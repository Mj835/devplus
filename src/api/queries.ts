import { queryOptions } from '@tanstack/react-query';
import { getRecentIssues, getRepo, getUser, search } from './github';
import type { SearchType } from './types';

/*
 * Every query key lives here. Each key includes every input of its fetcher: that is what keeps a
 * slow, stale response from ever overwriting a newer one (see README "Race conditions").
 */

export const searchQuery = (type: SearchType, q: string, page: number) =>
  queryOptions({
    queryKey: ['search', type, q, page] as const,
    queryFn: ({ signal }) => search(type, q, page, signal),
    enabled: q.length > 0,
  });

export const userQuery = (login: string) =>
  queryOptions({
    queryKey: ['user', login] as const,
    queryFn: ({ signal }) => getUser(login, signal),
    // Profiles change rarely and each one costs a request from a 60/h budget.
    staleTime: 30 * 60_000,
  });

export const repoQuery = (owner: string, repo: string) =>
  queryOptions({
    queryKey: ['repo', owner, repo] as const,
    queryFn: ({ signal }) => getRepo(owner, repo, signal),
  });

export const issuesQuery = (owner: string, repo: string) =>
  queryOptions({
    queryKey: ['issues', owner, repo] as const,
    queryFn: ({ signal }) => getRecentIssues(owner, repo, signal),
  });
