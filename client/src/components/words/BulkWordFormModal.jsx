import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Circle,
  CloudDownload,
  LoaderCircle,
  Save,
} from 'lucide-react';
import { WORD_TYPES } from '../../constants.js';
import { api } from '../../api.js';
import { rememberTags } from '../../lib/recentTags.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { TagInput } from '../tags/TagInput.jsx';

const STATUS_LABEL = {
  pending: 'Ready to fetch',
  loading: 'Fetching…',
  ready: 'Fetched',
  saved: 'Saved',
  duplicate: 'Already saved',
  error: 'Needs attention',
};

function parseWords(text) {
  const seen = new Set();
  const words = [];

  for (const raw of text.split(/[\n,;]+/)) {
    const word = raw.trim().replace(/^[-*•\s]+/, '');
    if (!word) continue;

    const key = word.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    words.push(word);
  }

  return words;
}

function previewDetail(item) {
  const data = item.data;

  if (item.status === 'error' || item.status === 'duplicate') return item.message;
  if (!data) return item.message;

  const german = data.article ? `${data.article} ${data.german}` : data.german;
  const english = (data.english ?? []).slice(0, 3).join(' · ');
  const parts = data.parts
    ? Object.values(data.parts)
      .map((part) => part?.text)
      .filter(Boolean)
      .slice(0, 3)
      .join(' · ')
    : '';

  return [german, english, parts].filter(Boolean).join(' — ');
}

function createPayload(type, data, tags) {
  return {
    type,
    german: data.german,
    article: data.article ?? null,
    gender: data.gender ?? null,
    plural: data.plural ?? null,
    english: data.english ?? [],
    parts: data.parts ?? null,
    opposite: data.opposite ?? null,
    irregular: Boolean(data.irregular),
    example: data.example ?? null,
    sourceUrl: data.sourceUrl ?? null,
    tags,
  };
}

export function BulkWordFormModal({ type, suggestions = [], onClose, onImported }) {
  const typeMeta = WORD_TYPES[type];
  const { push } = useToast();
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const words = useMemo(() => parseWords(text), [text]);
  const readyCount = items.filter((item) => item.status === 'ready').length;
  const savedCount = items.filter((item) => item.status === 'saved').length;
  const fetchedCount = items.filter((item) => (
    ['ready', 'saved', 'duplicate'].includes(item.status)
  )).length;

  function handleTextChange(value) {
    setText(value);
    setItems([]);
    setError('');
  }

  function updateItem(index, patch) {
    setItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch } : item
    )));
  }

  async function handleFetch() {
    if (words.length === 0) {
      setError('Enter at least one German word, one per line or separated by commas.');
      return;
    }

    setError('');
    setBusy('fetch');
    setItems(words.map((raw) => ({
      raw,
      status: 'loading',
      data: null,
      message: 'Looking up on verbformen.com…',
    })));

    for (let index = 0; index < words.length; index += 1) {
      try {
        const data = await api.lookup(type, words[index]);
        updateItem(index, {
          status: 'ready',
          data,
          message: `Fetched "${data.german}".`,
        });
      } catch (lookupError) {
        updateItem(index, {
          status: 'error',
          data: null,
          message: lookupError.message,
        });
      }
    }

    setBusy(null);
  }

  async function handleSave() {
    if (readyCount === 0) {
      setError('Fetch the words first, then save the ones that look right.');
      return;
    }

    setError('');
    setBusy('save');

    let saved = 0;
    let failed = 0;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (item.status !== 'ready') continue;

      try {
        const created = await api.words.create(
          createPayload(type, item.data, tags),
        );
        saved += 1;
        updateItem(index, {
          status: 'saved',
          data: created,
          message: `Saved as "${created.german}".`,
        });
      } catch (saveError) {
        failed += 1;
        updateItem(index, {
          status: saveError.status === 409 ? 'duplicate' : 'error',
          message: saveError.message,
        });
      }
    }

    setBusy(null);

    if (saved > 0) {
      rememberTags(tags);
      push(
        failed > 0
          ? `${saved} word${saved === 1 ? '' : 's'} added, ${failed} skipped.`
          : `${saved} word${saved === 1 ? '' : 's'} added to your ${typeMeta.label.toLowerCase()}.`,
        failed > 0 ? 'info' : 'success',
      );
      onImported(saved);
    } else {
      setError('None of the fetched words could be saved. Check the messages below.');
    }
  }

  function handleClose() {
    if (busy) return;
    onClose();
  }

  const fetchLabel = busy === 'fetch'
    ? 'Fetching…'
    : words.length === 0
      ? 'Fetch words'
      : `Fetch ${words.length} word${words.length === 1 ? '' : 's'}`;

  const saveLabel = busy === 'save'
    ? 'Saving…'
    : readyCount === 0
      ? 'Save words'
      : `Save ${readyCount} word${readyCount === 1 ? '' : 's'}`;

  return (
    <Modal
      title={`Bulk add ${typeMeta.label.toLowerCase()}`}
      eyebrow={typeMeta.eyebrow}
      description="Paste a list of German words, choose the tags once, fetch their details, then save them all together."
      onClose={handleClose}
      size="lg"
      footer={(
        <>
          <Button variant="ghost" onClick={handleClose} disabled={Boolean(busy)}>
            {savedCount > 0 && readyCount === 0 ? 'Close' : 'Cancel'}
          </Button>
          <Button
            variant="secondary"
            icon={busy === 'fetch' ? LoaderCircle : CloudDownload}
            onClick={handleFetch}
            disabled={Boolean(busy) || words.length === 0}
            className={busy === 'fetch' ? 'is-loading' : undefined}
          >
            {fetchLabel}
          </Button>
          <Button
            variant="accent"
            icon={busy === 'save' ? LoaderCircle : Save}
            onClick={handleSave}
            disabled={Boolean(busy) || readyCount === 0}
            className={busy === 'save' ? 'is-loading' : undefined}
          >
            {saveLabel}
          </Button>
        </>
      )}
    >
      <div className="bulk-add">
        <div className="form-section">
          <div className="form-section__heading">
            <h3>Words to import</h3>
            <span>One word per line is easiest. Commas also work.</span>
          </div>

          <label className="field">
            <span>German words</span>
            <textarea
              rows={5}
              value={text}
              onChange={(event) => handleTextChange(event.target.value)}
              placeholder={'gehen\nkommen\nsprechen'}
              disabled={Boolean(busy)}
            />
          </label>

          <p className="bulk-add__count">
            {words.length === 0
              ? 'No words yet.'
              : `${words.length} unique word${words.length === 1 ? '' : 's'} ready to fetch.`}
          </p>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <h3>Shared tags</h3>
            <span>These tags are added to every word in this batch.</span>
          </div>

          <TagInput
            value={tags}
            onChange={setTags}
            suggestions={suggestions}
            placeholder="Add a tag for the whole batch"
          />
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {items.length > 0 ? (
          <div className="form-section">
            <div className="form-section__heading">
              <h3>Preview</h3>
              <span>
                {savedCount > 0
                  ? `${savedCount} saved · ${fetchedCount} fetched`
                  : `${fetchedCount} of ${items.length} fetched`}
              </span>
            </div>

            <ul className="bulk-word-list">
              {items.map((item, index) => {
                const StatusIcon = item.status === 'loading'
                  ? LoaderCircle
                  : ['ready', 'saved'].includes(item.status)
                    ? Check
                    : item.status === 'pending'
                      ? Circle
                      : AlertCircle;

                return (
                  <li
                    className={`bulk-word is-${item.status}`}
                    key={`${item.raw}-${index}`}
                  >
                    <StatusIcon
                      size={16}
                      aria-hidden="true"
                      className={item.status === 'loading' ? 'spin' : undefined}
                    />
                    <div className="bulk-word__body">
                      <div className="bulk-word__head">
                        <span className="bulk-word__raw">{item.raw}</span>
                        <span className="bulk-word__badge">
                          {STATUS_LABEL[item.status]}
                        </span>
                      </div>
                      <p className="bulk-word__detail">{previewDetail(item)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
