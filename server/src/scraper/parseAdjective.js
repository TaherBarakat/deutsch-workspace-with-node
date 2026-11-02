import * as cheerio from 'cheerio';
import { ApiError } from '../lib/errors.js';
import { collapseWhitespace, getEnglishMeanings, getExample } from './parseUtils.js';

const PART_KEYS = ['positive', 'comparative', 'superlative'];

function buildPart(text) {
  return { text, segments: [{ text, style: 'plain' }] };
}

function parseComparisonForms($) {
  const stemText = collapseWhitespace($('.vStm').first().text());
  const forms = stemText
    .split('·')
    .map((form) => collapseWhitespace(form))
    .filter((form) => form && form !== '-');

  const parts = {};

  forms.slice(0, PART_KEYS.length).forEach((form, index) => {
    parts[PART_KEYS[index]] = buildPart(form);
  });

  return Object.keys(parts).length > 0 ? parts : null;
}

function germanFromTitle(title, requestedWord) {
  const match = title.match(/German adjective\s+(.+)$/i);
  return collapseWhitespace(match?.[1]) || collapseWhitespace(requestedWord);
}

export function parseAdjective(html, requestedWord) {
  const $ = cheerio.load(html);
  const title = collapseWhitespace($('h1').first().text());

  if (!/German adjective/i.test(title)) {
    throw new ApiError(
      422,
      `"${requestedWord}" does not look like a German adjective on verbformen.com. Check the spelling or enter the details manually.`,
    );
  }

  const german = collapseWhitespace($('.vGrnd').first().text())
    || germanFromTitle(title, requestedWord);
  const parts = parseComparisonForms($);
  const english = getEnglishMeanings($);

  if (!parts && english.length === 0) {
    throw new ApiError(
      422,
      `Could not read the adjective "${requestedWord}" from verbformen.com. Enter the details manually.`,
    );
  }

  return {
    type: 'adjective',
    german,
    english,
    parts,
    opposite: null,
    irregular: false,
    example: getExample($),
    sourceUrl: `https://www.verbformen.com/?w=${encodeURIComponent(german)}`,
  };
}
