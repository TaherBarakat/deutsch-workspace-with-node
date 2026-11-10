/**
 * High-level grammar tags for the word list UI.
 *
 * verbformen.com states regularity and separability in the intro paragraph,
 * so those two are primary-scraped. Reflexivity and governed case need a
 * dictionary (kaikki/Duden), which this app does not call yet; for those we
 * fall back to curated lists of common learner verbs. Everything returned here
 * is an uppercase enum value so the client can bind to it directly.
 */

export const REGULARITIES = ['REGULAR', 'IRREGULAR', 'MIXED', 'MODAL'];
export const SEPARABILITIES = ['SEPARABLE', 'INSEPARABLE', 'NONE'];
export const REFLEXIVE_TYPES = ['NOT_REFLEXIVE', 'MANDATORY_REFLEXIVE', 'OPTIONAL_REFLEXIVE'];
export const CASES = ['ACCUSATIVE', 'DATIVE', 'BOTH', 'PREPOSITIONAL'];
export const PLURAL_PATTERNS = [
  'NO_CHANGE',
  'UMLAUT_ONLY',
  'E_ENDING',
  'UMLAUT_PLUS_E',
  'EN_ENDING',
  'ER_ENDING',
  'UMLAUT_PLUS_ER',
  'S_ENDING',
  'PLURAL_ONLY',
  'UNCOUNTABLE',
];

const MODAL_VERBS = new Set([
  'dürfen',
  'können',
  'mögen',
  'möchten',
  'müssen',
  'sollen',
  'wollen',
]);

// Prefix fallback from the task specification. "ge-" is deliberately excluded:
// many unprefixed roots start with ge- (gehen, gewinnen, gefallen), so guessing
// would mislabel more words than it fixes. verbformen states real ge- verbs.
const INSEPARABLE_PREFIXES = ['be', 'emp', 'ent', 'er', 'miss', 'ver', 'zer'];
const SEPARABLE_PREFIXES = [
  'ab', 'an', 'auf', 'aus', 'bei', 'ein', 'fort', 'fest', 'heim', 'her', 'hin',
  'los', 'mit', 'nach', 'vor', 'weg', 'wieder', 'zu', 'zurück', 'zusammen',
];

// Roots that merely start with the letters of a prefix. Without this guard the
// fallback would label antworten as separable, bellen as inseparable, etc.
const PREFIX_LOOKALIKES = new Set([
  'antworten', 'beben', 'beichten', 'beißen', 'bellen', 'bergen', 'bersten',
  'beten', 'betteln', 'erben', 'erden', 'ernten', 'herrschen', 'hindern',
  'hinken',
]);

// Verbs whose reflexive pronoun cannot normally be dropped.
const MANDATORY_REFLEXIVE = new Set([
  'beeilen', 'besinnen', 'brüsten', 'ducken', 'ereignen', 'erholen', 'genieren',
  'gedulden', 'räuspern', 'schämen', 'sehnen', 'verhalten', 'verlieben',
  'verspäten', 'weigern', 'zutragen',
]);

// Verbs that may be used reflexively but also take a normal object.
const OPTIONAL_REFLEXIVE = new Set([
  'ändern', 'anziehen', 'ärgern', 'ausziehen', 'bedanken', 'beklagen', 'bemühen',
  'beschweren', 'bewegen', 'bewerben', 'duschen', 'entscheiden', 'entschuldigen',
  'entspannen', 'erinnern', 'fühlen', 'freuen', 'kämmen', 'kümmern', 'langweilen',
  'legen', 'merken', 'öffnen', 'rasieren', 'schließen', 'setzen', 'stellen',
  'treffen', 'umdrehen', 'unterhalten', 'verabreden', 'verletzen', 'verstecken',
  'vorbereiten', 'vorstellen', 'waschen',
]);

// Common pure dative verbs (person/thing in the dative, no accusative object).
const DATIVE_VERBS = new Set([
  'angehören', 'antworten', 'auffallen', 'ausweichen', 'begegnen', 'beistehen',
  'beitreten', 'beiwohnen', 'danken', 'dienen', 'drohen', 'einfallen',
  'einleuchten', 'entgehen', 'entkommen', 'entsagen', 'entsprechen', 'erliegen',
  'fehlen', 'fernbleiben', 'folgen', 'frönen', 'gebühren', 'gefallen',
  'gehorchen', 'gehören', 'gelingen', 'gleichen', 'gratulieren', 'helfen',
  'huldigen', 'mangeln', 'missfallen', 'misslingen', 'misstrauen', 'nahekommen',
  'nachgehen', 'nachlaufen', 'obliegen', 'passen', 'raten', 'schaden',
  'schmeicheln', 'schmecken', 'trotzen', 'unterliegen', 'vertrauen', 'weichen',
  'wehtun', 'widerfahren', 'widerstehen', 'widersprechen', 'zuhören',
  'zuschauen', 'zusehen', 'zustehen', 'zustimmen', 'zuvorkommen',
]);

// Verbs that commonly take both a dative recipient and an accusative object.
const BOTH_CASE_VERBS = new Set([
  'anvertrauen', 'backen', 'borgen', 'bringen', 'empfehlen', 'entziehen',
  'erklären', 'erlauben', 'erweisen', 'erzählen', 'geben', 'gestehen',
  'gewähren', 'glauben', 'gönnen', 'kaufen', 'kochen', 'leihen', 'liefern',
  'missgönnen', 'mitteilen', 'nutzen', 'nützen', 'opfern', 'reichen', 'sagen',
  'schenken', 'schicken', 'schreiben', 'schulden', 'senden', 'stehlen',
  'überlassen', 'verbieten', 'verdanken', 'verkaufen', 'verraten', 'versprechen',
  'verzeihen', 'vorenthalten', 'vorlesen', 'vorstellen', 'widmen', 'wünschen',
  'zeigen', 'zumuten', 'zusenden', 'zustellen', 'zutrauen',
]);

// Verbs learners meet with a fixed preposition rather than a bare object.
const PREPOSITIONAL_VERBS = new Set([
  'achten', 'anfangen', 'ärgern', 'aufhören', 'bedanken', 'beginnen', 'bemühen',
  'beschäftigen', 'beschweren', 'bestehen', 'bewerben', 'bitten', 'denken',
  'eignen', 'entscheiden', 'entschuldigen', 'erinnern', 'freuen', 'gewöhnen',
  'hoffen', 'interessieren', 'kümmern', 'lachen', 'leiden', 'sorgen', 'sprechen',
  'streiten', 'teilnehmen', 'treffen', 'verabreden', 'verlieben', 'warten',
  'werben', 'zweifeln',
]);

const UMLAUTS = { ä: 'a', ö: 'o', ü: 'u', ß: 'ss' };

function stripUmlauts(value) {
  return value.replace(/[äöüß]/g, (character) => UMLAUTS[character]);
}

function hasUmlaut(value) {
  return /[äöü]/.test(value);
}

function cleanNounForm(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹0-9]+$/g, '')
    .split('/')[0]
    .split(',')[0]
    .split('(')[0]
    .trim();
}

export function normalizeVerbBase(value) {
  return String(value ?? '')
    .trim()
    .replace(/^sich\s+/i, '')
    .toLowerCase();
}

function hasWeakPastEnding(past) {
  return /te[⁰¹²³⁴⁵⁶⁷⁸⁹0-9]*$/i.test(String(past ?? '').trim());
}

export function deriveRegularity({ german, past = null, irregular = false, intro = '' }) {
  const base = normalizeVerbBase(german);
  if (MODAL_VERBS.has(base)) return 'MODAL';

  if (/is irregular/i.test(intro)) {
    // Mixed verbs change the stem but still use the weak -te past ending.
    return hasWeakPastEnding(past) ? 'MIXED' : 'IRREGULAR';
  }

  if (/is regular/i.test(intro)) return 'REGULAR';
  if (!irregular) return 'REGULAR';

  return hasWeakPastEnding(past) ? 'MIXED' : 'IRREGULAR';
}

export function deriveSeparability({ german, intro = '' }) {
  if (/inseparable verb/i.test(intro)) return 'INSEPARABLE';
  if (/\bseparable verb/i.test(intro)) return 'SEPARABLE';

  const base = normalizeVerbBase(german);
  if (PREFIX_LOOKALIKES.has(base)) return 'NONE';

  for (const prefix of INSEPARABLE_PREFIXES) {
    if (base.startsWith(prefix) && base.length > prefix.length + 3) {
      return 'INSEPARABLE';
    }
  }

  for (const prefix of SEPARABLE_PREFIXES) {
    if (base.startsWith(prefix) && base.length > prefix.length + 3) {
      return 'SEPARABLE';
    }
  }

  return 'NONE';
}

export function deriveReflexiveType({ german, wasReflexive = false }) {
  const base = normalizeVerbBase(german);

  if (MANDATORY_REFLEXIVE.has(base)) return 'MANDATORY_REFLEXIVE';
  if (OPTIONAL_REFLEXIVE.has(base) || wasReflexive) return 'OPTIONAL_REFLEXIVE';

  return 'NOT_REFLEXIVE';
}

export function deriveCaseGoverned({ german }) {
  const base = normalizeVerbBase(german);

  // Pure dative wins: danken, helfen, gehören...
  if (DATIVE_VERBS.has(base)) return 'DATIVE';
  if (BOTH_CASE_VERBS.has(base)) return 'BOTH';
  if (PREPOSITIONAL_VERBS.has(base)) return 'PREPOSITIONAL';

  // The enum has no "intransitive" value, so accusative is the useful default.
  return 'ACCUSATIVE';
}

export function derivePluralPattern({ singular, plural, pluralOnly = false }) {
  if (pluralOnly) return 'PLURAL_ONLY';

  const singularForm = cleanNounForm(singular);
  const pluralForm = cleanNounForm(plural);

  if (!pluralForm || pluralForm === '-') return 'UNCOUNTABLE';

  const singularBase = stripUmlauts(singularForm);
  const pluralBase = stripUmlauts(pluralForm);

  if (singularForm === pluralForm) return 'NO_CHANGE';
  if (singularBase === pluralBase) return 'UMLAUT_ONLY';

  const umlaut = hasUmlaut(pluralForm) && !hasUmlaut(singularForm);

  if (pluralBase.endsWith('en')) return 'EN_ENDING';
  if (pluralBase.endsWith('e')) return umlaut ? 'UMLAUT_PLUS_E' : 'E_ENDING';
  if (pluralBase.endsWith('er')) return umlaut ? 'UMLAUT_PLUS_ER' : 'ER_ENDING';
  if (pluralBase.endsWith('s')) return 'S_ENDING';

  // Rare loan plurals (Kommata, Lexika) have no suffix in the enum. Keep them
  // filterable as "no change" rather than leaving the column empty.
  return 'NO_CHANGE';
}
