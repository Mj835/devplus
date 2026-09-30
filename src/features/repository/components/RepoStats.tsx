import type { ReactNode } from 'react';
import { AlertCircle, Eye, GitFork, Star } from 'lucide-react';
import type { RepoDetail } from '../../../api/types';
import { formatNumber } from '../../../lib/format';
import { kpiGrid } from '../../../styles/classes';

const kpiCard =
  'bg-surface border border-line rounded-[12px] p-[1.15rem] flex items-center gap-4 shadow-card transition-transform hover:-translate-y-[2px] hover:border-line-strong';
const kpiIcon = 'w-[44px] h-[44px] rounded-[10px] flex items-center justify-center shrink-0';
const kpiLabel = 'text-[0.75rem] font-semibold text-fg-muted uppercase tracking-[0.03em]';
const kpiValue = 'text-[1.35rem] font-extrabold text-fg leading-[1.2]';

interface Stat {
  label: string;
  value: number;
  /** Icon tile colours. Fixed per metric, so they stay the same in both themes. */
  tint: string;
  icon: ReactNode;
}

export function RepoStats({ repo }: { repo: RepoDetail }) {
  const stats: Stat[] = [
    {
      label: 'Stars',
      value: repo.stars,
      tint: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]',
      icon: <Star size={22} fill="#f59e0b" className="opacity-85" />,
    },
    {
      label: 'Forks',
      value: repo.forks,
      tint: 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]',
      icon: <GitFork size={22} />,
    },
    {
      label: 'Watchers',
      value: repo.watchers,
      tint: 'bg-[rgba(6,182,212,0.15)] text-[#06b6d4]',
      icon: <Eye size={22} />,
    },
    {
      label: 'Open Issues',
      value: repo.openIssues,
      tint: 'bg-[rgba(225,29,72,0.15)] text-[#e11d48]',
      icon: <AlertCircle size={22} />,
    },
  ];

  return (
    <section aria-label="Key repository metrics" className={kpiGrid}>
      {stats.map((stat) => (
        <div key={stat.label} className={kpiCard}>
          <div className={`${kpiIcon} ${stat.tint}`}>{stat.icon}</div>
          <div className="flex flex-col">
            <span className={kpiLabel}>{stat.label}</span>
            <span className={kpiValue}>{formatNumber(stat.value)}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
