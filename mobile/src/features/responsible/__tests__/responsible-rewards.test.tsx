import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';

import { RewardResponse } from '../../../api/types';
import { colors } from '../../../theme';
import { useAuth } from '../../auth/AuthContext';
import { ResponsibleRewardFormScreen } from '../ResponsibleRewardFormScreen';
import { ResponsibleRewardsScreen } from '../ResponsibleRewardsScreen';
import { responsibleService } from '../responsibleService';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../responsibleService', () => ({
  responsibleService: {
    createReward: jest.fn(),
    deactivateReward: jest.fn(),
    getReward: jest.fn(),
    listRewards: jest.fn(),
    updateReward: jest.fn(),
  },
}));

const session = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' as const },
  family: { id: 'family-1', name: 'Família Silva' },
};

const goBack = jest.fn();
const navigate = jest.fn();

const navigation = {
  goBack,
  navigate,
} as never;

const activeReward = reward({
  active: true,
  cost: 20,
  id: 'reward-active',
  title: 'Cinema em família',
});

const inactiveReward = reward({
  active: false,
  cost: 8,
  id: 'reward-inactive',
  title: 'Sorvete no parque',
});

describe('ResponsibleRewardsScreen', () => {
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

  it('loads active and inactive rewards for management and keeps active rewards first', async () => {
    const onCreateReward = jest.fn();
    const onEditReward = jest.fn();
    jest.mocked(responsibleService.listRewards).mockResolvedValue([inactiveReward, activeReward]);

    const view = render(
      <ResponsibleRewardsScreen onCreateReward={onCreateReward} onEditReward={onEditReward} />,
    );

    await waitFor(() => expect(responsibleService.listRewards).toHaveBeenCalledWith('jwt-token', true));

    const activeCard = await screen.findByTestId('manage-reward-reward-active');
    const inactiveCard = await screen.findByTestId('manage-reward-reward-inactive');

    expect(within(activeCard).getByText('Cinema em família')).toBeOnTheScreen();
    expect(within(activeCard).getByText('Ativa')).toBeOnTheScreen();
    expect(within(activeCard).getByText('Cinema em família com carinho · 20 moedas')).toBeOnTheScreen();
    expect(within(activeCard).getByRole('button', { name: 'Editar Cinema em família' })).toBeOnTheScreen();
    expect(within(inactiveCard).getByText('Inativa')).toBeOnTheScreen();
    expect(within(inactiveCard).queryByRole('button', { name: /Editar/ })).toBeNull();
    expect(JSON.stringify(view.toJSON())).toMatch(/Cinema em família[\s\S]*Sorvete no parque/);

    fireEvent.press(within(activeCard).getByRole('button', { name: 'Editar Cinema em família' }));
    fireEvent.press(screen.getAllByRole('button', { name: 'Nova recompensa' })[0]);

    expect(onEditReward).toHaveBeenCalledWith('reward-active');
    expect(onCreateReward).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('jwt-token')).toBeNull();
    expect(screen.queryByText('family-1')).toBeNull();
  }, 10000);

  it('renders an empty state with create CTA without fake rewards', async () => {
    const onCreateReward = jest.fn();
    jest.mocked(responsibleService.listRewards).mockResolvedValue([]);

    render(<ResponsibleRewardsScreen onCreateReward={onCreateReward} onEditReward={jest.fn()} />);

    expect(await screen.findByText('Nenhuma recompensa cadastrada')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Nova recompensa' }).length).toBeGreaterThan(0);
    expect(screen.queryByText('Cinema em família')).toBeNull();

    fireEvent.press(screen.getAllByRole('button', { name: 'Nova recompensa' })[0]);
    expect(onCreateReward).toHaveBeenCalledTimes(1);
  });
});

describe('ResponsibleRewardFormScreen', () => {
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

  it('creates a reward with local form data and returns to responsible tabs', async () => {
    jest.mocked(responsibleService.createReward).mockResolvedValue({
      ...activeReward,
      id: 'reward-new',
      title: 'Piquenique',
      cost: 12,
    });

    render(
      <ResponsibleRewardFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleRewardForm', name: 'ResponsibleRewardForm', params: undefined }}
      />,
    );

    expect(screen.getByPlaceholderText('Cinema em família').props.placeholderTextColor).toBe(colors.textMuted);
    expect(screen.getByPlaceholderText('Explique o combinado da recompensa').props.placeholderTextColor).toBe(
      colors.textMuted,
    );

    fireEvent.changeText(screen.getByLabelText('Nome da recompensa'), 'Piquenique');
    fireEvent.changeText(screen.getByLabelText('Descrição'), 'Sábado no parque');
    fireEvent.changeText(screen.getByLabelText('Recompensa em moedas'), '12');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar recompensa' }));

    await waitFor(() =>
      expect(responsibleService.createReward).toHaveBeenCalledWith('jwt-token', {
        title: 'Piquenique',
        description: 'Sábado no parque',
        cost: 12,
      }),
    );
    expect(navigate).toHaveBeenCalledWith('ResponsibleTabs');
  });

  it('loads and updates an existing reward while disabling duplicate saves', async () => {
    let resolveUpdate: (reward: RewardResponse) => void = () => undefined;
    const updatePromise = new Promise<RewardResponse>((resolve) => {
      resolveUpdate = resolve;
    });

    jest.mocked(responsibleService.getReward).mockResolvedValue(activeReward);
    jest.mocked(responsibleService.updateReward).mockReturnValue(updatePromise);

    render(
      <ResponsibleRewardFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleRewardForm', name: 'ResponsibleRewardForm', params: { rewardId: 'reward-active' } }}
      />,
    );

    expect(await screen.findByDisplayValue('Cinema em família')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Nome da recompensa'), 'Cinema com pipoca');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar recompensa' }));

    expect(screen.getByRole('button', { name: 'Salvando recompensa' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: 'Salvando recompensa' }));
    expect(responsibleService.updateReward).toHaveBeenCalledTimes(1);

    resolveUpdate({ ...activeReward, title: 'Cinema com pipoca' });

    await waitFor(() =>
      expect(responsibleService.updateReward).toHaveBeenCalledWith('jwt-token', 'reward-active', {
        title: 'Cinema com pipoca',
        description: 'Cinema em família com carinho',
        cost: 20,
      }),
    );
    expect(navigate).toHaveBeenCalledWith('ResponsibleTabs');
  });

  it('validates required name and positive cost before submitting', async () => {
    render(
      <ResponsibleRewardFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleRewardForm', name: 'ResponsibleRewardForm', params: undefined }}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Nome da recompensa'), ' ');
    fireEvent.changeText(screen.getByLabelText('Recompensa em moedas'), '0');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar recompensa' }));

    expect(await screen.findByText('Informe o nome da recompensa.')).toBeOnTheScreen();
    expect(screen.getByText('Informe ao menos 1 moeda.')).toBeOnTheScreen();
    expect(responsibleService.createReward).not.toHaveBeenCalled();
  });

  it('confirms deactivation with preserved-history copy and disables duplicate submits', async () => {
    let resolveDeactivate: (reward: RewardResponse) => void = () => undefined;
    const deactivatePromise = new Promise<RewardResponse>((resolve) => {
      resolveDeactivate = resolve;
    });

    jest.mocked(responsibleService.getReward).mockResolvedValue(activeReward);
    jest.mocked(responsibleService.deactivateReward).mockReturnValue(deactivatePromise);

    render(
      <ResponsibleRewardFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleRewardForm', name: 'ResponsibleRewardForm', params: { rewardId: 'reward-active' } }}
      />,
    );

    await screen.findByDisplayValue('Cinema em família');
    fireEvent.press(screen.getByRole('button', { name: 'Desativar recompensa' }));

    expect(screen.getByText('Desativar recompensa?')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'A recompensa deixa de aparecer para as crianças, mas resgates anteriores continuam no histórico.',
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Confirmar desativação de Cinema em família' }));
    expect(screen.getByRole('button', { name: 'Desativando recompensa' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: 'Desativando recompensa' }));
    expect(responsibleService.deactivateReward).toHaveBeenCalledTimes(1);

    resolveDeactivate({ ...activeReward, active: false });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('ResponsibleTabs'));
  });
});

function reward({
  active,
  cost,
  id,
  title,
}: {
  active: boolean;
  cost: number;
  id: string;
  title: string;
}): RewardResponse {
  return {
    active,
    cost,
    id,
    title,
    description: `${title} com carinho`,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  };
}
