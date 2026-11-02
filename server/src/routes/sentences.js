import { Router } from 'express';
import { ApiError } from '../lib/errors.js';
import {
  normalizeSentencePayload,
  parseId,
  parseTagMode,
  parseTags,
} from '../lib/validation.js';
import {
  createSentence,
  deleteSentence,
  getSentenceById,
  listSentences,
  updateSentence,
} from '../services/sentenceRepository.js';

export const sentencesRouter = Router();

function readFilters(query) {
  return {
    tags: parseTags(query.tags ?? query.tag),
    search: String(query.q ?? '').trim().slice(0, 200),
    tagMode: parseTagMode(query.tagMode),
  };
}

sentencesRouter.get('/', (req, res) => {
  res.json({ sentences: listSentences(readFilters(req.query)) });
});

sentencesRouter.get('/:id', (req, res) => {
  const sentence = getSentenceById(parseId(req.params.id));
  if (!sentence) throw new ApiError(404, 'Sentence not found.');
  res.json({ sentence });
});

sentencesRouter.post('/', (req, res) => {
  const payload = normalizeSentencePayload(req.body);
  const sentence = createSentence(payload);
  res.status(201).json({ sentence });
});

sentencesRouter.put('/:id', (req, res) => {
  const payload = normalizeSentencePayload(req.body);
  const sentence = updateSentence(parseId(req.params.id), payload);
  res.json({ sentence });
});

sentencesRouter.delete('/:id', (req, res) => {
  deleteSentence(parseId(req.params.id));
  res.status(204).end();
});
