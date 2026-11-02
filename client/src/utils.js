export function cx(...values) {
  return values.filter(Boolean).join(' ');
}

export function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }

  return copy;
}

export function splitMeanings(value) {
  return String(value ?? '')
    .split(',')
    .map((meaning) => meaning.trim())
    .filter(Boolean);
}

/**
 * Reads a comma-separated tag list from a URL param. Deduplicates case
 * insensitively so "A1.1,a1.1" cannot filter the same tag twice.
 */
export function parseTagsParam(value) {
  const seen = new Set();
  const tags = [];

  for (const rawTag of String(value ?? '').split(',')) {
    const tag = rawTag.trim();
    if (!tag) continue;

    const key = tag.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push(tag);
  }

  return tags;
}

export function toggleTag(tags, name) {
  const exists = tags.some((tag) => tag.toLowerCase() === name.toLowerCase());
  return exists
    ? tags.filter((tag) => tag.toLowerCase() !== name.toLowerCase())
    : [...tags, name];
}

export function wordSpeechText(word) {
  if (!word?.german) return '';
  return word.type === 'noun' && word.article
    ? `${word.article} ${word.german}`
    : word.german;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function groupWordsByTags(words) {
  const groups = new Map();
  const untagged = [];

  for (const word of words) {
    if (!word.tags || word.tags.length === 0) {
      untagged.push(word);
      continue;
    }

    for (const tag of word.tags) {
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag).push(word);
    }
  }

  const sorted = [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right, 'de', { sensitivity: 'base' }))
    .map(([name, groupWords]) => ({ name, words: groupWords }));

  if (untagged.length > 0) {
    sorted.push({ name: 'Untagged', words: untagged, isUntagged: true });
  }

  return sorted;
}

const GENDER_GROUP_ORDER = [
  { key: 'm', name: 'Masculine', article: 'der' },
  { key: 'f', name: 'Feminine', article: 'die' },
  { key: 'n', name: 'Neuter', article: 'das' },
];

export function groupWordsByGender(words) {
  const buckets = new Map([
    ['m', []],
    ['f', []],
    ['n', []],
    ['unknown', []],
  ]);

  for (const word of words) {
    const key = word.gender && buckets.has(word.gender) ? word.gender : 'unknown';
    buckets.get(key).push(word);
  }

  const groups = GENDER_GROUP_ORDER
    .filter((group) => buckets.get(group.key).length > 0)
    .map((group) => ({
      ...group,
      words: [...buckets.get(group.key)].sort((left, right) => (
        left.german.localeCompare(right.german, 'de', { sensitivity: 'base' })
      )),
    }));

  if (buckets.get('unknown').length > 0) {
    groups.push({
      key: 'unknown',
      name: 'No gender',
      article: null,
      words: buckets.get('unknown'),
    });
  }

  return groups;
}

export function exampleText(example) {
  if (!example) return null;
  return example.de || example.en || null;
}

export function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
