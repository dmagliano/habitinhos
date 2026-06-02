import { fireEvent, render, screen } from '@testing-library/react-native';

import { FamilyHubScreen } from '../FamilyHubScreen';
import { ResponsibleStubScreen } from '../ResponsibleStubScreen';
import { useAuth } from '../../auth/AuthContext';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const logout = jest.fn();
const navigate = jest.fn();

const navigation = {
  navigate,
} as never;

describe('family navigation screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session: {
        token: 'jwt-token',
        user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' },
        family: { id: 'family-1', name: 'Família Silva' },
      },
      errorMessage: null,
      login: jest.fn(),
      logout,
      retryRestore: jest.fn(),
    });
  });

  it('shows family mode choices and navigates to responsible and child flows', () => {
    render(<FamilyHubScreen navigation={navigation} route={{ key: 'FamilyHub', name: 'FamilyHub' }} />);

    fireEvent.press(screen.getByRole('button', { name: 'Sou responsável' }));
    fireEvent.press(screen.getByRole('button', { name: 'Sou criança' }));
    fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(screen.getByText('Escolha como quer entrar')).toBeOnTheScreen();
    expect(navigate).toHaveBeenCalledWith('ResponsibleStub');
    expect(navigate).toHaveBeenCalledWith('ChildProfileSelect');
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('lets responsible stub switch mode and logout without fake data', () => {
    const route = { key: 'ResponsibleStub', name: 'ResponsibleStub' } as never;

    render(<ResponsibleStubScreen navigation={navigation} route={route} />);

    expect(screen.getByText('Em breve você vai acompanhar missões, crianças e recompensas por aqui.')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Trocar modo' }));
    expect(navigate).toHaveBeenCalledWith('FamilyHub');

    fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/saldo/i)).toBeNull();
  });
});
