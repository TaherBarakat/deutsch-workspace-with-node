import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import {
  deriveCaseGoverned,
  derivePluralPattern,
  deriveReflexiveType,
  deriveRegularity,
  deriveSeparability,
} from '../lib/grammar.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(currentDir, '../../data');

fs.mkdirSync(dataDir, { recursive: true });

const defaultDatabasePath = path.join(dataDir, 'wortschatz.db');
const databasePath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : defaultDatabasePath;
const schema = fs.readFileSync(path.join(currentDir, 'schema.sql'), 'utf8');

export const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
// FULL makes every commit durable across crashes and quick restarts. WAL keeps
// normal reads fast, while the checkpoint below keeps the .db file up to date.
db.pragma('synchronous = FULL');
db.pragma('busy_timeout = 5000');
db.pragma('wal_autocheckpoint = 500');
db.exec(schema);

function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (columns.some((item) => item.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

// Schema upgrades for databases created by earlier versions.
addColumnIfMissing('words', 'opposite', 'TEXT');
addColumnIfMissing(
  'words',
  'regularity',
  "TEXT CHECK (regularity IS NULL OR regularity IN ('REGULAR', 'IRREGULAR', 'MIXED', 'MODAL'))",
);
addColumnIfMissing(
  'words',
  'is_separable',
  "TEXT CHECK (is_separable IS NULL OR is_separable IN ('SEPARABLE', 'INSEPARABLE', 'NONE'))",
);
addColumnIfMissing(
  'words',
  'reflexive_type',
  "TEXT CHECK (reflexive_type IS NULL OR reflexive_type IN ('NOT_REFLEXIVE', 'MANDATORY_REFLEXIVE', 'OPTIONAL_REFLEXIVE'))",
);
addColumnIfMissing(
  'words',
  'case_governed',
  "TEXT CHECK (case_governed IS NULL OR case_governed IN ('ACCUSATIVE', 'DATIVE', 'BOTH', 'PREPOSITIONAL'))",
);
addColumnIfMissing(
  'words',
  'plural_pattern',
  "TEXT CHECK (plural_pattern IS NULL OR plural_pattern IN ('NO_CHANGE', 'UMLAUT_ONLY', 'E_ENDING', 'UMLAUT_PLUS_E', 'EN_ENDING', 'ER_ENDING', 'UMLAUT_PLUS_ER', 'S_ENDING', 'PLURAL_ONLY', 'UNCOUNTABLE'))",
);

function parseStoredJson(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// Fill the new grammar columns for words saved before this metadata existed.
// COALESCE means a value the user edited later is never overwritten.
function backfillWordGrammar() {
  const rows = db.prepare(`
    SELECT id, type, german, plural, irregular, parts
    FROM words
    WHERE (
      type = 'verb'
      AND (
        regularity IS NULL
        OR is_separable IS NULL
        OR reflexive_type IS NULL
        OR case_governed IS NULL
      )
    ) OR (
      type = 'noun'
      AND plural_pattern IS NULL
    )
  `).all();

  if (rows.length === 0) return;

  const update = db.prepare(`
    UPDATE words SET
      regularity = COALESCE(regularity, @regularity),
      is_separable = COALESCE(is_separable, @isSeparable),
      reflexive_type = COALESCE(reflexive_type, @reflexiveType),
      case_governed = COALESCE(case_governed, @caseGoverned),
      plural_pattern = COALESCE(plural_pattern, @pluralPattern)
    WHERE id = @id
  `);

  db.transaction(() => {
    for (const row of rows) {
      const parts = parseStoredJson(row.parts, null);

      update.run({
        id: row.id,
        regularity: row.type === 'verb'
          ? deriveRegularity({
            german: row.german,
            past: parts?.past?.text ?? null,
            irregular: Boolean(row.irregular),
          })
          : null,
        isSeparable: row.type === 'verb'
          ? deriveSeparability({ german: row.german })
          : null,
        reflexiveType: row.type === 'verb'
          ? deriveReflexiveType({ german: row.german })
          : null,
        caseGoverned: row.type === 'verb'
          ? deriveCaseGoverned({ german: row.german })
          : null,
        pluralPattern: row.type === 'noun'
          ? derivePluralPattern({ singular: row.german, plural: row.plural })
          : null,
      });
    }
  })();
}

backfillWordGrammar();

if (databasePath !== defaultDatabasePath) {
  console.warn(
    `[db] Using custom database at ${databasePath}. `
    + `The default library lives at ${defaultDatabasePath}.`,
  );
}

let closed = false;

export function closeDatabase() {
  if (closed) return;
  closed = true;

  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
  } catch (error) {
    console.warn('[db] Could not checkpoint the write-ahead log:', error.message);
  }

  db.close();
}

export { databasePath, defaultDatabasePath };
