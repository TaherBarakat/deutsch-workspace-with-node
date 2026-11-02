import { cx } from '../../utils.js';
import { PartSegments } from './PrincipalParts.jsx';

const PART_ORDER = ['positive', 'comparative', 'superlative'];
const PART_LABELS = {
  positive: 'positive',
  comparative: 'comparative',
  superlative: 'superlative',
};

export function ComparisonParts({ parts, variant = 'inline' }) {
  if (!parts) {
    return <span className="muted-text">No comparison forms saved yet.</span>;
  }

  const availableKeys = PART_ORDER.filter((key) => parts[key]);

  if (availableKeys.length === 0) {
    return <span className="muted-text">No comparison forms saved yet.</span>;
  }

  if (variant === 'inline') {
    return (
      <span className="parts-inline comparison-parts">
        {availableKeys.map((key, index) => (
          <span className="parts-inline__item" key={key}>
            {index > 0 ? <span className="parts-inline__separator">·</span> : null}
            <span className="parts-inline__value" title={PART_LABELS[key]}>
              <PartSegments segments={parts[key].segments} />
            </span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className={cx('parts-stack', 'parts-stack--comparison', `parts-stack--${variant}`)}>
      {availableKeys.map((key) => (
        <div className="parts-stack__row" key={key}>
          <span className="parts-stack__label">{PART_LABELS[key]}</span>
          <span className="parts-stack__value">
            <PartSegments segments={parts[key].segments} />
          </span>
        </div>
      ))}
    </div>
  );
}
