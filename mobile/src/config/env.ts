const LOCAL_ANDROID_API_BASE_URL = 'http://10.0.2.2:8080';

// Expo public env vars are bundled in the client; use this only for non-secret URLs.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || LOCAL_ANDROID_API_BASE_URL;
