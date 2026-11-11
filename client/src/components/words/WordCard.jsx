import { CheckSquare, ExternalLink, Pencil, Square, Trash2 } from 'lucide-react';
import { WORD_TYPES } from '../../constants.js';
import { cx, wordSpeechText } from '../../utils.js';
import { TagChip } from '../tags/TagChip.jsx';
import { SpeakButton } from '../ui/SpeakButton.jsx';
import { ComparisonParts } from './ComparisonParts.jsx';
import { ExampleBlock } from './ExampleBlock.jsx';
import { GenderBadge } from './GenderBadge.jsx';
import { GrammarBadges } from './GrammarBadges.jsx';
import { MeaningList } from './MeaningList.jsx';
import { PrincipalParts } from './PrincipalParts.jsx';

export function WordCard({
  word,
  onEdit,
  onDelete,
  onTagClick,
  selectable = false,
  selected = false,
  onToggleSelect,
}) {
  const type = WORD_TYPES[word.type];
  const Icon = type?.icon;
  const isNoun = word.type === 'noun';
  const isAdjective = word.type === 'adjective';

  function handleSelectKeyDown(event) {
    if (!selectable) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onToggleSelect?.(word);
  }

  return (
    <article
      className={cx(
        'word-card',
        `word-card--${word.type}`,
        selectable && 'is-selectable',
        selected && 'is-selected',
      )}
      onClick={selectable ? () => onToggleSelect?.(word) : undefined}
      onKeyDown={handleSelectKeyDown}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-pressed={selectable ? selected : undefined}
    >
      {selectable ? (
        <span
          className={cx('word-card__select', selected && 'is-checked')}
          aria-hidden="true"
        >
          {selected ? <CheckSquare size={18} /> : <Square size={18} />}
        </span>
      ) : null}

      <div className="word-card__top">
        <div className="word-card__heading">
          <div className="word-card__kicker">
            {Icon ? <Icon size={13} aria-hidden="true" /> : null}
            <span>{type?.singular}</span>
          </div>

          <div className="word-card__word-row">
            <h3 className={cx('word-card__german', isNoun && `text-gender-${word.gender}`)}>
              {isNoun ? (
                <>
                  <span className="article">{word.article}</span> {word.german}
                </>
              ) : word.german}
            </h3>
            <SpeakButton
              text={wordSpeechText(word)}
              label={`Listen to ${word.german}`}
              size="sm"
            />
          </div>

          <div className="word-card__subline">
            {isNoun && word.gender ? <GenderBadge gender={word.gender} size="sm" /> : null}
            {isNoun ? (
              <span className="word-card__plural">
                plural: <strong>{word.plural ? `die ${word.plural}` : '—'}</strong>
              </span>
            ) : null}
            {!isNoun ? (
              <span className="word-card__meaning">
                <MeaningList meanings={word.english} />
              </span>
            ) : null}
            <GrammarBadges word={word} />
          </div>
        </div>

        {!selectable ? (
          <div className="word-card__actions">
            <button type="button" onClick={() => onEdit(word)} aria-label={`Edit ${word.german}`}>
              <Pencil size={15} />
            </button>
            <button
              type="button"
              className="is-danger"
              onClick={() => onDelete(word)}
              aria-label={`Delete ${word.german}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="word-card__body">
        {word.type === 'verb' ? <PrincipalParts parts={word.parts} /> : null}

        {isAdjective ? <ComparisonParts parts={word.parts} /> : null}

        {isAdjective && word.opposite ? (
          <p className="word-card__opposite">
            <span>Gegenteil</span>
            <strong>{word.opposite}</strong>
            <SpeakButton
              text={word.opposite}
              label="Listen to the opposite"
              size="sm"
            />
          </p>
        ) : null}

        {isNoun ? (
          <p className="word-card__translation">
            <MeaningList meanings={word.english} />
          </p>
        ) : null}

        <ExampleBlock example={word.example} compact />
      </div>

      <div className="word-card__footer">
        <div className="word-card__tags">
          {word.tags.length > 0 ? (
            word.tags.map((tag) => (
              <TagChip
                key={tag}
                name={tag}
                size="sm"
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
              />
            ))
          ) : (
            <span className="muted-text">No tags</span>
          )}
        </div>

        {word.sourceUrl ? (
          <a
            className="word-card__source"
            href={word.sourceUrl}
            target="_blank"
            rel="noreferrer"
            title="Open on verbformen.com"
          >
            <ExternalLink size={13} aria-hidden="true" />
            source
          </a>
        ) : null}
      </div>
    </article>
  );
}
