import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  busy = false,
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="sm"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </Button>
        </>
      )}
    >
      <div className="confirm-dialog">
        <span className="confirm-dialog__icon">
          <AlertTriangle size={20} aria-hidden="true" />
        </span>
        <p>{description}</p>
      </div>
    </Modal>
  );
}
