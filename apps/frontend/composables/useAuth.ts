import type { AuthResponse, AuthUser } from '~/types/auth';

const guestPaths = new Set(['/login', '/register']);

export const useAuth = () => {
  const apiBaseUrl = useApiBaseUrl();
  const token = useCookie<string | null>('auth_token', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
  const user = useState<AuthUser | null>('auth_user', () => null);
  const isAuthenticated = computed(() => Boolean(token.value));

  const setSession = (response: AuthResponse) => {
    token.value = response.accessToken;
    user.value = response.user;
  };

  const clearSession = () => {
    token.value = null;
    user.value = null;
  };

  const loadProfile = async () => {
    if (!token.value) {
      user.value = null;
      return null;
    }

    const profile = await $fetch<AuthUser>(`${apiBaseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    user.value = profile;
    return profile;
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    const response = await $fetch<AuthResponse>(`${apiBaseUrl}/auth/register`, {
      method: 'POST',
      body: payload,
    });
    setSession(response);
    return response;
  };

  const login = async (payload: { email: string; password: string }) => {
    const response = await $fetch<AuthResponse>(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      body: payload,
    });
    setSession(response);
    return response;
  };

  const logout = async () => {
    clearSession();
    await navigateTo('/login');
  };

  return {
    token,
    user,
    isAuthenticated,
    guestPaths,
    loadProfile,
    register,
    login,
    logout,
    clearSession,
  };
};
