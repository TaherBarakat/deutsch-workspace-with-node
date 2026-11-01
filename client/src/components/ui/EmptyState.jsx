import { Button } from './Button.jsx';

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, children }) {
  return (
    <div className="empty-state">
      {Icon ? (
        <div className="empty-state__icon">
          <Icon size={26} aria-hidden="true" />
        </div>
      ) : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="accent" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
