import { useRef, type FormEvent } from 'react';
import { BookMarked, Search, Users, X, type LucideIcon } from 'lucide-react';
import type { SearchType } from '../../../api/types';
import { useFocusShortcut } from '../../../hooks/useFocusShortcut';
import { btnGhostIcon } from '../../../styles/classes';

const segmentBase =
  'relative flex items-center gap-[0.4rem] px-[0.85rem] py-[0.45rem] rounded-[8px] text-[0.875rem] font-semibold cursor-pointer select-none transition-all has-focus-visible:outline-2 has-focus-visible:outline-focus max-md:flex-1 max-md:justify-center';
const segmentActive = 'bg-surface text-primary shadow-[0_1px_4px_rgba(0,0,0,0.1)]';
const segmentIdle = 'text-fg-2 hover:text-fg';

const SEARCH_TYPES: { value: SearchType; label: string; Icon: LucideIcon }[] = [
  { value: 'repositories', label: 'Repositories', Icon: BookMarked },
  { value: 'users', label: 'Developers', Icon: Users },
];

interface Props {
  text: string;
  type: SearchType;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onTypeChange: (type: SearchType) => void;
}

export function SearchBar({ text, type, onTextChange, onSubmit, onClear, onTypeChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  useFocusShortcut(inputRef);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <form
      className="flex items-center gap-2 bg-surface border-[1.5px] border-line-strong rounded-[14px] py-[0.4rem] pr-2 pl-4 shadow-card transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-light),var(--card-shadow)] max-md:flex-col max-md:items-stretch max-md:p-3"
      role="search"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-[0.65rem] flex-1 min-w-0">
        <Search size={20} className="text-fg-muted shrink-0" aria-hidden="true" />
        <label htmlFor="search-input" className="sr-only">
          Search {type === 'users' ? 'developers' : 'repositories'}
        </label>
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          className="w-full border-none bg-transparent text-fg text-[1.05rem] [font-family:inherit] outline-none placeholder:text-fg-muted placeholder:opacity-80"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={
            type === 'users'
              ? 'Search developers by username, name or role (e.g. "shadcn")'
              : 'Search repositories, technologies, or keywords (e.g. "react")'
          }
          autoComplete="off"
        />
        {text && (
          <button
            type="button"
            className={btnGhostIcon}
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear input"
          >
            <X size={18} />
          </button>
        )}
        <kbd
          className="hidden sm:inline-block text-[0.7rem] px-[0.45rem] py-[0.15rem] rounded-[4px] bg-subtle border border-line text-fg-muted font-semibold"
          title="Press '/' to focus search"
        >
          /
        </kbd>
      </div>

      <div
        className="flex bg-subtle p-[3px] rounded-[10px] border border-line shrink-0 max-md:w-full"
        role="radiogroup"
        aria-label="Search category"
      >
        {SEARCH_TYPES.map(({ value, label, Icon }) => (
          <label key={value} className={`${segmentBase} ${type === value ? segmentActive : segmentIdle}`}>
            <input
              type="radio"
              className="absolute opacity-0 w-0 h-0"
              name="type"
              value={value}
              checked={type === value}
              onChange={() => onTypeChange(value)}
            />
            <Icon size={16} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </form>
  );
}
