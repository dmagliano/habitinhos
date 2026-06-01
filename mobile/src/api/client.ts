import { API_BASE_URL } from '../config/env';

import { ApiError, ApiErrorBody } from './types';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

const NETWORK_ERROR_MESSAGE =
  'Nao conseguimos conectar ao servidor. Verifique a conexao e tente novamente.';
const SESSION_EXPIRED_MESSAGE = 'Sua sessao terminou. Entre novamente para continuar.';
const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha incorretos. Revise os dados e tente novamente.';
const GENERIC_ERROR_MESSAGE = 'Nao conseguimos concluir esta acao. Tente novamente.';

export function buildApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${normalizedPath}`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  assertNoClientFamilyAuthorization(path, options.body);

  try {
    const response = await fetch(buildApiUrl(path), {
      method: options.method ?? 'GET',
      headers: buildHeaders(options),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const payload = await parseJson(response);

    if (!response.ok) {
      throw createApiError(response.status, payload as ApiErrorBody | undefined);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      message: error instanceof Error ? error.message : 'Network request failed',
      userMessage: NETWORK_ERROR_MESSAGE,
      isNetworkError: true,
    });
  }
}

function buildHeaders(options: ApiRequestOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return headers;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function createApiError(status: number, body?: ApiErrorBody): ApiError {
  return new ApiError({
    status,
    code: body?.code,
    details: body?.details,
    message: body?.message ?? `HTTP ${status}`,
    userMessage: mapUserMessage(status, body),
  });
}

function mapUserMessage(status: number, body?: ApiErrorBody): string {
  if (status === 401 || status === 403) {
    return body?.code === 'INVALID_CREDENTIALS'
      ? INVALID_CREDENTIALS_MESSAGE
      : SESSION_EXPIRED_MESSAGE;
  }

  return body?.message || GENERIC_ERROR_MESSAGE;
}

function assertNoClientFamilyAuthorization(path: string, body: unknown): void {
  if (path.includes('familyUnitId') || containsFamilyUnitId(body)) {
    throw new ApiError({
      message: 'Client-side familyUnitId authorization is not allowed',
      userMessage: GENERIC_ERROR_MESSAGE,
      code: 'CLIENT_FAMILY_CONTEXT_REJECTED',
    });
  }
}

function containsFamilyUnitId(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'familyUnitId')) {
    return true;
  }

  return Object.values(value as Record<string, unknown>).some(containsFamilyUnitId);
}
