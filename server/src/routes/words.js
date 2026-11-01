import { Router } from 'express';
import { ApiError } from '../lib/errors.js';
import { normalizeWordPayload, parseId, parseTypes } from '../lib/validation.js';
import {
  createWord,
  deleteWord,
  getWordById,
  listWords,
  updateWord,
} from '../services/wordRepository.js';

export const wordsRouter = Router();

wordsRouter.get('/', (req, res) => {
  const types = parseTypes(req.query.types ?? req.query.type);
  const search = String(req.query.q ?? '').trim().slice(0, 120);
  const tag = String(req.query.tag ?? '').trim().slice(0, 40) || null;
  const sort = String(req.query.sort ?? 'alpha');
  const limitValue = Number(req.query.limit);
  const limit = Number.isInteger(limitValue) && limitValue > 0
    ? Math.min(limitValue, 500)
    : null;

  const words = listWords({ types, tag, search, sort, limit });
  res.json({ words });
});

wordsRouter.get('/:id', (req, res) => {
  const word = getWordById(parseId(req.params.id));
  if (!word) throw new ApiError(404, 'Word not found.');
  res.json({ word });
});

wordsRouter.post('/', (req, res) => {
  const payload = normalizeWordPayload(req.body);
  const word = createWord(payload);
  res.status(201).json({ word });
});

wordsRouter.put('/:id', (req, res) => {
  const payload = normalizeWordPayload(req.body);
  const word = updateWord(parseId(req.params.id), payload);
  res.json({ word });
});

wordsRouter.delete('/:id', (req, res) => {
  deleteWord(parseId(req.params.id));
  res.status(204).end();
});
