import { request } from './client';
import { mapIssues, mapRepo, mapRepoDetail, mapUser, mapUserSummary, totalPages } from './mappers';
import type {
  Issue,
  RawIssue,
  RawRepo,
  RawRepoDetail,
  RawSearchResponse,
  RawSearchUser,
  RawUser,
  RepoDetail,
  SearchResult,
  SearchType,
  User,
} from './types';

export const PER_PAGE: Record<SearchType, number> = {
  repositories: 20,
  // Small page because each user card costs one /users/{login} call (60/h unauthenticated).
  users: 10,
};

const RECENT_ISSUES_LIMIT = 30;

const seg = encodeURIComponent;

export async function search(
  type: SearchType,
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const perPage = PER_PAGE[type];
  const qs = new URLSearchParams({ q: query, page: String(page), per_page: String(perPage) });

  if (type === 'repositories') {
    const data = await request<RawSearchResponse<RawRepo>>(`/search/repositories?${qs}`, signal);
    return {
      type,
      totalCount: data.total_count,
      totalPages: totalPages(data.total_count, perPage),
      items: data.items.map(mapRepo),
    };
  }

  const data = await request<RawSearchResponse<RawSearchUser>>(`/search/users?${qs}`, signal);
  return {
    type,
    totalCount: data.total_count,
    totalPages: totalPages(data.total_count, perPage),
    items: data.items.map(mapUserSummary),
  };
}

export async function getUser(login: string, signal?: AbortSignal): Promise<User> {
  return mapUser(await request<RawUser>(`/users/${seg(login)}`, signal));
}

export async function getRepo(owner: string, repo: string, signal?: AbortSignal): Promise<RepoDetail> {
  return mapRepoDetail(await request<RawRepoDetail>(`/repos/${seg(owner)}/${seg(repo)}`, signal));
}

export async function getRecentIssues(owner: string, repo: string, signal?: AbortSignal): Promise<Issue[]> {
  const qs = new URLSearchParams({
    state: 'all',
    sort: 'created',
    direction: 'desc',
    per_page: String(RECENT_ISSUES_LIMIT),
  });
  const raw = await request<RawIssue[]>(`/repos/${seg(owner)}/${seg(repo)}/issues?${qs}`, signal);
  return mapIssues(raw);
}
