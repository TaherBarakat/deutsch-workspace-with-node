import { NavLink } from 'react-router-dom';
import {
  BookMarked,
  LayoutDashboard,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { SENTENCE_META, WORD_TYPE_LIST } from '../../constants.js';
import { pluralize } from '../../utils.js';
import { useStats } from '../../hooks/useStats.js';
import { useRefresh } from '../../contexts/RefreshContext.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';

const PRIMARY_NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  ...WORD_TYPE_LIST.map((type) => ({
    to: type.path,
    label: type.label,
    icon: type.icon,
    countKey: type.key,
  })),
  {
    to: SENTENCE_META.path,
    label: SENTENCE_META.label,
    icon: SENTENCE_META.icon,
    sentenceCount: true,
  },
];

export function Sidebar({ open, onClose }) {
  const { version } = useRefresh();
  const { stats } = useStats(version);

  return (
    <aside className={open ? 'sidebar is-open' : 'sidebar'}>
      <div className="sidebar__brand-row">
        <NavLink to="/" className="brand" onClick={onClose}>
          <span className="brand__mark">W</span>
          <span className="brand__copy">
            <strong>Wortschatz</strong>
            <small>German, word by word.</small>
          </span>
        </NavLink>

        <button type="button" className="sidebar__close" onClick={onClose} aria-label="Close menu">
          <X size={19} />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <p className="sidebar__label">Library</p>
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const count = item.sentenceCount
            ? stats.sentences ?? 0
            : item.countKey
              ? stats.byType[item.countKey] ?? 0
              : null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'nav-link is-active' : 'nav-link'}
              onClick={onClose}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
              {count !== null ? <span className="nav-link__count">{count}</span> : null}
            </NavLink>
          );
        })}

        <p className="sidebar__label sidebar__label--spaced">Practice</p>
        <NavLink
          to="/study"
          className={({ isActive }) => isActive ? 'nav-link is-active' : 'nav-link'}
          onClick={onClose}
        >
          <Layers size={18} aria-hidden="true" />
          <span>Flashcards</span>
          <span className="nav-link__count">{stats.total}</span>
        </NavLink>

        <NavLink
          to="/study?order=shuffle"
          className="nav-link nav-link--muted"
          onClick={onClose}
        >
          <Sparkles size={18} aria-hidden="true" />
          <span>Quick mix</span>
        </NavLink>
      </nav>

      <div className="sidebar__bottom">
        <ThemeToggle className="sidebar__theme" />

        <div className="sidebar__card">
          <BookMarked size={19} aria-hidden="true" />
          <div>
            <strong>Study by tag</strong>
            <p>
              {stats.tags.length > 0
                ? `${pluralize(stats.tags.length, 'tag')} ready to filter.`
                : 'Add tags to build focused decks.'}
            </p>
          </div>

          {stats.tags.length > 0 ? (
            <div className="sidebar__tag-links">
              {stats.tags.slice(0, 4).map((tag) => (
                <NavLink key={tag.id} to={`/study?tag=${encodeURIComponent(tag.name)}`} onClick={onClose}>
                  {tag.name}
                </NavLink>
              ))}
            </div>
          ) : null}
        </div>

        <p className="sidebar__attribution">
          Verb &amp; noun data from{' '}
          <a href="https://www.verbformen.com/" target="_blank" rel="noreferrer">verbformen.com</a>
        </p>
      </div>
    </aside>
  );
}
