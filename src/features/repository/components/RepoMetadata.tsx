import type { ReactNode } from 'react';
import { Calendar, Clock, Code2, GitBranch } from 'lucide-react';
import type { RepoDetail } from '../../../api/types';
import { RelativeTime } from '../../../components/RelativeTime';
import { formatDate } from '../../../lib/format';

const metaDt = 'text-[0.75rem] font-semibold text-fg-muted uppercase';
const metaDd = 'm-0 text-[0.925rem] font-semibold text-fg flex items-center gap-[0.45rem]';

interface Row {
  label: string;
  icon: ReactNode;
  value: ReactNode;
}

export function RepoMetadata({ repo }: { repo: RepoDetail }) {
  const rows: Row[] = [
    {
      label: 'Primary Language',
      icon: <Code2 size={15} color="var(--primary)" />,
      value: <span>{repo.language ?? 'Not specified'}</span>,
    },
    {
      label: 'Default Branch',
      icon: <GitBranch size={15} color="var(--primary)" />,
      value: <code>{repo.defaultBranch}</code>,
    },
    {
      label: 'Created Date',
      icon: <Calendar size={15} color="var(--text-muted)" />,
      value: <time dateTime={repo.createdAt}>{formatDate(repo.createdAt)}</time>,
    },
    {
      label: 'Last Activity',
      icon: <Clock size={15} color="var(--text-muted)" />,
      value: <RelativeTime iso={repo.updatedAt} />,
    },
  ];

  return (
    <dl
      aria-label="Metadata breakdown"
      className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 bg-surface border border-line rounded-[12px] p-5"
    >
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-[0.2rem]">
          <dt className={metaDt}>{row.label}</dt>
          <dd className={metaDd}>
            {row.icon}
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
