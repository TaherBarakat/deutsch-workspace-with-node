import { db } from '../db/index.js';
import { ApiError } from '../lib/errors.js';

function mapSentenceRow(row) {
  return {
    id: row.id,
    type: 'sentence',
    german: row.german,
    english: row.english ? [row.english] : [],
    notes: row.notes,
    sourceUrl: row.source_url,
    example: null,
    parts: null,
    opposite: null,
    irregular: false,
    article: null,
    gender: null,
    plural: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: [],
  };
}

function attachSentenceTags(sentences) {
  if (sentences.length === 0) return sentences;

  const params = {};
  const placeholders = sentences.map((sentence, index) => {
    params[`id${index}`] = sentence.id;
    return `@id${index}`;
  });

  const tagRows = db
    .prepare(`
      SELECT st.sentence_id AS sentenceId, t.name
      FROM sentence_tags st
      JOIN tags t ON t.id = st.tag_id
      WHERE st.sentence_id IN (${placeholders.join(', ')})
      ORDER BY t.name COLLATE NOCASE ASC
    `)
    .all(params);

  const tagsBySentence = new Map();
  for (const tag of tagRows) {
    const list = tagsBySentence.get(tag.sentenceId) ?? [];
    list.push(tag.name);
    tagsBySentence.set(tag.sentenceId, list);
  }

  for (const sentence of sentences) {
    sentence.tags = tagsBySentence.get(sentence.id) ?? [];
  }

  return sentences;
}

function syncSentenceTags(sentenceId, tags) {
  db.prepare('DELETE FROM sentence_tags WHERE sentence_id = ?').run(sentenceId);

  for (const tag of tags) {
    db.prepare('INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING').run(tag);
    const tagRow = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE').get(tag);
    if (tagRow) {
      db.prepare('INSERT OR IGNORE INTO sentence_tags (sentence_id, tag_id) VALUES (?, ?)')
        .run(sentenceId, tagRow.id);
    }
  }
}

function toSentenceDatabaseValues(payload) {
  return {
    german: payload.german,
    english: payload.english,
    notes: payload.notes,
    sourceUrl: payload.sourceUrl,
  };
}

const createSentenceTransaction = db.transaction((payload) => {
  const values = toSentenceDatabaseValues(payload);
  const result = db.prepare(`
    INSERT INTO sentences (german, english, notes, source_url)
    VALUES (@german, @english, @notes, @sourceUrl)
  `).run(values);

  syncSentenceTags(result.lastInsertRowid, payload.tags);
  return Number(result.lastInsertRowid);
});

const updateSentenceTransaction = db.transaction((id, payload) => {
  const values = toSentenceDatabaseValues(payload);

  db.prepare(`
    UPDATE sentences SET
      german = @german,
      english = @english,
      notes = @notes,
      source_url = @sourceUrl,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = @id
  `).run({ ...values, id });

  syncSentenceTags(id, payload.tags);
  return id;
});

export function listSentences({ tags = [], tag = null, tagMode = 'any', search = '' } = {}) {
  const clauses = [];
  const params = {};
  const activeTags = tags.length > 0 ? tags : (tag ? [tag] : []);

  if (activeTags.length > 0) {
    const placeholders = activeTags.map((tagName, index) => {
      params[`tag${index}`] = tagName;
      return `@tag${index}`;
    });

    if (tagMode === 'all') {
      clauses.push(`
        (
          SELECT COUNT(DISTINCT t.name)
          FROM sentence_tags st
          JOIN tags t ON t.id = st.tag_id
          WHERE st.sentence_id = s.id AND t.name IN (${placeholders.join(', ')})
        ) = @tagCount
      `);
      params.tagCount = activeTags.length;
    } else {
      clauses.push(`
        EXISTS (
          SELECT 1
          FROM sentence_tags st
          JOIN tags t ON t.id = st.tag_id
          WHERE st.sentence_id = s.id AND t.name IN (${placeholders.join(', ')})
        )
      `);
    }
  }

  if (search) {
    clauses.push(`(
      s.german LIKE @search COLLATE NOCASE
      OR COALESCE(s.english, '') LIKE @search COLLATE NOCASE
      OR COALESCE(s.notes, '') LIKE @search COLLATE NOCASE
    )`);
    params.search = `%${search}%`;
  }

  let sql = 'SELECT s.* FROM sentences s';
  if (clauses.length > 0) sql += ` WHERE ${clauses.join(' AND ')}`;
  sql += ' ORDER BY s.german COLLATE NOCASE ASC, s.id ASC';

  const rows = db.prepare(sql).all(params);
  return attachSentenceTags(rows.map(mapSentenceRow));
}

export function getSentenceById(id) {
  const row = db.prepare('SELECT * FROM sentences WHERE id = ?').get(id);
  if (!row) return null;
  return attachSentenceTags([mapSentenceRow(row)])[0];
}

export function createSentence(payload) {
  const id = createSentenceTransaction(payload);
  return getSentenceById(id);
}

export function updateSentence(id, payload) {
  const existing = db.prepare('SELECT id FROM sentences WHERE id = ?').get(id);
  if (!existing) throw new ApiError(404, 'Sentence not found.');

  updateSentenceTransaction(id, payload);
  return getSentenceById(id);
}

export function deleteSentence(id) {
  const result = db.prepare('DELETE FROM sentences WHERE id = ?').run(id);
  if (result.changes === 0) throw new ApiError(404, 'Sentence not found.');
}
