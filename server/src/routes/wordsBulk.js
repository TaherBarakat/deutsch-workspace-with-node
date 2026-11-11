import { Router } from 'express';
import { ApiError } from '../lib/errors.js';
import { db } from '../db/index.js';
import { parseIds, parseTags } from '../lib/validation.js';

export const wordsBulkRouter = Router();

wordsBulkRouter.post('/bulk-tags', (req, res) => {
  const ids = parseIds(req.body?.ids);
  const tags = parseTags(req.body?.tags);

  if (tags.length === 0) {
    throw new ApiError(400, 'Choose at least one tag to add.');
  }

  const wordExists = db.prepare('SELECT id FROM words WHERE id = ?');
  const insertTag = db.prepare(
    'INSERT OR IGNORE INTO tags (name) VALUES (?)',
  );
  const findTag = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE');
  const linkTag = db.prepare(`
    INSERT OR IGNORE INTO word_tags (word_id, tag_id) VALUES (?, ?)
  `);
  const touchWord = db.prepare(`
    UPDATE words SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `);

  let updated = 0;

  db.transaction(() => {
    for (const id of ids) {
      if (!wordExists.get(id)) continue;

      let changed = false;

      for (const tag of tags) {
        insertTag.run(tag);
        const tagRow = findTag.get(tag);
        if (!tagRow) continue;
        if (linkTag.run(id, tagRow.id).changes > 0) changed = true;
      }

      if (changed) touchWord.run(id);
      updated += 1;
    }
  })();

  res.json({ updated, tags });
});

wordsBulkRouter.post('/bulk-delete', (req, res) => {
  const ids = parseIds(req.body?.ids);
  const removeWord = db.prepare('DELETE FROM words WHERE id = ?');

  let deleted = 0;

  db.transaction(() => {
    for (const id of ids) {
      deleted += removeWord.run(id).changes;
    }
  })();

  res.json({ deleted });
});
