import { useState } from 'react';
import { CheckCircle2, CircleDot } from 'lucide-react';
import type { Issue } from '../../../api/types';
import { RelativeTime } from '../../../components/RelativeTime';
import { stateCompact, stateDesc, stateIcon, stateTitle, wrapAnywhere } from '../../../styles/classes';
import { countIssues, filterIssues, ISSUE_FILTERS, type IssueFilter } from '../issueFilters';

const FILTER_LABELS: Record<IssueFilter, string> = { all: 'All', open: 'Open', closed: 'Closed' };
const filterPill = 'px-3 py-[0.35rem] rounded-full text-[0.775rem] font-semibold border cursor-pointer transition-all';

export function IssueList({ issues }: { issues: Issue[] }) {
  const [filter, setFilter] = useState<IssueFilter>('all');
  const [query, setQuery] = useState('');

  if (issues.length === 0) {
    return (
      <div className={stateCompact}>
        <div className={`${stateIcon} bg-open-bg text-open`}>
          <CheckCircle2 size={24} />
        </div>
        <h3 className={stateTitle}>No Recent Issues</h3>
        <p className={stateDesc}>This repository currently has no active or recent issues recorded.</p>
      </div>
    );
  }

  const filtered = filterIssues(issues, filter, query);
  const counts = countIssues(issues);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex gap-[0.4rem]">
          {ISSUE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`${filterPill} ${filter === f ? 'bg-primary text-white border-primary' : 'bg-subtle border-line text-fg-2'}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]} ({counts[f]})
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="search"
            aria-label="Filter issues by title"
            className="px-3 py-[0.35rem] rounded-[8px] text-[0.825rem] bg-subtle border border-line text-fg outline-none focus:border-primary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter issues..."
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-fg-muted p-6 text-center">No issues match the selected filter.</p>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col border border-line rounded-[10px] overflow-hidden">
          {filtered.map((i) => (
            <li
              key={i.id}
              className="flex items-start gap-[0.85rem] px-4 py-[0.85rem] bg-surface border-t border-line first:border-t-0 transition-colors hover:bg-subtle"
            >
              <span
                className={`inline-flex items-center gap-[0.3rem] text-[0.725rem] font-bold px-[0.55rem] py-[0.2rem] rounded-full capitalize shrink-0 border ${
                  i.state === 'open' ? 'bg-open-bg text-open border-open' : 'bg-closed-bg text-closed border-closed'
                }`}
              >
                {i.state === 'open' ? <CircleDot size={12} /> : <CheckCircle2 size={12} />}
                <span>{i.state}</span>
              </span>
              <div className="flex-1 min-w-0">
                <a
                  href={i.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`${wrapAnywhere} block text-[0.925rem] font-semibold text-fg leading-[1.4] hover:text-primary`}
                >
                  {i.title}
                </a>
                <div className={`${wrapAnywhere} text-[0.775rem] text-fg-muted mt-[0.2rem]`}>
                  #{i.number} opened by <strong className="text-fg-2">{i.author ?? 'unknown'}</strong> ·{' '}
                  <RelativeTime iso={i.createdAt} /> · updated <RelativeTime iso={i.updatedAt} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
