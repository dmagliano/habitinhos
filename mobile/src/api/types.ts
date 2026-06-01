export type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
};

export type UserRole = 'RESPONSIBLE';

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type FamilySummary = {
  id: string;
  name: string;
};

export type AuthResponse = {
  token: string;
  user: UserSummary;
  family: FamilySummary;
};

export type MeResponse = UserSummary & {
  familyId: string;
  familyName: string;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  userMessage: string;
  isNetworkError: boolean;
  isSessionExpired: boolean;

  constructor(params: {
    message: string;
    userMessage: string;
    status?: number;
    code?: string;
    details?: Record<string, unknown>;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
    this.userMessage = params.userMessage;
    this.isNetworkError = params.isNetworkError ?? false;
    this.isSessionExpired = params.status === 401 || params.status === 403;
  }
}
