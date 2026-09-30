import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { issuesQuery } from '../../../api/queries';
import { ErrorState } from '../../../components/ErrorState';
import { countPill } from '../../../styles/classes';
import { IssueList } from './IssueList';

interface Props {
  owner: string;
  repo: string;
}

/** Loads independently of the repository details: a failed issues call must not hide the repo. */
export function RecentIssues({ owner, repo }: Props) {
  const issues = useQuery(issuesQuery(owner, repo));

  return (
    <section aria-labelledby="issues-heading" className="bg-surface border border-line rounded-[14px] p-6 shadow-card">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5 pb-[0.85rem] border-b border-line">
        <h2 id="issues-heading" className="flex items-center gap-[0.6rem]">
          <AlertCircle size={20} color="var(--primary)" />
          <span>Recent Issues</span>
        </h2>
        {issues.data && <span className={countPill}>{issues.data.length} tracked</span>}
      </div>

      {issues.isPending && (
        <div className="flex flex-col gap-3 py-4">
          <div className="skeleton h-[50px]" />
          <div className="skeleton h-[50px]" />
          <div className="skeleton h-[50px]" />
        </div>
      )}

      {issues.isError && (
        <ErrorState error={issues.error} title="Could not load issues" onRetry={() => issues.refetch()} />
      )}

      {issues.data && <IssueList issues={issues.data} />}
    </section>
  );
}
