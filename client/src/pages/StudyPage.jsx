import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { WORD_TYPES } from '../constants.js';
import { useRefresh } from '../contexts/RefreshContext.jsx';
import { useStats } from '../hooks/useStats.js';
import { useTags } from '../hooks/useTags.js';
import { parseTagsParam, shuffle } from '../utils.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { LoadingState } from '../components/ui/Loading.jsx';
import { StudySetup } from '../components/flashcards/StudySetup.jsx';
import { StudySession } from '../components/flashcards/StudySession.jsx';

function typesFromParam(value) {
  const requested = String(value ?? '')
    .split(',')
    .map((type) => type.trim())
    .filter((type) => WORD_TYPES[type]);

  return requested.length > 0 ? requested : ['verb', 'noun'];
}

function tagsFromParams(searchParams) {
  return parseTagsParam(searchParams.get('tags') ?? searchParams.get('tag') ?? '');
}

export function StudyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { version } = useRefresh();
  const { stats, loading: statsLoading } = useStats(version);
  const { tags } = useTags(null, version);

  const queryString = searchParams.toString();

  const [config, setConfig] = useState(() => ({
    types: typesFromParam(searchParams.get('types')),
    tags: tagsFromParams(searchParams),
    tagMode: searchParams.get('tagMode') === 'all' ? 'all' : 'any',
    order: searchParams.get('order') === 'shuffle' ? 'shuffle' : 'alpha',
    count: 'all',
  }));
  const [deck, setDeck] = useState(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setConfig((current) => ({
      ...current,
      types: typesFromParam(searchParams.get('types')),
      tags: tagsFromParams(searchParams),
      tagMode: searchParams.get('tagMode') === 'all' ? 'all' : 'any',
      order: searchParams.get('order') === 'shuffle' ? 'shuffle' : 'alpha',
    }));
    setDeck(null);
    setError('');
    // Search params are the source of truth when arriving from another page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  async function startSession() {
    if (config.types.length === 0) {
      setError('Choose at least one word category.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const words = await api.words.list({
        types: config.types,
        tags: config.tags,
        tagMode: config.tagMode,
        sort: 'alpha',
      });

      let nextDeck = config.order === 'shuffle' ? shuffle(words) : words;

      if (config.count !== 'all') {
        nextDeck = nextDeck.slice(0, Number(config.count));
      }

      if (nextDeck.length === 0) {
        setError('No words match this deck. Try another tag or category.');
        return;
      }

      setDeck(nextDeck);
      setSessionKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (statsLoading) {
    return <LoadingState label="Preparing your library…" />;
  }

  if (deck) {
    return (
      <StudySession
        key={sessionKey}
        deck={deck}
        onExit={() => setDeck(null)}
        onNewDeck={() => setDeck(null)}
      />
    );
  }

  return (
    <div className="study-page">
      <PageHeader
        eyebrow="Üben"
        title="Flashcards"
        description="Turn your vocabulary into cards. Filter by tag, mix categories, and flip at your own pace."
        meta={(
          <>
            <span>{stats.total} words available</span>
            <span>{tags.length} tags</span>
          </>
        )}
      />

      <StudySetup
        config={config}
        onChange={setConfig}
        tags={tags}
        stats={stats}
        onStart={startSession}
        loading={loading}
        error={error}
        onAddWords={() => navigate('/verbs?add=1')}
      />
    </div>
  );
}
