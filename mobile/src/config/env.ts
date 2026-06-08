const LOCAL_ANDROID_API_BASE_URL = 'http://10.0.2.2:8080';

// Expo public env vars are bundled in the client; use this only for non-secret URLs.
export const API_BASE_URL = resolveApiBaseUrl(
  process.env.EXPO_PUBLIC_API_URL,
  process.env.EXPO_PUBLIC_API_BASE_URL,
);

export function resolveApiBaseUrl(
  apiUrl: string | undefined,
  legacyApiBaseUrl: string | undefined,
): string {
  return normalizeUrl(apiUrl) || normalizeUrl(legacyApiBaseUrl) || LOCAL_ANDROID_API_BASE_URL;
}

function normalizeUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed || undefined;
}
