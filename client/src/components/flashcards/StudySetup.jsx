import { ArrowDownAZ, Check, Layers3, Shuffle, Tag } from 'lucide-react';
import { STUDY_COUNTS, WORD_TYPE_LIST } from '../../constants.js';
import { pluralize } from '../../utils.js';
import { Button } from '../ui/Button.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

export function StudySetup({
  config,
  onChange,
  tags,
  stats,
  onStart,
  loading,
  error,
  onAddWords,
}) {
  const selectedWordCount = config.types.reduce(
    (sum, type) => sum + (stats.byType[type] ?? 0),
    0,
  );

  function toggleType(type) {
    const selected = config.types.includes(type);
    const next = selected
      ? config.types.filter((item) => item !== type)
      : [...config.types, type];

    onChange({ ...config, types: next });
  }

  if (stats.total === 0) {
    return (
      <EmptyState
        icon={Layers3}
        title="Your first deck needs a few words"
        description="Add verbs, nouns, adjectives or adverbs to your library, then come back to build a flashcard session."
        actionLabel="Add your first word"
        onAction={onAddWords}
      />
    );
  }

  return (
    <div className="study-setup">
      <section className="study-panel">
        <div className="study-panel__heading">
          <span className="study-step">01</span>
          <div>
            <h2>Choose your words</h2>
            <p>Mix categories, or focus on just one.</p>
          </div>
        </div>

        <div className="type-toggle-grid">
          {WORD_TYPE_LIST.map((type) => {
            const Icon = type.icon;
            const selected = config.types.includes(type.key);
            const count = stats.byType[type.key] ?? 0;

            return (
              <button
                type="button"
                key={type.key}
                className={selected ? 'type-toggle is-selected' : 'type-toggle'}
                onClick={() => toggleType(type.key)}
                aria-pressed={selected}
                disabled={count === 0}
              >
                <span className={`type-toggle__icon type-toggle__icon--${type.tone}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="type-toggle__copy">
                  <strong>{type.label}</strong>
                  <small>{pluralize(count, 'word')}</small>
                </span>
                <span className="type-toggle__check">
                  {selected ? <Check size={14} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="study-panel">
        <div className="study-panel__heading">
          <span className="study-step">02</span>
          <div>
            <h2>Shape the deck</h2>
            <p>Filter by a tag and decide how many cards to review.</p>
          </div>
        </div>

        <div className="study-options">
          <label className="select-field select-field--large">
            <Tag size={15} aria-hidden="true" />
            <select
              value={config.tag}
              onChange={(event) => onChange({ ...config, tag: event.target.value })}
              aria-label="Filter flashcards by tag"
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  {tag.name} ({tag.count})
                </option>
              ))}
            </select>
          </label>

          <div className="segmented" role="group" aria-label="Deck order">
            <button
              type="button"
              className={config.order === 'shuffle' ? 'is-active' : undefined}
              onClick={() => onChange({ ...config, order: 'shuffle' })}
            >
              <Shuffle size={14} /> Shuffle
            </button>
            <button
              type="button"
              className={config.order === 'alpha' ? 'is-active' : undefined}
              onClick={() => onChange({ ...config, order: 'alpha' })}
            >
              <ArrowDownAZ size={15} /> A → Z
            </button>
          </div>

          <div className="segmented" role="group" aria-label="Number of cards">
            {STUDY_COUNTS.map((count) => (
              <button
                type="button"
                key={count.value}
                className={config.count === count.value ? 'is-active' : undefined}
                onClick={() => onChange({ ...config, count: count.value })}
              >
                {count.label}
              </button>
            ))}
          </div>
        </div>

        <div className="deck-summary">
          <div>
            <span>Your deck</span>
            <strong>
              {selectedWordCount === 0
                ? 'No words selected'
                : config.count === 'all'
                  ? `Up to ${pluralize(selectedWordCount, 'word')}`
                  : `Up to ${Math.min(selectedWordCount, Number(config.count))} words`}
            </strong>
          </div>
          <p>
            {config.tag ? `Tagged “${config.tag}”. ` : 'All tags. '}
            {config.types.length > 1 ? 'Mixed categories.' : 'One category.'}
          </p>
        </div>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <Button
          variant="accent"
          size="lg"
          icon={Layers3}
          onClick={onStart}
          disabled={loading || config.types.length === 0}
          className="study-start"
        >
          {loading ? 'Building your deck…' : 'Start flashcards'}
        </Button>
      </section>
    </div>
  );
}
