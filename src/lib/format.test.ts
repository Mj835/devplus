import { describe, expect, it } from 'vitest';
import { formatCount, formatNumber, formatRelativeTime, getLanguageColor } from './format';

describe('format utilities', () => {
  it('formats counts compactly', () => {
    expect(formatCount(1200)).toBe('1.2K');
    expect(formatCount(3500000)).toBe('3.5M');
  });

  it('formats numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('returns proper language colors and defaults', () => {
    expect(getLanguageColor('TypeScript')).toBe('#3178c6');
    expect(getLanguageColor('Python')).toBe('#3572A5');
    expect(getLanguageColor('UnknownLanguageXYZ')).toBe('#6366f1');
    expect(getLanguageColor(null)).toBe('#6366f1');
  });

  it('formats relative times correctly', () => {
    const now = new Date();
    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 2 * 86400 * 1000).toISOString();

    expect(formatRelativeTime(tenMinsAgo)).toBe('10m ago');
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
  });
});
