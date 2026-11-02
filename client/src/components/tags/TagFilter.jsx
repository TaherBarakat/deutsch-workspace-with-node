import { TAG_MODES } from '../../constants.js';
import { toggleTag } from '../../utils.js';
import { TagChip } from './TagChip.jsx';

export function TagFilter({
  tags,
  activeTags = [],
  onChange,
  mode = 'any',
  onModeChange,
  label = 'Filter by tags',
}) {
  if (tags.length === 0) return null;

  const activeKeys = new Set(activeTags.map((tag) => tag.toLowerCase()));

  function handleTag(name) {
    onChange(toggleTag(activeTags, name));
  }

  return (
    <div className="tag-filter">
      <span className="tag-filter__label">{label}</span>
      <div className="tag-filter__scroller">
        <TagChip
          name="All"
          active={activeTags.length === 0}
          onClick={() => onChange([])}
          className="tag-chip--all"
        />
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            name={tag.name}
            count={tag.count}
            active={activeKeys.has(tag.name.toLowerCase())}
            onClick={() => handleTag(tag.name)}
          />
        ))}
      </div>

      {activeTags.length > 1 && onModeChange ? (
        <div className="tag-filter__mode" role="group" aria-label="Tag matching">
          {TAG_MODES.map((option) => (
            <button
              type="button"
              key={option.value}
              className={mode === option.value ? 'is-active' : undefined}
              onClick={() => onModeChange(option.value)}
              aria-pressed={mode === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
