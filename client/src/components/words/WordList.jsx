import { Hash, Layers } from 'lucide-react';
import { groupWordsByTags, pluralize } from '../../utils.js';
import { WordCard } from './WordCard.jsx';

export function WordList({ words, grouped, onEdit, onDelete, onTagClick }) {
  if (grouped) {
    const groups = groupWordsByTags(words);

    return (
      <div className="word-groups">
        {groups.map((group) => (
          <section className="word-group" key={group.name}>
            <header className="word-group__header">
              <div>
                {group.isUntagged
                  ? <Layers size={17} aria-hidden="true" />
                  : <Hash size={17} aria-hidden="true" />}
                <h2>{group.name}</h2>
                <span>{pluralize(group.words.length, 'word')}</span>
              </div>
              <span className="word-group__rule" aria-hidden="true" />
            </header>

            <div className="word-grid">
              {group.words.map((word) => (
                <WordCard
                  key={`${group.name}-${word.id}`}
                  word={word}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onTagClick={onTagClick}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="word-grid">
      {words.map((word) => (
        <WordCard
          key={word.id}
          word={word}
          onEdit={onEdit}
          onDelete={onDelete}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}
