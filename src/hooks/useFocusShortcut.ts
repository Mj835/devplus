import { useEffect, type RefObject } from 'react';

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** Focuses `ref` on "/" (unless the user is typing elsewhere) or Ctrl/⌘+K. */
export function useFocusShortcut(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isShortcut = (e.key === '/' && !isTypingTarget(e.target)) || ((e.metaKey || e.ctrlKey) && e.key === 'k');
      if (isShortcut && document.activeElement !== ref.current) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ref]);
}
