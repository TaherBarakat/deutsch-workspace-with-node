import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { ApiError } from '../lib/errors.js';
import { lookupWord } from '../scraper/index.js';

export const lookupRouter = Router();

lookupRouter.get('/', asyncHandler(async (req, res) => {
  const type = String(req.query.type ?? '').trim();
  const word = String(req.query.word ?? '').trim();

  if (!['verb', 'noun'].includes(type)) {
    throw new ApiError(400, 'Choose "verb" or "noun" before looking up a word.');
  }

  const result = await lookupWord(type, word);
  res.json(result);
}));
