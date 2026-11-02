import { Hash, Layers } from 'lucide-react';
import { groupWordsByGender, groupWordsByTags, pluralize } from '../../utils.js';
import { WordCard } from './WordCard.jsx';
import { GenderBadge } from './GenderBadge.jsx';

export function WordList({ words, group = '', onEdit, onDelete, onTagClick }) {
  if (group === 'gender') {
    const groups = groupWordsByGender(words);

    if (groups.length === 0) return null;

    return (
      <div className="word-groups">
        {groups.map((groupItem) => (
          <section className="word-group" key={groupItem.key}>
            <header className="word-group__header">
              <div>
                {groupItem.article ? <GenderBadge gender={groupItem.key} article /> : <Layers size={17} aria-hidden="true" />}
                <h2>{groupItem.name}</h2>
                <span>{pluralize(groupItem.words.length, 'word')}</span>
              </div>
              <span className="word-group__rule" aria-hidden="true" />
            </header>

            <div className="word-grid">
              {groupItem.words.map((word) => (
                <WordCard
                  key={`${groupItem.key}-${word.id}`}
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

  if (group === 'tags') {
    const groups = groupWordsByTags(words);

    return (
      <div className="word-groups">
        {groups.map((groupItem) => (
          <section className="word-group" key={groupItem.name}>
            <header className="word-group__header">
              <div>
                {groupItem.isUntagged
                  ? <Layers size={17} aria-hidden="true" />
                  : <Hash size={17} aria-hidden="true" />}
                <h2>{groupItem.name}</h2>
                <span>{pluralize(groupItem.words.length, 'word')}</span>
              </div>
              <span className="word-group__rule" aria-hidden="true" />
            </header>

            <div className="word-grid">
              {groupItem.words.map((word) => (
                <WordCard
                  key={`${groupItem.name}-${word.id}`}
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
