import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { FIXED_TAGS } from '../../constants.js';
import { getRecentTags } from '../../lib/recentTags.js';
import { TagChip } from './TagChip.jsx';

function suggestionName(suggestion) {
  return typeof suggestion === 'string' ? suggestion : suggestion.name;
}

function uniqueNames(names) {
  const seen = new Set();
  const result = [];

  for (const name of names) {
    const clean = String(name ?? '').trim();
    if (!clean) continue;

    const key = clean.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(clean);
  }

  return result;
}

export function TagInput({ value, onChange, suggestions = [], placeholder = 'Add a tag, e.g. A1.1' }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestionNames = useMemo(
    () => uniqueNames([
      ...FIXED_TAGS,
      ...suggestions.map(suggestionName).filter(Boolean),
    ]),
    [suggestions],
  );

  const selectedKeys = useMemo(
    () => new Set(value.map((tag) => tag.toLowerCase())),
    [value],
  );

  const filteredSuggestions = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();

    return suggestionNames
      .filter((name) => !selectedKeys.has(name.toLowerCase()))
      .filter((name) => !normalisedQuery || name.toLowerCase().includes(normalisedQuery))
      .slice(0, 7);
  }, [query, selectedKeys, suggestionNames]);

  const recommendedTags = useMemo(() => {
    const fixedKeys = new Set(FIXED_TAGS.map((tag) => tag.toLowerCase()));
    const recent = getRecentTags().filter((tag) => !fixedKeys.has(tag.toLowerCase()));
    const existing = suggestionNames.filter((tag) => !fixedKeys.has(tag.toLowerCase()));

    return uniqueNames([...recent, ...existing])
      .filter((tag) => !selectedKeys.has(tag.toLowerCase()))
      .slice(0, 8);
  }, [selectedKeys, suggestionNames]);

  function addTag(rawTag) {
    const tag = rawTag.trim().replace(/,+$/, '');
    if (!tag) return;

    const exists = value.some((selected) => selected.toLowerCase() === tag.toLowerCase());
    if (!exists) onChange([...value, tag]);

    setQuery('');
  }

  function removeTag(tag) {
    onChange(value.filter((selected) => selected !== tag));
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      if (!query.trim()) return;
      event.preventDefault();
      addTag(query);
      return;
    }

    if (event.key === 'Backspace' && !query && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="tag-input">
      {value.length > 0 ? (
        <div className="tag-input__selected">
          {value.map((tag) => (
            <TagChip key={tag} name={tag} size="sm" onRemove={removeTag} />
          ))}
        </div>
      ) : null}

      <div className="tag-input__field">
        <Plus size={15} aria-hidden="true" />
        <input
          value={query}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          aria-label="Add tags"
        />
      </div>

      {focused && filteredSuggestions.length > 0 ? (
        <div className="tag-input__suggestions" role="listbox">
          {filteredSuggestions.map((name) => (
            <button
              type="button"
              key={name}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTag(name)}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="tag-input__quick tag-input__fixed">
        <span>Level tags</span>
        {FIXED_TAGS.map((tag) => {
          const selected = selectedKeys.has(tag.toLowerCase());

          return (
            <button
              type="button"
              key={tag}
              className={selected ? 'is-selected' : undefined}
              onClick={() => addTag(tag)}
              disabled={selected}
              aria-pressed={selected}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {recommendedTags.length > 0 ? (
        <div className="tag-input__quick">
          <span>Recommended</span>
          {recommendedTags.map((tag) => (
            <button type="button" key={tag} onClick={() => addTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
