import { cx } from '../../utils.js';

const PART_ORDER = ['present', 'past', 'perfect'];
const PART_LABELS = {
  present: 'present',
  past: 'past',
  perfect: 'perfect',
};

export function PartSegments({ segments }) {
  if (!segments || segments.length === 0) return null;

  return segments.map((segment, index) => {
    if (segment.style === 'irregular') {
      return (
        <mark className="segment segment--irregular" key={`${segment.text}-${index}`}>
          {segment.text}
        </mark>
      );
    }

    if (segment.style === 'ending') {
      return (
        <span className="segment segment--ending" key={`${segment.text}-${index}`}>
          {segment.text}
        </span>
      );
    }

    return <span key={`${segment.text}-${index}`}>{segment.text}</span>;
  });
}

export function PrincipalParts({ parts, variant = 'inline' }) {
  if (!parts) {
    return <span className="muted-text">No principal parts saved yet.</span>;
  }

  const availableKeys = PART_ORDER.filter((key) => parts[key]);

  if (availableKeys.length === 0) {
    return <span className="muted-text">No principal parts saved yet.</span>;
  }

  if (variant === 'inline') {
    return (
      <span className="parts-inline">
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
    <div className={cx('parts-stack', `parts-stack--${variant}`)}>
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
