import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { MissionResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { ApprovalCard } from './components/ApprovalCard';
import { ConfirmActionSheet } from './components/ConfirmActionSheet';
import { EmptyState } from './components/EmptyState';
import { FeedbackBanner } from './components/FeedbackBanner';
import { ManageListItem } from './components/ManageListItem';
import { responsibleService } from './responsibleService';

type ResponsibleMissionsScreenProps = {
  onCreateMission: () => void;
  onEditMission: (missionId: string) => void;
  onAssignMission: (missionId: string) => void;
  onOpenApprovals: () => void;
};

type LoadState = 'loading' | 'ready' | 'error';

export function ResponsibleMissionsScreen({
  onAssignMission,
  onCreateMission,
  onEditMission,
  onOpenApprovals,
}: ResponsibleMissionsScreenProps) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [missions, setMissions] = useState<MissionResponse[]>([]);
  const [approvalCount, setApprovalCount] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [feedback, setFeedback] = useState<{ title: string; variant: 'success' | 'error' } | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState<MissionResponse | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const { activeMissions, inactiveMissions } = useMemo(() => splitMissions(missions), [missions]);

  const loadMissions = useCallback(async () => {
    if (!token) {
      setMissions([]);
      setApprovalCount(0);
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    try {
      const [missionResponse, approvals] = await Promise.all([
        responsibleService.listMissions(token, true),
        responsibleService.listPendingApprovals(token),
      ]);
      setMissions(missionResponse);
      setApprovalCount(approvals.length);
      setLoadState('ready');
    } catch {
      setMissions([]);
      setApprovalCount(0);
      setLoadState('error');
    }
  }, [token]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadMissions();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadMissions]);

  const handleDeactivate = async () => {
    if (!token || !pendingDeactivate || deactivating) {
      return;
    }

    setDeactivating(true);

    try {
      await responsibleService.deactivateMission(token, pendingDeactivate.id);
      setPendingDeactivate(null);
      setFeedback({ title: 'Missão desativada.', variant: 'success' });
      await loadMissions();
    } catch {
      setFeedback({ title: 'Não conseguimos desativar a missão. Tente novamente.', variant: 'error' });
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <AppScreen>
      <AppHeader
        action={<PrimaryButton label="Nova missão" onPress={onCreateMission} />}
        emoji="📋"
        subtitle="Crie, atribua e revise missões da família."
        title="Missões"
      />

      {feedback ? <FeedbackBanner title={feedback.title} variant={feedback.variant} /> : null}

      {loadState === 'loading' ? (
        <Card style={styles.stateCard} variant="highlight">
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando missões...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar as missões.</Text>
          <SecondaryButton label="Tentar novamente" onPress={loadMissions} />
        </Card>
      ) : null}

      {loadState === 'ready' ? (
        <View style={styles.content}>
          <ApprovalCard count={approvalCount} onOpenApprovals={onOpenApprovals} />

          {missions.length === 0 ? (
            <EmptyState
              actionLabel="Nova missão"
              body="Crie a primeira missão para depois atribuir às crianças."
              emoji="📋"
              onAction={onCreateMission}
              title="Nenhuma missão cadastrada"
            />
          ) : null}

          {activeMissions.length > 0 ? (
            <MissionSection
              missions={activeMissions}
              onAssignMission={onAssignMission}
              onDeactivateMission={setPendingDeactivate}
              onEditMission={onEditMission}
              title="Missões ativas"
            />
          ) : null}

          {inactiveMissions.length > 0 ? (
            <MissionSection
              missions={inactiveMissions}
              onAssignMission={onAssignMission}
              onDeactivateMission={setPendingDeactivate}
              onEditMission={onEditMission}
              title="Missões inativas"
            />
          ) : null}
        </View>
      ) : null}

      {pendingDeactivate ? (
        <ConfirmActionSheet
          body="A missão sai de novas atribuições, mas o histórico e as missões já atribuídas continuam guardados."
          cancelLabel="Cancelar"
          confirmAccessibilityLabel={`Confirmar desativação de ${pendingDeactivate.title}`}
          confirmLabel="Desativar"
          loading={deactivating}
          loadingLabel="Desativando missão"
          onCancel={() => setPendingDeactivate(null)}
          onConfirm={handleDeactivate}
          title={`Desativar ${pendingDeactivate.title}?`}
        />
      ) : null}
    </AppScreen>
  );
}

function MissionSection({
  missions,
  onAssignMission,
  onDeactivateMission,
  onEditMission,
  title,
}: {
  missions: MissionResponse[];
  onAssignMission: (missionId: string) => void;
  onDeactivateMission: (mission: MissionResponse) => void;
  onEditMission: (missionId: string) => void;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {missions.map((mission) => (
        <ManageListItem
          active={mission.active}
          actions={
            mission.active
              ? [
                  {
                    label: 'Atribuir crianças',
                    accessibilityLabel: `Atribuir crianças para ${mission.title}`,
                    onPress: () => onAssignMission(mission.id),
                  },
                  {
                    label: 'Desativar',
                    accessibilityLabel: `Desativar ${mission.title}`,
                    destructive: true,
                    onPress: () => onDeactivateMission(mission),
                  },
                ]
              : []
          }
          avatarKey="mission"
          id={mission.id}
          key={mission.id}
          metadata={`${mission.coinValue} moedas · ${mission.requiresApproval ? 'com aprovação' : 'crédito automático'}`}
          onEdit={mission.active ? () => onEditMission(mission.id) : undefined}
          testID={`manage-mission-${mission.id}`}
          title={mission.title}
        />
      ))}
    </View>
  );
}

function splitMissions(missions: MissionResponse[]) {
  const sorted = [...missions].sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    return left.title.localeCompare(right.title, 'pt-BR');
  });

  return {
    activeMissions: sorted.filter((mission) => mission.active),
    inactiveMissions: sorted.filter((mission) => !mission.active),
  };
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  stateCard: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stateEmoji: {
    fontSize: 28,
  },
  stateTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
