import { describe, expect, it } from 'vitest';
import {
  buildAuthHeaders,
  clearAuthSession,
  createAuthSession,
  getAuthRedirect,
} from './auth-session';

describe('auth-session helpers', () => {
  it('creates session from auth response', () => {
    const session = createAuthSession({
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        email: 'reader@example.com',
        name: 'Reader',
      },
    });

    expect(session.token).toBe('token-123');
    expect(session.user.email).toBe('reader@example.com');
  });

  it('clears session values', () => {
    expect(clearAuthSession()).toEqual({
      token: null,
      user: null,
    });
  });

  it('builds authorization headers when token exists', () => {
    expect(buildAuthHeaders('token-123')).toEqual({
      Authorization: 'Bearer token-123',
    });
    expect(buildAuthHeaders(null)).toEqual({});
  });

  it('redirects authenticated users away from guest pages', () => {
    expect(getAuthRedirect('/login', true)).toBe('/');
    expect(getAuthRedirect('/register', true)).toBe('/');
  });

  it('redirects guests to login for protected pages', () => {
    expect(getAuthRedirect('/', false)).toBe('/login');
    expect(getAuthRedirect('/books', false)).toBe('/login');
  });

  it('allows access when route and auth state match', () => {
    expect(getAuthRedirect('/login', false)).toBeNull();
    expect(getAuthRedirect('/', true)).toBeNull();
  });

});
