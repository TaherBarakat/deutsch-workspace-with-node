import { useState } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { cx } from '../../utils.js';
import { isSpeechSupported, speakGerman } from '../../lib/speech.js';

export function SpeakButton({
  text,
  label = 'Listen in German',
  size = 'md',
  className,
}) {
  const [speaking, setSpeaking] = useState(false);

  if (!text || !isSpeechSupported()) return null;

  function handleClick(event) {
    event.stopPropagation();
    event.preventDefault();

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    speakGerman(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  const Icon = speaking ? Square : Volume2;

  return (
    <button
      type="button"
      className={cx(
        'speak-button',
        `speak-button--${size}`,
        speaking && 'is-speaking',
        className,
      )}
      onClick={handleClick}
      aria-label={speaking ? `${label}: stop` : `${label}: ${text}`}
      title={speaking ? 'Stop' : label}
    >
      <Icon size={size === 'lg' ? 18 : size === 'sm' ? 13 : 15} aria-hidden="true" />
    </button>
  );
}
