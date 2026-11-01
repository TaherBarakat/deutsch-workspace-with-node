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
