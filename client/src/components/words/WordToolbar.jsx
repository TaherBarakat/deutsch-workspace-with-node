import { CircleDot, Hash, Search, SlidersHorizontal, X } from 'lucide-react';
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
  resultCount,
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
      </div>
    </div>
  );
}
