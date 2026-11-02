const GERMAN_LANG = /^de([-_]|$)/i;

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickGermanVoice() {
  if (!isSpeechSupported()) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const germanVoices = voices.filter((voice) => GERMAN_LANG.test(voice.lang));
  if (germanVoices.length === 0) return null;

  const preferred = germanVoices.find((voice) => (
    /google|deutsch|german|anna|petra|markus|katja|conrad/i.test(voice.name)
  ));

  return preferred ?? germanVoices[0];
}

/**
 * Speak a German word or sentence with the browser's speech synthesis engine.
 * Chrome exposes this as window.speechSynthesis; the chosen voice is the best
 * German voice available on the device.
 */
export function speakGerman(text, {
  rate = 0.9,
  pitch = 1,
  onStart,
  onEnd,
  onError,
} = {}) {
  const cleanText = String(text ?? '').trim();

  if (!cleanText) return false;
  if (!isSpeechSupported()) {
    onError?.(new Error('Speech synthesis is not available in this browser.'));
    return false;
  }

  const synthesis = window.speechSynthesis;
  synthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'de-DE';
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voice = pickGermanVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => {
    if (event.error === 'canceled' || event.error === 'interrupted') {
      onEnd?.();
      return;
    }
    onError?.(new Error(`Speech failed: ${event.error}`));
  };

  synthesis.speak(utterance);
  return true;
}
