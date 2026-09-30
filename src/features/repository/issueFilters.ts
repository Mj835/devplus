import type { Issue } from '../../api/types';

export const ISSUE_FILTERS = ['all', 'open', 'closed'] as const;
export type IssueFilter = (typeof ISSUE_FILTERS)[number];

/** Client-side filter over the already-loaded issues: by state, then case-insensitive title match. */
export function filterIssues(issues: Issue[], state: IssueFilter, query: string): Issue[] {
  const needle = query.trim().toLowerCase();
  return issues.filter((i) => (state === 'all' || i.state === state) && i.title.toLowerCase().includes(needle));
}

export function countIssues(issues: Issue[]): Record<IssueFilter, number> {
  const open = issues.filter((i) => i.state === 'open').length;
  return { all: issues.length, open, closed: issues.length - open };
}
