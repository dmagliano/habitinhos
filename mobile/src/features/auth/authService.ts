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
