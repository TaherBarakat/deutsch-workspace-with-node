import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { ApiError } from './lib/errors.js';
import { lookupRouter } from './routes/lookup.js';
import { statsRouter, tagsRouter } from './routes/meta.js';
import { sentencesRouter } from './routes/sentences.js';
import { wordsRouter } from './routes/words.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(currentDir, '../../client/dist');

export const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/words', wordsRouter);
app.use('/api/sentences', sentencesRouter);
app.use('/api/lookup', lookupRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/stats', statsRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'The request body is not valid JSON.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Something went wrong on the server.' });
});
