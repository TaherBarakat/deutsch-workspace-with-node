import { ApiError } from '../lib/errors.js';
import {
  CASES,
  PLURAL_PATTERNS,
  REFLEXIVE_TYPES,
  REGULARITIES,
  SEPARABILITIES,
  deriveCaseGoverned,
  derivePluralPattern,
  deriveReflexiveType,
  deriveRegularity,
  deriveSeparability,
} from './grammar.js';

export const WORD_TYPES = ['verb', 'noun', 'adjective', 'adverb'];
export const ARTICLES = ['der', 'die', 'das'];
export const SEGMENT_STYLES = ['plain', 'irregular', 'ending'];
export const WORD_REGULARITIES = REGULARITIES;
export const WORD_SEPARABILITIES = SEPARABILITIES;
export const WORD_REFLEXIVE_TYPES = REFLEXIVE_TYPES;
export const WORD_CASES = CASES;
export const WORD_PLURAL_PATTERNS = PLURAL_PATTERNS;

const ARTICLE_GENDER = { der: 'm', die: 'f', das: 'n' };
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 40;
const MAX_ENGLISH = 12;

const PARTS_BY_TYPE = {
  verb: ['present', 'past', 'perfect'],
  adjective: ['positive', 'comparative', 'superlative'],
};

function cleanString(value, { max = 500, label = 'Value' } = {}) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw new ApiError(400, `${label} must be text.`);
  }

  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new ApiError(400, `${label} must be ${max} characters or fewer.`);
  }

  return trimmed || null;
}

function normalizeEnglish(value) {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const meanings = list
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, MAX_ENGLISH);

  return [...new Set(meanings)];
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];

  const tags = value
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
    .map((tag) => tag.slice(0, MAX_TAG_LENGTH));

  return [...new Set(tags.map((tag) => tag.toLowerCase()))]
    .slice(0, MAX_TAGS)
    .map((lowercaseTag) => tags.find((tag) => tag.toLowerCase() === lowercaseTag));
}

function normalizeSegments(value, fallbackText = '') {
  if (!Array.isArray(value) || value.length === 0) {
    return fallbackText ? [{ text: fallbackText, style: 'plain' }] : [];
  }

  return value
    .filter((segment) => segment && typeof segment.text === 'string' && segment.text.length > 0)
    .map((segment) => ({
      text: segment.text,
      style: SEGMENT_STYLES.includes(segment.style) ? segment.style : 'plain',
    }));
}

function normalizeParts(value, type) {
  const allowedKeys = PARTS_BY_TYPE[type];
  if (!allowedKeys || !value || typeof value !== 'object') return null;

  const parts = {};
  let hasAnyPart = false;

  for (const key of allowedKeys) {
    const raw = value[key];
    if (!raw) continue;

    const text = cleanString(typeof raw === 'string' ? raw : raw.text, {
      max: 160,
      label: `The ${key} form`,
    });

    if (!text) continue;

    const segments = typeof raw === 'string'
      ? [{ text, style: 'plain' }]
      : normalizeSegments(raw.segments, text);

    parts[key] = { text, segments };
    hasAnyPart = true;
  }

  return hasAnyPart ? parts : null;
}

function normalizeExample(input) {
  const example = input.example && typeof input.example === 'object' ? input.example : {};
  const de = cleanString(example.de ?? input.exampleDe, { max: 400, label: 'The German example' });
  const en = cleanString(example.en ?? input.exampleEn, { max: 400, label: 'The English example' });

  return de || en ? { de, en } : null;
}

function normalizeEnum(value, allowed) {
  const raw = cleanString(value, { max: 40, label: 'The grammar tag' });
  if (!raw) return null;

  const normalized = raw.toUpperCase().replace(/[\s-]+/g, '_');
  return allowed.includes(normalized) ? normalized : null;
}

function normalizeSourceUrl(value) {
  const url = cleanString(value, { max: 500, label: 'The source URL' });
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeWordPayload(input) {
  if (!input || typeof input !== 'object') {
    throw new ApiError(400, 'A word payload is required.');
  }

  const type = cleanString(input.type, { max: 20, label: 'The word type' });
  if (!WORD_TYPES.includes(type)) {
    throw new ApiError(400, 'Choose a valid word type.');
  }

  const german = cleanString(input.german, { max: 120, label: 'The German word' });
  if (!german) {
    throw new ApiError(400, 'The German word is required.');
  }

  let article = cleanString(input.article, { max: 5, label: 'The article' })?.toLowerCase() ?? null;
  if (article && !ARTICLES.includes(article)) article = null;

  let gender = cleanString(input.gender, { max: 1, label: 'The gender' })?.toLowerCase() ?? null;
  if (!['m', 'f', 'n'].includes(gender)) gender = null;
  if (!gender && article) gender = ARTICLE_GENDER[article];
  if (!article && gender) {
    article = Object.entries(ARTICLE_GENDER).find(([, value]) => value === gender)?.[0] ?? null;
  }

  const isVerb = type === 'verb';
  const isNoun = type === 'noun';
  const parts = normalizeParts(input.parts, type);
  const plural = isNoun
    ? cleanString(input.plural, { max: 120, label: 'The plural' })
    : null;
  const irregular = isVerb ? Boolean(input.irregular) : false;

  const payload = {
    type,
    german,
    article: isNoun ? article : null,
    gender: isNoun ? gender : null,
    plural,
    english: normalizeEnglish(input.english),
    parts,
    opposite: type === 'adjective'
      ? cleanString(input.opposite, { max: 120, label: 'The opposite adjective' })
      : null,
    irregular,
    regularity: isVerb
      ? normalizeEnum(input.regularity, REGULARITIES)
        ?? deriveRegularity({ german, past: parts?.past?.text ?? null, irregular })
      : null,
    is_separable: isVerb
      ? normalizeEnum(input.is_separable, SEPARABILITIES) ?? deriveSeparability({ german })
      : null,
    reflexive_type: isVerb
      ? normalizeEnum(input.reflexive_type, REFLEXIVE_TYPES) ?? deriveReflexiveType({ german })
      : null,
    case_governed: isVerb
      ? normalizeEnum(input.case_governed, CASES) ?? deriveCaseGoverned({ german })
      : null,
    plural_pattern: isNoun
      ? normalizeEnum(input.plural_pattern, PLURAL_PATTERNS)
        ?? derivePluralPattern({ singular: german, plural })
      : null,
    example: normalizeExample(input),
    notes: cleanString(input.notes, { max: 2000, label: 'Notes' }),
    sourceUrl: normalizeSourceUrl(input.sourceUrl),
    tags: normalizeTags(input.tags),
  };

  return payload;
}

export function normalizeSentencePayload(input) {
  if (!input || typeof input !== 'object') {
    throw new ApiError(400, 'A sentence payload is required.');
  }

  const german = cleanString(input.german, { max: 800, label: 'The German sentence' });
  if (!german) {
    throw new ApiError(400, 'The German sentence is required.');
  }

  return {
    german,
    english: cleanString(input.english, { max: 800, label: 'The English translation' }),
    notes: cleanString(input.notes, { max: 2000, label: 'Notes' }),
    sourceUrl: normalizeSourceUrl(input.sourceUrl),
    tags: normalizeTags(input.tags),
  };
}

export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'A valid word id is required.');
  }
  return id;
}

export function parseTypes(value) {
  if (!value) return [];

  const rawTypes = Array.isArray(value) ? value : String(value).split(',');
  const types = rawTypes
    .map((type) => type.trim().toLowerCase())
    .filter((type) => WORD_TYPES.includes(type));

  return [...new Set(types)];
}

export function parseTags(value) {
  if (!value) return [];

  const rawTags = (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item).split(','));

  const tags = rawTags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.slice(0, MAX_TAG_LENGTH));

  return [...new Set(tags.map((tag) => tag.toLowerCase()))]
    .slice(0, MAX_TAGS)
    .map((lowercaseTag) => tags.find((tag) => tag.toLowerCase() === lowercaseTag));
}

export function parseTagMode(value) {
  return String(value ?? '').toLowerCase() === 'all' ? 'all' : 'any';
}

export function parseEnumList(value, allowed) {
  if (!value) return [];

  const rawValues = Array.isArray(value) ? value : [value];
  const values = rawValues
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim().toUpperCase().replace(/[\s-]+/g, '_'))
    .filter((item) => allowed.includes(item));

  return [...new Set(values)];
}
