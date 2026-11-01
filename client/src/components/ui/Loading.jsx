import { LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading words…' }) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle size={22} className="spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function CardSkeletonGrid({ count = 4 }) {
  return (
    <div className="word-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="word-card word-card--skeleton" key={index}>
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
          <div className="skeleton skeleton--block" />
        </div>
      ))}
    </div>
  );
}
