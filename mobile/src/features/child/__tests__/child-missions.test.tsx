import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { AssignedMissionResponse, ChildResponse, WalletResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { childService } from '../childService';
import { ChildMissionDetailScreen } from '../ChildMissionDetailScreen';
import { ChildMissionsScreen } from '../ChildMissionsScreen';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../childService', () => ({
  childService: {
    completeMission: jest.fn(),
    getWallet: jest.fn(),
    listPendingMissions: jest.fn(),
  },
}));

const onOpenMissionDetail = jest.fn();
const goBack = jest.fn();

const session = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' as const },
  family: { id: 'family-1', name: 'Família Silva' },
};

const child: ChildResponse = {
  id: 'child-1',
  name: 'Joaquim',
  age: 8,
  avatarKey: 'fox',
  active: true,
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
};

describe('ChildMissionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session,
      errorMessage: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      retryRestore: jest.fn(),
    });
  });

  it('loads wallet and pending missions with real child service calls', async () => {
    const mission = assignedMission({
      id: 'assigned-1',
      title: 'Arrumar a cama',
      description: 'Deixar o quarto pronto para o dia',
      coinValue: 5,
      dueDate: '2026-06-03',
    });
    mockInitialLoad(wallet(12), [mission]);

    render(<ChildMissionsScreen child={child} onOpenMissionDetail={onOpenMissionDetail} />);

    expect(await screen.findByText('Suas missões')).toBeOnTheScreen();
    expect(await screen.findByText('12 moedas')).toBeOnTheScreen();
    expect(screen.getByText('Você tem 1 missão pendente para hoje.')).toBeOnTheScreen();
    expect(screen.getByText('Arrumar a cama')).toBeOnTheScreen();
    expect(screen.getByText('Deixar o quarto pronto para o dia')).toBeOnTheScreen();
    expect(screen.getByText('Pendente')).toBeOnTheScreen();
    expect(screen.getByText('5 moedas')).toBeOnTheScreen();

    const completeButton = screen.getByRole('button', { name: 'Concluir missão Arrumar a cama' });
    expect(completeButton).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Ver detalhes Arrumar a cama' }));
    expect(onOpenMissionDetail).toHaveBeenCalledWith(mission);
    expect(childService.getWallet).toHaveBeenCalledWith('jwt-token', 'child-1');
    expect(childService.listPendingMissions).toHaveBeenCalledWith('jwt-token', 'child-1');
  });

  it('shows responsible rejection reason for missions returned to pending', async () => {
    const mission = assignedMission({
      id: 'assigned-returned',
      title: 'Guardar brinquedos',
      rejectionReason: 'Faltou guardar os carrinhos',
    });
    mockInitialLoad(wallet(12), [mission]);

    render(<ChildMissionsScreen child={child} onOpenMissionDetail={onOpenMissionDetail} />);

    expect(await screen.findByText('Guardar brinquedos')).toBeOnTheScreen();
    expect(screen.getByText('Responsável pediu ajuste: Faltou guardar os carrinhos')).toBeOnTheScreen();
  });

  it('blocks duplicate submits, disables only the pressed mission, then shows auto-credit feedback and refreshed balance', async () => {
    const mission = assignedMission({ id: 'assigned-1', title: 'Arrumar a cama', coinValue: 5 });
    const otherMission = assignedMission({
      id: 'assigned-2',
      title: 'Separar uniforme',
      coinValue: 3,
    });
    const completion = { ...mission, status: 'COMPLETED' as const, completedAt: '2026-06-02T10:00:00Z' };
    const deferred = createDeferred<AssignedMissionResponse>();

    mockInitialLoad(wallet(10), [mission, otherMission]);
    jest.mocked(childService.completeMission).mockReturnValue(deferred.promise);
    jest.mocked(childService.getWallet).mockResolvedValueOnce(wallet(15));
    jest.mocked(childService.listPendingMissions).mockResolvedValueOnce([otherMission]);

    render(<ChildMissionsScreen child={child} onOpenMissionDetail={onOpenMissionDetail} />);

    const completeButton = await screen.findByRole('button', {
      name: 'Concluir missão Arrumar a cama',
    });
    const otherButton = screen.getByRole('button', { name: 'Concluir missão Separar uniforme' });

    fireEvent.press(completeButton);
    fireEvent.press(completeButton);

    expect(childService.completeMission).toHaveBeenCalledTimes(1);
    expect(completeButton).toBeDisabled();
    expect(otherButton).not.toBeDisabled();

    await act(async () => {
      deferred.resolve(completion);
    });

    expect(await screen.findByText('Missão concluída! +5 moedas')).toBeOnTheScreen();
    expect(screen.getByText('Saldo atualizado: 15 moedas')).toBeOnTheScreen();
    expect(childService.getWallet).toHaveBeenCalledTimes(2);
    expect(childService.listPendingMissions).toHaveBeenCalledTimes(2);
  });

  it('shows approval-required feedback without implying coins were credited', async () => {
    const mission = assignedMission({
      id: 'assigned-approval',
      title: 'Lavar a louça',
      coinValue: 8,
      requiresApproval: true,
    });
    mockInitialLoad(wallet(20), [mission]);
    jest.mocked(childService.completeMission).mockResolvedValue({
      ...mission,
      status: 'AWAITING_APPROVAL',
      completedAt: '2026-06-02T10:00:00Z',
    });
    jest.mocked(childService.getWallet).mockResolvedValueOnce(wallet(20));
    jest.mocked(childService.listPendingMissions).mockResolvedValueOnce([]);

    render(<ChildMissionsScreen child={child} onOpenMissionDetail={onOpenMissionDetail} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Concluir missão Lavar a louça' }));

    expect(await screen.findByText('Missão enviada! Um responsável vai revisar.')).toBeOnTheScreen();
    expect(screen.getByText('Aguardando aprovação')).toBeOnTheScreen();
    expect(screen.queryByText(/\+8 moedas/)).toBeNull();
  });

  it('renders empty state and friendly mutation errors', async () => {
    const mission = assignedMission({ id: 'assigned-1', title: 'Guardar brinquedos' });

    mockInitialLoad(wallet(0), []);
    const emptyRender = render(
      <ChildMissionsScreen child={child} onOpenMissionDetail={onOpenMissionDetail} />,
    );

    expect(await screen.findByText('Nenhuma missão por aqui agora')).toBeOnTheScreen();
    expect(screen.getByText('Aproveite o descanso!')).toBeOnTheScreen();

    emptyRender.unmount();
    mockInitialLoad(wallet(7), [mission]);
    jest.mocked(childService.completeMission).mockRejectedValueOnce(new Error('offline'));

    render(<ChildMissionsScreen child={child} onOpenMissionDetail={onOpenMissionDetail} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Concluir missão Guardar brinquedos' }));

    expect(await screen.findByText('Não conseguimos atualizar essa missão. Tente novamente.')).toBeOnTheScreen();
  });
});

describe('ChildMissionDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session,
      errorMessage: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      retryRestore: jest.fn(),
    });
  });

  it('renders mission details and completes with the same status-specific feedback', async () => {
    const mission = assignedMission({
      id: 'assigned-detail',
      title: 'Regar as plantas',
      description: 'Molhar as plantas da varanda',
      coinValue: 6,
      dueDate: '2026-06-04',
      requiresApproval: true,
      rejectionReason: 'Molhe também os vasos pequenos',
    });
    jest.mocked(childService.completeMission).mockResolvedValue({
      ...mission,
      status: 'AWAITING_APPROVAL',
      completedAt: '2026-06-02T10:00:00Z',
    });
    jest.mocked(childService.getWallet).mockResolvedValue(wallet(30));
    jest.mocked(childService.listPendingMissions).mockResolvedValue([]);

    render(
      <ChildMissionDetailScreen
        navigation={{ goBack } as never}
        route={{ key: 'ChildMissionDetail', name: 'ChildMissionDetail', params: { child, mission } }}
      />,
    );

    expect(screen.getByText('Regar as plantas')).toBeOnTheScreen();
    expect(screen.getByText('Molhar as plantas da varanda')).toBeOnTheScreen();
    expect(screen.getByText('Recompensa')).toBeOnTheScreen();
    expect(screen.getByText('6 moedas')).toBeOnTheScreen();
    expect(screen.getByText('Para 04/06')).toBeOnTheScreen();
    expect(screen.getByText('Um responsável vai revisar antes das moedas entrarem.')).toBeOnTheScreen();
    expect(screen.getByText('Responsável pediu ajuste')).toBeOnTheScreen();
    expect(screen.getByText('Molhe também os vasos pequenos')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Marcar como concluída' }));
    fireEvent.press(screen.getByRole('button', { name: 'Marcar como concluída' }));

    expect(childService.completeMission).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Missão enviada! Um responsável vai revisar.')).toBeOnTheScreen();
    expect(screen.queryByText(/\+6 moedas/)).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('keeps completed detail feedback when post-completion refresh fails', async () => {
    const mission = assignedMission({
      id: 'assigned-detail',
      title: 'Guardar mochila',
      coinValue: 6,
    });
    jest.mocked(childService.completeMission).mockResolvedValue({
      ...mission,
      status: 'COMPLETED',
      completedAt: '2026-06-02T10:00:00Z',
    });
    jest.mocked(childService.getWallet).mockRejectedValueOnce(new Error('wallet offline'));
    jest.mocked(childService.listPendingMissions).mockRejectedValueOnce(new Error('missions offline'));

    render(
      <ChildMissionDetailScreen
        navigation={{ goBack } as never}
        route={{ key: 'ChildMissionDetail', name: 'ChildMissionDetail', params: { child, mission } }}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Marcar como concluída' }));

    expect(await screen.findByText('Missão concluída! +6 moedas')).toBeOnTheScreen();
    expect(screen.queryByText('Não conseguimos atualizar essa missão. Tente novamente.')).toBeNull();
  });

  it('renders a safe not-found state', () => {
    render(
      <ChildMissionDetailScreen
        navigation={{ goBack } as never}
        route={{ key: 'ChildMissionDetail', name: 'ChildMissionDetail', params: { child, mission: null } } as never}
      />,
    );

    expect(screen.getByText('Não encontramos essa missão.')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Voltar para missões' }));
    expect(goBack).toHaveBeenCalledTimes(1);
  });
});

function mockInitialLoad(walletResponse: WalletResponse, missions: AssignedMissionResponse[]) {
  jest.mocked(childService.getWallet).mockResolvedValueOnce(walletResponse);
  jest.mocked(childService.listPendingMissions).mockResolvedValueOnce(missions);
}

function wallet(balance: number): WalletResponse {
  return {
    childId: child.id,
    balance,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  };
}

function assignedMission({
  id,
  title,
  description = `${title} com carinho`,
  coinValue = 5,
  dueDate = null,
  requiresApproval = false,
  rejectionReason = null,
}: {
  id: string;
  title: string;
  description?: string;
  coinValue?: number;
  dueDate?: string | null;
  requiresApproval?: boolean;
  rejectionReason?: string | null;
}): AssignedMissionResponse {
  return {
    id,
    missionId: id.replace('assigned', 'mission'),
    childId: child.id,
    status: 'PENDING',
    dueDate,
    completedAt: null,
    approvedAt: null,
    rejectedAt: null,
    rejectionReason,
    snapshotTitle: title,
    snapshotDescription: description,
    snapshotCoinValue: coinValue,
    snapshotRequiresApproval: requiresApproval,
    snapshotRecurrenceType: 'ONCE',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
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
