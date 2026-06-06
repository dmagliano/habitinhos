import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { RewardResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { EmptyState } from './components/EmptyState';
import { ManageListItem } from './components/ManageListItem';
import { responsibleService } from './responsibleService';

type ResponsibleRewardsScreenProps = {
  onCreateReward: () => void;
  onEditReward: (rewardId: string) => void;
};

type LoadState = 'loading' | 'ready' | 'error';

export function ResponsibleRewardsScreen({ onCreateReward, onEditReward }: ResponsibleRewardsScreenProps) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [rewards, setRewards] = useState<RewardResponse[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const { activeRewards, inactiveRewards } = useMemo(() => splitRewards(rewards), [rewards]);

  const loadRewards = useCallback(async () => {
    if (!token) {
      setRewards([]);
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    try {
      const response = await responsibleService.listRewards(token, true);
      setRewards(response);
      setLoadState('ready');
    } catch {
      setRewards([]);
      setLoadState('error');
    }
  }, [token]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadRewards();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadRewards]);

  return (
    <AppScreen>
      <AppHeader
        action={<PrimaryButton label="Nova recompensa" onPress={onCreateReward} />}
        emoji="🎁"
        subtitle="Gerencie recompensas disponíveis para as crianças."
        title="Recompensas"
      />

      {loadState === 'loading' ? (
        <Card style={styles.stateCard} variant="highlight">
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando recompensas...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar as recompensas.</Text>
          <SecondaryButton label="Tentar novamente" onPress={loadRewards} />
        </Card>
      ) : null}

      {loadState === 'ready' ? (
        <View style={styles.content}>
          {rewards.length === 0 ? (
            <EmptyState
              actionLabel="Nova recompensa"
              body="Cadastre algo que as crianças possam resgatar com moedas."
              emoji="🎁"
              onAction={onCreateReward}
              title="Nenhuma recompensa cadastrada"
            />
          ) : null}

          {activeRewards.length > 0 ? (
            <RewardSection onEditReward={onEditReward} rewards={activeRewards} title="Recompensas ativas" />
          ) : null}

          {inactiveRewards.length > 0 ? (
            <RewardSection onEditReward={onEditReward} rewards={inactiveRewards} title="Recompensas inativas" />
          ) : null}
        </View>
      ) : null}
    </AppScreen>
  );
}

function RewardSection({
  onEditReward,
  rewards,
  title,
}: {
  onEditReward: (rewardId: string) => void;
  rewards: RewardResponse[];
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rewards.map((reward) => (
        <ManageListItem
          active={reward.active}
          avatarKey="reward"
          id={reward.id}
          key={reward.id}
          metadata={`${reward.description || 'Sem descrição'} · ${reward.cost} moedas`}
          onEdit={reward.active ? () => onEditReward(reward.id) : undefined}
          testID={`manage-reward-${reward.id}`}
          title={reward.title}
        />
      ))}
    </View>
  );
}

function splitRewards(rewards: RewardResponse[]) {
  const sorted = [...rewards].sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    return left.title.localeCompare(right.title, 'pt-BR');
  });

  return {
    activeRewards: sorted.filter((reward) => reward.active),
    inactiveRewards: sorted.filter((reward) => !reward.active),
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
