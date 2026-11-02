import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { db, databasePath } from '../src/db/index.js';
import { normalizeWordPayload } from '../src/lib/validation.js';
import { createWord } from '../src/services/wordRepository.js';

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function findSourcePath() {
  const argument = process.argv[2];
  if (argument) return path.resolve(argument);

  return path.join(os.tmpdir(), 'opencode', 'wortschatz-ui-test.db');
}

function tagsForWord(source, wordId) {
  return source
    .prepare(`
      SELECT t.name
      FROM word_tags wt
      JOIN tags t ON t.id = wt.tag_id
      WHERE wt.word_id = ?
      ORDER BY t.name COLLATE NOCASE ASC
    `)
    .all(wordId)
    .map((row) => row.name);
}

function ensureTagLink(wordId, tagName) {
  db.prepare('INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING').run(tagName);
  const tag = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE').get(tagName);
  if (tag) {
    db.prepare('INSERT OR IGNORE INTO word_tags (word_id, tag_id) VALUES (?, ?)')
      .run(wordId, tag.id);
  }
}

const sourcePath = findSourcePath();

if (!fs.existsSync(sourcePath)) {
  console.error(`Source database not found: ${sourcePath}`);
  process.exit(1);
}

console.log(`Merging ${sourcePath}`);
console.log(`        into ${databasePath}`);

const source = new Database(sourcePath);
source.pragma('wal_checkpoint(TRUNCATE)');

const words = source.prepare('SELECT * FROM words ORDER BY id ASC').all();
const sentenceTable = source
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sentences'")
  .get();
const sentences = sentenceTable
  ? source.prepare('SELECT * FROM sentences ORDER BY id ASC').all()
  : [];

let imported = 0;
let updated = 0;
let sentencesImported = 0;

const mergeWord = db.transaction((row) => {
  const tags = tagsForWord(source, row.id);
  const existing = db
    .prepare('SELECT id FROM words WHERE type = ? AND german = ? COLLATE NOCASE')
    .get(row.type, row.german);

  if (existing) {
    for (const tag of tags) ensureTagLink(existing.id, tag);
    updated += 1;
    return;
  }

  const payload = normalizeWordPayload({
    type: row.type,
    german: row.german,
    article: row.article,
    gender: row.gender,
    plural: row.plural,
    english: parseJson(row.english, []),
    parts: parseJson(row.parts, null),
    opposite: row.opposite ?? null,
    irregular: Boolean(row.irregular),
    example: { de: row.example_de, en: row.example_en },
    notes: row.notes,
    sourceUrl: row.source_url,
    tags,
  });

  createWord(payload);
  imported += 1;
});

for (const row of words) mergeWord(row);

if (sentences.length > 0) {
  const mergeSentence = db.transaction((row) => {
    const tags = sentenceTable
      ? source
          .prepare(`
            SELECT t.name
            FROM sentence_tags st
            JOIN tags t ON t.id = st.tag_id
            WHERE st.sentence_id = ?
            ORDER BY t.name COLLATE NOCASE ASC
          `)
          .all(row.id)
          .map((tag) => tag.name)
      : [];

    const existing = db
      .prepare('SELECT id FROM sentences WHERE german = ? COLLATE NOCASE')
      .get(row.german);

    if (existing) {
      for (const tag of tags) {
        db.prepare('INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING').run(tag);
        const tagRow = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE').get(tag);
        if (tagRow) {
          db.prepare('INSERT OR IGNORE INTO sentence_tags (sentence_id, tag_id) VALUES (?, ?)')
            .run(existing.id, tagRow.id);
        }
      }
      return;
    }

    const result = db.prepare(`
      INSERT INTO sentences (german, english, notes, source_url)
      VALUES (?, ?, ?, ?)
    `).run(row.german, row.english, row.notes, row.source_url);

    for (const tag of tags) {
      db.prepare('INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING').run(tag);
      const tagRow = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE').get(tag);
      if (tagRow) {
        db.prepare('INSERT OR IGNORE INTO sentence_tags (sentence_id, tag_id) VALUES (?, ?)')
          .run(result.lastInsertRowid, tagRow.id);
      }
    }

    sentencesImported += 1;
  });

  for (const row of sentences) mergeSentence(row);
}

source.close();
db.pragma('wal_checkpoint(TRUNCATE)');

console.log(`Imported ${imported} new word(s), refreshed tags on ${updated} existing word(s).`);
if (sentences.length > 0) {
  console.log(`Imported ${sentencesImported} new sentence(s).`);
}
