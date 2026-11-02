PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('verb', 'noun', 'adjective', 'adverb')),
  german TEXT NOT NULL,
  article TEXT,
  gender TEXT CHECK (gender IS NULL OR gender IN ('m', 'f', 'n')),
  plural TEXT,
  english TEXT NOT NULL DEFAULT '[]',
  parts TEXT,
  opposite TEXT,
  irregular INTEGER NOT NULL DEFAULT 0,
  example_de TEXT,
  example_en TEXT,
  notes TEXT,
  source_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_words_type_german
  ON words (type, german COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_words_type ON words (type);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS word_tags (
  word_id INTEGER NOT NULL REFERENCES words (id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
  PRIMARY KEY (word_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_word_tags_tag ON word_tags (tag_id);

CREATE TABLE IF NOT EXISTS sentences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  german TEXT NOT NULL,
  english TEXT,
  notes TEXT,
  source_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_sentences_german ON sentences (german COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS sentence_tags (
  sentence_id INTEGER NOT NULL REFERENCES sentences (id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
  PRIMARY KEY (sentence_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_sentence_tags_tag ON sentence_tags (tag_id);
