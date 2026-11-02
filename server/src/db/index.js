import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

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
