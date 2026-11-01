import { GENDERS } from '../../constants.js';
import { cx } from '../../utils.js';

export function GenderBadge({ gender, article = false, size = 'md' }) {
  if (!gender || !GENDERS[gender]) return null;

  const meta = GENDERS[gender];

  return (
    <span className={cx('gender-badge', `gender-badge--${gender}`, `gender-badge--${size}`)}>
      <span className="gender-badge__dot" aria-hidden="true" />
      <span>{article ? meta.article : meta.label}</span>
    </span>
  );
}

export function GenderedArticle({ gender, children, className }) {
  if (!gender) return <span className={className}>{children}</span>;

  return (
    <span className={cx(className, `text-gender-${gender}`)}>
      <span className="article">{GENDERS[gender].article}</span> {children}
    </span>
  );
}
