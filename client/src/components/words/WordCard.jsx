import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { WORD_TYPES } from '../../constants.js';
import { cx } from '../../utils.js';
import { TagChip } from '../tags/TagChip.jsx';
import { ExampleBlock } from './ExampleBlock.jsx';
import { GenderBadge } from './GenderBadge.jsx';
import { MeaningList } from './MeaningList.jsx';
import { PrincipalParts } from './PrincipalParts.jsx';

export function WordCard({ word, onEdit, onDelete, onTagClick }) {
  const type = WORD_TYPES[word.type];
  const Icon = type?.icon;
  const isNoun = word.type === 'noun';

  return (
    <article className={cx('word-card', `word-card--${word.type}`)}>
      <div className="word-card__top">
        <div className="word-card__heading">
          <div className="word-card__kicker">
            {Icon ? <Icon size={13} aria-hidden="true" /> : null}
            <span>{type?.singular}</span>
            {word.irregular ? <span className="word-card__irregular">irregular</span> : null}
          </div>

          <h3 className={cx('word-card__german', isNoun && `text-gender-${word.gender}`)}>
            {isNoun ? (
              <>
                <span className="article">{word.article}</span> {word.german}
              </>
            ) : word.german}
          </h3>

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
          </div>
        </div>

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
      </div>

      <div className="word-card__body">
        {word.type === 'verb' ? <PrincipalParts parts={word.parts} /> : null}

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
