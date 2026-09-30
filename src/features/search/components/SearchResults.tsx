import { useRef } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Layers, Search, X } from 'lucide-react';
import { PER_PAGE } from '../../../api/github';
import { searchQuery } from '../../../api/queries';
import type { SearchType } from '../../../api/types';
import { ErrorState } from '../../../components/ErrorState';
import { Pagination } from '../../../components/Pagination';
import { formatNumber } from '../../../lib/format';
import { countPill, resultsGrid, stateContainer, stateDesc, stateIcon, stateTitle } from '../../../styles/classes';
import { RepoCard } from './RepoCard';
import { ResultsSkeleton } from './ResultsSkeleton';
import { UserCard } from './UserCard';

interface Props {
  q: string;
  type: SearchType;
  page: number;
  onPageChange: (page: number) => void;
}

export function SearchResults({ q, type, page, onPageChange }: Props) {
  // Each (type, q, page) is its own cache entry, so a slow stale response can never overwrite a newer
  // one; the AbortSignal inside searchQuery cancels requests nobody is waiting for any more.
  const result = useQuery({ ...searchQuery(type, q, page), placeholderData: keepPreviousData });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const goToPage = (next: number) => {
    onPageChange(next);
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const data = result.data;
  // keepPreviousData would otherwise show repo results under the "Developers" tab while loading.
  const showData = data?.type === type;

  return (
    <section aria-labelledby="results-heading">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5 pb-3 border-b border-line">
        <h2
          id="results-heading"
          ref={headingRef}
          tabIndex={-1}
          className="flex items-center gap-2 text-[1.15rem] font-bold scroll-mt-20"
        >
          {!q ? (
            <>
              <Layers size={20} color="var(--primary)" />
              <span>Ready to Search</span>
            </>
          ) : showData ? (
            <>
              <span>Results for “{q}”</span>
              <span className={countPill}>
                {formatNumber(data.totalCount)} {type === 'users' ? 'users' : 'repositories'}
              </span>
            </>
          ) : result.isError ? (
            <span>Search query error</span>
          ) : (
            <span>Searching GitHub for “{q}”…</span>
          )}
        </h2>
      </div>

      {!q && (
        <div className={stateContainer}>
          <div className={`${stateIcon} bg-primary-light text-primary`}>
            <Search size={28} />
          </div>
          <h3 className={stateTitle}>Find What You Need</h3>
          <p className={stateDesc}>
            Type a keyword above or select a trending topic to discover top GitHub repositories and open-source
            contributors.
          </p>
        </div>
      )}

      {q && result.isError && !showData && (
        <ErrorState error={result.error} title="Search failed" onRetry={() => result.refetch()} />
      )}

      {q && !result.isError && !showData && <ResultsSkeleton count={Math.min(PER_PAGE[type], 6)} />}

      {q && showData && data.items.length === 0 && (
        <div className={stateContainer}>
          <div className={`${stateIcon} bg-subtle text-fg-muted`}>
            <X size={28} />
          </div>
          <h3 className={stateTitle}>No matches found</h3>
          <p className={stateDesc}>
            No {type} matched “{q}”. Try checking for typos or searching with broader keywords.
          </p>
        </div>
      )}

      {q && showData && data.items.length > 0 && (
        <>
          {result.isError && (
            <ErrorState error={result.error} title="Could not refresh results" onRetry={() => result.refetch()} />
          )}
          <div
            className={`${resultsGrid}${result.isPlaceholderData ? ' opacity-60 pointer-events-none' : ''}`}
            aria-busy={result.isFetching}
          >
            {data.type === 'repositories'
              ? data.items.map((r) => <RepoCard key={r.id} repo={r} />)
              : data.items.map((u) => <UserCard key={u.id} user={u} />)}
          </div>
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onChange={goToPage}
            disabled={result.isPlaceholderData}
          />
        </>
      )}
    </section>
  );
}
