import { useState } from 'react';
import {
  Check,
  CloudDownload,
  ExternalLink,
  LoaderCircle,
  Sparkles,
} from 'lucide-react';
import { GENDERS, WORD_TYPES } from '../../constants.js';
import { api } from '../../api.js';
import { splitMeanings } from '../../utils.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { TagInput } from '../tags/TagInput.jsx';
import { ComparisonParts } from '../words/ComparisonParts.jsx';
import { PrincipalParts } from '../words/PrincipalParts.jsx';
import { GenderBadge } from '../words/GenderBadge.jsx';

const ARTICLE_BY_GENDER = { m: 'der', f: 'die', n: 'das' };
const GENDER_BY_ARTICLE = { der: 'm', die: 'f', das: 'n' };
const PARTS = ['present', 'past', 'perfect'];
const COMPARISON_PARTS = ['positive', 'comparative', 'superlative'];

const PART_FIELDS = {
  verb: [
    { key: 'present', label: 'Present (er/sie/es)', placeholder: 'geht' },
    { key: 'past', label: 'Past (Präteritum)', placeholder: 'ging' },
    { key: 'perfect', label: 'Perfect', placeholder: 'ist gegangen' },
  ],
  adjective: [
    { key: 'positive', label: 'Positive', placeholder: 'schnell' },
    { key: 'comparative', label: 'Comparative', placeholder: 'schneller' },
    { key: 'superlative', label: 'Superlative', placeholder: 'am schnellsten' },
  ],
};

function partKeysFor(type) {
  if (type === 'verb') return PARTS;
  if (type === 'adjective') return COMPARISON_PARTS;
  return [];
}

function initialForm(type, word) {
  const parts = {};

  for (const key of partKeysFor(type)) {
    parts[key] = word?.parts?.[key]?.text ?? '';
  }

  return {
    german: word?.german ?? '',
    article: word?.article ?? '',
    gender: word?.gender ?? '',
    plural: word?.plural ?? '',
    english: (word?.english ?? []).join(', '),
    parts,
    partsData: word?.parts ?? null,
    opposite: word?.opposite ?? '',
    irregular: Boolean(word?.irregular),
    exampleDe: word?.example?.de ?? '',
    exampleEn: word?.example?.en ?? '',
    notes: word?.notes ?? '',
    sourceUrl: word?.sourceUrl ?? '',
    tags: word?.tags ?? [],
  };
}

function buildParts(parts, partsData, type) {
  const keys = partKeysFor(type);
  if (keys.length === 0) return null;

  const result = {};

  for (const key of keys) {
    const text = String(parts[key] ?? '').trim();
    if (!text) continue;

    const cached = partsData?.[key];
    result[key] = cached && cached.text === text
      ? cached
      : { text, segments: [{ text, style: 'plain' }] };
  }

  return Object.keys(result).length > 0 ? result : null;
}

export function WordFormModal({ type, word = null, suggestions = [], onClose, onSaved }) {
  const typeMeta = WORD_TYPES[type];
  const isVerb = type === 'verb';
  const isNoun = type === 'noun';
  const isAdjective = type === 'adjective';
  const canLookup = Boolean(typeMeta);

  const [form, setForm] = useState(() => initialForm(type, word));
  const [lookupState, setLookupState] = useState('idle');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const { push } = useToast();

  const previewParts = buildParts(form.parts, form.partsData, type);
  const isEditing = Boolean(word);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePart(part, value) {
    setForm((current) => ({
      ...current,
      parts: { ...current.parts, [part]: value },
    }));
  }

  function handleArticleChange(article) {
    setForm((current) => ({
      ...current,
      article,
      gender: article ? GENDER_BY_ARTICLE[article] ?? '' : current.gender,
    }));
  }

  async function handleLookup() {
    if (!form.german.trim()) {
      setFormError('Type a German word first, then fetch its details.');
      return;
    }

    setFormError('');
    setLookupState('loading');

    try {
      const data = await api.lookup(type, form.german.trim());

      setForm((current) => {
        const nextParts = { ...current.parts };

        for (const key of partKeysFor(type)) {
          nextParts[key] = data.parts?.[key]?.text ?? current.parts[key] ?? '';
        }

        return {
          ...current,
          german: data.german ?? current.german,
          article: data.article ?? current.article,
          gender: data.gender ?? current.gender,
          plural: data.plural ?? current.plural,
          english: data.english?.length ? data.english.join(', ') : current.english,
          parts: nextParts,
          partsData: data.parts ?? current.partsData,
          opposite: data.opposite || current.opposite,
          irregular: typeof data.irregular === 'boolean' ? data.irregular : current.irregular,
          exampleDe: data.example?.de ?? current.exampleDe,
          exampleEn: data.example?.en ?? current.exampleEn,
          sourceUrl: data.sourceUrl ?? current.sourceUrl,
        };
      });

      setLookupState('success');
      push(`Found "${data.german}" on verbformen.com.`, 'success');
    } catch (error) {
      setLookupState('error');
      setFormError(error.message);
      push(error.message, 'error');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (!form.german.trim()) {
      setFormError('The German word is required.');
      return;
    }

    const parts = buildParts(form.parts, form.partsData, type);

    const payload = {
      type,
      german: form.german,
      article: isNoun ? form.article || null : null,
      gender: isNoun ? form.gender || null : null,
      plural: isNoun ? form.plural || null : null,
      english: splitMeanings(form.english),
      parts,
      opposite: isAdjective ? form.opposite || null : null,
      irregular: isVerb ? form.irregular : false,
      example: {
        de: form.exampleDe,
        en: form.exampleEn,
      },
      notes: form.notes,
      sourceUrl: form.sourceUrl || null,
      tags: form.tags,
    };

    setSaving(true);

    try {
      const savedWord = isEditing
        ? await api.words.update(word.id, payload)
        : await api.words.create(payload);

      push(
        isEditing ? `"${savedWord.german}" updated.` : `"${savedWord.german}" added to your ${typeMeta.label.toLowerCase()}.`,
        'success',
      );
      onSaved(savedWord);
    } catch (error) {
      setFormError(error.message);
      setSaving(false);
    }
  }

  const placeholder = isNoun
    ? 'Haus'
    : isVerb
      ? 'gehen'
      : isAdjective
        ? 'schnell'
        : 'gern';

  return (
    <Modal
      title={isEditing ? `Edit ${word.german}` : `Add a ${typeMeta.singular}`}
      eyebrow={isEditing ? 'Edit entry' : typeMeta.eyebrow}
      description={
        canLookup
          ? 'Fetch the details from verbformen.com, then edit anything before saving.'
          : 'Add the German word, its English meaning and any tags you want to study by.'
      }
      onClose={onClose}
      size="lg"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            type="submit"
            form="word-form"
            variant="accent"
            icon={Check}
            disabled={saving || lookupState === 'loading'}
          >
            {saving ? 'Saving…' : isEditing ? 'Save changes' : `Add ${typeMeta.singular}`}
          </Button>
        </>
      )}
    >
      <form id="word-form" className="word-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-section__heading">
            <h3>German word</h3>
            <span>The spelling exactly as you want to learn it.</span>
          </div>

          <div className="lookup-row">
            <label className="field">
              <span>Word</span>
              <input
                value={form.german}
                onChange={(event) => updateField('german', event.target.value)}
                placeholder={placeholder}
                autoFocus
              />
            </label>

            {canLookup ? (
              <Button
                variant="secondary"
                icon={lookupState === 'loading' ? LoaderCircle : CloudDownload}
                onClick={handleLookup}
                disabled={lookupState === 'loading' || !form.german.trim()}
                className={lookupState === 'loading' ? 'is-loading' : undefined}
              >
                {lookupState === 'loading' ? 'Fetching…' : 'Fetch from verbformen'}
              </Button>
            ) : null}
          </div>

          {form.sourceUrl ? (
            <p className="source-note">
              <Sparkles size={14} aria-hidden="true" />
              Details imported from verbformen.com
              <a href={form.sourceUrl} target="_blank" rel="noreferrer">
                View source <ExternalLink size={12} />
              </a>
            </p>
          ) : null}
        </div>

        {isVerb ? (
          <fieldset className="form-section form-section--boxed">
            <legend>Principal parts</legend>

            <div className="form-section__heading">
              <h3>Present · past · perfect</h3>
              <span>Irregular letters are highlighted when fetched.</span>
            </div>

            <div className="parts-preview">
              <PrincipalParts parts={previewParts} variant="stack" />
            </div>

            <div className="form-grid form-grid--three">
              {PART_FIELDS.verb.map((field) => (
                <label className="field" key={field.key}>
                  <span>{field.label}</span>
                  <input
                    value={form.parts[field.key] ?? ''}
                    onChange={(event) => updatePart(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>

            <label className="switch-row">
              <input
                type="checkbox"
                checked={form.irregular}
                onChange={(event) => updateField('irregular', event.target.checked)}
              />
              <span className="switch-row__track" aria-hidden="true" />
              <span>
                <strong>Irregular verb</strong>
                <small>Show the irregular marker on this word.</small>
              </span>
            </label>
          </fieldset>
        ) : null}

        {isAdjective ? (
          <fieldset className="form-section form-section--boxed">
            <legend>Comparison &amp; opposite</legend>

            <div className="form-section__heading">
              <h3>Positive · comparative · superlative</h3>
              <span>The automatic lookup fills these in when verbformen.com has them.</span>
            </div>

            <div className="parts-preview">
              <ComparisonParts parts={previewParts} variant="stack" />
            </div>

            <div className="form-grid form-grid--three">
              {PART_FIELDS.adjective.map((field) => (
                <label className="field" key={field.key}>
                  <span>{field.label}</span>
                  <input
                    value={form.parts[field.key] ?? ''}
                    onChange={(event) => updatePart(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>

            <label className="field">
              <span>Gegenteil (opposite)</span>
              <input
                value={form.opposite}
                onChange={(event) => updateField('opposite', event.target.value)}
                placeholder="langsam"
              />
            </label>
            <p className="form-hint">
              The opposite is not on verbformen.com, so add it yourself if you want it on the card.
            </p>
          </fieldset>
        ) : null}

        {isNoun ? (
          <fieldset className="form-section form-section--boxed">
            <legend>Noun details</legend>

            <div className="form-grid form-grid--three">
              <label className="field">
                <span>Article</span>
                <select
                  value={form.article}
                  onChange={(event) => handleArticleChange(event.target.value)}
                >
                  <option value="">No article</option>
                  <option value="der">der — masculine</option>
                  <option value="die">die — feminine</option>
                  <option value="das">das — neuter</option>
                </select>
              </label>

              <label className="field">
                <span>Plural</span>
                <input
                  value={form.plural}
                  onChange={(event) => updateField('plural', event.target.value)}
                  placeholder="Häuser"
                />
              </label>

              <div className="field field--preview">
                <span>Preview</span>
                <div className="noun-preview">
                  {form.gender ? <GenderBadge gender={form.gender} /> : null}
                  <strong className={form.gender ? `text-gender-${form.gender}` : undefined}>
                    {form.article ? `${form.article} ` : ''}{form.german || '…'}
                  </strong>
                </div>
              </div>
            </div>

            {form.gender ? (
              <p className="form-hint">
                Gender colour: {GENDERS[form.gender].label}. This colour is used on cards and flashcards.
              </p>
            ) : null}
          </fieldset>
        ) : null}

        <div className="form-section">
          <div className="form-section__heading">
            <h3>English meaning</h3>
            <span>Separate alternatives with commas. The first four appear on flashcards.</span>
          </div>
          <label className="field">
            <span>Meanings</span>
            <input
              value={form.english}
              onChange={(event) => updateField('english', event.target.value)}
              placeholder={
                isVerb
                  ? 'go, walk, leave, move'
                  : isNoun
                    ? 'house, home, building'
                    : isAdjective
                      ? 'fast, quick, rapid'
                      : 'gladly, with pleasure'
              }
            />
          </label>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <h3>Example sentence</h3>
            <span>One short sentence helps the word stick.</span>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>German</span>
              <input
                value={form.exampleDe}
                onChange={(event) => updateField('exampleDe', event.target.value)}
                placeholder="Ich gehe jetzt."
              />
            </label>
            <label className="field">
              <span>English</span>
              <input
                value={form.exampleEn}
                onChange={(event) => updateField('exampleEn', event.target.value)}
                placeholder="I am going now."
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <h3>Tags</h3>
            <span>Use levels, topics, or anything you like. Tags power your filters.</span>
          </div>
          <TagInput
            value={form.tags}
            onChange={(tags) => updateField('tags', tags)}
            suggestions={suggestions}
          />
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <h3>Notes</h3>
            <span>Optional — a memory hook, a rule, or a reminder.</span>
          </div>
          <label className="field">
            <span>Your note</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="e.g. Separable verb: ich stehe früh auf."
            />
          </label>
        </div>

        {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      </form>
    </Modal>
  );
}
