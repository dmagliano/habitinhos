import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AssignedMissionResponse, ChildResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { ResponsibleApprovalsScreen } from '../ResponsibleApprovalsScreen';
import { responsibleService } from '../responsibleService';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../responsibleService', () => ({
  responsibleService: {
    approveAssignedMission: jest.fn(),
    listChildren: jest.fn(),
    listPendingApprovals: jest.fn(),
    rejectAssignedMission: jest.fn(),
  },
}));

const session = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' as const },
  family: { id: 'family-1', name: 'Família Silva' },
};

const navigation = {
  goBack: jest.fn(),
} as never;

const child: ChildResponse = {
  id: 'child-1',
  name: 'Lia',
  age: 8,
  avatarKey: 'fox',
  active: true,
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
};

describe('ResponsibleApprovalsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session,
      errorMessage: null,
      login: jest.fn(),
      register: jest.fn(),
      deleteAccount: jest.fn(),
      logout: jest.fn(),
      retryRestore: jest.fn(),
    });
  });

  it('loads pending approvals with child names from backend data', async () => {
    jest.mocked(responsibleService.listPendingApprovals).mockResolvedValue([approval()]);
    jest.mocked(responsibleService.listChildren).mockResolvedValue([child]);

    render(<ResponsibleApprovalsScreen navigation={navigation} route={{ key: 'ResponsibleApprovals', name: 'ResponsibleApprovals' }} />);

    expect(await screen.findByText('Guardar brinquedos')).toBeOnTheScreen();
    expect(screen.getByText(/Lia · concluída em/)).toBeOnTheScreen();
    expect(screen.getByText('4 moedas')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Aprovar missão Guardar brinquedos de Lia' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Rejeitar missão Guardar brinquedos de Lia' })).toBeOnTheScreen();
    expect(responsibleService.listPendingApprovals).toHaveBeenCalledWith('jwt-token');
    expect(responsibleService.listChildren).toHaveBeenCalledWith('jwt-token', true);
  });

  it('approves once, disables duplicate submit, removes the item after refetch, and does not credit locally', async () => {
    const deferred = createDeferred<AssignedMissionResponse>();
    jest.mocked(responsibleService.listPendingApprovals)
      .mockResolvedValueOnce([approval()])
      .mockResolvedValueOnce([]);
    jest.mocked(responsibleService.listChildren).mockResolvedValue([child]);
    jest.mocked(responsibleService.approveAssignedMission).mockReturnValue(deferred.promise);

    render(<ResponsibleApprovalsScreen navigation={navigation} route={{ key: 'ResponsibleApprovals', name: 'ResponsibleApprovals' }} />);

    const approveButton = await screen.findByRole('button', { name: 'Aprovar missão Guardar brinquedos de Lia' });
    fireEvent.press(approveButton);
    fireEvent.press(approveButton);

    expect(responsibleService.approveAssignedMission).toHaveBeenCalledTimes(1);
    expect(approveButton).toBeDisabled();

    await act(async () => {
      deferred.resolve({ ...approval(), status: 'COMPLETED', approvedAt: '2026-06-02T11:00:00Z' });
    });

    expect(await screen.findByText('Missão aprovada. +4 moedas para Lia.')).toBeOnTheScreen();
    expect(await screen.findByText('Tudo revisado por enquanto')).toBeOnTheScreen();
    expect(responsibleService.listPendingApprovals).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Saldo atualizado')).toBeNull();
  });

  it('returns rejected mission to pending by default and sends the reason', async () => {
    jest.mocked(responsibleService.listPendingApprovals)
      .mockResolvedValueOnce([approval()])
      .mockResolvedValueOnce([]);
    jest.mocked(responsibleService.listChildren).mockResolvedValue([child]);
    jest.mocked(responsibleService.rejectAssignedMission).mockResolvedValue({
      ...approval(),
      status: 'REJECTED',
      rejectedAt: '2026-06-02T11:00:00Z',
      rejectionReason: 'Faltou guardar tudo',
    });

    render(<ResponsibleApprovalsScreen navigation={navigation} route={{ key: 'ResponsibleApprovals', name: 'ResponsibleApprovals' }} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Rejeitar missão Guardar brinquedos de Lia' }));
    expect(screen.getByText('Rejeitar essa conclusão?')).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Devolver para refazer' })).toBeOnTheScreen();
    expect(screen.getByText('A missão volta para a lista da criança com essa mensagem.')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Motivo da rejeição'), 'Faltou guardar tudo');
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar rejeição de Guardar brinquedos' }));

    await waitFor(() =>
      expect(responsibleService.rejectAssignedMission).toHaveBeenCalledWith('jwt-token', 'approval-1', {
        reason: 'Faltou guardar tudo',
        returnToPending: true,
      }),
    );
    expect(await screen.findByText('Missão devolvida para a criança refazer.')).toBeOnTheScreen();
    expect(await screen.findByText('Tudo revisado por enquanto')).toBeOnTheScreen();
  });

  it('can reject without returning the mission to the child', async () => {
    jest.mocked(responsibleService.listPendingApprovals)
      .mockResolvedValueOnce([approval()])
      .mockResolvedValueOnce([]);
    jest.mocked(responsibleService.listChildren).mockResolvedValue([child]);
    jest.mocked(responsibleService.rejectAssignedMission).mockResolvedValue({
      ...approval(),
      status: 'REJECTED',
      rejectedAt: '2026-06-02T11:00:00Z',
      rejectionReason: null,
    });

    render(<ResponsibleApprovalsScreen navigation={navigation} route={{ key: 'ResponsibleApprovals', name: 'ResponsibleApprovals' }} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Rejeitar missão Guardar brinquedos de Lia' }));
    fireEvent.press(screen.getByRole('switch', { name: 'Devolver para refazer' }));
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar rejeição de Guardar brinquedos' }));

    await waitFor(() =>
      expect(responsibleService.rejectAssignedMission).toHaveBeenCalledWith('jwt-token', 'approval-1', {
        returnToPending: false,
      }),
    );
    expect(await screen.findByText('Missão rejeitada.')).toBeOnTheScreen();
  });

  it('renders the empty state without fake approvals', async () => {
    jest.mocked(responsibleService.listPendingApprovals).mockResolvedValue([]);
    jest.mocked(responsibleService.listChildren).mockResolvedValue([child]);

    render(<ResponsibleApprovalsScreen navigation={navigation} route={{ key: 'ResponsibleApprovals', name: 'ResponsibleApprovals' }} />);

    expect(await screen.findByText('Tudo revisado por enquanto')).toBeOnTheScreen();
    expect(screen.getByText('As missões enviadas pelas crianças aparecem aqui.')).toBeOnTheScreen();
    expect(screen.queryByText('Guardar brinquedos')).toBeNull();
  });
});

function approval(): AssignedMissionResponse {
  return {
    id: 'approval-1',
    missionId: 'mission-1',
    childId: child.id,
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
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, reject, resolve };
}
