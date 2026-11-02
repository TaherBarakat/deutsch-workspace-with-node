import * as cheerio from 'cheerio';
import { ApiError } from '../lib/errors.js';
import {
  collapseWhitespace,
  getBilingualExample,
  getEnglishMeaningsFromElement,
} from './parseUtils.js';

function normaliseWord(value) {
  return collapseWhitespace(value)
    .replace(/[·\u00b7]/g, '')
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
    .toLowerCase();
}

function adverbRows($) {
  return $('.bTrf').filter((index, element) => (
    $(element).find('[title="adverb"]').length > 0
  ));
}

function rowWord($, row) {
  return collapseWhitespace(row.find('q').first().text());
}

export function parseAdverb(html, requestedWord) {
  const $ = cheerio.load(html);
  const rows = adverbRows($);

  if (rows.length === 0) {
    throw new ApiError(
      422,
      `verbformen.com has no adverb entry for "${requestedWord}". Adverbs are listed inside search results, so enter this one manually if it is missing.`,
    );
  }

  const wanted = normaliseWord(requestedWord);
  let match = rows.filter((index, element) => (
    normaliseWord(rowWord($, $(element))) === wanted
  )).first();

  if (match.length === 0 && rows.length === 1) {
    match = rows.first();
  }

  if (match.length === 0) {
    const suggestions = rows
      .map((index, element) => rowWord($, $(element)))
      .get()
      .filter(Boolean)
      .slice(0, 5);

    throw new ApiError(
      422,
      `Could not find the exact adverb "${requestedWord}". Found: ${suggestions.join(', ')}. Enter the details manually.`,
    );
  }

  const german = rowWord($, match) || collapseWhitespace(requestedWord);
  const english = getEnglishMeaningsFromElement($, match.find('[lang="en"]'));
  const example = getBilingualExample($, match.find('.wKnFmt'));

  return {
    type: 'adverb',
    german,
    english,
    example,
    sourceUrl: `https://www.verbformen.com/?w=${encodeURIComponent(german)}`,
  };
}
