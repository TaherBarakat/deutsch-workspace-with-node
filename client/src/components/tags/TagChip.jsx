import { Hash, X } from 'lucide-react';
import { cx } from '../../utils.js';

export function TagChip({
  name,
  count,
  active = false,
  onClick,
  onRemove,
  size = 'md',
  className,
}) {
  const content = (
    <>
      {size === 'sm' ? null : <Hash size={12} aria-hidden="true" />}
      <span>{name}</span>
      {Number.isFinite(count) ? <span className="tag-chip__count">{count}</span> : null}
      {onRemove ? (
        <span
          className="tag-chip__remove"
          role="button"
          tabIndex={0}
          aria-label={`Remove tag ${name}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(name);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onRemove(name);
            }
          }}
        >
          <X size={12} />
        </span>
      ) : null}
    </>
  );

  const classes = cx(
    'tag-chip',
    `tag-chip--${size}`,
    active && 'is-active',
    onClick && 'tag-chip--clickable',
    className,
  );

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-pressed={active}>
        {content}
      </button>
    );
  }

  return <span className={classes}>{content}</span>;
}
