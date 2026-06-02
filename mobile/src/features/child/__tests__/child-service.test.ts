import { childService } from '../childService';

const fetchMock = jest.fn();

globalThis.fetch = fetchMock;

describe('childService', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('lists children with the responsible bearer token', async () => {
    const children = [
      {
        id: 'child-1',
        name: 'Joaquim',
        age: 8,
        avatarKey: 'fox',
        active: true,
        createdAt: '2026-06-01T10:00:00Z',
        updatedAt: '2026-06-01T10:00:00Z',
      },
    ];

    fetchMock.mockResolvedValueOnce(createResponse(200, children));

    await expect(childService.listChildren('jwt-token')).resolves.toEqual(children);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/children',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
        body: undefined,
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain('familyUnitId');
  });

  it('gets the selected child wallet from the child-scoped backend route', async () => {
    const wallet = {
      childId: 'child-1',
      balance: 42,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    };

    fetchMock.mockResolvedValueOnce(createResponse(200, wallet));

    await expect(childService.getWallet('jwt-token', 'child-1')).resolves.toEqual(wallet);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/children/child-1/wallet',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
  });

  it('lists pending missions for the selected child', async () => {
    const missions = [
      {
        id: 'assigned-1',
        missionId: 'mission-1',
        childId: 'child-1',
        status: 'PENDING',
        dueDate: '2026-06-03',
        completedAt: null,
        approvedAt: null,
        rejectedAt: null,
        rejectionReason: null,
        snapshotTitle: 'Arrumar a cama',
        snapshotDescription: 'Deixar o quarto pronto para o dia',
        snapshotCoinValue: 5,
        snapshotRequiresApproval: false,
        createdAt: '2026-06-01T10:00:00Z',
        updatedAt: '2026-06-01T10:00:00Z',
      },
    ];

    fetchMock.mockResolvedValueOnce(createResponse(200, missions));

    await expect(childService.listPendingMissions('jwt-token', 'child-1')).resolves.toEqual(
      missions,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/children/child-1/missions',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
  });

  it('completes an assigned mission through the current backend route', async () => {
    const completedMission = {
      id: 'assigned-1',
      missionId: 'mission-1',
      childId: 'child-1',
      status: 'COMPLETED',
      dueDate: null,
      completedAt: '2026-06-02T10:00:00Z',
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      snapshotTitle: 'Arrumar a cama',
      snapshotDescription: 'Deixar o quarto pronto para o dia',
      snapshotCoinValue: 5,
      snapshotRequiresApproval: false,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-02T10:00:00Z',
    };

    fetchMock.mockResolvedValueOnce(createResponse(200, completedMission));

    await expect(childService.completeMission('jwt-token', 'assigned-1')).resolves.toEqual(
      completedMission,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/assigned-missions/assigned-1/complete',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
        body: undefined,
      }),
    );
  });

  it('lists active rewards from the family rewards route', async () => {
    const rewards = [
      {
        id: 'reward-1',
        title: 'Cinema em familia',
        description: 'Escolher um filme para todo mundo assistir',
        cost: 30,
        active: true,
        createdAt: '2026-06-01T10:00:00Z',
        updatedAt: '2026-06-01T10:00:00Z',
      },
    ];

    fetchMock.mockResolvedValueOnce(createResponse(200, rewards));

    await expect(childService.listRewards('jwt-token')).resolves.toEqual(rewards);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/rewards',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
  });

  it('redeems a reward with the selected child id and no familyUnitId', async () => {
    const redemption = {
      id: 'redemption-1',
      rewardId: 'reward-1',
      childId: 'child-1',
      walletId: 'wallet-1',
      status: 'REDEEMED',
      snapshotTitle: 'Cinema em familia',
      snapshotCost: 30,
      coinTransactionId: 'transaction-1',
      createdAt: '2026-06-02T10:00:00Z',
      updatedAt: '2026-06-02T10:00:00Z',
    };

    fetchMock.mockResolvedValueOnce(createResponse(200, redemption));

    await expect(childService.redeemReward('jwt-token', 'reward-1', 'child-1')).resolves.toEqual(
      redemption,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/rewards/reward-1/redeem',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ childId: 'child-1' }),
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain('familyUnitId');
  });
});

function createResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}
