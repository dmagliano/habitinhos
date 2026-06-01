import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { LoginScreen } from '../LoginScreen';
import { useAuth } from '../AuthContext';

jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

const login = jest.fn();
const retryRestore = jest.fn();

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'unauthenticated',
      session: null,
      errorMessage: null,
      login,
      logout: jest.fn(),
      retryRestore,
    });
  });

  it('renders PT-BR welcome and form labels', () => {
    render(<LoginScreen />);

    expect(screen.getByText('Habitinhos')).toBeOnTheScreen();
    expect(screen.getByText('Transforme tarefas em pequenas conquistas')).toBeOnTheScreen();
    expect(screen.getByLabelText('E-mail')).toBeOnTheScreen();
    expect(screen.getByLabelText('Senha')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Entrar na conta' })).toBeOnTheScreen();
  });

  it('submits credentials through auth login', async () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'dani@example.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'secret');
    fireEvent.press(screen.getByRole('button', { name: 'Entrar na conta' }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('dani@example.com', 'secret'));
  });

  it('disables submit copy during loading and shows friendly errors', () => {
    jest.mocked(useAuth).mockReturnValue({
      status: 'loading',
      session: null,
      errorMessage: 'Nao conseguimos conectar ao servidor. Verifique a conexao e tente novamente.',
      login,
      logout: jest.fn(),
      retryRestore,
    });

    render(<LoginScreen />);

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
    expect(screen.getByText('Nao conseguimos conectar ao servidor. Verifique a conexao e tente novamente.')).toBeOnTheScreen();
  });
});
