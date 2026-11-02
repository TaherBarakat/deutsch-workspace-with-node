import { useEffect, useState } from 'react';
import { api } from '../api.js';

export function useSentences(params, revision = 0) {
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify(params);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    api.sentences
      .list(params, controller.signal)
      .then((nextSentences) => {
        if (!active) return;
        setSentences(nextSentences);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, revision]);

  return { sentences, loading, error };
}
