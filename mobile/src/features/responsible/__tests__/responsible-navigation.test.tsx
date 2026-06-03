import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

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

describe('responsible navigation flow', () => {
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

  it('renders responsible profile actions without exposing internal session identifiers', async () => {
    render(
      <NavigationContainer>
        <ResponsibleTabsScreen
          navigation={navigation}
          route={{ key: 'ResponsibleTabs', name: 'ResponsibleTabs' }}
        />
      </NavigationContainer>,
    );

    fireEvent.press(await screen.findByRole('button', { name: 'Abrir Perfil' }));

    expect(await screen.findByText('Dani')).toBeOnTheScreen();
    expect(screen.getByText('dani@example.com')).toBeOnTheScreen();
    expect(screen.getByText('Família Silva')).toBeOnTheScreen();
    expect(screen.queryByText('jwt-token')).toBeNull();
    expect(screen.queryByText('family-1')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Trocar modo' }));
    fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(navigate).toHaveBeenCalledWith('FamilyHub');
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
