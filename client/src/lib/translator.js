const SOURCE_LANGUAGE = 'de';
const TARGET_LANGUAGE = 'en';

let translatorPromise = null;

export function isTranslatorSupported() {
  return typeof globalThis !== 'undefined'
    && typeof globalThis.Translator?.create === 'function'
    && typeof globalThis.Translator?.availability === 'function';
}

/**
 * Chrome's built-in Translator API. The first call may download the German →
 * English model; the button that triggers it should stay inside a user gesture.
 */
export async function translateGermanToEnglish(text, { onProgress } = {}) {
  const cleanText = String(text ?? '').trim();
  if (!cleanText) throw new Error('Enter a German sentence first.');

  if (!isTranslatorSupported()) {
    throw new Error(
      'Chrome’s built-in Translator API is not available in this browser. '
      + 'Use a recent Chrome version with translation models enabled, or type the English yourself.',
    );
  }

  const Translator = globalThis.Translator;
  const availability = await Translator.availability({
    sourceLanguage: SOURCE_LANGUAGE,
    targetLanguage: TARGET_LANGUAGE,
  });

  if (availability === 'unavailable') {
    throw new Error(
      'German → English translation is unavailable on this device. '
      + 'Type the translation manually or check Chrome’s translation model settings.',
    );
  }

  if (!translatorPromise) {
    translatorPromise = Translator.create({
      sourceLanguage: SOURCE_LANGUAGE,
      targetLanguage: TARGET_LANGUAGE,
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => {
          onProgress?.(Math.round((event.loaded ?? 0) * 100));
        });
      },
    }).catch((error) => {
      translatorPromise = null;
      throw error;
    });
  }

  const translator = await translatorPromise;
  return translator.translate(cleanText);
}
