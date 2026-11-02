import { Search, X } from 'lucide-react';
import { pluralize } from '../../utils.js';

export function SentenceToolbar({ search, onSearch, resultCount }) {
  return (
    <div className="word-toolbar sentence-toolbar">
      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search German or English sentences…"
          aria-label="Search sentences"
        />
        {search ? (
          <button type="button" onClick={() => onSearch('')} aria-label="Clear search">
            <X size={14} />
          </button>
        ) : null}
      </label>

      <div className="word-toolbar__controls">
        <span className="word-toolbar__count">{pluralize(resultCount, 'sentence')}</span>
      </div>
    </div>
  );
}
