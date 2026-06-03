import { fireEvent, render, screen } from '@testing-library/react-native';

import { ApiError, ChildResponse, RewardResponse, WalletResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { childService } from '../childService';
import { ChildRewardsScreen } from '../ChildRewardsScreen';
import { ProgressBar } from '../components/ProgressBar';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../childService', () => ({
  childService: {
    getWallet: jest.fn(),
    listRewards: jest.fn(),
    redeemReward: jest.fn(),
  },
}));

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

describe('ChildRewardsScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session,
      errorMessage: null,
      login: jest.fn(),
      logout: jest.fn(),
      retryRestore: jest.fn(),
    });
  });

  it('loads wallet and rewards, enabling affordable rewards and explaining missing coins', async () => {
    mockInitialLoad(wallet(50), [
      reward({ id: 'reward-1', title: 'Cinema em família', cost: 30 }),
      reward({ id: 'reward-2', title: 'Bicicleta nova', cost: 80 }),
    ]);

    render(<ChildRewardsScreen child={child} />);

    expect(await screen.findByText('50')).toBeOnTheScreen();
    expect(screen.getByText('moedas disponíveis')).toBeOnTheScreen();
    expect(screen.getByText('O que você quer resgatar?')).toBeOnTheScreen();
    expect(screen.getByText('Cinema em família')).toBeOnTheScreen();
    expect(screen.getByText('Bicicleta nova')).toBeOnTheScreen();
    expect(screen.getByText('30 moedas')).toBeOnTheScreen();
    expect(screen.queryByText('Custa 30 moedas')).toBeNull();

    expect(screen.getByRole('button', { name: 'Resgatar recompensa Cinema em família' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Resgatar recompensa Bicicleta nova' })).toBeDisabled();
    expect(screen.getByText('Faltam 30 moedas')).toBeOnTheScreen();
    expect(screen.getByLabelText('50 de 80 moedas')).toBeOnTheScreen();
    expect(childService.getWallet).toHaveBeenCalledWith('jwt-token', 'child-1');
    expect(childService.listRewards).toHaveBeenCalledWith('jwt-token');
  });

  it('confirms an affordable redemption, calls backend once, then refetches wallet and rewards', async () => {
    const cinema = reward({ id: 'reward-1', title: 'Cinema em família', cost: 30 });

    mockInitialLoad(wallet(50), [cinema]);
    jest.mocked(childService.redeemReward).mockResolvedValue({
      id: 'redemption-1',
      rewardId: cinema.id,
      childId: child.id,
      walletId: 'wallet-1',
      status: 'REDEEMED',
      snapshotTitle: cinema.title,
      snapshotCost: cinema.cost,
      coinTransactionId: 'transaction-1',
      createdAt: '2026-06-02T10:00:00Z',
      updatedAt: '2026-06-02T10:00:00Z',
    });
    jest.mocked(childService.getWallet).mockResolvedValueOnce(wallet(20));
    jest.mocked(childService.listRewards).mockResolvedValueOnce([cinema]);

    render(<ChildRewardsScreen child={child} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Resgatar recompensa Cinema em família' }));

    expect(screen.getByRole('button', { name: 'Confirmar resgate' })).toBeOnTheScreen();
    expect(screen.getByText('Saldo atual: 50 moedas')).toBeOnTheScreen();
    expect(screen.getByText('Custo: 30 moedas')).toBeOnTheScreen();
    expect(screen.getByText('Depois do resgate: 20 moedas')).toBeOnTheScreen();
    expect(childService.redeemReward).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole('button', { name: 'Confirmar resgate' }));
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar resgate' }));

    expect(childService.redeemReward).toHaveBeenCalledTimes(1);
    expect(childService.redeemReward).toHaveBeenCalledWith('jwt-token', 'reward-1', 'child-1');
    expect(await screen.findByText('Recompensa resgatada! Mostre para um responsável.')).toBeOnTheScreen();
    expect(screen.getByText('20')).toBeOnTheScreen();
    expect(childService.getWallet).toHaveBeenCalledTimes(2);
    expect(childService.listRewards).toHaveBeenCalledTimes(2);
  });

  it('handles backend insufficient balance without exposing raw error details', async () => {
    const cinema = reward({ id: 'reward-1', title: 'Cinema em família', cost: 30 });

    mockInitialLoad(wallet(50), [cinema]);
    jest.mocked(childService.redeemReward).mockRejectedValueOnce(
      new ApiError({
        status: 400,
        code: 'INSUFFICIENT_BALANCE',
        message: 'INSUFFICIENT_BALANCE',
        userMessage: 'Saldo insuficiente para resgatar esta recompensa.',
      }),
    );
    jest.mocked(childService.getWallet).mockResolvedValueOnce(wallet(10));

    render(<ChildRewardsScreen child={child} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Resgatar recompensa Cinema em família' }));
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar resgate' }));

    expect(await screen.findByText('Faltam moedas para essa recompensa.')).toBeOnTheScreen();
    expect(screen.queryByText('INSUFFICIENT_BALANCE')).toBeNull();
    expect(screen.getByText('10')).toBeOnTheScreen();
  });

  it('keeps the friendly insufficient-balance message if wallet refresh also fails', async () => {
    const cinema = reward({ id: 'reward-1', title: 'Cinema em família', cost: 30 });

    mockInitialLoad(wallet(50), [cinema]);
    jest.mocked(childService.redeemReward).mockRejectedValueOnce(
      new ApiError({
        status: 400,
        code: 'INSUFFICIENT_BALANCE',
        message: 'INSUFFICIENT_BALANCE',
        userMessage: 'Saldo insuficiente para resgatar esta recompensa.',
      }),
    );
    jest.mocked(childService.getWallet).mockRejectedValueOnce(new Error('wallet offline'));

    render(<ChildRewardsScreen child={child} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Resgatar recompensa Cinema em família' }));
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar resgate' }));

    expect(await screen.findByText('Faltam moedas para essa recompensa.')).toBeOnTheScreen();
    expect(screen.queryByText('INSUFFICIENT_BALANCE')).toBeNull();
  });

  it('shows empty state and generic redemption errors', async () => {
    const cinema = reward({ id: 'reward-1', title: 'Cinema em família', cost: 30 });

    mockInitialLoad(wallet(0), []);
    const emptyRender = render(<ChildRewardsScreen child={child} />);

    expect(await screen.findByText('Nenhuma recompensa cadastrada')).toBeOnTheScreen();
    expect(screen.getByText('Quando a família criar uma recompensa, ela aparece aqui.')).toBeOnTheScreen();

    emptyRender.unmount();
    mockInitialLoad(wallet(50), [cinema]);
    jest.mocked(childService.redeemReward).mockRejectedValueOnce(new Error('offline'));

    render(<ChildRewardsScreen child={child} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Resgatar recompensa Cinema em família' }));
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar resgate' }));

    expect(await screen.findByText('Não conseguimos resgatar agora. Tente novamente.')).toBeOnTheScreen();
  });
});

describe('ProgressBar', () => {
  it('clamps progress and exposes accessible text', () => {
    render(<ProgressBar accessibilityLabel="120 de 80 moedas" value={150} />);

    expect(screen.getByLabelText('120 de 80 moedas')).toBeOnTheScreen();
  });
});

function mockInitialLoad(walletResponse: WalletResponse, rewards: RewardResponse[]) {
  jest.mocked(childService.getWallet).mockResolvedValueOnce(walletResponse);
  jest.mocked(childService.listRewards).mockResolvedValueOnce(rewards);
}

function wallet(balance: number): WalletResponse {
  return {
    childId: child.id,
    balance,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  };
}

function reward({ id, title, cost }: { id: string; title: string; cost: number }): RewardResponse {
  return {
    id,
    title,
    cost,
    active: true,
    description: `${title} escolhida pela família`,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  };
}
