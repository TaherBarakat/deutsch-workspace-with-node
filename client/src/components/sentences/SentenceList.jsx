import { SentenceCard } from './SentenceCard.jsx';

export function SentenceList({ sentences, onEdit, onDelete, onTagClick }) {
  return (
    <div className="sentence-grid">
      {sentences.map((sentence) => (
        <SentenceCard
          key={sentence.id}
          sentence={sentence}
          onEdit={onEdit}
          onDelete={onDelete}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}
