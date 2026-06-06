import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AssignedMissionResponse, ChildResponse, WalletResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, CoinBadge, PrimaryButton, SecondaryButton } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { childService } from './childService';

type ChildHomeScreenProps = {
  child: ChildResponse;
  onOpenMissions: () => void;
};

type LoadState = 'loading' | 'ready' | 'error';

export function ChildHomeScreen({ child, onOpenMissions }: ChildHomeScreenProps) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [missions, setMissions] = useState<AssignedMissionResponse[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const sortedMissions = useMemo(() => sortPendingMissions(missions), [missions]);
  const visibleMissions = sortedMissions.slice(0, 3);

  const loadHome = useCallback(async () => {
    if (!token) {
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    try {
      const [walletResponse, missionsResponse] = await Promise.all([
        childService.getWallet(token, child.id),
        childService.listPendingMissions(token, child.id),
      ]);

      setWallet(walletResponse);
      setMissions(missionsResponse);
      setLoadState('ready');
    } catch {
      setWallet(null);
      setMissions([]);
      setLoadState('error');
    }
  }, [child.id, token]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadHome();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadHome]);

  return (
    <AppScreen>
      <AppHeader
        emoji={getAvatarEmoji(child.avatarKey)}
        greeting="Você está indo muito bem!"
        title={`Oi, ${child.name}!`}
      />

      {loadState === 'loading' ? (
        <Card style={styles.stateCard} variant="highlight">
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando seu tesouro...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar agora. Tente novamente.</Text>
          <SecondaryButton label="Tentar novamente" onPress={loadHome} />
        </Card>
      ) : null}

      {loadState === 'ready' && wallet ? (
        <>
          <Card style={styles.balanceCard} variant="highlight">
            <Text style={styles.balanceLabel}>Seu tesouro</Text>
            <Text style={styles.balanceValue}>{wallet.balance} moedas</Text>
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Missões de hoje</Text>
            <Text style={styles.sectionSummary}>{getPendingSummary(sortedMissions.length)}</Text>
          </View>

          {visibleMissions.length > 0 ? (
            <View style={styles.missionList}>
              {visibleMissions.map((mission) => (
                <Card key={mission.id} style={styles.missionCard}>
                  <View style={styles.missionRewardRow}>
                    <Text style={styles.missionEmoji}>✅</Text>
                    <CoinBadge amount={mission.snapshotCoinValue} />
                  </View>
                  <View style={styles.missionCopy}>
                    <Text style={styles.missionTitle} testID="home-mission-title">
                      {mission.snapshotTitle}
                    </Text>
                    {mission.snapshotDescription ? (
                      <Text style={styles.missionDescription}>{mission.snapshotDescription}</Text>
                    ) : null}
                  </View>
                  {mission.dueDate ? (
                    <Text style={styles.missionDueDate}>Para {formatDate(mission.dueDate)}</Text>
                  ) : null}
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.stateCard}>
              <Text style={styles.stateEmoji}>🌤️</Text>
              <Text style={styles.stateTitle}>Nenhuma missão hoje</Text>
              <Text style={styles.stateCopy}>Quando houver uma nova missão, ela aparece aqui.</Text>
            </Card>
          )}

          <PrimaryButton label="Ver missões" onPress={onOpenMissions} style={styles.openButton} />
        </>
      ) : null}
    </AppScreen>
  );
}

function sortPendingMissions(missions: AssignedMissionResponse[]): AssignedMissionResponse[] {
  return [...missions].sort((left, right) => {
    if (left.dueDate && !right.dueDate) {
      return -1;
    }

    if (!left.dueDate && right.dueDate) {
      return 1;
    }

    if (left.dueDate && right.dueDate && left.dueDate !== right.dueDate) {
      return left.dueDate.localeCompare(right.dueDate);
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

function getPendingSummary(count: number): string {
  if (count === 1) {
    return 'Você tem 1 missão pendente hoje.';
  }

  return `Você tem ${count} missões pendentes hoje.`;
}

function getAvatarEmoji(avatarKey: string | null | undefined): string {
  if (avatarKey === 'fox') {
    return '🦊';
  }

  if (avatarKey === 'cat') {
    return '🐱';
  }

  if (avatarKey === 'dog') {
    return '🐶';
  }

  if (avatarKey === 'bear') {
    return '🐻';
  }

  return '⭐';
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}`;
}

const styles = StyleSheet.create({
  stateCard: {
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stateEmoji: {
    fontSize: 28,
  },
  stateTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  stateCopy: {
    ...typography.body,
    color: colors.textSecondary,
  },
  balanceCard: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    ...typography.label,
    color: colors.primaryDark,
  },
  balanceValue: {
    ...typography.display,
    color: colors.accentDark,
  },
  sectionHeader: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  sectionSummary: {
    ...typography.body,
    color: colors.textSecondary,
  },
  missionList: {
    gap: spacing.md,
  },
  missionCard: {
    gap: spacing.sm,
  },
  missionRewardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  missionEmoji: {
    fontSize: 24,
  },
  missionCopy: {
    gap: spacing.xs,
  },
  missionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  missionDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  missionDueDate: {
    ...typography.label,
    color: colors.textMuted,
  },
  openButton: {
    marginTop: spacing.lg,
  },
});
