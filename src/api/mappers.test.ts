import { describe, expect, it } from 'vitest';
import { mapIssues, mapRepo, totalPages } from './mappers';

describe('totalPages', () => {
  it('respects the 1000-result search cap', () => {
    expect(totalPages(5_000_000, 20)).toBe(50);
    expect(totalPages(41, 20)).toBe(3);
    expect(totalPages(0, 20)).toBe(0);
  });
});

describe('mapIssues', () => {
  const base = {
    title: 't',
    state: 'open' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    html_url: 'https://github.com/o/r/issues/1',
  };

  it('drops pull requests and handles deleted authors', () => {
    const issues = mapIssues([
      { ...base, id: 1, number: 1, user: { login: 'alice' } },
      { ...base, id: 2, number: 2, user: { login: 'bob' }, pull_request: {} },
      { ...base, id: 3, number: 3, user: null },
    ]);
    expect(issues.map((i) => i.number)).toEqual([1, 3]);
    expect(issues[0]?.author).toBe('alice');
    expect(issues[1]?.author).toBeNull();
  });
});

describe('mapRepo', () => {
  it('maps snake_case API fields to the domain model', () => {
    const repo = mapRepo({
      id: 1,
      name: 'react',
      full_name: 'facebook/react',
      owner: { login: 'facebook', avatar_url: 'a', html_url: 'h' },
      description: null,
      language: 'JavaScript',
      stargazers_count: 10,
      forks_count: 2,
      open_issues_count: 3,
      updated_at: '2024-01-01T00:00:00Z',
      html_url: 'https://github.com/facebook/react',
    });
    expect(repo).toMatchObject({ fullName: 'facebook/react', stars: 10, forks: 2, openIssues: 3, description: null });
    expect(repo.owner.avatarUrl).toBe('a');
  });
});
