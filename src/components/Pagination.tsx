import { ChevronLeft, ChevronRight } from 'lucide-react';

const pageBtn =
  'inline-flex items-center gap-[0.35rem] px-[0.95rem] py-2 rounded-[9px] text-[0.85rem] font-semibold bg-surface border border-line-strong text-fg cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all enabled:hover:bg-elevated enabled:hover:border-focus enabled:hover:text-primary disabled:opacity-45 disabled:cursor-not-allowed';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, totalPages, onChange, disabled }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-[0.65rem] mt-10 mb-4" aria-label="Search results pagination">
      <button
        type="button"
        className={pageBtn}
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </button>

      <div
        className="px-[0.85rem] py-[0.45rem] rounded-[8px] text-[0.85rem] font-semibold text-fg-2 bg-subtle border border-line"
        aria-live="polite"
      >
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </div>

      <button
        type="button"
        className={pageBtn}
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
