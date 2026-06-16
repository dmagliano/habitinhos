import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ApiError, AssignedMissionResponse, ChildResponse, WalletResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, CoinBadge, SecondaryButton } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { childService } from './childService';
import { EmptyState } from './components/EmptyState';
import { FeedbackBanner } from './components/FeedbackBanner';
import { MissionCard } from './components/MissionCard';

type ChildMissionsScreenProps = {
  child: ChildResponse;
  completedMissionIds?: string[];
  onMissionCompleted?: (missionId: string) => void;
  onOpenMissionDetail: (mission: AssignedMissionResponse) => void;
};

type LoadState = 'loading' | 'ready' | 'error';
type MissionFeedback =
  | { type: 'completed'; coins: number; balance: number }
  | { type: 'awaiting-approval' }
  | { type: 'error'; message: string }
  | null;

const MISSION_ERROR_COPY = 'Não conseguimos atualizar essa missão. Tente novamente.';

export function ChildMissionsScreen({
  child,
  completedMissionIds,
  onMissionCompleted,
  onOpenMissionDetail,
}: ChildMissionsScreenProps) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const completingMissionRef = useRef<string | null>(null);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [missions, setMissions] = useState<AssignedMissionResponse[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<MissionFeedback>(null);
  const visibleMissions = useMemo(
    () => filterCompletedMissions(missions, completedMissionIds),
    [completedMissionIds, missions],
  );

  const loadMissions = useCallback(
    async (showLoading = true) => {
      if (!token) {
        setLoadState('error');
        return null;
      }

      if (showLoading) {
        setLoadState('loading');
      }

      try {
        const [walletResponse, missionResponse] = await Promise.all([
          childService.getWallet(token, child.id),
          childService.listPendingMissions(token, child.id),
        ]);

        setWallet(walletResponse);
        setMissions(missionResponse);
        setLoadState('ready');

        return { wallet: walletResponse, missions: missionResponse };
      } catch {
        setWallet(null);
        setMissions([]);
        setLoadState('error');
        return null;
      }
    },
    [child.id, token],
  );

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadMissions();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadMissions]);

  const handleComplete = async (mission: AssignedMissionResponse) => {
    if (!token || completingMissionRef.current === mission.id) {
      return;
    }

    completingMissionRef.current = mission.id;
    setCompletingMissionId(mission.id);
    setFeedback(null);

    try {
      const completedMission = await childService.completeMission(token, mission.id);
      onMissionCompleted?.(mission.id);
      setMissions((currentMissions) => currentMissions.filter((currentMission) => currentMission.id !== mission.id));
      const refreshed = await loadMissions(false);

      if (completedMission.status === 'AWAITING_APPROVAL') {
        setFeedback({ type: 'awaiting-approval' });
      } else if (completedMission.status === 'COMPLETED') {
        setFeedback({
          type: 'completed',
          coins: completedMission.snapshotCoinValue,
          balance: refreshed?.wallet.balance ?? wallet?.balance ?? 0,
        });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: getMissionErrorMessage(error) });
    } finally {
      completingMissionRef.current = null;
      setCompletingMissionId(null);
    }
  };

  return (
    <AppScreen>
      <AppHeader
        action={wallet ? <CoinBadge amount={wallet.balance} /> : null}
        emoji="✅"
        subtitle={loadState === 'ready' ? getSubtitle(visibleMissions.length) : undefined}
        title="Suas missões"
      />

      {feedback ? <MissionFeedbackBanner feedback={feedback} /> : null}

      {loadState === 'loading' ? (
        <Card style={styles.stateCard} variant="highlight">
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando suas missões...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar agora. Tente novamente.</Text>
          <SecondaryButton label="Tentar novamente" onPress={() => void loadMissions()} />
        </Card>
      ) : null}

      {loadState === 'ready' && visibleMissions.length === 0 ? (
        <EmptyState
          body="Aproveite o descanso!"
          emoji="🌤️"
          title="Nenhuma missão por aqui agora"
        />
      ) : null}

      {loadState === 'ready' && visibleMissions.length > 0 ? (
        <View style={styles.list}>
          {visibleMissions.map((mission) => (
            <MissionCard
              completing={completingMissionId === mission.id}
              key={mission.id}
              mission={mission}
              onComplete={handleComplete}
              onOpenDetail={onOpenMissionDetail}
            />
          ))}
        </View>
      ) : null}
    </AppScreen>
  );
}

function filterCompletedMissions(
  missions: AssignedMissionResponse[],
  completedMissionIds: string[] | undefined,
): AssignedMissionResponse[] {
  if (!completedMissionIds?.length) {
    return missions;
  }

  const completedMissionIdSet = new Set(completedMissionIds);

  return missions.filter((mission) => !completedMissionIdSet.has(mission.id));
}

function MissionFeedbackBanner({ feedback }: { feedback: MissionFeedback }) {
  if (!feedback) {
    return null;
  }

  if (feedback.type === 'completed') {
    return (
      <FeedbackBanner
        message={`Saldo atualizado: ${feedback.balance} moedas`}
        title={`Missão concluída! +${feedback.coins} moedas`}
        variant="success"
      />
    );
  }

  if (feedback.type === 'awaiting-approval') {
    return (
      <FeedbackBanner
        statusLabel="Aguardando aprovação"
        title="Missão enviada! Um responsável vai revisar."
        variant="warning"
      />
    );
  }

  return <FeedbackBanner title={feedback.message} variant="error" />;
}

function getSubtitle(count: number): string {
  if (count === 0) {
    return 'Hoje está tranquilo por aqui.';
  }

  if (count === 1) {
    return 'Você tem 1 missão pendente para hoje.';
  }

  return `Você tem ${count} missões pendentes para hoje.`;
}

function getMissionErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.userMessage) {
    return error.userMessage;
  }

  return MISSION_ERROR_COPY;
}

const styles = StyleSheet.create({
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
  list: {
    gap: spacing.md,
  },
});
