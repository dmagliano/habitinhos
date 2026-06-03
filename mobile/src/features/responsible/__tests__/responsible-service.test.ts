import { responsibleService } from '../responsibleService';

const fetchMock = jest.fn();

globalThis.fetch = fetchMock;

describe('responsibleService', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('gets the responsible dashboard with the bearer token', async () => {
    const dashboard = {
      children: [],
      pendingApprovalCount: 0,
      approvalPreview: [],
      recentRedemptions: [],
    };

    fetchMock.mockResolvedValueOnce(createResponse(200, dashboard));

    await expect(responsibleService.getDashboard('jwt-token')).resolves.toEqual(dashboard);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/dashboard/responsible',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
        body: undefined,
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain('familyUnitId');
  });

  it('lists children and appends includeInactive only when requested', async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse(200, []))
      .mockResolvedValueOnce(createResponse(200, []));

    await responsibleService.listChildren('jwt-token');
    await responsibleService.listChildren('jwt-token', true);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://10.0.2.2:8080/children',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://10.0.2.2:8080/children?includeInactive=true',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('familyUnitId');
  });

  it('lists missions and rewards with includeInactive only when requested', async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse(200, []))
      .mockResolvedValueOnce(createResponse(200, []))
      .mockResolvedValueOnce(createResponse(200, []))
      .mockResolvedValueOnce(createResponse(200, []));

    await responsibleService.listMissions('jwt-token');
    await responsibleService.listMissions('jwt-token', true);
    await responsibleService.listRewards('jwt-token');
    await responsibleService.listRewards('jwt-token', true);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://10.0.2.2:8080/missions',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://10.0.2.2:8080/missions?includeInactive=true',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://10.0.2.2:8080/rewards',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'http://10.0.2.2:8080/rewards?includeInactive=true',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }) }),
    );
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('familyUnitId');
  });
});

function createResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}
