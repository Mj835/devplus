import { Flame } from 'lucide-react';
import type { SearchType } from '../../../api/types';

const SUGGESTIONS: Record<SearchType, string[]> = {
  repositories: ['React', 'TypeScript', 'Next.js', 'Rust', 'Golang', 'Tailwind CSS', 'Python AI', 'Vue'],
  users: ['gaearon', 'torvalds', 'sindresorhus', 'antfu', 'shadcn', 'leerob', 'yyx990803'],
};

interface Props {
  type: SearchType;
  onSelect: (term: string) => void;
}

export function PopularSearches({ type, onSelect }: Props) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-[0.45rem] mt-4">
      <div className="text-[0.8rem] font-semibold text-fg-muted mr-1">
        <Flame size={14} className="inline align-text-bottom text-[#f59e0b] mr-[2px]" />
        <span>Popular:</span>
      </div>
      {SUGGESTIONS[type].map((term) => (
        <button
          key={term}
          type="button"
          className="inline-flex items-center gap-[0.35rem] px-[0.65rem] py-1 rounded-full text-[0.775rem] font-medium bg-surface border border-line text-fg-2 cursor-pointer transition-all hover:bg-primary-light hover:text-primary hover:border-focus hover:-translate-y-px"
          onClick={() => onSelect(term)}
        >
          <span>{term}</span>
        </button>
      ))}
    </div>
  );
}
