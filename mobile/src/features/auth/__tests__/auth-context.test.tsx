import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ApiError } from '../../../api/types';
import { tokenStorage } from '../../../storage/tokenStorage';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../authService';
import { AuthSession } from '../authTypes';

jest.mock('../../../storage/tokenStorage', () => ({
  tokenStorage: {
    getToken: jest.fn(),
    setToken: jest.fn(),
    clearToken: jest.fn(),
  },
}));

jest.mock('../authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
  },
}));

const session: AuthSession = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' },
  family: { id: 'family-1', name: 'Familia Silva' },
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restores to unauthenticated when no token exists', async () => {
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce(null);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeOnTheScreen());
  });

  it('restores a valid token through /me', async () => {
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce('jwt-token');
    jest.mocked(authService.me).mockResolvedValueOnce(session);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('authenticated')).toBeOnTheScreen());
    expect(screen.getByText('Familia Silva')).toBeOnTheScreen();
  });

  it('clears token when /me rejects with an expired session', async () => {
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce('jwt-token');
    jest.mocked(authService.me).mockRejectedValueOnce(
      new ApiError({
        status: 401,
        message: 'Unauthorized',
        userMessage: 'Sua sessao terminou. Entre novamente para continuar.',
      }),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText('Sua sessao terminou. Entre novamente para continuar.')).toBeOnTheScreen(),
    );
    expect(tokenStorage.clearToken).toHaveBeenCalled();
  });

  it('persists token after login when remember session is checked', async () => {
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce(null);
    jest.mocked(authService.login).mockResolvedValueOnce(session);

    let latestAuth: ReturnType<typeof useAuth> | undefined;

    render(
      <AuthProvider>
        <AuthProbe onReady={(auth) => (latestAuth = auth)} />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeOnTheScreen());

    await act(async () => {
      await latestAuth?.login('dani@example.com', 'secret', true);
    });

    await waitFor(() => expect(tokenStorage.setToken).toHaveBeenCalledWith('jwt-token'));
    expect(screen.getByText('authenticated')).toBeOnTheScreen();
  });

  it('authenticates without persisting token when remember session is unchecked', async () => {
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce(null);
    jest.mocked(authService.login).mockResolvedValueOnce(session);

    let latestAuth: ReturnType<typeof useAuth> | undefined;

    render(
      <AuthProvider>
        <AuthProbe onReady={(auth) => (latestAuth = auth)} />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeOnTheScreen());

    await act(async () => {
      await latestAuth?.login('dani@example.com', 'secret', false);
    });

    await waitFor(() => expect(screen.getByText('authenticated')).toBeOnTheScreen());
    expect(tokenStorage.setToken).not.toHaveBeenCalled();
  });

  it('clears stored token on logout even when the current session was not remembered', async () => {
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce(null);
    jest.mocked(authService.login).mockResolvedValueOnce(session);

    let latestAuth: ReturnType<typeof useAuth> | undefined;

    render(
      <AuthProvider>
        <AuthProbe onReady={(auth) => (latestAuth = auth)} />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeOnTheScreen());

    await act(async () => {
      await latestAuth?.login('dani@example.com', 'secret', false);
    });

    await act(async () => {
      await latestAuth?.logout();
    });

    await waitFor(() => expect(tokenStorage.clearToken).toHaveBeenCalled());
  });

  it('registers a new account, persists the token, and enters the authenticated session', async () => {
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce(null);
    jest.mocked(authService.register).mockResolvedValueOnce(session);

    let latestAuth: ReturnType<typeof useAuth> | undefined;

    render(
      <AuthProvider>
        <AuthProbe onReady={(auth) => (latestAuth = auth)} />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeOnTheScreen());

    await act(async () => {
      await latestAuth?.register({
        name: 'Dani',
        email: 'dani@example.com',
        password: 'secret',
        familyName: 'Familia Silva',
      });
    });

    await waitFor(() => expect(screen.getByText('authenticated')).toBeOnTheScreen());
    expect(authService.register).toHaveBeenCalledWith({
      name: 'Dani',
      email: 'dani@example.com',
      password: 'secret',
      familyName: 'Familia Silva',
    });
    expect(tokenStorage.setToken).toHaveBeenCalledWith('jwt-token');
  });
});

function AuthProbe({ onReady }: { onReady?: (auth: ReturnType<typeof useAuth>) => void }) {
  const auth = useAuth();

  onReady?.(auth);

  return (
    <>
      <Text>{auth.status}</Text>
      <Text>{auth.session?.family.name}</Text>
      <Text>{auth.errorMessage}</Text>
    </>
  );
}
