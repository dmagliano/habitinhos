import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ChildResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { FamilyHubScreen } from '../../family/FamilyHubScreen';
import { childService } from '../childService';
import { ChildProfileSelectScreen } from '../ChildProfileSelectScreen';
import { ChildTabsScreen } from '../ChildTabsScreen';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../childService', () => ({
  childService: {
    getWallet: jest.fn(),
    listChildren: jest.fn(),
    listPendingMissions: jest.fn(),
  },
}));

const logout = jest.fn();
const navigate = jest.fn();

const navigation = {
  navigate,
} as never;

const session = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' as const },
  family: { id: 'family-1', name: 'Família Silva' },
};

const joaquim: ChildResponse = {
  id: 'child-1',
  name: 'Joaquim',
  age: 8,
  avatarKey: 'fox',
  active: true,
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
};

const inactiveChild: ChildResponse = {
  id: 'child-2',
  name: 'Ana',
  age: 6,
  avatarKey: 'cat',
  active: false,
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
};

describe('child navigation flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session,
      errorMessage: null,
      login: jest.fn(),
      logout,
      retryRestore: jest.fn(),
    });
    jest.mocked(childService.getWallet).mockResolvedValue({
      childId: joaquim.id,
      balance: 42,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    });
    jest.mocked(childService.listPendingMissions).mockResolvedValue([]);
  });

  it('opens backend child profile selection from FamilyHub', () => {
    render(<FamilyHubScreen navigation={navigation} route={{ key: 'FamilyHub', name: 'FamilyHub' }} />);

    fireEvent.press(screen.getByRole('button', { name: 'Sou criança' }));

    expect(navigate).toHaveBeenCalledWith('ChildProfileSelect');
    expect(screen.getByText('Escolha um perfil para brincar com as missões da família.')).toBeOnTheScreen();
  });

  it('loads active children, requires selection, and navigates with selected child state', async () => {
    jest.mocked(childService.listChildren).mockResolvedValue([joaquim, inactiveChild]);

    render(
      <ChildProfileSelectScreen
        navigation={navigation}
        route={{ key: 'ChildProfileSelect', name: 'ChildProfileSelect' }}
      />,
    );

    expect(screen.getByText('Quem vai brincar agora?')).toBeOnTheScreen();
    expect(screen.getByText('Escolha um perfil da família.')).toBeOnTheScreen();
    expect(await screen.findByText('Joaquim')).toBeOnTheScreen();
    expect(screen.queryByText('Ana')).toBeNull();
    expect(childService.listChildren).toHaveBeenCalledWith('jwt-token');

    const enterButton = screen.getByRole('button', { name: 'Entrar no perfil' });
    expect(enterButton).toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Selecionar Joaquim' }));
    expect(enterButton).not.toBeDisabled();

    fireEvent.press(enterButton);

    expect(navigate).toHaveBeenCalledWith('ChildTabs', { child: joaquim });
  });

  it('shows empty, error, and retry states without fake child data', async () => {
    jest.mocked(childService.listChildren).mockResolvedValueOnce([]);

    const emptyRender = render(
      <ChildProfileSelectScreen
        navigation={navigation}
        route={{ key: 'ChildProfileSelect', name: 'ChildProfileSelect' }}
      />,
    );

    expect(await screen.findByText('Nenhuma criança cadastrada')).toBeOnTheScreen();
    expect(screen.getByText('Peça para um responsável criar um perfil primeiro.')).toBeOnTheScreen();
    expect(screen.queryByText('Joaquim')).toBeNull();

    emptyRender.unmount();
    jest.mocked(childService.listChildren).mockRejectedValueOnce(new Error('offline'));

    render(
      <ChildProfileSelectScreen
        navigation={navigation}
        route={{ key: 'ChildProfileSelect', name: 'ChildProfileSelect' }}
      />,
    );

    await waitFor(() => expect(childService.listChildren).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Não conseguimos carregar os perfis. Tente novamente.')).toBeOnTheScreen();

    jest.mocked(childService.listChildren).mockResolvedValueOnce([joaquim]);
    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Joaquim')).toBeOnTheScreen();
  });

  it('renders child tabs and profile actions without exposing sensitive session data', async () => {
    render(
      <NavigationContainer>
        <ChildTabsScreen
          navigation={navigation}
          route={{ key: 'ChildTabs', name: 'ChildTabs', params: { child: joaquim } }}
        />
      </NavigationContainer>,
    );

    expect(await screen.findByRole('button', { name: 'Abrir Início' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Missões' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Recompensas' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Perfil' })).toBeOnTheScreen();
    expect(screen.getByText('Recompensas').props.numberOfLines).toBe(1);

    fireEvent.press(screen.getByRole('button', { name: 'Abrir Perfil' }));

    expect(await screen.findByRole('button', { name: 'Trocar criança' })).toBeOnTheScreen();
    expect(screen.getByText('Joaquim')).toBeOnTheScreen();
    expect(screen.getByText('Família Silva')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Voltar para família' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sair da conta' })).toBeOnTheScreen();
    expect(screen.queryByText('jwt-token')).toBeNull();
    expect(screen.queryByText('family-1')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Trocar criança' }));
    fireEvent.press(screen.getByRole('button', { name: 'Voltar para família' }));
    fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(navigate).toHaveBeenCalledWith('ChildProfileSelect');
    expect(navigate).toHaveBeenCalledWith('FamilyHub');
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
