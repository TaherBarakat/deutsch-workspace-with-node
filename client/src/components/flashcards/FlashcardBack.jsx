import { WORD_TYPES } from '../../constants.js';
import { TagChip } from '../tags/TagChip.jsx';
import { ExampleBlock } from '../words/ExampleBlock.jsx';
import { GenderBadge } from '../words/GenderBadge.jsx';
import { MeaningList } from '../words/MeaningList.jsx';
import { PrincipalParts } from '../words/PrincipalParts.jsx';

function DetailRow({ label, children }) {
  return (
    <div className="flashcard-detail">
      <span className="flashcard-detail__label">{label}</span>
      <div className="flashcard-detail__value">{children}</div>
    </div>
  );
}

export function FlashcardBack({ word }) {
  const type = WORD_TYPES[word.type];
  const isNoun = word.type === 'noun';
  const isVerb = word.type === 'verb';

  return (
    <div className="flashcard-face flashcard-face--back">
      <div className="flashcard-face__top">
        <span className="flashcard-type flashcard-type--answer">Answer</span>
        <div className="flashcard-face__tags">
          {word.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} name={tag} size="sm" />
          ))}
        </div>
      </div>

      <div className="flashcard-back__heading">
        {isNoun ? (
          <>
            <p className={`flashcard-back__word text-gender-${word.gender}`}>
              <span className="article">{word.article}</span> {word.german}
            </p>
            <GenderBadge gender={word.gender} />
          </>
        ) : (
          <p className="flashcard-back__word">{word.german}</p>
        )}
      </div>

      <div className="flashcard-back__body">
        {isVerb ? (
          <DetailRow label="Principal parts">
            <PrincipalParts parts={word.parts} variant="stack" />
          </DetailRow>
        ) : null}

        <DetailRow label="English">
          <MeaningList meanings={word.english} limit={4} className="flashcard-meanings" />
        </DetailRow>

        {isNoun ? (
          <DetailRow label="Plural">
            <span className={word.plural ? `text-gender-${word.gender}` : undefined}>
              {word.plural ? `die ${word.plural}` : 'No plural recorded'}
            </span>
          </DetailRow>
        ) : null}

        {word.notes ? (
          <DetailRow label="Note">
            <span className="flashcard-note">{word.notes}</span>
          </DetailRow>
        ) : null}

        {word.example?.de || word.example?.en ? (
          <ExampleBlock example={word.example} />
        ) : null}
      </div>

      <p className="flashcard-hint flashcard-hint--back">
        {type?.singular} · press ← → to move through the deck
      </p>
    </div>
  );
}
