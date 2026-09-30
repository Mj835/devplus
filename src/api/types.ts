/*
 * Raw types describe only the GitHub fields this app reads. Domain types are the camelCase shapes the
 * UI uses; mappers.ts converts between them, so components never touch API shapes.
 */

// ---------------------------------------------------------------------------- Raw (GitHub REST)

export interface RawOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface RawRepo {
  id: number;
  name: string;
  full_name: string;
  owner: RawOwner;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  html_url: string;
}

export interface RawRepoDetail extends RawRepo {
  private: boolean;
  subscribers_count: number;
  created_at: string;
  default_branch: string;
}

export interface RawSearchUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface RawUser extends RawSearchUser {
  name: string | null;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
}

export interface RawIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: { login: string } | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  /** Present when the "issue" is actually a pull request. */
  pull_request?: unknown;
}

export interface RawSearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

// ---------------------------------------------------------------------------- Domain

export interface Owner {
  login: string;
  avatarUrl: string;
  url: string;
}

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  owner: Owner;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
  url: string;
}

export interface RepoDetail extends Repo {
  isPrivate: boolean;
  watchers: number;
  createdAt: string;
  defaultBranch: string;
}

export interface UserSummary {
  id: number;
  login: string;
  avatarUrl: string;
  url: string;
}

export interface User extends UserSummary {
  name: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  location: string | null;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export type SearchType = 'repositories' | 'users';

/** Discriminated on `type`, so a repository result can never be rendered as a user card. */
export type SearchResult =
  | { type: 'repositories'; totalCount: number; totalPages: number; items: Repo[] }
  | { type: 'users'; totalCount: number; totalPages: number; items: UserSummary[] };
