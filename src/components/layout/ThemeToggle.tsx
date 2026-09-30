import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { btnIcon } from '../../styles/classes';

const STORAGE_KEY = 'devpulse_theme';

const THEMES = {
  system: { label: 'System', Icon: Monitor, next: 'dark' },
  dark: { label: 'Dark', Icon: Moon, next: 'light' },
  light: { label: 'Light', Icon: Sun, next: 'system' },
} as const;

type Theme = keyof typeof THEMES;

const isTheme = (value: string | null): value is Theme => value !== null && Object.hasOwn(THEMES, value);

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isTheme(saved)) return saved;
  } catch {
    // Storage blocked: fall back to the OS preference.
  }
  return 'system';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    // "system" removes the attribute so the prefers-color-scheme media query in index.css decides.
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage blocked: the choice just won't persist.
    }
  }, [theme]);

  const { label, Icon, next } = THEMES[theme];

  return (
    <button
      type="button"
      className={btnIcon}
      onClick={() => setTheme(next)}
      title={`Current theme: ${label} (Click to toggle)`}
      aria-label={`Current theme: ${label}`}
    >
      <Icon size={16} />
      {/* Icon-only on phones; the button's aria-label always names the theme. */}
      <span className="max-sm:hidden">{label}</span>
    </button>
  );
}
