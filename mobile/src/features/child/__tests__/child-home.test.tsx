import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AssignedMissionResponse, ChildResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { childService } from '../childService';
import { ChildHomeScreen } from '../ChildHomeScreen';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../childService', () => ({
  childService: {
    getWallet: jest.fn(),
    listPendingMissions: jest.fn(),
  },
}));

const openMissions = jest.fn();

const joaquim: ChildResponse = {
  id: 'child-1',
  name: 'Joaquim',
  age: 8,
  avatarKey: 'fox',
  active: true,
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
};

const session = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' as const },
  family: { id: 'family-1', name: 'Família Silva' },
};

describe('ChildHomeScreen', () => {
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

  it('renders backend wallet balance and due-date-prioritized pending missions', async () => {
    jest.mocked(childService.getWallet).mockResolvedValue({
      childId: joaquim.id,
      balance: 42,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    });
    jest.mocked(childService.listPendingMissions).mockResolvedValue([
      mission('mission-undated', 'Guardar brinquedos', null, '2026-06-01T10:00:00Z'),
      mission('mission-late', 'Regar as plantas', '2026-06-05', '2026-06-01T09:00:00Z'),
      mission('mission-first', 'Arrumar a cama', '2026-06-03', '2026-06-01T11:00:00Z'),
      mission('mission-second', 'Separar uniforme', '2026-06-04', '2026-06-01T08:00:00Z'),
    ]);

    render(<ChildHomeScreen child={joaquim} onOpenMissions={openMissions} />);

    expect(await screen.findByText('Oi, Joaquim!')).toBeOnTheScreen();
    expect(screen.getByText('Você está indo muito bem!')).toBeOnTheScreen();
    expect(await screen.findByText('Seu tesouro')).toBeOnTheScreen();
    expect(screen.getByText('42 moedas')).toBeOnTheScreen();
    expect(screen.getByText('Missões de hoje')).toBeOnTheScreen();
    expect(screen.getByText('Você tem 4 missões pendentes hoje.')).toBeOnTheScreen();

    expect(screen.getAllByTestId('home-mission-title').map((node) => node.props.children)).toEqual([
      'Arrumar a cama',
      'Separar uniforme',
      'Regar as plantas',
    ]);

    fireEvent.press(screen.getByRole('button', { name: 'Ver missões' }));
    expect(openMissions).toHaveBeenCalledTimes(1);
  });

  it('renders loading and empty states without fake missions', async () => {
    jest.mocked(childService.getWallet).mockResolvedValue({
      childId: joaquim.id,
      balance: 0,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    });
    jest.mocked(childService.listPendingMissions).mockResolvedValue([]);

    render(<ChildHomeScreen child={joaquim} onOpenMissions={openMissions} />);

    expect(screen.getByText('Carregando seu tesouro...')).toBeOnTheScreen();
    expect(await screen.findByText('Nenhuma missão hoje')).toBeOnTheScreen();
    expect(screen.getByText('Quando houver uma nova missão, ela aparece aqui.')).toBeOnTheScreen();
    expect(screen.queryByTestId('home-mission-title')).toBeNull();
  });

  it('renders a friendly error state and retries real backend loading', async () => {
    jest.mocked(childService.getWallet)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        childId: joaquim.id,
        balance: 7,
        createdAt: '2026-06-01T10:00:00Z',
        updatedAt: '2026-06-01T10:00:00Z',
      });
    jest.mocked(childService.listPendingMissions)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([]);

    render(<ChildHomeScreen child={joaquim} onOpenMissions={openMissions} />);

    expect(await screen.findByText('Não conseguimos carregar agora. Tente novamente.')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(childService.getWallet).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('7 moedas')).toBeOnTheScreen();
  });
});

function mission(
  id: string,
  title: string,
  dueDate: string | null,
  createdAt: string,
): AssignedMissionResponse {
  return {
    id,
    missionId: id.replace('mission', 'template'),
    childId: joaquim.id,
    status: 'PENDING',
    dueDate,
    completedAt: null,
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    snapshotTitle: title,
    snapshotDescription: `${title} com carinho`,
    snapshotCoinValue: 5,
    snapshotRequiresApproval: false,
    snapshotRecurrenceType: 'ONCE',
    createdAt,
    updatedAt: createdAt,
  };
}
