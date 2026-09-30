const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en');
const date = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' });
const time = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });

export const formatCount = (n: number) => compact.format(n);
export const formatNumber = (n: number) => full.format(n);
export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatTime = (d: Date) => time.format(d);

export function formatRelativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(seconds)) return iso;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 86400 * 365) return `${Math.floor(seconds / (86400 * 30))}mo ago`;
  return `${Math.floor(seconds / (86400 * 365))}y ago`;
}

const DEFAULT_LANG_COLOR = '#6366f1';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Java: '#b07219',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Lua: '#000080',
  Elixir: '#6e4a7e',
  Zig: '#ec915c',
  Scala: '#c22d40',
};

export function getLanguageColor(language: string | null): string {
  return (language && LANGUAGE_COLORS[language]) || DEFAULT_LANG_COLOR;
}
