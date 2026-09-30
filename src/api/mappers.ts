import type {
  Issue,
  RawIssue,
  RawRepo,
  RawRepoDetail,
  RawSearchUser,
  RawUser,
  Repo,
  RepoDetail,
  User,
  UserSummary,
} from './types';

/** GitHub search only ever returns the first 1000 matches, whatever total_count says. */
const SEARCH_RESULT_CAP = 1000;

export function totalPages(totalCount: number, perPage: number): number {
  return Math.ceil(Math.min(totalCount, SEARCH_RESULT_CAP) / perPage);
}

export function mapRepo(r: RawRepo): Repo {
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: { login: r.owner.login, avatarUrl: r.owner.avatar_url, url: r.owner.html_url },
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    openIssues: r.open_issues_count,
    updatedAt: r.updated_at,
    url: r.html_url,
  };
}

export function mapRepoDetail(r: RawRepoDetail): RepoDetail {
  return {
    ...mapRepo(r),
    isPrivate: r.private,
    watchers: r.subscribers_count,
    createdAt: r.created_at,
    defaultBranch: r.default_branch,
  };
}

export function mapUserSummary(u: RawSearchUser): UserSummary {
  return { id: u.id, login: u.login, avatarUrl: u.avatar_url, url: u.html_url };
}

export function mapUser(u: RawUser): User {
  return {
    ...mapUserSummary(u),
    name: u.name,
    followers: u.followers,
    following: u.following,
    publicRepos: u.public_repos,
    location: u.location,
  };
}

/** The issues endpoint also returns pull requests; the dashboard only wants real issues. */
export function mapIssues(raw: RawIssue[]): Issue[] {
  return raw
    .filter((i) => !i.pull_request)
    .map((i) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      state: i.state,
      author: i.user?.login ?? null,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      url: i.html_url,
    }));
}
