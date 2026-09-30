import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { GitHubError } from '../../api/client';
import { repoQuery } from '../../api/queries';
import { ErrorState } from '../../components/ErrorState';
import {
  btnPrimary,
  kpiGrid,
  skeletonCard,
  stateDesc,
  stateErrorContainer,
  stateIcon,
  stateTitle,
} from '../../styles/classes';
import { RecentIssues } from './components/RecentIssues';
import { RepoMetadata } from './components/RepoMetadata';
import { RepoOverview } from './components/RepoOverview';
import { RepoStats } from './components/RepoStats';

export function RepositoryPage() {
  const { owner = '', repo = '' } = useParams();
  const details = useQuery(repoQuery(owner, repo));
  const data = details.data;
  const notFound = details.error instanceof GitHubError && details.error.kind === 'not-found';

  // The heading only exists once details load, so focus it then (not on mount, when it's still null).
  // Navigating to another repo remounts this page (the route boundary is keyed by pathname).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const loaded = Boolean(data);
  useEffect(() => {
    if (loaded) headingRef.current?.focus();
  }, [loaded]);

  return (
    <article className="flex flex-col gap-7 animate-fade-in">
      <div>
        <BackToSearchLink />
      </div>

      {details.isPending && <RepoSkeleton />}

      {details.isError &&
        (notFound ? (
          <RepoNotFound owner={owner} repo={repo} />
        ) : (
          <ErrorState
            error={details.error}
            title="Could not load repository details"
            onRetry={() => details.refetch()}
          />
        ))}

      {data && (
        <>
          <RepoOverview repo={data} headingRef={headingRef} />
          <RepoStats repo={data} />
          <RepoMetadata repo={data} />
        </>
      )}

      {/* Nothing useful to show about issues of a repo that doesn't exist. */}
      {!notFound && <RecentIssues owner={owner} repo={repo} />}
    </article>
  );
}

function BackToSearchLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-[0.45rem] w-fit text-[0.875rem] font-semibold text-fg-2 px-3 py-[0.35rem] rounded-[8px] bg-surface border border-line transition-all hover:text-primary hover:border-line-strong hover:-translate-x-[2px]"
      onClick={(e) => {
        // history.back() keeps the user's search, page and scroll; fall back to / on direct visits.
        if (window.history.state?.idx > 0) {
          e.preventDefault();
          window.history.back();
        }
      }}
    >
      <ArrowLeft size={16} />
      <span>Back to search</span>
    </Link>
  );
}

function RepoSkeleton() {
  return (
    <div className={`${skeletonCard} p-8`}>
      <div className="skeleton w-[40%] h-[32px] mb-[16px]" />
      <div className="skeleton w-[70%] h-[20px] mb-[24px]" />
      <div className={kpiGrid}>
        <div className="skeleton h-[75px]" />
        <div className="skeleton h-[75px]" />
        <div className="skeleton h-[75px]" />
        <div className="skeleton h-[75px]" />
      </div>
    </div>
  );
}

function RepoNotFound({ owner, repo }: { owner: string; repo: string }) {
  return (
    <div className={stateErrorContainer} role="alert">
      <div className={`${stateIcon} bg-danger-bg text-danger`}>
        <AlertCircle size={28} />
      </div>
      <h2 className={stateTitle}>Repository Not Found</h2>
      <p className={stateDesc}>
        The repository{' '}
        <strong>
          {owner}/{repo}
        </strong>{' '}
        could not be found. It may be private, renamed, or deleted.
      </p>
      <Link to="/" className={`${btnPrimary} mt-2`}>
        Return to Search
      </Link>
    </div>
  );
}
