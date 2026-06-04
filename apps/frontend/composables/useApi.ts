import type { FetchOptions } from 'ofetch';
import { buildAuthHeaders } from '~/utils/auth-session';

export const useApi = () => {
  const apiBaseUrl = useApiBaseUrl();
  const { token } = useAuth();

  const apiFetch = <T>(path: string, options: FetchOptions<'json'> = {}) => {
    const headers = new Headers(options.headers as HeadersInit | undefined);
    const authHeaders = buildAuthHeaders(token.value);
    for (const [key, value] of Object.entries(authHeaders)) {
      headers.set(key, value);
    }

    return $fetch<T>(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
    });
  };

  return {
    apiBaseUrl,
    apiFetch,
  };
};
