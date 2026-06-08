import { apiRequest } from '../../api/client';
import { AuthResponse, MeResponse, RegisterRequest } from '../../api/types';

import { AuthSession } from './authTypes';

export type LoginCredentials = {
  email: string;
  password: string;
};

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    return {
      token: response.token,
      user: response.user,
      family: response.family,
    };
  },

  async register(body: RegisterRequest): Promise<AuthSession> {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body,
    });

    return {
      token: response.token,
      user: response.user,
      family: response.family,
    };
  },

  async verifyResponsiblePin(token: string, pin: string): Promise<void> {
    await apiRequest<void>('/auth/responsible-pin/verify', {
      method: 'POST',
      token,
      body: { pin },
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiRequest<void>('/auth/password-reset/request', {
      method: 'POST',
      body: { email },
    });
  },

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    await apiRequest<void>('/auth/password-reset/confirm', {
      method: 'POST',
      body: { token, newPassword },
    });
  },

  async requestResponsiblePinReset(token: string, password: string): Promise<void> {
    await apiRequest<void>('/auth/responsible-pin/reset/request', {
      method: 'POST',
      token,
      body: { password },
    });
  },

  async confirmResponsiblePinReset(token: string, resetToken: string, newPin: string): Promise<void> {
    await apiRequest<void>('/auth/responsible-pin/reset/confirm', {
      method: 'POST',
      token,
      body: { token: resetToken, newPin },
    });
  },

  async deleteAccount(token: string, password: string): Promise<void> {
    await apiRequest<void>('/me', {
      method: 'DELETE',
      token,
      body: { password },
    });
  },

  async me(token: string): Promise<AuthSession> {
    const response = await apiRequest<MeResponse>('/me', {
      token,
    });

    return {
      token,
      user: {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      },
      family: {
        id: response.familyId,
        name: response.familyName,
      },
    };
  },
};
