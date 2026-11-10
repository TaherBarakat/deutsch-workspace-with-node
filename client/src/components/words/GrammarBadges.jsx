import {
  CASE_LABELS,
  PLURAL_PATTERN_LABELS,
  REFLEXIVE_LABELS,
  REGULARITY_LABELS,
  SEPARABILITY_LABELS,
} from '../../constants.js';

function Badge({ label, tone = 'default', title }) {
  return (
    <span className={`grammar-badge grammar-badge--${tone}`} title={title}>
      {label}
    </span>
  );
}

export function GrammarBadges({ word }) {
  if (word.type === 'verb') {
    const badges = [];

    if (word.regularity && word.regularity !== 'REGULAR') {
      badges.push(
        <Badge
          key="regularity"
          label={REGULARITY_LABELS[word.regularity] ?? word.regularity}
          tone="irregular"
          title="Verb regularity"
        />,
      );
    }

    if (word.is_separable === 'SEPARABLE' || word.is_separable === 'INSEPARABLE') {
      badges.push(
        <Badge
          key="separable"
          label={SEPARABILITY_LABELS[word.is_separable]}
          tone="separability"
          title="Separable prefix"
        />,
      );
    }

    if (word.reflexive_type === 'MANDATORY_REFLEXIVE' || word.reflexive_type === 'OPTIONAL_REFLEXIVE') {
      badges.push(
        <Badge
          key="reflexive"
          label={REFLEXIVE_LABELS[word.reflexive_type]}
          tone="reflexive"
          title="Reflexive use"
        />,
      );
    }

    if (word.case_governed && word.case_governed !== 'ACCUSATIVE') {
      badges.push(
        <Badge
          key="case"
          label={CASE_LABELS[word.case_governed] ?? word.case_governed}
          tone="case"
          title="Governed case"
        />,
      );
    }

    if (badges.length === 0) return null;
    return <span className="grammar-badges">{badges}</span>;
  }

  if (word.type === 'noun' && word.plural_pattern) {
    return (
      <span className="grammar-badges">
        <Badge
          label={PLURAL_PATTERN_LABELS[word.plural_pattern] ?? word.plural_pattern}
          tone="plural"
          title="Plural pattern"
        />
      </span>
    );
  }

  return null;
}
