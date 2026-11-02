import { Router } from 'express';
import { listSentenceTags, listTags } from '../services/tagRepository.js';
import { getStats } from '../services/stats.js';

export const tagsRouter = Router();
export const statsRouter = Router();

tagsRouter.get('/', (req, res) => {
  const type = String(req.query.type ?? '').trim();
  const scope = String(req.query.scope ?? '').trim().toLowerCase();

  res.json({
    tags: scope === 'sentences' ? listSentenceTags() : listTags(type || null),
  });
});

statsRouter.get('/', (req, res) => {
  res.json(getStats());
});
