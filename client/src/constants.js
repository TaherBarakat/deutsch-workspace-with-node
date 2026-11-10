import {
  BookOpen,
  Footprints,
  MessageSquareQuote,
  Sparkles,
  Wind,
} from 'lucide-react';

export const GENDERS = {
  m: { article: 'der', label: 'masculine', short: 'm' },
  f: { article: 'die', label: 'feminine', short: 'f' },
  n: { article: 'das', label: 'neuter', short: 'n' },
};

export const WORD_TYPE_LIST = [
  {
    key: 'verb',
    label: 'Verbs',
    singular: 'verb',
    path: '/verbs',
    eyebrow: 'Tunwörter',
    description: 'Actions, principal parts and example sentences.',
    icon: Footprints,
    tone: 'verb',
  },
  {
    key: 'noun',
    label: 'Nouns',
    singular: 'noun',
    path: '/nouns',
    eyebrow: 'Nomen',
    description: 'Every noun with its article, gender and plural.',
    icon: BookOpen,
    tone: 'noun',
  },
  {
    key: 'adjective',
    label: 'Adjectives',
    singular: 'adjective',
    path: '/adjectives',
    eyebrow: 'Eigenschaftswörter',
    description: 'Words that describe people, places and things.',
    icon: Sparkles,
    tone: 'adjective',
  },
  {
    key: 'adverb',
    label: 'Adverbs',
    singular: 'adverb',
    path: '/adverbs',
    eyebrow: 'Umstandswörter',
    description: 'Words that add colour to how something happens.',
    icon: Wind,
    tone: 'adverb',
  },
];

export const WORD_TYPES = Object.fromEntries(
  WORD_TYPE_LIST.map((type) => [type.key, type]),
);

export const SENTENCE_META = {
  key: 'sentence',
  label: 'Sentences',
  singular: 'sentence',
  path: '/sentences',
  eyebrow: 'Sätze',
  description: 'Collect whole sentences, tag them, and translate them with Chrome.',
  icon: MessageSquareQuote,
  tone: 'sentence',
};

export const FIXED_TAGS = [
  'A1.1',
  'A1.2',
  'A2.1',
  'A2.2',
  'B1.1',
  'B1.2',
  'B2.1',
  'B2.2',
];

export const FLASHCARD_DIRECTIONS = [
  { value: 'german', label: 'German first' },
  { value: 'english', label: 'English first' },
];

export const SORT_OPTIONS = [
  { value: 'alpha', label: 'A → Z' },
  { value: 'alpha_desc', label: 'Z → A' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export const GENDER_SORT_OPTIONS = [
  { value: 'gender', label: 'Gender: m → f → n' },
  { value: 'gender_desc', label: 'Gender: n → f → m' },
];

export const REGULARITY_OPTIONS = [
  { value: 'REGULAR', label: 'Regular' },
  { value: 'IRREGULAR', label: 'Irregular' },
  { value: 'MIXED', label: 'Mixed' },
  { value: 'MODAL', label: 'Modal' },
];

export const SEPARABILITY_OPTIONS = [
  { value: 'SEPARABLE', label: 'Separable' },
  { value: 'INSEPARABLE', label: 'Inseparable' },
  { value: 'NONE', label: 'No prefix' },
];

export const REFLEXIVE_OPTIONS = [
  { value: 'NOT_REFLEXIVE', label: 'Not reflexive' },
  { value: 'MANDATORY_REFLEXIVE', label: 'Reflexive' },
  { value: 'OPTIONAL_REFLEXIVE', label: 'Optional reflexive' },
];

export const CASE_OPTIONS = [
  { value: 'ACCUSATIVE', label: 'Accusative' },
  { value: 'DATIVE', label: 'Dative' },
  { value: 'BOTH', label: 'Dative + accusative' },
  { value: 'PREPOSITIONAL', label: 'Prepositional' },
];

export const PLURAL_PATTERN_OPTIONS = [
  { value: 'NO_CHANGE', label: 'No change' },
  { value: 'UMLAUT_ONLY', label: 'Umlaut only' },
  { value: 'E_ENDING', label: '-e' },
  { value: 'UMLAUT_PLUS_E', label: 'Umlaut + -e' },
  { value: 'EN_ENDING', label: '-en' },
  { value: 'ER_ENDING', label: '-er' },
  { value: 'UMLAUT_PLUS_ER', label: 'Umlaut + -er' },
  { value: 'S_ENDING', label: '-s' },
  { value: 'PLURAL_ONLY', label: 'Plural only' },
  { value: 'UNCOUNTABLE', label: 'Uncountable' },
];

function labelMap(options) {
  return Object.fromEntries(options.map((option) => [option.value, option.label]));
}

export const REGULARITY_LABELS = labelMap(REGULARITY_OPTIONS);
export const SEPARABILITY_LABELS = labelMap(SEPARABILITY_OPTIONS);
export const REFLEXIVE_LABELS = labelMap(REFLEXIVE_OPTIONS);
export const CASE_LABELS = labelMap(CASE_OPTIONS);
export const PLURAL_PATTERN_LABELS = labelMap(PLURAL_PATTERN_OPTIONS);

export const VERB_GROUP_OPTIONS = [
  { value: 'regularity', label: 'Regularity' },
  { value: 'separability', label: 'Separability' },
  { value: 'reflexive', label: 'Reflexive' },
  { value: 'case', label: 'Case' },
];

export const NOUN_GROUP_OPTIONS = [
  { value: 'plural', label: 'Plural' },
];

export const TAG_MODES = [
  { value: 'any', label: 'Any tag' },
  { value: 'all', label: 'All tags' },
];

export const STUDY_COUNTS = [
  { value: 'all', label: 'All' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
];
