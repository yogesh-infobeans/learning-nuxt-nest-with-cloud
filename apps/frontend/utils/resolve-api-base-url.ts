export function resolveApiBaseUrl(
  isServer: boolean,
  apiBaseUrl: string,
  publicApiBaseUrl: string,
): string {
  return isServer ? apiBaseUrl : publicApiBaseUrl;
}
