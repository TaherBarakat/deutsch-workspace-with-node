import { ApiError } from '../lib/errors.js';
import { fetchWordPage } from './http.js';
import { parseVerb } from './parseVerb.js';
import { parseNoun } from './parseNoun.js';
import { parseAdjective } from './parseAdjective.js';
import { parseAdverb } from './parseAdverb.js';

const SUPPORTED_TYPES = ['verb', 'noun', 'adjective', 'adverb'];

export async function lookupWord(type, word) {
  if (!SUPPORTED_TYPES.includes(type)) {
    throw new ApiError(400, 'Automatic lookup is available for verbs, nouns, adjectives and adverbs.');
  }

  const cleanWord = String(word ?? '').trim();
  if (!cleanWord) {
    throw new ApiError(400, 'Enter a German word to look up.');
  }

  if (cleanWord.length > 120) {
    throw new ApiError(400, 'The word is too long.');
  }

  // verbformen has no conjugation page for "sich beeilen"; look up "beeilen"
  // and let the parser keep the reflexive information from the input.
  const fetchWord = type === 'verb'
    ? cleanWord.replace(/^sich\s+/i, '')
    : cleanWord;
  const page = await fetchWordPage(fetchWord);

  switch (type) {
    case 'verb':
      return parseVerb(page.html, cleanWord);
    case 'noun':
      return parseNoun(page.html, cleanWord);
    case 'adjective':
      return parseAdjective(page.html, cleanWord);
    case 'adverb':
      return parseAdverb(page.html, cleanWord);
    default:
      throw new ApiError(400, 'Choose a valid word type.');
  }
}
