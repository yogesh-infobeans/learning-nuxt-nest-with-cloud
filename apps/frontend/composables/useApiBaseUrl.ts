export const useApiBaseUrl = () => {
  const config = useRuntimeConfig();

  return resolveApiBaseUrl(
    import.meta.server,
    config.apiBaseUrl as string,
    config.public.apiBaseUrl as string,
  );
};
