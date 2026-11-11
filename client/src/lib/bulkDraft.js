const STORAGE_KEY_PREFIX = 'wortschatz-bulk-draft';

function storageKey(type) {
  return `${STORAGE_KEY_PREFIX}-${type}`;
}

function cleanTag(tag) {
  return typeof tag === 'string' ? tag.trim() : '';
}

/**
 * Reads the unsaved batch for one word type. Drafts survive an accidental
 * Escape or page reload, and are only removed once the words are saved.
 */
export function readBulkDraft(type) {
  if (typeof window === 'undefined') return { text: '', tags: [] };

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(storageKey(type)) ?? 'null',
    );

    if (!parsed || typeof parsed !== 'object') return { text: '', tags: [] };

    return {
      text: typeof parsed.text === 'string' ? parsed.text : '',
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map(cleanTag).filter(Boolean)
        : [],
    };
  } catch {
    return { text: '', tags: [] };
  }
}

export function writeBulkDraft(type, { text, tags }) {
  if (typeof window === 'undefined') return;

  const cleanText = typeof text === 'string' ? text : '';
  const cleanTags = Array.isArray(tags) ? tags.map(cleanTag).filter(Boolean) : [];

  try {
    if (!cleanText.trim() && cleanTags.length === 0) {
      window.localStorage.removeItem(storageKey(type));
      return;
    }

    window.localStorage.setItem(
      storageKey(type),
      JSON.stringify({ text: cleanText, tags: cleanTags }),
    );
  } catch {
    // Storage can be unavailable in private browsing; drafts are optional.
  }
}

export function clearBulkDraft(type) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(storageKey(type));
  } catch {
    // Storage can be unavailable in private browsing; drafts are optional.
  }
}
