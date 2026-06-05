import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '../../../navigation/RootNavigator';
import { AuthWelcomeScreen } from '../AuthWelcomeScreen';
import { getLoginKeyboardBehavior, LoginScreen } from '../LoginScreen';
import { RegisterScreen } from '../RegisterScreen';
import { useAuth } from '../AuthContext';

jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

const login = jest.fn();
const register = jest.fn();
const retryRestore = jest.fn();
const navigate = jest.fn();

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'unauthenticated',
      session: null,
      errorMessage: null,
      login,
      register,
      logout: jest.fn(),
      retryRestore,
    });
  });

  it('renders PT-BR form labels after login is selected', () => {
    render(<LoginScreen />);

    expect(screen.getByLabelText('E-mail')).toBeOnTheScreen();
    expect(screen.getByLabelText('Senha')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Entrar na conta' })).toBeOnTheScreen();
  });

  it('submits credentials through auth login without remembering by default', async () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'dani@example.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'secret');
    fireEvent.press(screen.getByRole('button', { name: 'Entrar na conta' }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('dani@example.com', 'secret', false));
  });

  it('toggles the remember-session checkbox and submits the checked state', async () => {
    render(<LoginScreen />);

    let rememberCheckbox = screen.getByRole('checkbox', { name: 'Mantenha-me conectado' });
    expect(rememberCheckbox.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));

    fireEvent.press(rememberCheckbox);
    rememberCheckbox = screen.getByRole('checkbox', { name: 'Mantenha-me conectado' });
    expect(rememberCheckbox.props.accessibilityState).toEqual(expect.objectContaining({ checked: true }));

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'dani@example.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'secret');
    fireEvent.press(screen.getByRole('button', { name: 'Entrar na conta' }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('dani@example.com', 'secret', true));
  });

  it('disables submit copy during loading and shows friendly errors', () => {
    jest.mocked(useAuth).mockReturnValue({
      status: 'loading',
      session: null,
      errorMessage: 'Nao conseguimos conectar ao servidor. Verifique a conexao e tente novamente.',
      login,
      register,
      logout: jest.fn(),
      retryRestore,
    });

    render(<LoginScreen />);

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
    expect(screen.getByText('Nao conseguimos conectar ao servidor. Verifique a conexao e tente novamente.')).toBeOnTheScreen();
  });

  it('uses height keyboard avoidance on Android so fields can slide above the keyboard', () => {
    expect(getLoginKeyboardBehavior('android')).toBe('height');
    expect(getLoginKeyboardBehavior('ios')).toBe('padding');
  });
});

describe('AuthWelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offers visible login and registration entry actions', () => {
    render(<AuthWelcomeScreen navigation={{ navigate } as never} route={{ key: 'AuthWelcome', name: 'AuthWelcome' }} />);

    expect(screen.getByLabelText('Ilustração de missões, moedas e recompensas')).toBeOnTheScreen();
    expect(screen.getByText('⭐')).toBeOnTheScreen();
    expect(screen.getByText('🎁')).toBeOnTheScreen();
    expect(screen.getByText('Habitinhos')).toBeOnTheScreen();
    expect(screen.getByText('Transforme tarefas em pequenas conquistas')).toBeOnTheScreen();
    expect(screen.getByText('Organize missões, moedas e recompensas da família.')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    fireEvent.press(screen.getByRole('button', { name: 'Registro' }));

    expect(navigate).toHaveBeenCalledWith('AuthLogin');
    expect(navigate).toHaveBeenCalledWith('AuthRegister');
  });
});

describe('RootNavigator auth entry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the welcome entry before any login-only form for unauthenticated users', () => {
    jest.mocked(useAuth).mockReturnValue({
      status: 'unauthenticated',
      session: null,
      errorMessage: null,
      login,
      register,
      logout: jest.fn(),
      retryRestore,
    });

    render(<RootNavigator />);

    expect(screen.getByText('Habitinhos')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Login' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Registro' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('E-mail')).not.toBeOnTheScreen();
    expect(screen.queryByLabelText('Senha')).not.toBeOnTheScreen();
  });

  it('keeps the loading screen while auth state is restoring', () => {
    jest.mocked(useAuth).mockReturnValue({
      status: 'restoring',
      session: null,
      errorMessage: null,
      login,
      register,
      logout: jest.fn(),
      retryRestore,
    });

    render(<RootNavigator />);

    expect(screen.getByText('Preparando sua família...')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Login' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Registro' })).not.toBeOnTheScreen();
  });
});

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'unauthenticated',
      session: null,
      errorMessage: null,
      login,
      register,
      logout: jest.fn(),
      retryRestore,
    });
  });

  it('renders the required registration fields and submits the account request', async () => {
    render(<RegisterScreen navigation={{ navigate } as never} route={{ key: 'AuthRegister', name: 'AuthRegister' }} />);

    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Nome'), 'Dani');
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'dani@example.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'secret');
    fireEvent.changeText(screen.getByLabelText('Nome da família'), 'Familia Silva');
    fireEvent.changeText(screen.getByLabelText('PIN do responsável'), '1234');
    fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        name: 'Dani',
        email: 'dani@example.com',
        password: 'secret',
        familyName: 'Familia Silva',
        responsiblePin: '1234',
      }),
    );
  });

  it('renders friendly backend errors and lets the user return to login', () => {
    jest.mocked(useAuth).mockReturnValue({
      status: 'unauthenticated',
      session: null,
      errorMessage: 'Esse e-mail já está em uso. Entre ou use outro e-mail.',
      login,
      register,
      logout: jest.fn(),
      retryRestore,
    });

    render(<RegisterScreen navigation={{ navigate } as never} route={{ key: 'AuthRegister', name: 'AuthRegister' }} />);

    expect(screen.getByText('Esse e-mail já está em uso. Entre ou use outro e-mail.')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Já tenho conta' }));

    expect(navigate).toHaveBeenCalledWith('AuthLogin');
  });

  it('does not render expired-session recovery copy on account creation', () => {
    jest.mocked(useAuth).mockReturnValue({
      status: 'unauthenticated',
      session: null,
      errorMessage: 'Sua sessao terminou. Entre novamente para continuar.',
      login,
      register,
      logout: jest.fn(),
      retryRestore,
    });

    render(<RegisterScreen navigation={{ navigate } as never} route={{ key: 'AuthRegister', name: 'AuthRegister' }} />);

    expect(screen.queryByText('Sua sessao terminou. Entre novamente para continuar.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeOnTheScreen();
  });
});
