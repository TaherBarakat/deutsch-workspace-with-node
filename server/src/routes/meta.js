import { Router } from 'express';
import { listTags } from '../services/tagRepository.js';
import { getStats } from '../services/stats.js';

export const tagsRouter = Router();
export const statsRouter = Router();

tagsRouter.get('/', (req, res) => {
  const type = String(req.query.type ?? '').trim();
  res.json({ tags: listTags(type || null) });
});

statsRouter.get('/', (req, res) => {
  res.json(getStats());
});
