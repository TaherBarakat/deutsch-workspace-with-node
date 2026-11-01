import { cx } from '../../utils.js';
import { FlashcardBack } from './FlashcardBack.jsx';
import { FlashcardFront } from './FlashcardFront.jsx';

export function Flashcard({ word, flipped, onFlip }) {
  return (
    <div
      className={cx('flashcard', flipped && 'is-flipped')}
      onClick={onFlip}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onFlip();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Flashcard answer. Click to show the word.' : 'Flashcard. Click to reveal the answer.'}
    >
      <div className="flashcard__inner">
        <div className="flashcard__face flashcard__face--front" aria-hidden={flipped}>
          <FlashcardFront word={word} />
        </div>
        <div className="flashcard__face flashcard__face--back" aria-hidden={!flipped}>
          <FlashcardBack word={word} />
        </div>
      </div>
    </div>
  );
}
