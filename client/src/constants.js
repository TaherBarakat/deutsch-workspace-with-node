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
