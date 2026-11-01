const API_BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) query.set(key, value.join(','));
    } else {
      query.set(key, String(value));
    }
  }

  const serialised = query.toString();
  return serialised ? `?${serialised}` : '';
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the server. Is it running?', 0);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || 'Something went wrong.', response.status);
  }

  return data;
}

export const api = {
  words: {
    list(params = {}, signal) {
      return request(`/api/words${buildQuery(params)}`, { signal }).then((data) => data.words);
    },
    get(id, signal) {
      return request(`/api/words/${id}`, { signal }).then((data) => data.word);
    },
    create(payload) {
      return request('/api/words', { method: 'POST', body: payload }).then((data) => data.word);
    },
    update(id, payload) {
      return request(`/api/words/${id}`, { method: 'PUT', body: payload }).then((data) => data.word);
    },
    remove(id) {
      return request(`/api/words/${id}`, { method: 'DELETE' });
    },
  },
  tags: {
    list(type, signal) {
      return request(`/api/tags${buildQuery({ type })}`, { signal }).then((data) => data.tags);
    },
  },
  stats: {
    get(signal) {
      return request('/api/stats', { signal });
    },
  },
  lookup(type, word) {
    return request(`/api/lookup${buildQuery({ type, word })}`);
  },
};
