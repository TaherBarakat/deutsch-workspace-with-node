import { db } from '../db/index.js';
import { ApiError } from '../lib/errors.js';

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function mapRow(row) {
  return {
    id: row.id,
    type: row.type,
    german: row.german,
    article: row.article,
    gender: row.gender,
    plural: row.plural,
    english: parseJson(row.english, []),
    parts: row.parts ? parseJson(row.parts, null) : null,
    opposite: row.opposite ?? null,
    irregular: Boolean(row.irregular),
    example: row.example_de || row.example_en
      ? { de: row.example_de, en: row.example_en }
      : null,
    notes: row.notes,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: [],
  };
}

function attachTags(words) {
  if (words.length === 0) return words;

  const params = {};
  const placeholders = words.map((word, index) => {
    params[`id${index}`] = word.id;
    return `@id${index}`;
  });

  const tagRows = db
    .prepare(`
      SELECT wt.word_id AS wordId, t.name
      FROM word_tags wt
      JOIN tags t ON t.id = wt.tag_id
      WHERE wt.word_id IN (${placeholders.join(', ')})
      ORDER BY t.name COLLATE NOCASE ASC
    `)
    .all(params);

  const tagsByWord = new Map();
  for (const tag of tagRows) {
    const list = tagsByWord.get(tag.wordId) ?? [];
    list.push(tag.name);
    tagsByWord.set(tag.wordId, list);
  }

  for (const word of words) {
    word.tags = tagsByWord.get(word.id) ?? [];
  }

  return words;
}

function buildOrderClause(sort) {
  const genderOrder = `
    CASE w.gender
      WHEN 'm' THEN 1
      WHEN 'f' THEN 2
      WHEN 'n' THEN 3
      ELSE 4
    END
  `;

  switch (sort) {
    case 'alpha_desc':
      return 'w.german COLLATE NOCASE DESC, w.id DESC';
    case 'newest':
      return 'w.created_at DESC, w.id DESC';
    case 'oldest':
      return 'w.created_at ASC, w.id ASC';
    case 'gender_desc':
      return `${genderOrder} DESC, w.german COLLATE NOCASE DESC, w.id DESC`;
    case 'gender':
      return `${genderOrder} ASC, w.german COLLATE NOCASE ASC, w.id ASC`;
    case 'alpha':
    default:
      return 'w.german COLLATE NOCASE ASC, w.id ASC';
  }
}

export function listWords({
  types = [],
  tags = [],
  tag = null,
  tagMode = 'any',
  search = '',
  sort = 'alpha',
  limit = null,
} = {}) {
  const clauses = [];
  const params = {};
  const activeTags = tags.length > 0 ? tags : (tag ? [tag] : []);

  if (types.length > 0) {
    const placeholders = types.map((type, index) => {
      params[`type${index}`] = type;
      return `@type${index}`;
    });
    clauses.push(`w.type IN (${placeholders.join(', ')})`);
  }

  if (activeTags.length > 0) {
    const placeholders = activeTags.map((tagName, index) => {
      params[`tag${index}`] = tagName;
      return `@tag${index}`;
    });

    if (tagMode === 'all') {
      // Every selected tag must be present on the word.
      clauses.push(`
        (
          SELECT COUNT(DISTINCT t.name)
          FROM word_tags wt
          JOIN tags t ON t.id = wt.tag_id
          WHERE wt.word_id = w.id AND t.name IN (${placeholders.join(', ')})
        ) = @tagCount
      `);
      params.tagCount = activeTags.length;
    } else {
      clauses.push(`
        EXISTS (
          SELECT 1
          FROM word_tags wt
          JOIN tags t ON t.id = wt.tag_id
          WHERE wt.word_id = w.id AND t.name IN (${placeholders.join(', ')})
        )
      `);
    }
  }

  if (search) {
    clauses.push(`(
      w.german LIKE @search COLLATE NOCASE
      OR w.english LIKE @search COLLATE NOCASE
      OR COALESCE(w.notes, '') LIKE @search COLLATE NOCASE
    )`);
    params.search = `%${search}%`;
  }

  let sql = 'SELECT w.* FROM words w';
  if (clauses.length > 0) sql += ` WHERE ${clauses.join(' AND ')}`;
  sql += ` ORDER BY ${buildOrderClause(sort)}`;

  if (Number.isInteger(limit) && limit > 0) {
    sql += ' LIMIT @limit';
    params.limit = limit;
  }

  const rows = db.prepare(sql).all(params);
  return attachTags(rows.map(mapRow));
}

export function getWordById(id) {
  const row = db.prepare('SELECT * FROM words WHERE id = ?').get(id);
  if (!row) return null;
  return attachTags([mapRow(row)])[0];
}

function syncTags(wordId, tags) {
  db.prepare('DELETE FROM word_tags WHERE word_id = ?').run(wordId);

  for (const tag of tags) {
    db.prepare('INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING').run(tag);
    const tagRow = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE').get(tag);
    if (tagRow) {
      db.prepare('INSERT OR IGNORE INTO word_tags (word_id, tag_id) VALUES (?, ?)')
        .run(wordId, tagRow.id);
    }
  }
}

function toDatabaseValues(payload) {
  return {
    type: payload.type,
    german: payload.german,
    article: payload.article,
    gender: payload.gender,
    plural: payload.plural,
    english: JSON.stringify(payload.english),
    parts: payload.parts ? JSON.stringify(payload.parts) : null,
    opposite: payload.opposite,
    irregular: payload.irregular ? 1 : 0,
    exampleDe: payload.example?.de ?? null,
    exampleEn: payload.example?.en ?? null,
    notes: payload.notes,
    sourceUrl: payload.sourceUrl,
  };
}

function duplicateError(payload) {
  return new ApiError(
    409,
    `"${payload.german}" already exists in your ${payload.type}s.`,
  );
}

const createTransaction = db.transaction((payload) => {
  const values = toDatabaseValues(payload);
  let result;

  try {
    result = db.prepare(`
      INSERT INTO words (
        type, german, article, gender, plural, english, parts, opposite, irregular,
        example_de, example_en, notes, source_url
      ) VALUES (
        @type, @german, @article, @gender, @plural, @english, @parts, @opposite, @irregular,
        @exampleDe, @exampleEn, @notes, @sourceUrl
      )
    `).run(values);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw duplicateError(payload);
    throw error;
  }

  syncTags(result.lastInsertRowid, payload.tags);
  return Number(result.lastInsertRowid);
});

const updateTransaction = db.transaction((id, payload) => {
  const values = toDatabaseValues(payload);

  try {
    db.prepare(`
      UPDATE words SET
        type = @type,
        german = @german,
        article = @article,
        gender = @gender,
        plural = @plural,
        english = @english,
        parts = @parts,
        opposite = @opposite,
        irregular = @irregular,
        example_de = @exampleDe,
        example_en = @exampleEn,
        notes = @notes,
        source_url = @sourceUrl,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = @id
    `).run({ ...values, id });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw duplicateError(payload);
    throw error;
  }

  syncTags(id, payload.tags);
  return id;
});

export function createWord(payload) {
  const id = createTransaction(payload);
  return getWordById(id);
}

export function updateWord(id, payload) {
  const existing = db.prepare('SELECT id FROM words WHERE id = ?').get(id);
  if (!existing) throw new ApiError(404, 'Word not found.');

  updateTransaction(id, payload);
  return getWordById(id);
}

export function deleteWord(id) {
  const result = db.prepare('DELETE FROM words WHERE id = ?').run(id);
  if (result.changes === 0) throw new ApiError(404, 'Word not found.');
}
