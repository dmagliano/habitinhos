import * as SecureStore from 'expo-secure-store';

import { tokenStorage } from '../../../storage/tokenStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists, reads, and clears the auth token', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('jwt-token');

    await tokenStorage.setToken('jwt-token');
    await expect(tokenStorage.getToken()).resolves.toBe('jwt-token');
    await tokenStorage.clearToken();

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('habitinhos.authToken', 'jwt-token');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('habitinhos.authToken');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('habitinhos.authToken');
  });
});
