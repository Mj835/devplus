import { afterEach, describe, expect, it, vi } from 'vitest';
import { GitHubError, request, toGitHubError } from './client';

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers });

describe('toGitHubError', () => {
  it('detects primary rate limiting and reads the reset time', async () => {
    const err = await toGitHubError(
      json({ message: 'API rate limit exceeded' }, 403, {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': '1700000000',
      }),
    );
    expect(err.kind).toBe('rate-limit');
    expect(err.resetAt?.getTime()).toBe(1_700_000_000_000);
    expect(err.retryable).toBe(false);
  });

  it('detects secondary rate limiting via retry-after', async () => {
    const err = await toGitHubError(
      json({ message: 'You have exceeded a secondary rate limit' }, 403, { 'retry-after': '60' }),
    );
    expect(err.kind).toBe('rate-limit');
    expect(err.resetAt).toBeInstanceOf(Date);
  });

  it('does not treat a plain 403 as a rate limit', async () => {
    const err = await toGitHubError(json({ message: 'Forbidden' }, 403, { 'x-ratelimit-remaining': '10' }));
    expect(err.kind).toBe('unknown');
  });

  it('maps 422 to invalid with the API message', async () => {
    const err = await toGitHubError(json({ message: 'Validation Failed' }, 422));
    expect(err.kind).toBe('invalid');
    expect(err.message).toBe('Validation Failed');
  });

  it('maps 404 and 5xx, tolerating non-JSON bodies', async () => {
    expect((await toGitHubError(json({}, 404))).kind).toBe('not-found');
    const server = await toGitHubError(new Response('<html>bad gateway</html>', { status: 502 }));
    expect(server.kind).toBe('server');
    expect(server.retryable).toBe(true);
  });
});

describe('request', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('turns fetch failures into network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(request('/x')).rejects.toMatchObject({ kind: 'network' });
  });

  it('rethrows aborts untouched so cancelled queries are not reported as errors', async () => {
    const controller = new AbortController();
    controller.abort();
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));
    await expect(request('/x', controller.signal)).rejects.toBe(abortError);
  });

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ok: 1 }, 200)));
    await expect(request('/x')).resolves.toEqual({ ok: 1 });
  });

  it('throws GitHubError on HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ message: 'Not Found' }, 404)));
    await expect(request('/x')).rejects.toBeInstanceOf(GitHubError);
  });
});
