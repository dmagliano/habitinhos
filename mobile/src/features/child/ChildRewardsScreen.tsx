import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ApiError, ChildResponse, RewardResponse, WalletResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, CoinBadge, PrimaryButton, SecondaryButton } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { childService } from './childService';
import { EmptyState } from './components/EmptyState';
import { FeedbackBanner } from './components/FeedbackBanner';
import { RewardCard } from './components/RewardCard';

type ChildRewardsScreenProps = {
  child: ChildResponse;
};

type LoadState = 'loading' | 'ready' | 'error';
type RewardFeedback =
  | { type: 'success' }
  | { type: 'insufficient' }
  | { type: 'error' }
  | null;

export function ChildRewardsScreen({ child }: ChildRewardsScreenProps) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const redeemingRewardRef = useRef<string | null>(null);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [rewards, setRewards] = useState<RewardResponse[]>([]);
  const [selectedReward, setSelectedReward] = useState<RewardResponse | null>(null);
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<RewardFeedback>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const activeRewards = rewards.filter((reward) => reward.active);

  const loadRewards = useCallback(
    async (showLoading = true) => {
      if (!token) {
        setLoadState('error');
        return null;
      }

      if (showLoading) {
        setLoadState('loading');
      }

      try {
        const [walletResponse, rewardResponse] = await Promise.all([
          childService.getWallet(token, child.id),
          childService.listRewards(token),
        ]);

        setWallet(walletResponse);
        setRewards(rewardResponse);
        setLoadState('ready');

        return { rewards: rewardResponse, wallet: walletResponse };
      } catch {
        setWallet(null);
        setRewards([]);
        setLoadState('error');
        return null;
      }
    },
    [child.id, token],
  );

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadRewards();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadRewards]);

  const confirmRedemption = async () => {
    if (!token || !selectedReward || redeemingRewardRef.current === selectedReward.id) {
      return;
    }

    redeemingRewardRef.current = selectedReward.id;
    setRedeemingRewardId(selectedReward.id);
    setFeedback(null);

    try {
      await childService.redeemReward(token, selectedReward.id, child.id);
      await loadRewards(false);
      setSelectedReward(null);
      setFeedback({ type: 'success' });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'INSUFFICIENT_BALANCE') {
        const walletResponse = await childService.getWallet(token, child.id);
        setWallet(walletResponse);
        setSelectedReward(null);
        setFeedback({ type: 'insufficient' });
      } else {
        setFeedback({ type: 'error' });
      }
    } finally {
      redeemingRewardRef.current = null;
      setRedeemingRewardId(null);
    }
  };

  return (
    <AppScreen>
      <AppHeader
        action={wallet ? <CoinBadge amount={wallet.balance} /> : null}
        emoji="🎁"
        title="Recompensas"
      />

      {feedback ? <RewardFeedbackBanner feedback={feedback} /> : null}

      {loadState === 'loading' ? (
        <Card style={styles.stateCard} variant="highlight">
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando recompensas...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar agora. Tente novamente.</Text>
          <SecondaryButton label="Tentar novamente" onPress={() => void loadRewards()} />
        </Card>
      ) : null}

      {loadState === 'ready' && wallet ? (
        <>
          <Card style={styles.balanceCard} variant="highlight">
            <Text style={styles.balanceValue}>{wallet.balance}</Text>
            <Text style={styles.balanceLabel}>moedas disponíveis</Text>
          </Card>

          <Text style={styles.sectionTitle}>O que você quer resgatar?</Text>

          {selectedReward ? (
            <ConfirmationPanel
              balance={wallet.balance}
              onCancel={() => setSelectedReward(null)}
              onConfirm={confirmRedemption}
              redeeming={redeemingRewardId === selectedReward.id}
              reward={selectedReward}
            />
          ) : null}

          {activeRewards.length === 0 ? (
            <EmptyState
              body="Quando a família criar uma recompensa, ela aparece aqui."
              emoji="🎁"
              title="Nenhuma recompensa cadastrada"
            />
          ) : (
            <View style={styles.list}>
              {activeRewards.map((reward) => (
                <RewardCard
                  balance={wallet.balance}
                  key={reward.id}
                  onSelect={setSelectedReward}
                  redeeming={redeemingRewardId === reward.id}
                  reward={reward}
                />
              ))}
            </View>
          )}
        </>
      ) : null}
    </AppScreen>
  );
}

function ConfirmationPanel({
  balance,
  onCancel,
  onConfirm,
  redeeming,
  reward,
}: {
  balance: number;
  onCancel: () => void;
  onConfirm: () => void;
  redeeming: boolean;
  reward: RewardResponse;
}) {
  const remainingBalance = balance - reward.cost;

  return (
    <Card style={styles.confirmationCard}>
      <Text style={styles.confirmationTitle}>Confirmar resgate</Text>
      <Text style={styles.confirmationCopy}>Saldo atual: {balance} moedas</Text>
      <Text style={styles.confirmationCopy}>Custo: {reward.cost} moedas</Text>
      <Text style={styles.confirmationCopy}>Depois do resgate: {remainingBalance} moedas</Text>
      <PrimaryButton label="Confirmar resgate" loading={redeeming} onPress={onConfirm} />
      <SecondaryButton disabled={redeeming} label="Cancelar" onPress={onCancel} />
    </Card>
  );
}

function RewardFeedbackBanner({ feedback }: { feedback: RewardFeedback }) {
  if (!feedback) {
    return null;
  }

  if (feedback.type === 'success') {
    return (
      <FeedbackBanner
        title="Recompensa resgatada! Mostre para um responsável."
        variant="success"
      />
    );
  }

  if (feedback.type === 'insufficient') {
    return <FeedbackBanner title="Faltam moedas para essa recompensa." variant="warning" />;
  }

  return <FeedbackBanner title="Não conseguimos resgatar agora. Tente novamente." variant="error" />;
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
  balanceCard: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  balanceValue: {
    ...typography.display,
    color: colors.accentDark,
  },
  balanceLabel: {
    ...typography.label,
    color: colors.primaryDark,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  confirmationCard: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  confirmationTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  confirmationCopy: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
