import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';

import { ResponsibleDashboardResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { responsibleService } from '../responsibleService';
import { ResponsibleChildDetailScreen } from '../ResponsibleChildDetailScreen';
import { ResponsibleHomeScreen } from '../ResponsibleHomeScreen';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../responsibleService', () => ({
  responsibleService: {
    getDashboard: jest.fn(),
  },
}));

const navigate = jest.fn();

const navigation = {
  navigate,
} as never;

const session = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' as const },
  family: { id: 'family-1', name: 'Família Silva' },
};

const dashboardFixture: ResponsibleDashboardResponse = {
  children: [
    {
      id: 'child-1',
      name: 'Lia',
      age: 8,
      avatarKey: 'fox',
      balance: 24,
      missionCounts: {
        PENDING: 3,
        AWAITING_APPROVAL: 1,
        COMPLETED: 5,
        REJECTED: 1,
        CANCELLED: 0,
      },
    },
  ],
  pendingApprovalCount: 1,
  approvalPreview: [
    {
      id: 'approval-1',
      childId: 'child-1',
      childName: 'Lia',
      missionTitle: 'Arrumar a cama',
      coinValue: 5,
      completedAt: '2026-06-02T10:00:00Z',
    },
  ],
  recentRedemptions: [
    {
      id: 'redemption-1',
      rewardId: 'reward-1',
      childId: 'child-1',
      childName: 'Lia',
      rewardTitle: 'Cinema em família',
      rewardCost: 20,
      redeemedAt: '2026-06-02T11:00:00Z',
    },
  ],
};

describe('responsible dashboard screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session,
      errorMessage: null,
      login: jest.fn(),
      logout: jest.fn(),
      retryRestore: jest.fn(),
    });
  });

  it('renders dashboard metrics, child cards, actions, approvals, and redemptions from API data', async () => {
    jest.mocked(responsibleService.getDashboard).mockResolvedValue(dashboardFixture);

    render(<ResponsibleHomeScreen navigation={navigation} />);

    expect(screen.getByText('Olá, responsável')).toBeOnTheScreen();
    expect(await screen.findByText('Crianças')).toBeOnTheScreen();
    expect(screen.getAllByText('Aprovações').length).toBeGreaterThan(0);
    expect(screen.getByText('Missões abertas')).toBeOnTheScreen();
    expect(screen.getAllByText('Resgates recentes').length).toBeGreaterThan(0);
    expect(screen.getByText('4')).toBeOnTheScreen();

    const childCard = screen.getByTestId('child-summary-child-1');
    expect(within(childCard).getByText('Lia')).toBeOnTheScreen();
    expect(within(childCard).getByText('3 pendentes · 1 aguardando')).toBeOnTheScreen();
    expect(within(childCard).getByText('24 moedas')).toBeOnTheScreen();
    expect(within(childCard).getByRole('button', { name: 'Ver detalhes de Lia' })).toBeOnTheScreen();

    expect(screen.getByRole('button', { name: 'Nova Missão' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cadastrar Recompensa' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cadastrar Criança' })).toBeOnTheScreen();
    expect(screen.getByText('1 missão aguardando aprovação')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir aprovações' })).toBeOnTheScreen();
    expect(screen.getByText('Cinema em família')).toBeOnTheScreen();
    expect(screen.getByText('Lia · 20 moedas')).toBeOnTheScreen();

    fireEvent.press(within(childCard).getByRole('button', { name: 'Ver detalhes de Lia' }));
    expect(navigate).toHaveBeenCalledWith('ResponsibleChildDetail', { childId: 'child-1' });
    fireEvent.press(screen.getByRole('button', { name: 'Cadastrar Recompensa' }));
    expect(navigate).toHaveBeenCalledWith('ResponsibleRewardForm');
    expect(responsibleService.getDashboard).toHaveBeenCalledWith('jwt-token');
    expect(screen.queryByText('family-1')).toBeNull();
    expect(screen.queryByText('jwt-token')).toBeNull();
  });

  it('renders empty and error states without fake dashboard data', async () => {
    jest.mocked(responsibleService.getDashboard).mockResolvedValueOnce({
      children: [],
      pendingApprovalCount: 0,
      approvalPreview: [],
      recentRedemptions: [],
    });

    const emptyRender = render(<ResponsibleHomeScreen navigation={navigation} />);

    expect(await screen.findByText('Nenhuma criança cadastrada')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Nova criança' }).length).toBeGreaterThan(0);
    expect(screen.queryByText('24 moedas')).toBeNull();

    emptyRender.unmount();
    jest.mocked(responsibleService.getDashboard).mockRejectedValueOnce(new Error('offline'));

    render(<ResponsibleHomeScreen navigation={navigation} />);

    expect(await screen.findByText('Não conseguimos carregar o painel.')).toBeOnTheScreen();
    jest.mocked(responsibleService.getDashboard).mockResolvedValueOnce(dashboardFixture);
    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(responsibleService.getDashboard).toHaveBeenCalledTimes(3));
    await screen.findByText('Cinema em família');
    expect(screen.getAllByText('Lia').length).toBeGreaterThan(0);
  });

  it('renders child detail summary for the selected backend child id', async () => {
    jest.mocked(responsibleService.getDashboard).mockResolvedValue(dashboardFixture);

    render(
      <ResponsibleChildDetailScreen
        navigation={navigation}
        route={{
          key: 'ResponsibleChildDetail',
          name: 'ResponsibleChildDetail',
          params: { childId: 'child-1' },
        }}
      />,
    );

    await screen.findByText('Cinema em família');
    expect(screen.getAllByText('Lia').length).toBeGreaterThan(0);
    expect(screen.getAllByText('24 moedas').length).toBeGreaterThan(0);
    expect(screen.getByText('3 pendentes')).toBeOnTheScreen();
    expect(screen.getByText('1 aguardando aprovação')).toBeOnTheScreen();
    expect(screen.getByText('5 concluídas')).toBeOnTheScreen();
    expect(screen.getByText('Cinema em família')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Editar criança' }));
    expect(navigate).toHaveBeenCalledWith('ResponsibleChildForm', { childId: 'child-1' });
  });
});
