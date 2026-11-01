import { db } from '../db/index.js';

export function listTags(type = null) {
  const params = {};
  let sql = `
    SELECT t.id, t.name, COUNT(wt.word_id) AS count
    FROM tags t
    JOIN word_tags wt ON wt.tag_id = t.id
  `;

  if (type) {
    sql += ' JOIN words w ON w.id = wt.word_id';
  }

  if (type) {
    sql += ' WHERE w.type = @type';
    params.type = type;
  }

  sql += ' GROUP BY t.id ORDER BY t.name COLLATE NOCASE ASC';

  return db.prepare(sql).all(params);
}
