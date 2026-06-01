import { FamilySummary, UserSummary } from '../../api/types';

export type AuthUser = UserSummary;

export type AuthFamily = FamilySummary;

export type AuthSession = {
  token: string;
  user: AuthUser;
  family: AuthFamily;
};

export type AuthStatus = 'restoring' | 'unauthenticated' | 'authenticated' | 'loading' | 'error';
