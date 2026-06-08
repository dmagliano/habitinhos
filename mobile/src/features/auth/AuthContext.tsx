import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiError, RegisterRequest } from '../../api/types';
import { tokenStorage } from '../../storage/tokenStorage';

import { authService } from './authService';
import { AuthSession, AuthStatus } from './authTypes';

type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  errorMessage: string | null;
  login: (email: string, password: string, rememberSession: boolean) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  retryRestore: () => Promise<void>;
};

const SESSION_EXPIRED_MESSAGE = 'Sua sessao terminou. Entre novamente para continuar.';
const NETWORK_ERROR_MESSAGE =
  'Nao conseguimos conectar ao servidor. Verifique a conexao e tente novamente.';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const restoreSession = useCallback(async (markRestoring = true) => {
    if (markRestoring) {
      setStatus('restoring');
      setErrorMessage(null);
    }

    const token = await tokenStorage.getToken();

    if (!token) {
      setSession(null);
      setStatus('unauthenticated');
      return;
    }

    try {
      const restoredSession = await authService.me(token);
      setSession(restoredSession);
      setStatus('authenticated');
    } catch (error) {
      if (isSessionExpired(error)) {
        await tokenStorage.clearToken();
        setSession(null);
        setErrorMessage(SESSION_EXPIRED_MESSAGE);
        setStatus('unauthenticated');
        return;
      }

      setSession(null);
      setErrorMessage(getUserMessage(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const restoreTimeout = setTimeout(() => {
      void restoreSession(false);
    }, 0);

    return () => clearTimeout(restoreTimeout);
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string, rememberSession: boolean) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const loggedSession = await authService.login(email, password);
      if (rememberSession) {
        await tokenStorage.setToken(loggedSession.token);
      }
      setSession(loggedSession);
      setStatus('authenticated');
    } catch (error) {
      setSession(null);
      setErrorMessage(getUserMessage(error));
      setStatus('unauthenticated');
    }
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const registeredSession = await authService.register(body);
      await tokenStorage.setToken(registeredSession.token);
      setSession(registeredSession);
      setStatus('authenticated');
    } catch (error) {
      setSession(null);
      setErrorMessage(getUserMessage(error));
      setStatus('unauthenticated');
    }
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.clearToken();
    setSession(null);
    setErrorMessage(null);
    setStatus('unauthenticated');
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    if (!session?.token) {
      setErrorMessage(SESSION_EXPIRED_MESSAGE);
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      await authService.deleteAccount(session.token, password);
      await tokenStorage.clearToken();
      setSession(null);
      setStatus('unauthenticated');
    } catch (error) {
      setErrorMessage(getUserMessage(error));
      setStatus('authenticated');
      throw error;
    }
  }, [session?.token]);

  const value = useMemo(
    () => ({
      status,
      session,
      errorMessage,
      login,
      register,
      deleteAccount,
      logout,
      retryRestore: () => restoreSession(),
    }),
    [deleteAccount, errorMessage, login, logout, register, restoreSession, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.isSessionExpired;
}

function getUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage;
  }

  return NETWORK_ERROR_MESSAGE;
}
