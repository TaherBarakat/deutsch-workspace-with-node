import { useEffect, useState } from 'react';
import { api } from '../api.js';

const EMPTY_STATS = {
  total: 0,
  byType: { verb: 0, noun: 0, adjective: 0, adverb: 0 },
  sentences: 0,
  tags: [],
  recent: [],
};

export function useStats(revision = 0) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    api.stats
      .get(controller.signal)
      .then((nextStats) => {
        if (!active) return;
        setStats(nextStats);
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
  }, [revision]);

  return { stats, loading };
}
