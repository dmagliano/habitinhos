import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChildResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { FamilyHubScreen } from '../../family/FamilyHubScreen';
import { ResponsibleTabsScreen } from '../ResponsibleTabsScreen';
import { responsibleService } from '../responsibleService';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../responsibleService', () => ({
  responsibleService: {
    getDashboard: jest.fn(),
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

describe('responsible navigation flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session,
      errorMessage: null,
      login: jest.fn(),
      register: jest.fn(),
      logout,
      retryRestore: jest.fn(),
    });
    jest.mocked(responsibleService.getDashboard).mockResolvedValue({
      children: [],
      pendingApprovalCount: 0,
      approvalPreview: [],
      recentRedemptions: [],
    });
  });

  it('opens responsible tabs from FamilyHub instead of the old stub', () => {
    render(<FamilyHubScreen navigation={navigation} route={{ key: 'FamilyHub', name: 'FamilyHub' }} />);

    fireEvent.press(screen.getByRole('button', { name: 'Sou responsável' }));

    expect(navigate).toHaveBeenCalledWith('ResponsibleTabs');
    expect(navigate).not.toHaveBeenCalledWith('ResponsibleStub');
  });

  it('renders responsible tabs with the expected accessibility labels', async () => {
    render(
      <NavigationContainer>
        <ResponsibleTabsScreen
          navigation={navigation}
          route={{ key: 'ResponsibleTabs', name: 'ResponsibleTabs' }}
        />
      </NavigationContainer>,
    );

    expect(await screen.findByRole('button', { name: 'Abrir Início' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Missões' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Recompensas' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Perfil' })).toBeOnTheScreen();
    expect(screen.queryByText('jwt-token')).toBeNull();
    expect(screen.queryByText('family-1')).toBeNull();
  });

  it('renders responsible profile return-to-child action when active child context exists', async () => {
    render(
      <NavigationContainer>
        <ResponsibleTabsScreen
          navigation={navigation}
          route={{ key: 'ResponsibleTabs', name: 'ResponsibleTabs', params: { activeChild: joaquim } }}
        />
      </NavigationContainer>,
    );

    fireEvent.press(await screen.findByRole('button', { name: 'Abrir Perfil' }));

    expect(await screen.findByText('Dani')).toBeOnTheScreen();
    expect(screen.getByText('dani@example.com')).toBeOnTheScreen();
    expect(screen.getByText('Família Silva')).toBeOnTheScreen();
    expect(screen.getByText('Você está gerenciando a família.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Voltar para o modo criança' })).toBeOnTheScreen();
    expect(screen.queryByText('jwt-token')).toBeNull();
    expect(screen.queryByText('family-1')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Voltar para o modo criança' }));
    fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(navigate).toHaveBeenCalledWith('ChildTabs', { child: joaquim });
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('renders responsible profile child selector fallback without active child context', async () => {
    render(
      <NavigationContainer>
        <ResponsibleTabsScreen
          navigation={navigation}
          route={{ key: 'ResponsibleTabs', name: 'ResponsibleTabs' }}
        />
      </NavigationContainer>,
    );

    fireEvent.press(await screen.findByRole('button', { name: 'Abrir Perfil' }));

    expect(await screen.findByText('Você está gerenciando a família.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Escolher criança' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Escolher criança' }));

    expect(navigate).toHaveBeenCalledWith('ChildProfileSelect');
    expect(logout).not.toHaveBeenCalled();
  });
});
