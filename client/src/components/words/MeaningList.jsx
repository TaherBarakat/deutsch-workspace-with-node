export function MeaningList({ meanings, limit = 4, className }) {
  if (!meanings || meanings.length === 0) {
    return <span className="muted-text">No English meaning saved.</span>;
  }

  const visible = meanings.slice(0, limit);
  const remaining = meanings.length - visible.length;

  return (
    <span className={className ?? 'meaning-list'}>
      {visible.join(' · ')}
      {remaining > 0 ? <span className="meaning-list__more"> +{remaining}</span> : null}
    </span>
  );
}
