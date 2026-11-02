import { db } from '../db/index.js';
import { listWords } from './wordRepository.js';
import { listTags } from './tagRepository.js';

export function getStats() {
  const byType = {
    verb: 0,
    noun: 0,
    adjective: 0,
    adverb: 0,
  };

  const countRows = db
    .prepare('SELECT type, COUNT(*) AS count FROM words GROUP BY type')
    .all();

  for (const row of countRows) {
    byType[row.type] = row.count;
  }

  const sentenceCount = db
    .prepare('SELECT COUNT(*) AS count FROM sentences')
    .get()?.count ?? 0;

  return {
    total: Object.values(byType).reduce((sum, count) => sum + count, 0),
    byType,
    sentences: sentenceCount,
    tags: listTags(),
    recent: listWords({ sort: 'newest', limit: 5 }),
  };
}
