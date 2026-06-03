import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';

import { ChildResponse, MissionResponse } from '../../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { ResponsibleAssignmentFormScreen } from '../ResponsibleAssignmentFormScreen';
import { ResponsibleMissionFormScreen } from '../ResponsibleMissionFormScreen';
import { ResponsibleMissionsScreen } from '../ResponsibleMissionsScreen';
import { responsibleService } from '../responsibleService';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../responsibleService', () => ({
  responsibleService: {
    assignMission: jest.fn(),
    createMission: jest.fn(),
    deactivateMission: jest.fn(),
    getMission: jest.fn(),
    listChildren: jest.fn(),
    listMissions: jest.fn(),
    listPendingApprovals: jest.fn(),
    updateMission: jest.fn(),
  },
}));

const session = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Dani', email: 'dani@example.com', role: 'RESPONSIBLE' as const },
  family: { id: 'family-1', name: 'Família Silva' },
};

const goBack = jest.fn();
const navigate = jest.fn();

const navigation = {
  goBack,
  navigate,
} as never;

const activeMission = mission({
  id: 'mission-active',
  title: 'Guardar brinquedos',
  coinValue: 4,
  requiresApproval: true,
  active: true,
});

const inactiveMission = mission({
  id: 'mission-inactive',
  title: 'Regar plantas',
  coinValue: 2,
  requiresApproval: false,
  active: false,
});

const activeChild: ChildResponse = {
  id: 'child-1',
  name: 'Lia',
  age: 8,
  avatarKey: 'fox',
  active: true,
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
};

const inactiveChild: ChildResponse = {
  ...activeChild,
  id: 'child-inactive',
  name: 'Noah',
  active: false,
};

describe('ResponsibleMissionsScreen', () => {
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

  it('loads active and inactive missions for management and keeps active missions first', async () => {
    const callbacks = createMissionCallbacks();
    jest.mocked(responsibleService.listMissions).mockResolvedValue([inactiveMission, activeMission]);
    jest.mocked(responsibleService.listPendingApprovals).mockResolvedValue([
      assignedMission({ id: 'approval-1', missionId: 'mission-active' }),
    ]);

    const view = render(<ResponsibleMissionsScreen {...callbacks} />);

    await waitFor(() => expect(responsibleService.listMissions).toHaveBeenCalledWith('jwt-token', true));
    expect(responsibleService.listPendingApprovals).toHaveBeenCalledWith('jwt-token');

    const activeCard = await screen.findByTestId('manage-mission-mission-active');
    const inactiveCard = await screen.findByTestId('manage-mission-mission-inactive');

    expect(within(activeCard).getByText('Guardar brinquedos')).toBeOnTheScreen();
    expect(within(activeCard).getByText('Ativa')).toBeOnTheScreen();
    expect(within(activeCard).getByRole('button', { name: 'Editar Guardar brinquedos' })).toBeOnTheScreen();
    expect(within(activeCard).getByRole('button', { name: 'Atribuir crianças para Guardar brinquedos' })).toBeOnTheScreen();
    expect(within(activeCard).getByRole('button', { name: 'Desativar Guardar brinquedos' })).toBeOnTheScreen();
    expect(within(inactiveCard).getByText('Inativa')).toBeOnTheScreen();
    expect(within(inactiveCard).queryByRole('button', { name: /Atribuir crianças/ })).toBeNull();
    expect(screen.getByText('1 missão aguardando aprovação')).toBeOnTheScreen();
    expect(JSON.stringify(view.toJSON())).toMatch(/Guardar brinquedos[\s\S]*Regar plantas/);
  });

  it('confirms mission deactivation with preserved-history copy and refetches through PATCH', async () => {
    const callbacks = createMissionCallbacks();
    jest.mocked(responsibleService.listMissions)
      .mockResolvedValueOnce([activeMission])
      .mockResolvedValueOnce([{ ...activeMission, active: false }]);
    jest.mocked(responsibleService.listPendingApprovals).mockResolvedValue([]);
    jest.mocked(responsibleService.deactivateMission).mockResolvedValue({ ...activeMission, active: false });

    render(<ResponsibleMissionsScreen {...callbacks} />);

    const missionCard = await screen.findByTestId('manage-mission-mission-active');
    fireEvent.press(within(missionCard).getByRole('button', { name: 'Desativar Guardar brinquedos' }));

    expect(screen.getByText('Desativar Guardar brinquedos?')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'A missão sai de novas atribuições, mas o histórico e as missões já atribuídas continuam guardados.',
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Confirmar desativação de Guardar brinquedos' }));

    await waitFor(() => expect(responsibleService.deactivateMission).toHaveBeenCalledWith('jwt-token', 'mission-active'));
    await waitFor(() => expect(responsibleService.listMissions).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Missão desativada.')).toBeOnTheScreen();
  });
});

describe('ResponsibleMissionFormScreen', () => {
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

  it('creates a mission, starts assignment with no child preselected, then assigns selected children', async () => {
    jest.mocked(responsibleService.listChildren).mockResolvedValue([activeChild, inactiveChild]);
    jest.mocked(responsibleService.createMission).mockResolvedValue(activeMission);
    jest.mocked(responsibleService.assignMission).mockResolvedValue([
      assignedMission({ id: 'assigned-1', missionId: activeMission.id }),
    ]);

    render(
      <ResponsibleMissionFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleMissionForm', name: 'ResponsibleMissionForm', params: undefined }}
      />,
    );

    await waitFor(() => expect(responsibleService.listChildren).toHaveBeenCalledWith('jwt-token', false));
    fireEvent.changeText(screen.getByLabelText('Título'), 'Guardar brinquedos');
    fireEvent.changeText(screen.getByLabelText('Descrição opcional'), 'Organizar a sala');
    fireEvent.changeText(screen.getByLabelText('Recompensa em moedas'), '4');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar missão' }));

    await waitFor(() =>
      expect(responsibleService.createMission).toHaveBeenCalledWith('jwt-token', {
        title: 'Guardar brinquedos',
        description: 'Organizar a sala',
        coinValue: 4,
        requiresApproval: true,
        recurrenceType: 'ONCE',
      }),
    );

    expect(await screen.findByText('Quem deve fazer?')).toBeOnTheScreen();
    expect(screen.queryByText('Selecionada')).toBeNull();
    expect(screen.getByText('Lia')).toBeOnTheScreen();
    expect(screen.queryByText('Noah')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Selecionar Lia' }));
    fireEvent.changeText(screen.getByLabelText('Data limite opcional'), '2026-06-10');
    fireEvent.press(screen.getByRole('button', { name: 'Atribuir missão' }));

    await waitFor(() =>
      expect(responsibleService.assignMission).toHaveBeenCalledWith('jwt-token', 'mission-active', {
        childIds: ['child-1'],
        dueDate: '2026-06-10',
      }),
    );
    expect(navigate).toHaveBeenCalledWith('ResponsibleTabs');
  });

  it('keeps the created mission available when assignment fails', async () => {
    jest.mocked(responsibleService.listChildren).mockResolvedValue([activeChild]);
    jest.mocked(responsibleService.createMission).mockResolvedValue(activeMission);
    jest.mocked(responsibleService.assignMission).mockRejectedValue(new Error('offline'));

    render(
      <ResponsibleMissionFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleMissionForm', name: 'ResponsibleMissionForm', params: undefined }}
      />,
    );

    await screen.findByLabelText('Título');
    fireEvent.changeText(screen.getByLabelText('Título'), 'Guardar brinquedos');
    fireEvent.changeText(screen.getByLabelText('Recompensa em moedas'), '4');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar missão' }));
    await screen.findByText('Quem deve fazer?');

    fireEvent.press(screen.getByRole('button', { name: 'Selecionar Lia' }));
    fireEvent.press(screen.getByRole('button', { name: 'Atribuir missão' }));

    expect(await screen.findByText('Missão criada. A atribuição ficou pendente; tente atribuir novamente.')).toBeOnTheScreen();
    expect(responsibleService.assignMission).toHaveBeenCalledWith('jwt-token', 'mission-active', {
      childIds: ['child-1'],
      dueDate: null,
    });
  });

  it('edits the future mission template only', async () => {
    jest.mocked(responsibleService.listChildren).mockResolvedValue([activeChild]);
    jest.mocked(responsibleService.getMission).mockResolvedValue(activeMission);
    jest.mocked(responsibleService.updateMission).mockResolvedValue({ ...activeMission, title: 'Guardar quarto' });

    render(
      <ResponsibleMissionFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleMissionForm', name: 'ResponsibleMissionForm', params: { missionId: 'mission-active' } }}
      />,
    );

    expect(await screen.findByDisplayValue('Guardar brinquedos')).toBeOnTheScreen();
    expect(screen.getAllByText('Alterações valem para novas atribuições.').length).toBeGreaterThan(0);
    expect(screen.getByText('Missões já atribuídas mantêm o registro anterior.')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Título'), 'Guardar quarto');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar missão' }));

    await waitFor(() =>
      expect(responsibleService.updateMission).toHaveBeenCalledWith('jwt-token', 'mission-active', {
        title: 'Guardar quarto',
        description: 'Guardar brinquedos com carinho',
        coinValue: 4,
        requiresApproval: true,
        recurrenceType: 'ONCE',
      }),
    );
  });
});

describe('ResponsibleAssignmentFormScreen', () => {
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

  it('assigns an existing active mission to selected children later', async () => {
    jest.mocked(responsibleService.getMission).mockResolvedValue(activeMission);
    jest.mocked(responsibleService.listChildren).mockResolvedValue([activeChild]);
    jest.mocked(responsibleService.assignMission).mockResolvedValue([
      assignedMission({ id: 'assigned-later', missionId: activeMission.id }),
    ]);

    render(
      <ResponsibleAssignmentFormScreen
        navigation={navigation}
        route={{ key: 'ResponsibleAssignmentForm', name: 'ResponsibleAssignmentForm', params: { missionId: 'mission-active' } }}
      />,
    );

    expect(await screen.findByText('Guardar brinquedos')).toBeOnTheScreen();
    expect(screen.queryByText('Selecionada')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Selecionar Lia' }));
    fireEvent.press(screen.getByRole('button', { name: 'Atribuir missão' }));

    await waitFor(() =>
      expect(responsibleService.assignMission).toHaveBeenCalledWith('jwt-token', 'mission-active', {
        childIds: ['child-1'],
        dueDate: null,
      }),
    );
  });
});

function createMissionCallbacks() {
  return {
    onAssignMission: jest.fn(),
    onCreateMission: jest.fn(),
    onEditMission: jest.fn(),
    onOpenApprovals: jest.fn(),
  };
}

function mission({
  active,
  coinValue,
  id,
  requiresApproval,
  title,
}: {
  active: boolean;
  coinValue: number;
  id: string;
  requiresApproval: boolean;
  title: string;
}): MissionResponse {
  return {
    id,
    title,
    description: `${title} com carinho`,
    coinValue,
    requiresApproval,
    recurrenceType: 'ONCE',
    active,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  };
}

function assignedMission({ id, missionId }: { id: string; missionId: string }) {
  return {
    id,
    missionId,
    childId: 'child-1',
    status: 'AWAITING_APPROVAL' as const,
    dueDate: null,
    completedAt: '2026-06-02T10:00:00Z',
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    snapshotTitle: 'Guardar brinquedos',
    snapshotDescription: 'Organizar a sala',
    snapshotCoinValue: 4,
    snapshotRequiresApproval: true,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-02T10:00:00Z',
  };
}
