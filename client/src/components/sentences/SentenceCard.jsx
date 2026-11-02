import { ExternalLink, Pencil, Quote, Trash2 } from 'lucide-react';
import { TagChip } from '../tags/TagChip.jsx';
import { SpeakButton } from '../ui/SpeakButton.jsx';

export function SentenceCard({ sentence, onEdit, onDelete, onTagClick }) {
  const english = sentence.english?.join(' ') ?? '';

  return (
    <article className="sentence-card">
      <div className="sentence-card__top">
        <div className="sentence-card__de-row">
          <Quote size={16} className="sentence-card__quote" aria-hidden="true" />
          <p className="sentence-card__de">{sentence.german}</p>
          <SpeakButton
            text={sentence.german}
            label="Listen to the sentence"
            size="sm"
          />
        </div>

        <div className="sentence-card__actions">
          <button type="button" onClick={() => onEdit(sentence)} aria-label="Edit sentence">
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="is-danger"
            onClick={() => onDelete(sentence)}
            aria-label="Delete sentence"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {english ? (
        <p className="sentence-card__en">{english}</p>
      ) : (
        <p className="sentence-card__en sentence-card__en--empty">No English translation yet.</p>
      )}

      {sentence.notes ? <p className="sentence-card__notes">{sentence.notes}</p> : null}

      <div className="sentence-card__footer">
        <div className="sentence-card__tags">
          {sentence.tags.length > 0 ? (
            sentence.tags.map((tag) => (
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

        {sentence.sourceUrl ? (
          <a
            className="word-card__source"
            href={sentence.sourceUrl}
            target="_blank"
            rel="noreferrer"
            title="Open source"
          >
            <ExternalLink size={13} aria-hidden="true" />
            source
          </a>
        ) : null}
      </div>
    </article>
  );
}
