export function collapseWhitespace(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim();
}

export function getIntro($) {
  return collapseWhitespace($('h1').first().next('p').text());
}

export function getEnglishMeanings($, limit = 8) {
  const translation = $('dd[lang="en"]').first();
  if (translation.length === 0) return [];

  const clone = translation.clone();
  clone.find('.vLng').remove();

  return collapseWhitespace(clone.text())
    .split(',')
    .map((meaning) => meaning.trim())
    .filter(Boolean)
    .slice(0, limit);
}

export function getExample($) {
  const exampleSection = $('section')
    .filter((index, element) => $(element).find('h2').first().text().trim() === 'Examples')
    .first();

  const item = (exampleSection.length > 0 ? exampleSection : $('.vBsp')).find('li').first();
  if (item.length === 0) return null;

  const englishLabel = item.find('img[alt="English"]').first();
  const english = englishLabel.length > 0
    ? collapseWhitespace(englishLabel.parent().text())
    : null;

  const clone = item.clone();
  clone.find('a').remove();
  clone.find('img[alt="English"]').closest('span').remove();
  clone.find('br').remove();

  const german = collapseWhitespace(clone.text());
  if (!german && !english) return null;

  return {
    de: german || null,
    en: english || null,
  };
}

/**
 * Search listing rows keep the German and English halves of an example in one
 * paragraph, separated by an English flag image. Walk the children so the two
 * languages stay apart instead of collapsing into one run-on sentence.
 */
export function getBilingualExample($, element) {
  if (!element || element.length === 0) return null;

  const german = [];
  const english = [];
  let inEnglish = false;

  const walk = (node) => {
    if (node.type === 'text') {
      (inEnglish ? english : german).push(node.data ?? '');
      return;
    }

    if (node.type !== 'tag') return;

    if (node.name === 'img' && node.attribs?.alt === 'English') {
      inEnglish = true;
      return;
    }

    if (node.name === 'br') {
      (inEnglish ? english : german).push(' ');
      return;
    }

    for (const child of node.children ?? []) walk(child);
  };

  for (const child of element[0]?.children ?? []) walk(child);

  const de = collapseWhitespace(german.join(' ').replace(/^[»\s]+/, ''));
  const en = collapseWhitespace(english.join(' '));

  if (!de && !en) return null;
  return { de: de || null, en: en || null };
}

export function getEnglishMeaningsFromElement($, element, limit = 8) {
  if (!element || element.length === 0) return [];

  return collapseWhitespace(element.first().text())
    .split(',')
    .map((meaning) => meaning.trim())
    .filter(Boolean)
    .slice(0, limit);
}
