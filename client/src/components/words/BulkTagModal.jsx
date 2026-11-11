import { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { TagInput } from '../tags/TagInput.jsx';

export function BulkTagModal({ count, suggestions, onApply, onClose }) {
  const [tags, setTags] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event?.preventDefault();
    if (busy) return;

    if (tags.length === 0) {
      setError('Choose or type at least one tag.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await onApply(tags);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  }

  return (
    <Modal
      title={`Tag ${count} ${count === 1 ? 'word' : 'words'}`}
      description="These tags are added to every selected word. Existing tags are kept."
      onClose={busy ? () => {} : onClose}
      size="sm"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="accent" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Adding…' : 'Add tags'}
          </Button>
        </>
      )}
    >
      <form className="bulk-tag-form" onSubmit={handleSubmit}>
        <TagInput
          value={tags}
          onChange={setTags}
          suggestions={suggestions}
          placeholder="Tag every selected word"
        />
        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </Modal>
  );
}
