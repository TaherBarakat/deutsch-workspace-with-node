import { ArrowRight, Layers3, Plus, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WORD_TYPE_LIST } from '../constants.js';
import { useStats } from '../hooks/useStats.js';
import { useRefresh } from '../contexts/RefreshContext.jsx';
import { pluralize } from '../utils.js';
import { Button } from '../components/ui/Button.jsx';
import { TagChip } from '../components/tags/TagChip.jsx';
import { MeaningList } from '../components/words/MeaningList.jsx';

export function OverviewPage() {
  const { version } = useRefresh();
  const { stats } = useStats(version);
  const navigate = useNavigate();

  return (
    <div className="overview-page">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Dein Wortschatz</p>
          <h1>
            Learn German,<br />
            <em>one word</em> at a time.
          </h1>
          <p className="hero__lede">
            Collect verbs and nouns with their full forms, add your own tags,
            and turn any corner of your vocabulary into a flashcard deck.
          </p>

          <div className="hero__actions">
            <Button variant="accent" size="lg" icon={Layers3} onClick={() => navigate('/study')}>
              Start studying
            </Button>
            <Button variant="light" size="lg" icon={Plus} onClick={() => navigate('/verbs?add=1')}>
              Add a word
            </Button>
          </div>

          <div className="hero__stats">
            <span><strong>{stats.total}</strong> words collected</span>
            <span className="hero__stats-divider" aria-hidden="true" />
            <span><strong>{stats.tags.length}</strong> tags in use</span>
          </div>
        </div>

        <div className="hero__art" aria-hidden="true">
          <span className="hero-slip hero-slip--der">der</span>
          <span className="hero-slip hero-slip--die">die</span>
          <span className="hero-slip hero-slip--das">das</span>
          <div className="hero-card">
            <span className="hero-card__label">irregular verb</span>
            <strong>gehen</strong>
            <p>geht <i>·</i> g<mark>ing</mark> <i>·</i> ist ge<mark>gang</mark>en</p>
            <div className="hero-card__rule" />
            <span className="hero-card__meaning">go · walk · leave</span>
          </div>
          <span className="hero-slip hero-slip--tag">A1.1</span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your library</p>
            <h2>Four kinds of words</h2>
          </div>
          <Link to="/study" className="text-link">
            Build a mixed deck <ArrowRight size={14} />
          </Link>
        </div>

        <div className="type-card-grid">
          {WORD_TYPE_LIST.map((type) => {
            const Icon = type.icon;
            const count = stats.byType[type.key] ?? 0;

            return (
              <Link to={type.path} className={`type-card type-card--${type.tone}`} key={type.key}>
                <span className="type-card__icon">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <span className="type-card__eyebrow">{type.eyebrow}</span>
                <strong>{type.label}</strong>
                <p>{type.description}</p>
                <span className="type-card__footer">
                  {pluralize(count, 'word')}
                  <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {stats.total === 0 ? (
        <section className="onboarding">
          <div className="onboarding__intro">
            <p className="eyebrow">Getting started</p>
            <h2>Three steps to your first session</h2>
            <p>
              Add a verb or noun, let verbformen.com fill in the details,
              then tag it and start flipping.
            </p>
            <Button variant="accent" icon={Plus} onClick={() => navigate('/verbs?add=1')}>
              Add your first word
            </Button>
          </div>

          <ol className="onboarding__steps">
            <li>
              <span>01</span>
              <div>
                <strong>Add a word</strong>
                <p>Type a German verb or noun and fetch its forms automatically.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Tag it</strong>
                <p>Use levels like A1.1 or topics like “travel” to group your vocabulary.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Study it</strong>
                <p>Build a deck from one section, one tag, or a mix of everything.</p>
              </div>
            </li>
          </ol>
        </section>
      ) : (
        <div className="overview-columns">
          <section className="panel">
            <div className="panel__heading">
              <div>
                <p className="eyebrow">Study by tag</p>
                <h2>Your tag shelf</h2>
              </div>
              <Sparkles size={18} aria-hidden="true" />
            </div>

            {stats.tags.length > 0 ? (
              <>
                <div className="tag-shelf">
                  {stats.tags.map((tag) => (
                    <TagChip
                      key={tag.id}
                      name={tag.name}
                      count={tag.count}
                      onClick={() => navigate(`/study?tag=${encodeURIComponent(tag.name)}`)}
                    />
                  ))}
                </div>
                <p className="panel__hint">
                  Pick a tag to build a deck from every word carrying it.
                </p>
              </>
            ) : (
              <p className="panel__empty">No tags yet. Add one while creating a word.</p>
            )}
          </section>

          <section className="panel">
            <div className="panel__heading">
              <div>
                <p className="eyebrow">Fresh in your library</p>
                <h2>Recently added</h2>
              </div>
              <span className="panel__count">{stats.recent.length}</span>
            </div>

            <div className="recent-list">
              {stats.recent.map((word) => {
                const type = WORD_TYPE_LIST.find((item) => item.key === word.type);
                const Icon = type?.icon;

                return (
                  <Link to={type?.path ?? '/verbs'} className="recent-row" key={word.id}>
                    <span className={`recent-row__icon recent-row__icon--${word.type}`}>
                      {Icon ? <Icon size={15} aria-hidden="true" /> : null}
                    </span>
                    <span className="recent-row__copy">
                      <strong className={word.type === 'noun' ? `text-gender-${word.gender}` : undefined}>
                        {word.type === 'noun' ? `${word.article} ${word.german}` : word.german}
                      </strong>
                      <MeaningList meanings={word.english} limit={2} />
                    </span>
                    <span className="recent-row__type">{type?.singular}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
