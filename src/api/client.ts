const BASE_URL = 'https://api.github.com';

export type GitHubErrorKind = 'network' | 'rate-limit' | 'not-found' | 'invalid' | 'server' | 'unknown';

export class GitHubError extends Error {
  readonly kind: GitHubErrorKind;
  readonly status?: number;
  /** When the rate limit window resets (only for kind === 'rate-limit'). */
  readonly resetAt?: Date;

  constructor(kind: GitHubErrorKind, message: string, opts: { status?: number; resetAt?: Date } = {}) {
    super(message);
    this.name = 'GitHubError';
    this.kind = kind;
    this.status = opts.status;
    this.resetAt = opts.resetAt;
  }

  /** Transient failures worth retrying automatically. Rate limits and 4xx are not. */
  get retryable(): boolean {
    return this.kind === 'network' || this.kind === 'server';
  }
}

const TOKEN_KEY = 'devpulse_gh_token';
export const TOKEN_CHANGED_EVENT = 'devpulse:token-changed';

/** A token saved in the app wins over the build-time VITE_GITHUB_TOKEN. */
export function getStoredToken(): string | null {
  try {
    const saved = localStorage.getItem(TOKEN_KEY)?.trim();
    if (saved) return saved;
  } catch {
    // Storage blocked (private mode, disabled cookies): fall back to the env token.
  }
  return import.meta.env.VITE_GITHUB_TOKEN || null;
}

export function setStoredToken(token: string | null): void {
  const value = token?.trim();
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked: the token simply won't persist.
  }
  // Several components show token state (navbar badge, token dialogs); tell them all.
  window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
}

/** Single entry point for every GitHub call: headers, abort, and error normalisation. */
export async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(BASE_URL + path, { headers, signal });
  } catch (err) {
    // Aborts are expected (superseded queries) — let the caller's abort propagate untouched.
    if (signal?.aborted) throw err;
    throw new GitHubError('network', 'Network error. Check your connection and try again.');
  }

  // Trust boundary: callers declare the response shape; it is typed, not validated at runtime.
  if (res.ok) return (await res.json()) as T;
  throw await toGitHubError(res);
}

export async function toGitHubError(res: Response): Promise<GitHubError> {
  let apiMessage = '';
  try {
    apiMessage = ((await res.json()) as { message?: string }).message ?? '';
  } catch {
    // Non-JSON error body; fall back to the status-based message.
  }
  const status = res.status;

  const remaining = res.headers.get('x-ratelimit-remaining');
  const isRateLimited = (status === 403 || status === 429) && (remaining === '0' || /rate limit/i.test(apiMessage));
  if (isRateLimited) {
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const retryAfter = Number(res.headers.get('retry-after'));
    const resetAt = reset ? new Date(reset * 1000) : retryAfter ? new Date(Date.now() + retryAfter * 1000) : undefined;
    return new GitHubError('rate-limit', 'GitHub API rate limit reached.', { status, resetAt });
  }
  if (status === 404) return new GitHubError('not-found', 'Not found.', { status });
  if (status === 410) return new GitHubError('not-found', apiMessage || 'This resource is unavailable.', { status });
  if (status === 422 || status === 400) {
    return new GitHubError('invalid', apiMessage || 'The request was invalid.', { status });
  }
  if (status >= 500) return new GitHubError('server', 'GitHub is having trouble right now.', { status });
  return new GitHubError('unknown', apiMessage || `Request failed (${status}).`, { status });
}
