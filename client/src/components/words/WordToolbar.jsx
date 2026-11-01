import { LayoutGrid, Layers, Search, SlidersHorizontal, X } from 'lucide-react';
import { SORT_OPTIONS } from '../../constants.js';
import { pluralize } from '../../utils.js';

export function WordToolbar({
  search,
  onSearch,
  sort,
  onSort,
  grouped,
  onToggleGrouped,
  resultCount,
}) {
  return (
    <div className="word-toolbar">
      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search German or English…"
          aria-label="Search words"
        />
        {search ? (
          <button type="button" onClick={() => onSearch('')} aria-label="Clear search">
            <X size={14} />
          </button>
        ) : null}
      </label>

      <div className="word-toolbar__controls">
        <span className="word-toolbar__count">{pluralize(resultCount, 'word')}</span>

        <label className="select-field">
          <SlidersHorizontal size={14} aria-hidden="true" />
          <select value={sort} onChange={(event) => onSort(event.target.value)} aria-label="Sort words">
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={grouped ? 'toolbar-toggle is-active' : 'toolbar-toggle'}
          onClick={onToggleGrouped}
          aria-pressed={grouped}
        >
          {grouped ? <Layers size={15} /> : <LayoutGrid size={15} />}
          <span>{grouped ? 'Grouped by tag' : 'Group by tag'}</span>
        </button>
      </div>
    </div>
  );
}
