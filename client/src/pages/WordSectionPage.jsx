import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layers3, ListPlus, Plus, SearchX } from 'lucide-react';
import {
  CASE_OPTIONS,
  NOUN_GROUP_OPTIONS,
  PLURAL_PATTERN_OPTIONS,
  REFLEXIVE_OPTIONS,
  REGULARITY_OPTIONS,
  SEPARABILITY_OPTIONS,
  VERB_GROUP_OPTIONS,
  WORD_TYPES,
} from '../constants.js';
import { api } from '../api.js';
import { parseTagsParam, pluralize, toggleTag } from '../utils.js';
import { useRefresh } from '../contexts/RefreshContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useTags } from '../hooks/useTags.js';
import { useWords } from '../hooks/useWords.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { CardSkeletonGrid } from '../components/ui/Loading.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { TagFilter } from '../components/tags/TagFilter.jsx';
import { WordList } from '../components/words/WordList.jsx';
import { WordToolbar } from '../components/words/WordToolbar.jsx';
import { WordFormModal } from '../components/words/WordFormModal.jsx';
import { BulkWordFormModal } from '../components/words/BulkWordFormModal.jsx';

export function WordSectionPage({ type }) {
  const typeMeta = WORD_TYPES[type];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { version, refresh } = useRefresh();
  const { push } = useToast();

  const activeTags = parseTagsParam(
    searchParams.get('tags') ?? searchParams.get('tag') ?? '',
  );
  const tagMode = searchParams.get('tagMode') === 'all' ? 'all' : 'any';
  const search = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'alpha';
  const group = searchParams.get('group') ?? '';
  const grouped = Boolean(group);
  const addRequested = searchParams.get('add') === '1';

  const grammarParams = {
    regularity: searchParams.get('regularity') ?? '',
    is_separable: searchParams.get('is_separable') ?? '',
    reflexive_type: searchParams.get('reflexive_type') ?? '',
    case_governed: searchParams.get('case_governed') ?? '',
    plural_pattern: searchParams.get('plural_pattern') ?? '',
  };

  const grammarFilters = type === 'verb'
    ? [
      { key: 'regularity', label: 'Regularity', options: REGULARITY_OPTIONS, value: grammarParams.regularity },
      { key: 'is_separable', label: 'Separability', options: SEPARABILITY_OPTIONS, value: grammarParams.is_separable },
      { key: 'reflexive_type', label: 'Reflexive', options: REFLEXIVE_OPTIONS, value: grammarParams.reflexive_type },
      { key: 'case_governed', label: 'Case', options: CASE_OPTIONS, value: grammarParams.case_governed },
    ]
    : type === 'noun'
      ? [
        { key: 'plural_pattern', label: 'Plural', options: PLURAL_PATTERN_OPTIONS, value: grammarParams.plural_pattern },
      ]
      : [];

  const extraGroupOptions = type === 'verb'
    ? VERB_GROUP_OPTIONS
    : type === 'noun'
      ? NOUN_GROUP_OPTIONS
      : [];

  const [formState, setFormState] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { words, loading, error } = useWords(
    {
      types: [type],
      tags: activeTags,
      tagMode,
      q: debouncedSearch,
      sort,
      ...grammarParams,
    },
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

  const hasFilters = activeTags.length > 0
    || Boolean(search)
    || Object.values(grammarParams).some(Boolean);
  const studyLink = `/study?types=${type}${
    activeTags.length > 0 ? `&tags=${encodeURIComponent(activeTags.join(','))}` : ''
  }${
    tagMode === 'all' && activeTags.length > 1 ? `&tagMode=all` : ''
  }`;

  return (
    <div className="word-section-page">
      <PageHeader
        eyebrow={typeMeta.eyebrow}
        title={typeMeta.label}
        description={typeMeta.description}
        meta={(
          <>
            <span>{pluralize(words.length, 'word')} shown</span>
            {activeTags.length > 0 ? (
              <span className="meta-pill">
                {tagMode === 'all' ? 'all' : 'any'}: {activeTags.join(' · ')}
              </span>
            ) : null}
            {type === 'verb' || type === 'noun' || type === 'adjective' ? (
              <span className="meta-hint">Auto-fill available from verbformen.com</span>
            ) : null}
          </>
        )}
        actions={(
          <>
            <Button variant="secondary" icon={Layers3} onClick={() => navigate(studyLink)}>
              Study these
            </Button>
            <Button variant="secondary" icon={ListPlus} onClick={() => setBulkOpen(true)}>
              Bulk add
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
        group={group}
        onGroupChange={(value) => setParam('group', value === group ? '' : value)}
        allowGenderGroup={type === 'noun'}
        allowGenderSort={type === 'noun'}
        extraGroups={extraGroupOptions}
        filters={grammarFilters}
        onFilterChange={setParam}
        resultCount={words.length}
      />

      <TagFilter
        tags={tags}
        activeTags={activeTags}
        mode={tagMode}
        onChange={setTags}
        onModeChange={setTagMode}
      />

      {grouped && words.length > 0 ? (
        <p className="group-note">
          {group === 'gender'
            ? 'Nouns are grouped by grammatical gender: masculine, feminine, then neuter.'
            : group === 'regularity'
              ? 'Verbs are grouped by regularity: regular, irregular, mixed, then modal.'
              : group === 'separability'
                ? 'Verbs are grouped by whether a prefix can separate from the stem.'
                : group === 'reflexive'
                  ? 'Verbs are grouped by whether they need or allow a reflexive pronoun.'
                  : group === 'case'
                    ? 'Verbs are grouped by the case or preposition pattern they govern.'
                    : group === 'plural'
                      ? 'Nouns are grouped by how their plural differs from the singular.'
                      : 'Words with more than one tag appear in each matching group.'}
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
              type === 'verb' || type === 'noun' || type === 'adjective'
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
          group={group}
          onEdit={(word) => setFormState({ word })}
          onDelete={setDeleteTarget}
          onTagClick={(nextTag) => setTags(toggleTag(activeTags, nextTag))}
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

      {bulkOpen ? (
        <BulkWordFormModal
          type={type}
          suggestions={allTags}
          onClose={() => setBulkOpen(false)}
          onImported={refresh}
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
