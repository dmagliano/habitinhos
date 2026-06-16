import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChildResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { authService } from '../../auth/authService';
import { getResponsibleTabBottomSafeAreaHeight, ResponsibleTabsScreen } from '../ResponsibleTabsScreen';
import { responsibleService } from '../responsibleService';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../auth/authService', () => ({
  authService: {
    requestAccountDeletion: jest.fn(),
  },
}));

jest.mock('../responsibleService', () => ({
  responsibleService: {
    getDashboard: jest.fn(),
  },
}));

const logout = jest.fn();
const deleteAccount = jest.fn();
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
      deleteAccount,
      logout,
      retryRestore: jest.fn(),
    });
    jest.mocked(authService.requestAccountDeletion).mockResolvedValue(undefined);
    jest.mocked(responsibleService.getDashboard).mockResolvedValue({
      children: [],
      pendingApprovalCount: 0,
      approvalPreview: [],
      recentRedemptions: [],
    });
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

  it('keeps the responsible tab row above the Android safe area without adding extra dead band', () => {
    expect(getResponsibleTabBottomSafeAreaHeight(0)).toBe(0);
    expect(getResponsibleTabBottomSafeAreaHeight(48)).toBe(48);
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

  it('confirms account deletion with the responsible password and email code from profile', async () => {
    render(
      <NavigationContainer>
        <ResponsibleTabsScreen
          navigation={navigation}
          route={{ key: 'ResponsibleTabs', name: 'ResponsibleTabs' }}
        />
      </NavigationContainer>,
    );

    fireEvent.press(await screen.findByRole('button', { name: 'Abrir Perfil' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Excluir conta' }));

    expect(screen.getByLabelText('Senha para excluir conta')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Senha para excluir conta'), 'secret');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar código de confirmação' }));

    expect(authService.requestAccountDeletion).toHaveBeenCalledWith('jwt-token', 'secret');

    expect(await screen.findByLabelText('Código para excluir conta')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Código para excluir conta'), 'del123');
    fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));

    expect(deleteAccount).toHaveBeenCalledWith('secret', 'DEL123');
  });
});
