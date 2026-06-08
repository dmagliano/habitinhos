import { resolveApiBaseUrl } from '../env';

describe('API_BASE_URL', () => {
  it('uses EXPO_PUBLIC_API_URL when present', () => {
    expect(resolveApiBaseUrl(' https://habitinhos-api.onrender.com ', undefined)).toBe(
      'https://habitinhos-api.onrender.com',
    );
  });

  it('keeps EXPO_PUBLIC_API_BASE_URL as a compatibility fallback', () => {
    expect(resolveApiBaseUrl(undefined, 'https://legacy-api.example.com')).toBe(
      'https://legacy-api.example.com',
    );
  });

  it('falls back to the Android emulator backend URL', () => {
    expect(resolveApiBaseUrl(undefined, undefined)).toBe('http://10.0.2.2:8080');
  });
});
