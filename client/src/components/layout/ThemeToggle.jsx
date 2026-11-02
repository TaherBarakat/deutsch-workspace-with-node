import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { cx } from '../../utils.js';

export function ThemeToggle({ compact = false, className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className={cx('theme-toggle', compact && 'theme-toggle--compact', className)}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
    >
      <Icon size={compact ? 17 : 16} aria-hidden="true" />
      {compact ? null : <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
}
