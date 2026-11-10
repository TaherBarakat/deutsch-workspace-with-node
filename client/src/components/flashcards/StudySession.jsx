import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  PartyPopper,
  RotateCcw,
  Shuffle,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { shuffle as shuffleArray, wordSpeechText } from '../../utils.js';
import { speakGerman } from '../../lib/speech.js';
import { Button, IconButton } from '../ui/Button.jsx';
import { Flashcard } from './Flashcard.jsx';

export function StudySession({ deck, direction = 'german', onExit, onNewDeck }) {
  const [sessionDeck, setSessionDeck] = useState(deck);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);

  const word = sessionDeck[index];
  const isLast = index === sessionDeck.length - 1;
  const progress = sessionDeck.length > 0
    ? Math.round(((index + (flipped ? 0.5 : 0)) / sessionDeck.length) * 100)
    : 0;

  function goNext() {
    if (isLast) {
      setFinished(true);
      return;
    }

    setIndex((current) => current + 1);
    setFlipped(false);
  }

  function goPrevious() {
    if (index === 0) return;
    setIndex((current) => current - 1);
    setFlipped(false);
  }

  function restart() {
    setSessionDeck(deck);
    setIndex(0);
    setFlipped(false);
    setFinished(false);
  }

  function reshuffle() {
    setSessionDeck(shuffleArray(deck));
    setIndex(0);
    setFlipped(false);
    setFinished(false);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) return;
      }

      if (finished) return;

      const key = event.key.toLowerCase();

      if (event.code === 'Space') {
        event.preventDefault();
        setFlipped((current) => !current);
        return;
      }

      if (key === 'u') {
        event.preventDefault();
        speakGerman(wordSpeechText(word));
        return;
      }

      if (key === 'l') {
        event.preventDefault();
        if (isLast) {
          setFinished(true);
        } else {
          setIndex((current) => current + 1);
          setFlipped(false);
        }
        return;
      }

      if (key === 'h') {
        event.preventDefault();
        setIndex((current) => Math.max(0, current - 1));
        setFlipped(false);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (isLast) setFinished(true);
        else {
          setIndex((current) => current + 1);
          setFlipped(false);
        }
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((current) => Math.max(0, current - 1));
        setFlipped(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finished, isLast, word]);

  if (finished) {
    return (
      <div className="session-complete">
        <span className="session-complete__icon">
          <PartyPopper size={30} aria-hidden="true" />
        </span>
        <p className="eyebrow">Session complete</p>
        <h2>You reviewed {sessionDeck.length} {sessionDeck.length === 1 ? 'word' : 'words'}.</h2>
        <p>Repeat the deck, shuffle it for a fresh order, or build a new mix.</p>

        <div className="session-complete__actions">
          <Button variant="primary" icon={RotateCcw} onClick={restart}>Study again</Button>
          <Button variant="secondary" icon={Shuffle} onClick={reshuffle}>Shuffle again</Button>
          <Button variant="ghost" icon={SlidersHorizontal} onClick={onNewDeck}>New deck</Button>
        </div>

        <button type="button" className="text-link" onClick={onExit}>
          Back to deck setup
        </button>
      </div>
    );
  }

  return (
    <div className="study-session">
      <header className="session-header">
        <div>
          <p className="eyebrow">Flashcard session</p>
          <h1>Card {index + 1} <span>of {sessionDeck.length}</span></h1>
        </div>

        <div className="session-header__actions">
          <IconButton icon={Shuffle} label="Shuffle remaining deck" onClick={reshuffle} />
          <Button variant="ghost" icon={X} size="sm" onClick={onExit}>End session</Button>
        </div>
      </header>

      <div className="session-progress" aria-label={`${progress}% through the deck`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <Flashcard
        word={word}
        flipped={flipped}
        direction={direction}
        onFlip={() => setFlipped((current) => !current)}
      />

      <div className="session-controls">
        <button
          type="button"
          className="session-nav"
          onClick={goPrevious}
          disabled={index === 0}
          aria-label="Previous card"
        >
          <ArrowLeft size={19} />
        </button>

        <Button variant="accent" size="lg" onClick={() => setFlipped((current) => !current)}>
          {flipped ? 'Show the word' : 'Reveal answer'}
        </Button>

        <button
          type="button"
          className="session-nav"
          onClick={goNext}
          aria-label={isLast ? 'Finish session' : 'Next card'}
        >
          {isLast ? <PartyPopper size={19} /> : <ArrowRight size={19} />}
        </button>
      </div>

      <p className="session-keyboard-hint">
        <kbd>Space</kbd> flip · <kbd>H</kbd> <kbd>L</kbd> move · <kbd>U</kbd> sound
      </p>
    </div>
  );
}
