import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';

import { ChildResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { ResponsibleChildrenScreen } from '../ResponsibleChildrenScreen';
import { ResponsibleChildFormScreen } from '../ResponsibleChildFormScreen';
import { responsibleService } from '../responsibleService';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../responsibleService', () => ({
  responsibleService: {
    createChild: jest.fn(),
    deactivateChild: jest.fn(),
    getChild: jest.fn(),
    listChildren: jest.fn(),
    updateChild: jest.fn(),
  },
}));

const navigate = jest.fn();

const navigation = {
  goBack: jest.fn(),
  navigate,
} as never;

const session = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' as const },
  family: { id: 'family-1', name: 'Família Silva' },
};

const activeChild: ChildResponse = {
  id: 'child-active',
  name: 'Lia',
  age: 8,
  avatarKey: 'fox',
  active: true,
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
};

const inactiveChild: ChildResponse = {
  id: 'child-inactive',
  name: 'Noah',
  age: 7,
  avatarKey: 'cat',
  active: false,
  createdAt: '2026-06-01T09:00:00Z',
  updatedAt: '2026-06-01T09:00:00Z',
};

describe('ResponsibleChildrenScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      session,
      errorMessage: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      retryRestore: jest.fn(),
    });
  });

  it('loads active and inactive children for management and keeps active children first', async () => {
    jest.mocked(responsibleService.listChildren).mockResolvedValue([inactiveChild, activeChild]);

    const view = render(
      <ResponsibleChildrenScreen
        navigation={navigation}
        route={{ key: 'ResponsibleChildren', name: 'ResponsibleChildren' }}
      />,
    );

    await waitFor(() => expect(responsibleService.listChildren).toHaveBeenCalledWith('jwt-token', true));

    const activeCard = await screen.findByTestId('manage-child-child-active');
    const inactiveCard = await screen.findByTestId('manage-child-child-inactive');

    expect(within(activeCard).getByText('Lia')).toBeOnTheScreen();
    expect(within(activeCard).getByText('Ativa')).toBeOnTheScreen();
    expect(within(inactiveCard).getByText('Noah')).toBeOnTheScreen();
    expect(within(inactiveCard).getByText('Inativa')).toBeOnTheScreen();
    expect(JSON.stringify(view.toJSON())).toMatch(/Lia[\s\S]*Noah/);
    expect(screen.queryByText('jwt-token')).toBeNull();
    expect(screen.queryByText('family-1')).toBeNull();
  });

  it('opens the child form from edit and create actions', async () => {
    jest.mocked(responsibleService.listChildren).mockResolvedValue([activeChild]);

    render(<ResponsibleChildrenScreen navigation={navigation} route={{ key: 'ResponsibleChildren', name: 'ResponsibleChildren' }} />);

    const childCard = await screen.findByTestId('manage-child-child-active');
    fireEvent.press(within(childCard).getByRole('button', { name: 'Editar Lia' }));
    fireEvent.press(screen.getByRole('button', { name: 'Cadastrar criança' }));

    expect(navigate).toHaveBeenCalledWith('ResponsibleChildForm', { childId: 'child-active' });
    expect(navigate).toHaveBeenCalledWith('ResponsibleChildForm');
  });

  it('renders an empty state with create CTA without fake children', async () => {
    jest.mocked(responsibleService.listChildren).mockResolvedValue([]);

    render(<ResponsibleChildrenScreen navigation={navigation} route={{ key: 'ResponsibleChildren', name: 'ResponsibleChildren' }} />);

    expect(await screen.findByText('Nenhuma criança cadastrada')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Cadastrar criança' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Nova criança' })).toBeNull();
    expect(screen.queryByText('Lia')).toBeNull();
  });

  it('creates a child with local form data and returns to the management list', async () => {
    jest.mocked(responsibleService.createChild).mockResolvedValue({
      ...activeChild,
      id: 'child-new',
      name: 'Bia',
      age: 6,
      avatarKey: 'cat',
    });

    render(
      <ResponsibleChildFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleChildForm', name: 'ResponsibleChildForm', params: undefined }}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Nome'), 'Bia');
    fireEvent.changeText(screen.getByLabelText('Idade'), '6');
    fireEvent.press(screen.getByRole('button', { name: 'Escolher avatar Gato' }));
    fireEvent.press(screen.getByRole('button', { name: 'Salvar criança' }));

    await waitFor(() =>
      expect(responsibleService.createChild).toHaveBeenCalledWith('jwt-token', {
        name: 'Bia',
        age: 6,
        avatarKey: 'cat',
      }),
    );
    expect(navigate).toHaveBeenCalledWith('ResponsibleChildren', { feedback: 'child-created' });
  });

  it('loads and updates an existing child while disabling duplicate saves', async () => {
    let resolveUpdate: (child: ChildResponse) => void = () => undefined;
    const updatePromise = new Promise<ChildResponse>((resolve) => {
      resolveUpdate = resolve;
    });

    jest.mocked(responsibleService.getChild).mockResolvedValue(activeChild);
    jest.mocked(responsibleService.updateChild).mockReturnValue(updatePromise);

    render(
      <ResponsibleChildFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleChildForm', name: 'ResponsibleChildForm', params: { childId: 'child-active' } }}
      />,
    );

    expect(await screen.findByDisplayValue('Lia')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Nome'), 'Lia Atualizada');
    fireEvent.changeText(screen.getByLabelText('Idade'), '9');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar criança' }));

    expect(screen.getByRole('button', { name: 'Salvando criança' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: 'Salvando criança' }));
    expect(responsibleService.updateChild).toHaveBeenCalledTimes(1);

    resolveUpdate({ ...activeChild, name: 'Lia Atualizada', age: 9 });

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('ResponsibleChildDetail', {
        childId: 'child-active',
        feedback: 'child-updated',
      }),
    );
  });

  it('validates required name and positive age before submitting', async () => {
    render(
      <ResponsibleChildFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleChildForm', name: 'ResponsibleChildForm', params: undefined }}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Nome'), ' ');
    fireEvent.changeText(screen.getByLabelText('Idade'), '0');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar criança' }));

    expect(await screen.findByText('Informe o nome da criança.')).toBeOnTheScreen();
    expect(screen.getByText('Informe uma idade maior que zero.')).toBeOnTheScreen();
    expect(responsibleService.createChild).not.toHaveBeenCalled();
  });

  it('confirms deactivation with preserved-history copy and disables duplicate submits', async () => {
    let resolveDeactivate: (child: ChildResponse) => void = () => undefined;
    const deactivatePromise = new Promise<ChildResponse>((resolve) => {
      resolveDeactivate = resolve;
    });

    jest.mocked(responsibleService.getChild).mockResolvedValue(activeChild);
    jest.mocked(responsibleService.deactivateChild).mockReturnValue(deactivatePromise);

    render(
      <ResponsibleChildFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleChildForm', name: 'ResponsibleChildForm', params: { childId: 'child-active' } }}
      />,
    );

    await screen.findByDisplayValue('Lia');
    fireEvent.press(screen.getByRole('button', { name: 'Desativar criança' }));

    expect(screen.getByText('Desativar criança?')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'O histórico, as moedas e as missões anteriores continuam guardados. A criança não aparece para novas atribuições.',
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Confirmar desativação de Lia' }));
    expect(screen.getByRole('button', { name: 'Desativando criança' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: 'Desativando criança' }));
    expect(responsibleService.deactivateChild).toHaveBeenCalledTimes(1);

    resolveDeactivate({ ...activeChild, active: false });

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('ResponsibleChildren', { feedback: 'child-deactivated' }),
    );
  });

  it('refetches deactivated children in the management list as inactive', async () => {
    jest.mocked(responsibleService.listChildren).mockResolvedValue([{ ...activeChild, active: false }]);

    render(<ResponsibleChildrenScreen navigation={navigation} route={{ key: 'ResponsibleChildren', name: 'ResponsibleChildren' }} />);

    const childCard = await screen.findByTestId('manage-child-child-active');
    expect(within(childCard).getByText('Inativa')).toBeOnTheScreen();
    expect(responsibleService.listChildren).toHaveBeenCalledWith('jwt-token', true);
  });
});
