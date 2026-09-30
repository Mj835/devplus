import { useEffect, useEffectEvent, useState } from 'react';
import { PopularSearches } from './components/PopularSearches';
import { SearchBar } from './components/SearchBar';
import { SearchHero } from './components/SearchHero';
import { SearchResults } from './components/SearchResults';
import { useSearchState } from './useSearchState';

const DEBOUNCE_MS = 400;

export function SearchPage() {
  // The URL is the single source of truth for what is searched: shareable, and back/forward just work.
  const [{ q, type, page }, update] = useSearchState();

  // The input is local state so typing stays instant; it is committed to the URL after a pause.
  const [text, setText] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    // URL changed from outside (back/forward, link): reflect it in the input.
    setSyncedQ(q);
    if (q !== text.trim()) setText(q);
  }

  // Typing replaces history entries so Back doesn't step through every keystroke.
  const commitTyped = useEffectEvent((value: string) => update({ q: value, page: 1 }, { replace: true }));
  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === q) return;
    const id = setTimeout(() => commitTyped(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [text, q]);

  const searchFor = (term: string) => {
    setText(term);
    update({ q: term, page: 1 });
  };

  return (
    <>
      <SearchHero />
      <div className="max-w-[780px] mx-auto mb-6 relative">
        <SearchBar
          text={text}
          type={type}
          onTextChange={setText}
          onSubmit={() => update({ q: text.trim(), page: 1 })}
          onClear={() => searchFor('')}
          onTypeChange={(next) => update({ type: next, page: 1 })}
        />
        <PopularSearches type={type} onSelect={searchFor} />
      </div>
      <SearchResults q={q} type={type} page={page} onPageChange={(next) => update({ page: next })} />
    </>
  );
}
