import { createWord } from './services/wordRepository.js';
import { normalizeWordPayload } from './lib/validation.js';
import { db } from './db/index.js';

const seedWords = [
  {
    type: 'verb',
    german: 'gehen',
    english: ['go', 'walk', 'leave', 'move'],
    irregular: true,
    parts: {
      present: {
        text: 'geht',
        segments: [
          { text: 'geh', style: 'plain' },
          { text: 't', style: 'ending' },
        ],
      },
      past: {
        text: 'ging',
        segments: [
          { text: 'g', style: 'plain' },
          { text: 'ing', style: 'irregular' },
        ],
      },
      perfect: {
        text: 'ist gegangen',
        segments: [
          { text: 'ist ', style: 'plain' },
          { text: 'ge', style: 'ending' },
          { text: 'g', style: 'plain' },
          { text: 'ang', style: 'irregular' },
          { text: 'en', style: 'ending' },
        ],
      },
    },
    example: { de: 'Ich gehe jetzt.', en: "I'm going now." },
    notes: 'Irregular stem change: e → i → a.',
    sourceUrl: 'https://www.verbformen.com/?w=gehen',
    tags: ['A1.1', 'irregular'],
  },
  {
    type: 'verb',
    german: 'lernen',
    english: ['learn', 'study', 'memorise'],
    irregular: false,
    parts: {
      present: {
        text: 'lernt',
        segments: [
          { text: 'lern', style: 'plain' },
          { text: 't', style: 'ending' },
        ],
      },
      past: {
        text: 'lernte',
        segments: [
          { text: 'lern', style: 'plain' },
          { text: 'te', style: 'ending' },
        ],
      },
      perfect: {
        text: 'hat gelernt',
        segments: [
          { text: 'hat ', style: 'plain' },
          { text: 'ge', style: 'ending' },
          { text: 'lern', style: 'plain' },
          { text: 't', style: 'ending' },
        ],
      },
    },
    example: { de: 'Ich lerne jeden Tag Deutsch.', en: 'I learn German every day.' },
    sourceUrl: 'https://www.verbformen.com/?w=lernen',
    tags: ['A1.1'],
  },
  {
    type: 'noun',
    german: 'Haus',
    article: 'das',
    gender: 'n',
    plural: 'Häuser',
    english: ['house', 'home', 'building'],
    example: { de: 'Mein Haus ist alt und hässlich.', en: 'My house is old and ugly.' },
    sourceUrl: 'https://www.verbformen.com/?w=Haus',
    tags: ['A1.1', 'home'],
  },
  {
    type: 'noun',
    german: 'Frau',
    article: 'die',
    gender: 'f',
    plural: 'Frauen',
    english: ['woman', 'wife', 'lady', 'Mrs'],
    example: { de: 'Die Frau liest ein Buch.', en: 'The woman is reading a book.' },
    sourceUrl: 'https://www.verbformen.com/?w=Frau',
    tags: ['A1.1', 'people'],
  },
  {
    type: 'adjective',
    german: 'schnell',
    english: ['fast', 'quick', 'rapid'],
    example: { de: 'Das Auto ist sehr schnell.', en: 'The car is very fast.' },
    tags: ['A1.1'],
  },
  {
    type: 'adverb',
    german: 'gern',
    english: ['gladly', 'with pleasure'],
    example: { de: 'Ich trinke gern Tee.', en: 'I like drinking tea.' },
    tags: ['A1.1'],
  },
];

const existing = db.prepare('SELECT COUNT(*) AS count FROM words').get();
if (existing.count > 0) {
  console.log(`Database already has ${existing.count} word(s). Seed skipped.`);
} else {
  for (const rawWord of seedWords) {
    createWord(normalizeWordPayload(rawWord));
  }
  console.log(`Seeded ${seedWords.length} starter words.`);
}
