import { CheckSquare, CircleDot, Hash, Layers, Search, SlidersHorizontal, X } from 'lucide-react';
import { GENDER_SORT_OPTIONS, SORT_OPTIONS } from '../../constants.js';
import { cx, pluralize } from '../../utils.js';

export function WordToolbar({
  search,
  onSearch,
  sort,
  onSort,
  group,
  onGroupChange,
  allowGenderGroup = false,
  allowGenderSort = false,
  extraGroups = [],
  filters = [],
  onFilterChange,
  resultCount,
  selecting = false,
  onToggleSelecting,
}) {
  const sortOptions = allowGenderSort
    ? [...SORT_OPTIONS, ...GENDER_SORT_OPTIONS]
    : SORT_OPTIONS;

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

        <button
          type="button"
          className={cx('toolbar-toggle', selecting && 'is-active')}
          onClick={onToggleSelecting}
          aria-pressed={selecting}
          disabled={resultCount === 0}
          title={selecting ? 'Stop selecting words' : 'Select multiple words'}
        >
          <CheckSquare size={15} />
          <span>{selecting ? 'Done' : 'Select'}</span>
        </button>

        <label className="select-field">
          <SlidersHorizontal size={14} aria-hidden="true" />
          <select value={sort} onChange={(event) => onSort(event.target.value)} aria-label="Sort words">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={cx('toolbar-toggle', group === 'tags' && 'is-active')}
          onClick={() => onGroupChange('tags')}
          aria-pressed={group === 'tags'}
          title="Group by tag"
        >
          <Hash size={15} />
          <span>Tags</span>
        </button>

        {allowGenderGroup ? (
          <button
            type="button"
            className={cx('toolbar-toggle', group === 'gender' && 'is-active')}
            onClick={() => onGroupChange('gender')}
            aria-pressed={group === 'gender'}
            title="Group by grammatical gender"
          >
            <CircleDot size={15} />
            <span>Gender</span>
          </button>
        ) : null}

        {extraGroups.map((option) => (
          <button
            type="button"
            className={cx('toolbar-toggle', group === option.value && 'is-active')}
            onClick={() => onGroupChange(option.value)}
            aria-pressed={group === option.value}
            title={`Group by ${option.label.toLowerCase()}`}
            key={option.value}
          >
            <Layers size={15} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {filters.length > 0 ? (
        <div className="word-toolbar__filters">
          {filters.map((filter) => (
            <label className="select-field select-field--filter" key={filter.key}>
              <span className="select-field__label">{filter.label}</span>
              <select
                value={filter.value ?? ''}
                onChange={(event) => onFilterChange(filter.key, event.target.value)}
                aria-label={`Filter by ${filter.label.toLowerCase()}`}
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
