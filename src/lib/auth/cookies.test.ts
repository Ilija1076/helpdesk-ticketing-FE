import { afterEach, describe, expect, it, vi } from 'vitest';
import { accessTokenExpiry, isAccessTokenStale } from './cookies';

/** Builds an unsigned JWT — only the payload segment is ever read. */
function tokenExpiringAt(seconds: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: seconds })).toString('base64url');
  return `header.${payload}.signature`;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('accessTokenExpiry', () => {
  it('reads exp without verifying the signature', () => {
    expect(accessTokenExpiry(tokenExpiringAt(1_760_000_000))).toEqual(new Date(1_760_000_000_000));
  });

  it('returns null for a token with no exp', () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'abc' })).toString('base64url');
    expect(accessTokenExpiry(`header.${payload}.sig`)).toBeNull();
  });

  it.each([['not-a-jwt'], ['header.@@@not-base64@@@.sig'], ['']])(
    'returns null for malformed input %s',
    (value) => {
      expect(accessTokenExpiry(value)).toBeNull();
    },
  );
});

describe('isAccessTokenStale', () => {
  it('treats a missing token as stale', () => {
    expect(isAccessTokenStale(undefined)).toBe(true);
  });

  it('is false while the token has comfortable life left', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-08-11T12:00:00Z'));
    const inTenMinutes = Date.parse('2026-08-11T12:10:00Z') / 1000;
    expect(isAccessTokenStale(tokenExpiringAt(inTenMinutes))).toBe(false);
  });

  /**
   * The skew is what stops a token from expiring mid-flight: proxy refreshes a minute
   * early so a request that passes the check still has a valid token when it reaches the
   * backend.
   */
  it('is true inside the one-minute skew, before the token actually expires', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-08-11T12:00:00Z'));
    const inThirtySeconds = Date.parse('2026-08-11T12:00:30Z') / 1000;
    expect(isAccessTokenStale(tokenExpiringAt(inThirtySeconds))).toBe(true);
  });

  it('is true for an already expired token', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-08-11T12:00:00Z'));
    const anHourAgo = Date.parse('2026-08-11T11:00:00Z') / 1000;
    expect(isAccessTokenStale(tokenExpiringAt(anHourAgo))).toBe(true);
  });
});
