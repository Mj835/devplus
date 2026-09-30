import { describe, expect, it } from 'vitest';
import type { Issue } from '../../api/types';
import { countIssues, filterIssues } from './issueFilters';

const issue = (id: number, title: string, state: Issue['state']): Issue => ({
  id,
  number: id,
  title,
  state,
  author: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  url: '',
});

const issues = [
  issue(1, 'Crash on startup', 'open'),
  issue(2, 'Docs typo', 'closed'),
  issue(3, 'crash in HMR', 'closed'),
];

describe('filterIssues', () => {
  it('filters by state', () => {
    expect(filterIssues(issues, 'open', '').map((i) => i.id)).toEqual([1]);
    expect(filterIssues(issues, 'all', '').map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it('combines state with a trimmed, case-insensitive title match', () => {
    expect(filterIssues(issues, 'all', '  CRASH ').map((i) => i.id)).toEqual([1, 3]);
    expect(filterIssues(issues, 'closed', 'crash').map((i) => i.id)).toEqual([3]);
  });
});

describe('countIssues', () => {
  it('counts per state', () => {
    expect(countIssues(issues)).toEqual({ all: 3, open: 1, closed: 2 });
  });
});
