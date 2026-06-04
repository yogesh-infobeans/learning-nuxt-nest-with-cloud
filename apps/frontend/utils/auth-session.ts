import type { AuthResponse, AuthUser } from '~/types/auth';

export const guestPaths = new Set(['/login', '/register']);

export function createAuthSession(response: AuthResponse) {
  return {
    token: response.accessToken,
    user: response.user,
  };
}

export function clearAuthSession() {
  return {
    token: null as string | null,
    user: null as AuthUser | null,
  };
}

export function buildAuthHeaders(token: string | null): Record<string, string> {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getAuthRedirect(path: string, isAuthenticated: boolean): string | null {
  if (guestPaths.has(path) && isAuthenticated) {
    return '/';
  }

  if (!guestPaths.has(path) && !isAuthenticated) {
    return '/login';
  }

  return null;
}
