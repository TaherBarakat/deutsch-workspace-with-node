import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layers3, Plus, SearchX } from 'lucide-react';
import { WORD_TYPES } from '../constants.js';
import { api } from '../api.js';
import { useRefresh } from '../contexts/RefreshContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useTags } from '../hooks/useTags.js';
import { useWords } from '../hooks/useWords.js';
import { pluralize } from '../utils.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { CardSkeletonGrid, LoadingState } from '../components/ui/Loading.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { TagFilter } from '../components/tags/TagFilter.jsx';
import { WordList } from '../components/words/WordList.jsx';
import { WordToolbar } from '../components/words/WordToolbar.jsx';
import { WordFormModal } from '../components/words/WordFormModal.jsx';

export function WordSectionPage({ type }) {
  const typeMeta = WORD_TYPES[type];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { version, refresh } = useRefresh();
  const { push } = useToast();

  const tag = searchParams.get('tag') ?? '';
  const search = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'alpha';
  const grouped = searchParams.get('group') === 'tags';
  const addRequested = searchParams.get('add') === '1';

  const [formState, setFormState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { words, loading, error } = useWords(
    { types: [type], tag, q: debouncedSearch, sort },
    version,
  );
  const { tags } = useTags(type, version);
  const { tags: allTags } = useTags(null, version);

  useEffect(() => {
    if (!addRequested) return;

    setFormState({ word: null });
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

  function clearFilters() {
    const next = new URLSearchParams();
    if (sort !== 'alpha') next.set('sort', sort);
    setSearchParams(next, { replace: true });
  }

  function handleSaved() {
    setFormState(null);
    refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await api.words.remove(deleteTarget.id);
      push(`"${deleteTarget.german}" deleted.`, 'success');
      setDeleteTarget(null);
      refresh();
    } catch (requestError) {
      push(requestError.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = Boolean(tag || search);
  const studyLink = `/study?types=${type}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`;

  return (
    <div className="word-section-page">
      <PageHeader
        eyebrow={typeMeta.eyebrow}
        title={typeMeta.label}
        description={typeMeta.description}
        meta={(
          <>
            <span>{pluralize(words.length, 'word')} shown</span>
            {tag ? <span className="meta-pill">tag: {tag}</span> : null}
            {type === 'verb' || type === 'noun' ? (
              <span className="meta-hint">Auto-fill available from verbformen.com</span>
            ) : null}
          </>
        )}
        actions={(
          <>
            <Button variant="secondary" icon={Layers3} onClick={() => navigate(studyLink)}>
              Study {tag ? `“${tag}”` : 'these'}
            </Button>
            <Button variant="accent" icon={Plus} onClick={() => setFormState({ word: null })}>
              Add {typeMeta.singular}
            </Button>
          </>
        )}
      />

      <WordToolbar
        search={search}
        onSearch={(value) => setParam('q', value)}
        sort={sort}
        onSort={(value) => setParam('sort', value)}
        grouped={grouped}
        onToggleGrouped={() => setParam('group', grouped ? '' : 'tags')}
        resultCount={words.length}
      />

      <TagFilter
        tags={tags}
        activeTag={tag}
        onChange={(nextTag) => setParam('tag', nextTag)}
      />

      {grouped && words.length > 0 ? (
        <p className="group-note">
          Words with more than one tag appear in each matching group.
        </p>
      ) : null}

      {loading && words.length === 0 ? <CardSkeletonGrid /> : null}

      {error && !loading ? (
        <EmptyState
          icon={SearchX}
          title="Could not load your words"
          description={error.message}
          actionLabel="Try again"
          onAction={refresh}
        />
      ) : null}

      {!loading && !error && words.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No words match these filters"
            description={`Nothing in ${typeMeta.label.toLowerCase()} matches the current search or tag.`}
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <EmptyState
            icon={typeMeta.icon}
            title={`No ${typeMeta.label.toLowerCase()} yet`}
            description={
              type === 'verb' || type === 'noun'
                ? `Add your first ${typeMeta.singular}, fetch its details from verbformen.com, and tag it for later.`
                : `Add your first ${typeMeta.singular} with its English meaning and a short example.`
            }
            actionLabel={`Add ${typeMeta.singular}`}
            onAction={() => setFormState({ word: null })}
          />
        )
      ) : null}

      {!error && words.length > 0 ? (
        <WordList
          words={words}
          grouped={grouped}
          onEdit={(word) => setFormState({ word })}
          onDelete={setDeleteTarget}
          onTagClick={(nextTag) => setParam('tag', nextTag)}
        />
      ) : null}

      {formState ? (
        <WordFormModal
          type={type}
          word={formState.word}
          suggestions={allTags}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title={`Delete "${deleteTarget.german}"?`}
          description="This removes the word and its tags from your library. This cannot be undone."
          confirmLabel="Delete word"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          busy={deleting}
        />
      ) : null}
    </div>
  );
}
