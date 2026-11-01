import { cx } from '../../utils.js';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cx('button', `button--${variant}`, `button--${size}`, className)}
      {...props}
    >
      {Icon ? <Icon size={size === 'sm' ? 15 : 17} aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  className,
  ...props
}) {
  return (
    <button
      type="button"
      className={cx('icon-button', `icon-button--${variant}`, className)}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}
