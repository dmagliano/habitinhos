import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';

import { ChildResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { ResponsibleChildrenScreen } from '../ResponsibleChildrenScreen';
import { responsibleService } from '../responsibleService';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../responsibleService', () => ({
  responsibleService: {
    listChildren: jest.fn(),
  },
}));

const navigate = jest.fn();

const navigation = {
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

    const activeCard = screen.getByTestId('manage-child-child-active');
    const inactiveCard = screen.getByTestId('manage-child-child-inactive');

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
    fireEvent.press(screen.getByRole('button', { name: 'Nova criança' }));

    expect(navigate).toHaveBeenCalledWith('ResponsibleChildForm', { childId: 'child-active' });
    expect(navigate).toHaveBeenCalledWith('ResponsibleChildForm');
  });

  it('renders an empty state with create CTA without fake children', async () => {
    jest.mocked(responsibleService.listChildren).mockResolvedValue([]);

    render(<ResponsibleChildrenScreen navigation={navigation} route={{ key: 'ResponsibleChildren', name: 'ResponsibleChildren' }} />);

    expect(await screen.findByText('Nenhuma criança cadastrada')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Nova criança' }).length).toBeGreaterThan(0);
    expect(screen.queryByText('Lia')).toBeNull();
  });
});
