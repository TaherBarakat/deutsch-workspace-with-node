import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquareQuote, Plus, SearchX } from 'lucide-react';
import { api } from '../api.js';
import { parseTagsParam, pluralize, toggleTag } from '../utils.js';
import { useRefresh } from '../contexts/RefreshContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useSentences } from '../hooks/useSentences.js';
import { useTags } from '../hooks/useTags.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { CardSkeletonGrid } from '../components/ui/Loading.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { TagFilter } from '../components/tags/TagFilter.jsx';
import { SentenceList } from '../components/sentences/SentenceList.jsx';
import { SentenceToolbar } from '../components/sentences/SentenceToolbar.jsx';
import { SentenceFormModal } from '../components/sentences/SentenceFormModal.jsx';

export function SentencesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { version, refresh } = useRefresh();
  const { push } = useToast();

  const activeTags = parseTagsParam(
    searchParams.get('tags') ?? searchParams.get('tag') ?? '',
  );
  const tagMode = searchParams.get('tagMode') === 'all' ? 'all' : 'any';
  const search = searchParams.get('q') ?? '';
  const addRequested = searchParams.get('add') === '1';

  const [formState, setFormState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { sentences, loading, error } = useSentences(
    { tags: activeTags, tagMode, q: debouncedSearch },
    version,
  );
  const { tags } = useTags(null, version, 'sentences');
  const { tags: allTags } = useTags(null, version);

  useEffect(() => {
    if (!addRequested) return;

    setFormState({ sentence: null });
    const next = new URLSearchParams(searchParams);
    next.delete('add');
    setSearchParams(next, { replace: true });
  }, [addRequested, searchParams, setSearchParams]);

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  function setTags(nextTags) {
    const next = new URLSearchParams(searchParams);
    next.delete('tag');
    if (nextTags.length > 0) next.set('tags', nextTags.join(','));
    else next.delete('tags');
    if (nextTags.length < 2) next.delete('tagMode');
    setSearchParams(next, { replace: true });
  }

  function setTagMode(nextMode) {
    setParam('tagMode', nextMode === 'all' ? 'all' : '');
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  function handleSaved() {
    setFormState(null);
    refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await api.sentences.remove(deleteTarget.id);
      push('Sentence deleted.', 'success');
      setDeleteTarget(null);
      refresh();
    } catch (requestError) {
      push(requestError.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = activeTags.length > 0 || Boolean(search);

  return (
    <div className="word-section-page sentences-page">
      <PageHeader
        eyebrow="Sätze"
        title="Sentences"
        description="Collect whole sentences with tags, listen to them, and translate with Chrome’s built-in Translator API."
        meta={(
          <>
            <span>{pluralize(sentences.length, 'sentence')} shown</span>
            {activeTags.length > 0 ? (
              <span className="meta-pill">
                {tagMode === 'all' ? 'all' : 'any'}: {activeTags.join(' · ')}
              </span>
            ) : null}
          </>
        )}
        actions={(
          <Button variant="accent" icon={Plus} onClick={() => setFormState({ sentence: null })}>
            Add sentence
          </Button>
        )}
      />

      <SentenceToolbar
        search={search}
        onSearch={(value) => setParam('q', value)}
        resultCount={sentences.length}
      />

      <TagFilter
        tags={tags}
        activeTags={activeTags}
        mode={tagMode}
        onChange={setTags}
        onModeChange={setTagMode}
        label="Filter by tags"
      />

      {loading && sentences.length === 0 ? <CardSkeletonGrid /> : null}

      {error && !loading ? (
        <EmptyState
          icon={SearchX}
          title="Could not load your sentences"
          description={error.message}
          actionLabel="Try again"
          onAction={refresh}
        />
      ) : null}

      {!loading && !error && sentences.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No sentences match these filters"
            description="Nothing matches the current search or tags."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <EmptyState
            icon={MessageSquareQuote}
            title="No sentences yet"
            description="Add your first German sentence, tag it, and use Chrome translation to fill in the English side."
            actionLabel="Add sentence"
            onAction={() => setFormState({ sentence: null })}
          />
        )
      ) : null}

      {!error && sentences.length > 0 ? (
        <SentenceList
          sentences={sentences}
          onEdit={(sentence) => setFormState({ sentence })}
          onDelete={setDeleteTarget}
          onTagClick={(nextTag) => setTags(toggleTag(activeTags, nextTag))}
        />
      ) : null}

      {formState ? (
        <SentenceFormModal
          sentence={formState.sentence}
          suggestions={allTags}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Delete this sentence?"
          description="This removes the sentence and its tags from your library. This cannot be undone."
          confirmLabel="Delete sentence"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          busy={deleting}
        />
      ) : null}
    </div>
  );
}
