import { useEffect, useState } from 'react';
import { api } from '../api.js';

export function useWords(params, revision = 0) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify(params);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    api.words
      .list(params, controller.signal)
      .then((nextWords) => {
        if (!active) return;
        setWords(nextWords);
        setLoading(false);
      })
      .catch((requestError) => {
        if (!active || requestError.name === 'AbortError') return;
        setError(requestError);
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // `key` captures every filter that affects the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, revision]);

  return { words, loading, error };
}
