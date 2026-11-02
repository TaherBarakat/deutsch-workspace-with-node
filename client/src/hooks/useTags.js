import { useEffect, useState } from 'react';
import { api } from '../api.js';

export function useTags(type = null, revision = 0, scope = null) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    api.tags
      .list(type, controller.signal, scope)
      .then((nextTags) => {
        if (!active) return;
        setTags(nextTags);
        setLoading(false);
      })
      .catch((error) => {
        if (!active || error.name === 'AbortError') return;
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [type, revision, scope]);

  return { tags, loading };
}
