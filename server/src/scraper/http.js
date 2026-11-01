import { ApiError } from '../lib/errors.js';

const USER_AGENT = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'AppleWebKit/537.36 (KHTML, like Gecko)',
  'Chrome/124.0.0.0 Safari/537.36',
].join(' ');

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const cache = new Map();

export async function fetchWordPage(word) {
  const cacheKey = word.toLowerCase();
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.page;
  }

  const url = `https://www.verbformen.com/?w=${encodeURIComponent(word)}`;
  let response;

  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
      },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new ApiError(
      502,
      'Could not reach verbformen.com. Check your connection or enter the details manually.',
      error.message,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      502,
      `verbformen.com responded with ${response.status}. Please try again or enter the details manually.`,
    );
  }

  const html = await response.text();
  const page = { html, url: response.url || url };

  cache.set(cacheKey, { page, fetchedAt: Date.now() });
  return page;
}
