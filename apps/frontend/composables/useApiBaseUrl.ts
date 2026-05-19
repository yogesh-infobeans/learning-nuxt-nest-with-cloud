export const useApiBaseUrl = () => {
  const config = useRuntimeConfig();

  if (import.meta.server) {
    return config.apiBaseUrl as string;
  }

  return config.public.apiBaseUrl as string;
};
