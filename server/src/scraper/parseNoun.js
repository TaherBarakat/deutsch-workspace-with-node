import * as cheerio from 'cheerio';
import { ApiError } from '../lib/errors.js';
import { collapseWhitespace, getEnglishMeanings, getExample, getIntro } from './parseUtils.js';

const GENDER_BY_ARTICLE = { der: 'm', die: 'f', das: 'n' };
const GENDER_BY_WORD = { masculine: 'm', feminine: 'f', neuter: 'n' };

function parseArticleAndWord(basis) {
  const match = basis.match(/^(der|die|das)\s+(.+)$/i);
  if (!match) return { article: null, german: basis.trim() };
  return {
    article: match[1].toLowerCase(),
    german: collapseWhitespace(match[2]),
  };
}

export function parseNoun(html, requestedWord) {
  const $ = cheerio.load(html);
  const title = collapseWhitespace($('h1').first().text());

  if (!/Declension of German noun/i.test(title)) {
    throw new ApiError(
      422,
      `"${requestedWord}" does not look like a German noun on verbformen.com. Check the spelling or use the Verbs section.`,
    );
  }

  const intro = getIntro($);
  const basis = collapseWhitespace($('.vGrnd').first().text());
  const { article, german: parsedWord } = parseArticleAndWord(basis || requestedWord);

  const genderFromIntro = intro.match(/is\s+(masculine|feminine|neuter)/i)?.[1]?.toLowerCase();
  const gender = GENDER_BY_ARTICLE[article] ?? GENDER_BY_WORD[genderFromIntro] ?? null;

  const plural = intro.match(/nominative plural\s+"([^"]+)"/i)?.[1]
    ?? null;

  return {
    type: 'noun',
    german: parsedWord,
    article: article ?? (gender ? Object.keys(GENDER_BY_ARTICLE).find((key) => GENDER_BY_ARTICLE[key] === gender) : null),
    gender,
    plural: plural ? collapseWhitespace(plural) : null,
    english: getEnglishMeanings($),
    example: getExample($),
    sourceUrl: `https://www.verbformen.com/?w=${encodeURIComponent(parsedWord)}`,
  };
}
