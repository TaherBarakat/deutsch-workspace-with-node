import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { QUICK_TAGS } from '../../constants.js';
import { TagChip } from './TagChip.jsx';

function suggestionName(suggestion) {
  return typeof suggestion === 'string' ? suggestion : suggestion.name;
}

export function TagInput({ value, onChange, suggestions = [], placeholder = 'Add a tag, e.g. A1.1' }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestionNames = useMemo(
    () => suggestions.map(suggestionName).filter(Boolean),
    [suggestions],
  );

  const filteredSuggestions = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();
    const selected = new Set(value.map((tag) => tag.toLowerCase()));

    return suggestionNames
      .filter((name) => !selected.has(name.toLowerCase()))
      .filter((name) => !normalisedQuery || name.toLowerCase().includes(normalisedQuery))
      .slice(0, 7);
  }, [query, suggestionNames, value]);

  const quickTags = QUICK_TAGS
    .filter((tag) => !value.some((selected) => selected.toLowerCase() === tag.toLowerCase()))
    .slice(0, 7);

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

      <div className="tag-input__quick">
        <span>Quick add</span>
        {quickTags.map((tag) => (
          <button type="button" key={tag} onClick={() => addTag(tag)}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
