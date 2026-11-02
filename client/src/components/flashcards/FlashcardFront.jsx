import { MousePointerClick } from 'lucide-react';
import { WORD_TYPES } from '../../constants.js';
import { wordSpeechText } from '../../utils.js';
import { TagChip } from '../tags/TagChip.jsx';
import { SpeakButton } from '../ui/SpeakButton.jsx';
import { GenderBadge } from '../words/GenderBadge.jsx';

export function FlashcardFront({ word }) {
  const type = WORD_TYPES[word.type];
  const Icon = type?.icon;
  const isNoun = word.type === 'noun';

  return (
    <div className="flashcard-face flashcard-face--front">
      <div className="flashcard-face__top">
        <span className="flashcard-type">
          {Icon ? <Icon size={14} aria-hidden="true" /> : null}
          {type?.singular}
        </span>

        <div className="flashcard-face__tags">
          {word.tags.slice(0, 2).map((tag) => (
            <TagChip key={tag} name={tag} size="sm" />
          ))}
        </div>
      </div>

      <div className="flashcard-front__center">
        <div className="flashcard-front__word-row">
          {isNoun ? (
            <>
              <p className={`flashcard-word flashcard-word--noun text-gender-${word.gender}`}>
                <span className="article">{word.article}</span>
                <span>{word.german}</span>
              </p>
              <GenderBadge gender={word.gender} />
            </>
          ) : (
            <p className="flashcard-word">{word.german}</p>
          )}
          <SpeakButton
            text={wordSpeechText(word)}
            label={`Listen to ${word.german}`}
            size="lg"
          />
        </div>

        {word.irregular ? <span className="flashcard-irregular">irregular verb</span> : null}
      </div>

      <p className="flashcard-hint">
        <MousePointerClick size={14} aria-hidden="true" />
        Click the card or press Space to reveal
      </p>
    </div>
  );
}
