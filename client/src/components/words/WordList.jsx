import { Hash, Layers } from 'lucide-react';
import {
  CASE_OPTIONS,
  PLURAL_PATTERN_OPTIONS,
  REFLEXIVE_OPTIONS,
  REGULARITY_OPTIONS,
  SEPARABILITY_OPTIONS,
} from '../../constants.js';
import {
  groupWordsByGender,
  groupWordsByGrammar,
  groupWordsByTags,
  pluralize,
} from '../../utils.js';
import { WordCard } from './WordCard.jsx';
import { GenderBadge } from './GenderBadge.jsx';

const GRAMMAR_GROUPS = {
  regularity: { field: 'regularity', options: REGULARITY_OPTIONS },
  separability: { field: 'is_separable', options: SEPARABILITY_OPTIONS },
  reflexive: { field: 'reflexive_type', options: REFLEXIVE_OPTIONS },
  case: { field: 'case_governed', options: CASE_OPTIONS },
  plural: { field: 'plural_pattern', options: PLURAL_PATTERN_OPTIONS },
};

export function WordList({
  words,
  group = '',
  onEdit,
  onDelete,
  onTagClick,
  selectable = false,
  selectedIds,
  onToggleSelect,
}) {
  const grammarGroup = GRAMMAR_GROUPS[group];

  function renderCard(word, key) {
    return (
      <WordCard
        key={key}
        word={word}
        onEdit={onEdit}
        onDelete={onDelete}
        onTagClick={selectable ? undefined : onTagClick}
        selectable={selectable}
        selected={selectable ? Boolean(selectedIds?.has(word.id)) : false}
        onToggleSelect={onToggleSelect}
      />
    );
  }

  if (grammarGroup) {
    const groups = groupWordsByGrammar(words, grammarGroup.field, grammarGroup.options);

    return (
      <div className="word-groups">
        {groups.map((groupItem) => (
          <section className="word-group" key={groupItem.key}>
            <header className="word-group__header">
              <div>
                <Layers size={17} aria-hidden="true" />
                <h2>{groupItem.name}</h2>
                <span>{pluralize(groupItem.words.length, 'word')}</span>
              </div>
              <span className="word-group__rule" aria-hidden="true" />
            </header>

            <div className="word-grid">
              {groupItem.words.map((word) => (
                renderCard(word, `${groupItem.key}-${word.id}`)
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

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
                renderCard(word, `${groupItem.key}-${word.id}`)
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
                renderCard(word, `${groupItem.name}-${word.id}`)
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="word-grid">
      {words.map((word) => renderCard(word, word.id))}
    </div>
  );
}
