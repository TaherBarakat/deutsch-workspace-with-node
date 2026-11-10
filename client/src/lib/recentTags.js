const STORAGE_KEY = 'wortschatz-recent-tags';
const MAX_RECENT_TAGS = 12;

function normaliseTag(tag) {
  return typeof tag === 'string' ? tag.trim() : '';
}

export function getRecentTags() {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normaliseTag).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Remember the tags that were just saved so the next word form can recommend
 * them. Fixed level tags are filtered out by the tag input itself.
 */
export function rememberTags(tags) {
  if (typeof window === 'undefined' || !Array.isArray(tags)) return;

  const seen = new Set();
  const next = [];

  for (const tag of [...tags, ...getRecentTags()]) {
    const clean = normaliseTag(tag);
    if (!clean) continue;

    const key = clean.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    next.push(clean);
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next.slice(0, MAX_RECENT_TAGS)),
    );
  } catch {
    // Storage can be unavailable in private browsing; recents are optional.
  }
}
