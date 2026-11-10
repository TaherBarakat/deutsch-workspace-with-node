import * as cheerio from 'cheerio';
import { ApiError } from '../lib/errors.js';
import {
  deriveCaseGoverned,
  deriveReflexiveType,
  deriveRegularity,
  deriveSeparability,
} from '../lib/grammar.js';
import { collapseWhitespace, getEnglishMeanings, getExample, getIntro } from './parseUtils.js';

function mergeSegments(segments) {
  const merged = [];

  for (const segment of segments) {
    if (!segment.text) continue;
    const previous = merged[merged.length - 1];

    if (previous && previous.style === segment.style) {
      previous.text += segment.text;
    } else {
      merged.push({ ...segment });
    }
  }

  if (merged.length > 0) {
    merged[0].text = merged[0].text.replace(/^\s+/, '');
    merged[merged.length - 1].text = merged[merged.length - 1].text.replace(/\s+$/, '');
  }

  return merged
    .map((segment) => ({ ...segment, text: segment.text.replace(/\s+/g, ' ') }))
    .filter((segment) => segment.text.length > 0);
}

/**
 * Converts one conjugation cell into safe text segments. verbformen uses <u>
 * for irregular stem changes and <i> for endings, which lets the UI colour
 * exactly the letters that changed.
 */
function segmentsFromCell($, cell) {
  const segments = [];

  const walk = (node, style = 'plain') => {
    if (node.type === 'text') {
      if (node.data) segments.push({ text: node.data, style });
      return;
    }

    if (node.type !== 'tag') return;

    let nextStyle = style;
    if (node.name === 'u') nextStyle = 'irregular';
    if (node.name === 'i') nextStyle = 'ending';

    for (const child of node.children ?? []) {
      walk(child, nextStyle);
    }
  };

  for (const node of cell[0]?.children ?? []) {
    walk(node);
  }

  return mergeSegments(segments);
}

function textFromSegments(segments) {
  return collapseWhitespace(segments.map((segment) => segment.text).join(''));
}

function findVerbTable($, heading) {
  return $('.vTbl')
    .filter((index, element) => $(element).find('h3').first().text().trim() === heading)
    .first();
}

function findThirdPersonRow($, table) {
  return table
    .find('tr')
    .filter((index, row) => $(row).find('td').first().text().trim() === 'er')
    .first();
}

function buildPart(text, segments) {
  const safeSegments = segments.length > 0 ? segments : [{ text, style: 'plain' }];
  return { text, segments: safeSegments };
}

function principalPartsFromTables($) {
  const presentRow = findThirdPersonRow($, findVerbTable($, 'Present'));
  const pastRow = findThirdPersonRow($, findVerbTable($, 'Imperfect'));
  const perfectRow = findThirdPersonRow($, findVerbTable($, 'Perfect'));

  if (presentRow.length === 0 && pastRow.length === 0 && perfectRow.length === 0) {
    return null;
  }

  const parts = {};

  if (presentRow.length > 0) {
    const cell = presentRow.find('td').eq(1);
    const segments = segmentsFromCell($, cell);
    parts.present = buildPart(textFromSegments(segments), segments);
  }

  if (pastRow.length > 0) {
    const cell = pastRow.find('td').eq(1);
    const segments = segmentsFromCell($, cell);
    parts.past = buildPart(textFromSegments(segments), segments);
  }

  if (perfectRow.length > 0) {
    const cells = perfectRow.find('td');
    const auxiliary = collapseWhitespace(cells.eq(1).text());
    const participleCell = cells.eq(2).length > 0 ? cells.eq(2) : cells.eq(1);
    const participleSegments = segmentsFromCell($, participleCell);
    const participle = textFromSegments(participleSegments);

    parts.perfect = buildPart(
      collapseWhitespace(`${auxiliary} ${participle}`),
      [
        ...(auxiliary ? [{ text: `${auxiliary} `, style: 'plain' }] : []),
        ...participleSegments,
      ],
    );
  }

  return Object.keys(parts).length > 0 ? parts : null;
}

export function parseVerb(html, requestedWord) {
  const $ = cheerio.load(html);
  const title = collapseWhitespace($('h1').first().text());

  if (!/Conjugation of German verb/i.test(title)) {
    throw new ApiError(
      422,
      `"${requestedWord}" does not look like a German verb on verbformen.com. Check the spelling or use the Nouns section.`,
    );
  }

  const intro = getIntro($);
  const principalMatch = intro.match(
    /principal parts of\s+"([^"]+)"\s+are\s+"([^"]+)",\s+"([^"]+)",?\s+and\s+"([^"]+)"/i,
  );

  const german = collapseWhitespace(principalMatch?.[1] || title.replace(/^Conjugation of German verb\s+/i, ''));
  const tableParts = principalPartsFromTables($);

  let parts = tableParts;
  if (!parts && principalMatch) {
    parts = {
      present: buildPart(principalMatch[2], [{ text: principalMatch[2], style: 'plain' }]),
      past: buildPart(principalMatch[3], [{ text: principalMatch[3], style: 'plain' }]),
      perfect: buildPart(principalMatch[4], [{ text: principalMatch[4], style: 'plain' }]),
    };
  }

  if (!parts) {
    throw new ApiError(422, `Could not read the conjugation of "${requestedWord}" from verbformen.com.`);
  }

  const hasMarkedIrregularity = Object.values(parts).some((part) =>
    part.segments.some((segment) => segment.style === 'irregular'),
  );
  const irregular = /is irregular/i.test(intro) || hasMarkedIrregularity;
  const wasReflexive = /^sich\s+/i.test(String(requestedWord ?? '').trim());

  return {
    type: 'verb',
    german,
    english: getEnglishMeanings($),
    parts,
    irregular,
    regularity: deriveRegularity({
      german,
      past: parts.past?.text ?? null,
      irregular,
      intro,
    }),
    is_separable: deriveSeparability({ german, intro }),
    reflexive_type: deriveReflexiveType({ german, wasReflexive }),
    case_governed: deriveCaseGoverned({ german }),
    example: getExample($),
    sourceUrl: `https://www.verbformen.com/?w=${encodeURIComponent(german)}`,
  };
}
