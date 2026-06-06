import { apiRequest } from '../../../api/client';
import { ApiError, AuthResponse } from '../../../api/types';
import { authService } from '../authService';

const fetchMock = jest.fn();

globalThis.fetch = fetchMock;

describe('apiRequest', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('posts login credentials and returns auth response', async () => {
    const response: AuthResponse = {
      token: 'jwt-token',
      user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' },
      family: { id: 'family-1', name: 'Familia Silva' },
    };

    fetchMock.mockResolvedValueOnce(createResponse(200, response));

    await expect(
      apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email: 'dani@example.com', password: 'secret' },
      }),
    ).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'dani@example.com', password: 'secret' }),
      }),
    );
  });

  it('registers a responsible user through the backend auth endpoint', async () => {
    const response: AuthResponse = {
      token: 'jwt-token',
      user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' },
      family: { id: 'family-1', name: 'Familia Silva' },
    };

    fetchMock.mockResolvedValueOnce(createResponse(200, response));

    await expect(
      authService.register({
        name: 'Dani',
        email: 'dani@example.com',
        password: 'secret',
        familyName: 'Familia Silva',
        responsiblePin: '1234',
      }),
    ).resolves.toEqual({
      token: 'jwt-token',
      user: response.user,
      family: response.family,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Dani',
          email: 'dani@example.com',
          password: 'secret',
          familyName: 'Familia Silva',
          responsiblePin: '1234',
        }),
      }),
    );
  });

  it('verifies the responsible PIN with the authenticated token', async () => {
    fetchMock.mockResolvedValueOnce(createResponse(204, undefined));

    await expect(authService.verifyResponsiblePin('jwt-token', '1234')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/auth/responsible-pin/verify',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
        body: JSON.stringify({ pin: '1234' }),
      }),
    );
  });

  it('maps invalid responsible PIN to a PIN-specific message', async () => {
    fetchMock.mockResolvedValueOnce(
      createResponse(403, {
        code: 'INVALID_RESPONSIBLE_PIN',
        message: 'PIN inválido. Tente novamente.',
      }),
    );

    await expect(authService.verifyResponsiblePin('jwt-token', '9999')).rejects.toMatchObject({
      code: 'INVALID_RESPONSIBLE_PIN',
      userMessage: 'PIN inválido. Tente novamente.',
    });
  });

  it('rejects client familyUnitId in register body', async () => {
    await expect(
      authService.register({
        name: 'Dani',
        email: 'dani@example.com',
        password: 'secret',
        familyName: 'Familia Silva',
        responsiblePin: '1234',
        familyUnitId: 'client-family',
      } as never),
    ).rejects.toBeInstanceOf(ApiError);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps structured backend errors to friendly PT-BR messages', async () => {
    fetchMock.mockResolvedValueOnce(
      createResponse(401, {
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciais invalidas.',
        details: { field: 'password' },
      }),
    );

    await expect(apiRequest('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      userMessage: 'E-mail ou senha incorretos. Revise os dados e tente novamente.',
    });
  });

  it('maps network failure to a recoverable PT-BR message', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Failed to fetch'));

    await expect(apiRequest('/me')).rejects.toMatchObject({
      isNetworkError: true,
      userMessage: 'Nao conseguimos conectar ao servidor. Verifique a conexao e tente novamente.',
    });
  });

  it('injects bearer token without accepting client familyUnitId authorization', async () => {
    fetchMock.mockResolvedValueOnce(createResponse(200, { ok: true }));

    await apiRequest('/me', { token: 'jwt-token' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/me',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );

    await expect(
      apiRequest('/children', {
        method: 'POST',
        body: { name: 'Joaquim', familyUnitId: 'client-family' },
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

function createResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}
