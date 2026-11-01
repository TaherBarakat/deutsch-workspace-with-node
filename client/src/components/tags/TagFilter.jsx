import { TagChip } from './TagChip.jsx';

export function TagFilter({ tags, activeTag, onChange }) {
  if (tags.length === 0) return null;

  return (
    <div className="tag-filter">
      <span className="tag-filter__label">Filter by tag</span>
      <div className="tag-filter__scroller">
        <TagChip
          name="All words"
          active={!activeTag}
          onClick={() => onChange('')}
          className="tag-chip--all"
        />
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            name={tag.name}
            count={tag.count}
            active={activeTag === tag.name}
            onClick={() => onChange(activeTag === tag.name ? '' : tag.name)}
          />
        ))}
      </div>
    </div>
  );
}
