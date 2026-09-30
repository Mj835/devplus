import { describe, expect, it } from 'vitest';
import { parseSearchParams, toSearchParams } from './searchParams';

describe('parseSearchParams', () => {
  it('falls back to defaults for missing or invalid values', () => {
    expect(parseSearchParams(new URLSearchParams(''))).toEqual({ q: '', type: 'repositories', page: 1 });
    expect(parseSearchParams(new URLSearchParams('type=bogus&page=-3'))).toMatchObject({
      type: 'repositories',
      page: 1,
    });
    expect(parseSearchParams(new URLSearchParams('page=2.5'))).toMatchObject({ page: 1 });
  });

  it('reads and trims valid values', () => {
    expect(parseSearchParams(new URLSearchParams('q=%20react%20&type=users&page=3'))).toEqual({
      q: 'react',
      type: 'users',
      page: 3,
    });
  });
});

describe('toSearchParams', () => {
  it('omits defaults so URLs stay canonical', () => {
    expect(toSearchParams({ q: 'react', type: 'repositories', page: 1 }).toString()).toBe('q=react');
    expect(toSearchParams({ q: '', type: 'repositories', page: 1 }).toString()).toBe('');
  });

  it('round-trips through parseSearchParams', () => {
    const state = { q: 'vite plugin', type: 'users', page: 4 } as const;
    expect(parseSearchParams(toSearchParams(state))).toEqual(state);
  });
});
