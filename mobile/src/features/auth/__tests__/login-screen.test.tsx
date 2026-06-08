import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '../../../navigation/RootNavigator';
import { AuthWelcomeScreen } from '../AuthWelcomeScreen';
import { authService } from '../authService';
import { getLoginKeyboardBehavior, LoginScreen } from '../LoginScreen';
import { PasswordResetScreen } from '../PasswordResetScreen';
import { RegisterScreen } from '../RegisterScreen';
import { ResponsiblePinResetScreen } from '../ResponsiblePinResetScreen';
import { useAuth } from '../AuthContext';

jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../authService', () => ({
  authService: {
    requestPasswordReset: jest.fn(),
    confirmPasswordReset: jest.fn(),
    requestResponsiblePinReset: jest.fn(),
    confirmResponsiblePinReset: jest.fn(),
  },
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
      deleteAccount: jest.fn(),
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

  it('offers password recovery from the login form', () => {
    render(<LoginScreen navigation={{ navigate } as never} route={{ key: 'AuthLogin', name: 'AuthLogin' }} />);

    fireEvent.press(screen.getByRole('button', { name: 'Esqueci minha senha' }));

    expect(navigate).toHaveBeenCalledWith('AuthPasswordReset');
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
      deleteAccount: jest.fn(),
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

describe('PasswordResetScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(authService.requestPasswordReset).mockResolvedValue(undefined);
    jest.mocked(authService.confirmPasswordReset).mockResolvedValue(undefined);
  });

  it('requests reset instructions and saves a new password with the received code', async () => {
    render(
      <PasswordResetScreen
        navigation={{ navigate } as never}
        route={{ key: 'AuthPasswordReset', name: 'AuthPasswordReset' }}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'dani@example.com');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar instruções' }));

    await waitFor(() => expect(authService.requestPasswordReset).toHaveBeenCalledWith('dani@example.com'));
    expect(await screen.findByText('Enviamos as instruções para o e-mail informado.')).toBeOnTheScreen();

    fireEvent.changeText(screen.getByLabelText('Código recebido'), 'abc123');
    fireEvent.changeText(screen.getByLabelText('Nova senha'), 'novaSenha123');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }));

    await waitFor(() =>
      expect(authService.confirmPasswordReset).toHaveBeenCalledWith('ABC123', 'novaSenha123'),
    );
    expect(await screen.findByText('Senha atualizada. Você já pode entrar com a nova senha.')).toBeOnTheScreen();
  });
});

describe('ResponsiblePinResetScreen', () => {
  const goBack = jest.fn();

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
      login,
      register,
      deleteAccount: jest.fn(),
      logout: jest.fn(),
      retryRestore,
    });
    jest.mocked(authService.requestResponsiblePinReset).mockResolvedValue(undefined);
    jest.mocked(authService.confirmResponsiblePinReset).mockResolvedValue(undefined);
  });

  it('requests the PIN code with the account password and saves a new PIN', async () => {
    render(
      <ResponsiblePinResetScreen
        navigation={{ goBack } as never}
        route={{ key: 'ResponsiblePinReset', name: 'ResponsiblePinReset' }}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Senha da conta'), 'secret');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar código' }));

    await waitFor(() => expect(authService.requestResponsiblePinReset).toHaveBeenCalledWith('jwt-token', 'secret'));
    expect(await screen.findByText('Enviamos o código para o e-mail da conta.')).toBeOnTheScreen();

    fireEvent.changeText(screen.getByLabelText('Código recebido'), 'pin456');
    fireEvent.changeText(screen.getByLabelText('Novo PIN'), '5678');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar novo PIN' }));

    await waitFor(() =>
      expect(authService.confirmResponsiblePinReset).toHaveBeenCalledWith('jwt-token', 'PIN456', '5678'),
    );
    expect(await screen.findByText('PIN atualizado.')).toBeOnTheScreen();
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
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the welcome entry before any login-only form for unauthenticated users', async () => {
    jest.useFakeTimers();
    jest.mocked(useAuth).mockReturnValue({
      status: 'unauthenticated',
      session: null,
      errorMessage: null,
      login,
      register,
      deleteAccount: jest.fn(),
      logout: jest.fn(),
      retryRestore,
    });

    render(<RootNavigator />);

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Login' })).toBeOnTheScreen());
    expect(screen.getByText('Habitinhos')).toBeOnTheScreen();
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
      deleteAccount: jest.fn(),
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
      deleteAccount: jest.fn(),
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
      deleteAccount: jest.fn(),
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
      deleteAccount: jest.fn(),
      logout: jest.fn(),
      retryRestore,
    });

    render(<RegisterScreen navigation={{ navigate } as never} route={{ key: 'AuthRegister', name: 'AuthRegister' }} />);

    expect(screen.queryByText('Sua sessao terminou. Entre novamente para continuar.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeOnTheScreen();
  });
});
