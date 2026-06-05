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

  it('gets, creates, and updates children without client family authorization', async () => {
    const child = {
      id: 'child-1',
      name: 'Lia',
      age: 8,
      avatarKey: 'fox',
      active: true,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    };

    fetchMock
      .mockResolvedValueOnce(createResponse(200, child))
      .mockResolvedValueOnce(createResponse(201, child))
      .mockResolvedValueOnce(createResponse(200, { ...child, name: 'Lia Atualizada' }));

    await responsibleService.getChild('jwt-token', 'child-1');
    await responsibleService.createChild('jwt-token', { name: 'Lia', age: 8, avatarKey: 'fox' });
    await responsibleService.updateChild('jwt-token', 'child-1', {
      name: 'Lia Atualizada',
      age: 9,
      avatarKey: 'cat',
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://10.0.2.2:8080/children/child-1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://10.0.2.2:8080/children',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
        body: JSON.stringify({ name: 'Lia', age: 8, avatarKey: 'fox' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://10.0.2.2:8080/children/child-1',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
        body: JSON.stringify({ name: 'Lia Atualizada', age: 9, avatarKey: 'cat' }),
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('familyUnitId');
  });

  it('deactivates children with PATCH and never sends DELETE', async () => {
    const child = {
      id: 'child-1',
      name: 'Lia',
      age: 8,
      avatarKey: 'fox',
      active: false,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    };

    fetchMock.mockResolvedValueOnce(createResponse(200, child));

    await expect(responsibleService.deactivateChild('jwt-token', 'child-1')).resolves.toEqual(child);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/children/child-1/deactivate',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('DELETE');
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

  it('creates, gets, updates, deactivates, and assigns missions with backend DTO fields', async () => {
    const mission = {
      id: 'mission-1',
      title: 'Arrumar a cama',
      description: 'Deixar o quarto pronto',
      coinValue: 5,
      requiresApproval: true,
      recurrenceType: 'DAILY',
      completionWindowDays: 2,
      active: true,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    };
    const missionBody = {
      title: 'Arrumar a cama',
      description: 'Deixar o quarto pronto',
      coinValue: 5,
      requiresApproval: true,
      recurrenceType: 'DAILY' as const,
      completionWindowDays: 2,
    };
    const assignments = [
      {
        id: 'assigned-1',
        missionId: 'mission-1',
        childId: 'child-1',
        status: 'PENDING',
        scheduledDate: '2026-06-01',
        dueDate: null,
        completedAt: null,
        approvedAt: null,
        rejectedAt: null,
        rejectionReason: null,
        snapshotTitle: 'Arrumar a cama',
        snapshotDescription: 'Deixar o quarto pronto',
        snapshotCoinValue: 5,
        snapshotRequiresApproval: true,
        snapshotRecurrenceType: 'DAILY',
        snapshotCompletionWindowDays: 2,
        createdAt: '2026-06-01T10:00:00Z',
        updatedAt: '2026-06-01T10:00:00Z',
      },
    ];

    fetchMock
      .mockResolvedValueOnce(createResponse(201, mission))
      .mockResolvedValueOnce(createResponse(200, mission))
      .mockResolvedValueOnce(createResponse(200, { ...mission, title: 'Arrumar quarto' }))
      .mockResolvedValueOnce(createResponse(200, { ...mission, active: false }))
      .mockResolvedValueOnce(createResponse(201, assignments));

    await responsibleService.createMission('jwt-token', missionBody);
    await responsibleService.getMission('jwt-token', 'mission-1');
    await responsibleService.updateMission('jwt-token', 'mission-1', { ...missionBody, title: 'Arrumar quarto' });
    await responsibleService.deactivateMission('jwt-token', 'mission-1');
    await responsibleService.assignMission('jwt-token', 'mission-1', {
      childIds: ['child-1', 'child-2'],
      dueDate: null,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://10.0.2.2:8080/missions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
        body: JSON.stringify(missionBody),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://10.0.2.2:8080/missions/mission-1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://10.0.2.2:8080/missions/mission-1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ ...missionBody, title: 'Arrumar quarto' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'http://10.0.2.2:8080/missions/mission-1/deactivate',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      'http://10.0.2.2:8080/missions/mission-1/assign',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ childIds: ['child-1', 'child-2'], dueDate: null }),
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('familyUnitId');
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('DELETE');
  });

  it('lists, approves, and rejects pending approvals through assigned mission routes', async () => {
    const pending = [
      {
        id: 'assigned-1',
        missionId: 'mission-1',
        childId: 'child-1',
        status: 'AWAITING_APPROVAL',
        scheduledDate: '2026-06-01',
        dueDate: null,
        completedAt: '2026-06-02T10:00:00Z',
        approvedAt: null,
        rejectedAt: null,
        rejectionReason: null,
        snapshotTitle: 'Guardar brinquedos',
        snapshotDescription: 'Organizar a sala',
        snapshotCoinValue: 4,
        snapshotRequiresApproval: true,
        snapshotRecurrenceType: 'ONCE',
        snapshotCompletionWindowDays: 0,
        createdAt: '2026-06-01T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z',
      },
    ];

    fetchMock
      .mockResolvedValueOnce(createResponse(200, pending))
      .mockResolvedValueOnce(createResponse(200, { ...pending[0], status: 'COMPLETED', approvedAt: '2026-06-02T11:00:00Z' }))
      .mockResolvedValueOnce(createResponse(200, { ...pending[0], status: 'REJECTED', rejectionReason: 'Faltou guardar tudo' }));

    await responsibleService.listPendingApprovals('jwt-token');
    await responsibleService.approveAssignedMission('jwt-token', 'assigned-1');
    await responsibleService.rejectAssignedMission('jwt-token', 'assigned-1', { reason: 'Faltou guardar tudo' });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://10.0.2.2:8080/assigned-missions/pending-approval',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://10.0.2.2:8080/assigned-missions/assigned-1/approve',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://10.0.2.2:8080/assigned-missions/assigned-1/reject',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ reason: 'Faltou guardar tudo' }),
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('familyUnitId');
  });

  it('gets, creates, updates, and deactivates rewards with backend DTO fields', async () => {
    const reward = {
      id: 'reward-1',
      title: 'Cinema em família',
      description: 'Sessão de sábado',
      cost: 20,
      active: true,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    };
    const rewardBody = {
      title: 'Cinema em família',
      description: 'Sessão de sábado',
      cost: 20,
    };

    fetchMock
      .mockResolvedValueOnce(createResponse(200, reward))
      .mockResolvedValueOnce(createResponse(201, reward))
      .mockResolvedValueOnce(createResponse(200, { ...reward, title: 'Parque' }))
      .mockResolvedValueOnce(createResponse(200, { ...reward, active: false }));

    await responsibleService.getReward('jwt-token', 'reward-1');
    await responsibleService.createReward('jwt-token', rewardBody);
    await responsibleService.updateReward('jwt-token', 'reward-1', { ...rewardBody, title: 'Parque' });
    await responsibleService.deactivateReward('jwt-token', 'reward-1');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://10.0.2.2:8080/rewards/reward-1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://10.0.2.2:8080/rewards',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(rewardBody),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://10.0.2.2:8080/rewards/reward-1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ ...rewardBody, title: 'Parque' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'http://10.0.2.2:8080/rewards/reward-1/deactivate',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('familyUnitId');
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('DELETE');
  });

  it('marks reward redemption delivered without client family authorization', async () => {
    const deliveredRedemption = {
      id: 'redemption-1',
      rewardId: 'reward-1',
      childId: 'child-1',
      walletId: 'wallet-1',
      status: 'DELIVERED',
      snapshotTitle: 'Cinema em família',
      snapshotCost: 20,
      coinTransactionId: 'coin-1',
      deliveredAt: '2026-06-03T12:00:00Z',
      createdAt: '2026-06-02T10:00:00Z',
      updatedAt: '2026-06-03T12:00:00Z',
    };

    fetchMock.mockResolvedValueOnce(createResponse(200, deliveredRedemption));

    await expect(responsibleService.markRedemptionDelivered('jwt-token', 'redemption-1')).resolves.toEqual(
      deliveredRedemption,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:8080/reward-redemptions/redemption-1/delivered',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
        body: undefined,
      }),
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
