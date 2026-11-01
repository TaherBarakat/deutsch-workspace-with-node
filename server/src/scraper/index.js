import { ApiError } from '../lib/errors.js';
import { fetchWordPage } from './http.js';
import { parseVerb } from './parseVerb.js';
import { parseNoun } from './parseNoun.js';

const SUPPORTED_TYPES = ['verb', 'noun'];

export async function lookupWord(type, word) {
  if (!SUPPORTED_TYPES.includes(type)) {
    throw new ApiError(400, 'Automatic lookup is available for verbs and nouns only.');
  }

  const cleanWord = String(word ?? '').trim();
  if (!cleanWord) {
    throw new ApiError(400, 'Enter a German word to look up.');
  }

  if (cleanWord.length > 120) {
    throw new ApiError(400, 'The word is too long.');
  }

  const page = await fetchWordPage(cleanWord);
  return type === 'verb'
    ? parseVerb(page.html, cleanWord)
    : parseNoun(page.html, cleanWord);
}
