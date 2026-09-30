/*
 * Tailwind class strings for patterns that repeat across components. One-off styling lives inline
 * at the call site; only things used in several files are named here.
 * Note: root font-size is 15px, so px values from the design are written as arbitrary px (w-[36px]).
 */

export const btnPrimary =
  'inline-flex items-center gap-[0.45rem] px-[1.15rem] py-[0.55rem] rounded-[9px] text-[0.875rem] font-semibold bg-primary text-white border-none cursor-pointer shadow-glow transition-all hover:bg-primary-hover hover:text-white hover:-translate-y-px';

export const btnSecondary =
  'inline-flex items-center gap-[0.45rem] px-4 py-[0.55rem] rounded-[9px] text-[0.875rem] font-semibold bg-subtle border border-line-strong text-fg cursor-pointer transition-all hover:bg-elevated hover:border-line-hover';

export const btnCard =
  'inline-flex items-center gap-[0.35rem] px-[0.65rem] py-[0.35rem] rounded-[6px] text-[0.775rem] font-semibold bg-subtle border border-line text-fg-2 cursor-pointer transition-all hover:bg-elevated hover:text-primary hover:border-focus';

/** Emphasised variant of btnCard (e.g. "Insights", "GitHub Profile"). */
export const btnCardAccent =
  'inline-flex items-center gap-[0.35rem] px-[0.65rem] py-[0.35rem] rounded-[6px] text-[0.775rem] font-semibold bg-subtle border border-focus text-primary cursor-pointer transition-all hover:bg-elevated';

export const btnIcon =
  'inline-flex items-center justify-center gap-[0.4rem] px-3 py-[0.45rem] rounded-[8px] border border-line bg-subtle text-fg-2 text-[0.85rem] font-medium cursor-pointer transition-all hover:bg-elevated hover:text-fg hover:border-line-strong';

/** Borderless square icon button (clear search, close dialog). */
export const btnGhostIcon =
  'bg-transparent border-none p-[0.3rem] text-fg-muted cursor-pointer flex items-center justify-center rounded-[6px] transition-all hover:bg-subtle hover:text-fg';

export const card =
  'relative flex flex-col bg-surface border border-line rounded-[14px] p-5 shadow-card overflow-hidden transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:border-line-strong hover:shadow-card-hover';

export const cardFooter =
  'flex items-center justify-between gap-2 mt-[0.85rem] pt-[0.65rem] border-t border-dashed border-line';

export const resultsGrid =
  'grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5 transition-opacity max-md:grid-cols-1';

export const skeletonCard = 'bg-surface border border-line rounded-[14px] flex flex-col gap-[0.85rem]';

export const countPill =
  'inline-flex px-[0.55rem] py-[0.15rem] rounded-full text-[0.75rem] font-bold bg-primary-light text-primary';

export const langDot = 'w-[9px] h-[9px] rounded-full shrink-0';

// Columns never go below 210px (enough for a 9-digit count beside its icon), so phones get one column
// instead of two squeezed ones; min(100%, …) keeps a single column from overflowing very narrow screens.
export const kpiGrid = 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-4';

/** Lets long unbroken strings (URLs, repo names, logins) wrap instead of overflowing their box. */
export const wrapAnywhere = 'min-w-0 [overflow-wrap:anywhere]';

// Empty / error state panels.
const stateBase =
  'text-center bg-surface border rounded-[14px] shadow-card flex flex-col items-center justify-center gap-3 my-6';
export const stateContainer = `${stateBase} border-line py-14 px-6`;
export const stateErrorContainer = `${stateBase} border-danger py-14 px-6`;
export const stateCompact = `${stateBase} border-line py-8 px-4`;
export const stateIcon = 'w-[56px] h-[56px] rounded-full flex items-center justify-center mb-2';
export const stateTitle = 'text-[1.25rem] font-bold text-fg';
export const stateDesc = 'text-[0.925rem] text-fg-2 max-w-[480px]';
