import { Tag, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function WordSelectionBar({
  count,
  total,
  onSelectAll,
  onClear,
  onTag,
  onDelete,
  onExit,
}) {
  const allSelected = total > 0 && count === total;

  return (
    <div className="selection-bar" role="region" aria-label="Bulk actions">
      <div className="selection-bar__summary">
        <strong>{count}</strong>
        <span>{` of ${total} selected`}</span>
      </div>

      <div className="selection-bar__actions">
        <button
          type="button"
          className="selection-bar__link"
          onClick={allSelected ? onClear : onSelectAll}
        >
          {allSelected ? 'Clear selection' : 'Select all'}
        </button>

        <Button
          variant="secondary"
          size="sm"
          icon={Tag}
          onClick={onTag}
          disabled={count === 0}
        >
          Add tag
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={onDelete}
          disabled={count === 0}
        >
          Delete
        </Button>
        <Button variant="ghost" size="sm" icon={X} onClick={onExit}>
          Done
        </Button>
      </div>
    </div>
  );
}
