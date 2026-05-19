import type { FetchOptions } from 'ofetch';

export const useApi = () => {
  const apiBaseUrl = useApiBaseUrl();
  const { token } = useAuth();

  const apiFetch = <T>(path: string, options: FetchOptions<'json'> = {}) => {
    const headers = new Headers(options.headers as HeadersInit | undefined);
    if (token.value) {
      headers.set('Authorization', `Bearer ${token.value}`);
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
