import { cx } from '../../utils.js';
import { FlashcardBack } from './FlashcardBack.jsx';
import { FlashcardFront } from './FlashcardFront.jsx';

export function Flashcard({ word, flipped, direction = 'german', onFlip }) {
  const englishFirst = direction === 'english';

  return (
    <div
      className={cx('flashcard', flipped && 'is-flipped')}
      onClick={onFlip}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onFlip();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={
        flipped
          ? `Flashcard answer. Click to show the ${englishFirst ? 'English' : 'German'}.`
          : `Flashcard. Click to reveal the ${englishFirst ? 'German' : 'answer'}.`
      }
    >
      <div className="flashcard__inner">
        <div className="flashcard__face flashcard__face--front" aria-hidden={flipped}>
          <FlashcardFront word={word} direction={direction} />
        </div>
        <div className="flashcard__face flashcard__face--back" aria-hidden={!flipped}>
          <FlashcardBack word={word} direction={direction} />
        </div>
      </div>
    </div>
  );
}
