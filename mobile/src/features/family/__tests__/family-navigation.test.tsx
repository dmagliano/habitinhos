import { fireEvent, render, screen } from '@testing-library/react-native';

import { FamilyHubScreen } from '../FamilyHubScreen';
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
      register: jest.fn(),
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
    expect(navigate).toHaveBeenCalledWith('ResponsibleTabs');
    expect(navigate).toHaveBeenCalledWith('ChildProfileSelect');
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
