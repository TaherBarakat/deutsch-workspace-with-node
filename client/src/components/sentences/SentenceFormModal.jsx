import { useState } from 'react';
import { Check, Languages, LoaderCircle } from 'lucide-react';
import { api } from '../../api.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import {
  isTranslatorSupported,
  translateGermanToEnglish,
} from '../../lib/translator.js';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { TagInput } from '../tags/TagInput.jsx';

function initialForm(sentence) {
  return {
    german: sentence?.german ?? '',
    english: sentence?.english?.join(' ') ?? '',
    notes: sentence?.notes ?? '',
    sourceUrl: sentence?.sourceUrl ?? '',
    tags: sentence?.tags ?? [],
  };
}

export function SentenceFormModal({ sentence = null, suggestions = [], onClose, onSaved }) {
  const [form, setForm] = useState(() => initialForm(sentence));
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [translateError, setTranslateError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const isEditing = Boolean(sentence);
  const translatorReady = isTranslatorSupported();

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleTranslate() {
    if (!form.german.trim()) {
      setFormError('Write the German sentence first, then translate it.');
      return;
    }

    setFormError('');
    setTranslateError('');
    setTranslating(true);
    setProgress(null);

    try {
      const translation = await translateGermanToEnglish(form.german, {
        onProgress: (value) => setProgress(value),
      });

      setForm((current) => ({ ...current, english: translation }));
      push('Sentence translated with Chrome.', 'success');
    } catch (error) {
      setTranslateError(error.message);
    } finally {
      setTranslating(false);
      setProgress(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (!form.german.trim()) {
      setFormError('The German sentence is required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        german: form.german,
        english: form.english,
        notes: form.notes,
        sourceUrl: form.sourceUrl || null,
        tags: form.tags,
      };

      const saved = isEditing
        ? await api.sentences.update(sentence.id, payload)
        : await api.sentences.create(payload);

      push(isEditing ? 'Sentence updated.' : 'Sentence added.', 'success');
      onSaved(saved);
    } catch (error) {
      setFormError(error.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEditing ? 'Edit sentence' : 'Add a sentence'}
      eyebrow="Sätze"
      description="Keep a German sentence, its English translation and the tags you want to revisit."
      onClose={onClose}
      size="md"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            type="submit"
            form="sentence-form"
            variant="accent"
            icon={Check}
            disabled={saving || translating}
          >
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add sentence'}
          </Button>
        </>
      )}
    >
      <form id="sentence-form" className="word-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-section__heading">
            <h3>German sentence</h3>
            <span>Use punctuation exactly as you want to read it.</span>
          </div>
          <label className="field">
            <span>German</span>
            <textarea
              rows={3}
              value={form.german}
              onChange={(event) => updateField('german', event.target.value)}
              placeholder="Ich gehe gern mit meinen Freunden ins Kino."
              autoFocus
            />
          </label>
        </div>

        <div className="form-section">
          <div className="sentence-translate">
            <div className="form-section__heading">
              <h3>English translation</h3>
              <span>Let Chrome translate it, or write your own version.</span>
            </div>
            <Button
              variant="secondary"
              icon={translating ? LoaderCircle : Languages}
              onClick={handleTranslate}
              disabled={translating || !form.german.trim()}
              className={translating ? 'is-loading' : undefined}
            >
              {translating
                ? progress !== null
                  ? `Downloading ${progress}%…`
                  : 'Translating…'
                : 'Translate with Chrome'}
            </Button>
          </div>

          <label className="field">
            <span>English</span>
            <textarea
              rows={3}
              value={form.english}
              onChange={(event) => updateField('english', event.target.value)}
              placeholder="I like going to the cinema with my friends."
            />
          </label>

          {!translatorReady ? (
            <p className="form-hint">
              The built-in Translator API is not available in this browser. Use a recent Chrome
              version, or type the translation manually.
            </p>
          ) : (
            <p className="form-hint">
              The first translation may download a small language model. Keep this tab open while
              it finishes.
            </p>
          )}

          {translateError ? (
            <p className="form-error" role="alert">{translateError}</p>
          ) : null}
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <h3>Tags</h3>
            <span>Filter your sentences by level, topic, or anything else.</span>
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
            <span>Optional — grammar, vocabulary, or a context reminder.</span>
          </div>
          <label className="field">
            <span>Your note</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="e.g. gern sits before the infinitive here."
            />
          </label>
        </div>

        {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      </form>
    </Modal>
  );
}
