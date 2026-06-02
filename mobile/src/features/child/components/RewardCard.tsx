import { StyleSheet, Text, View } from 'react-native';

import { RewardResponse } from '../../../api/types';
import { Card, CoinBadge, PrimaryButton, StatusBadge } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

import { ProgressBar } from './ProgressBar';

type RewardCardProps = {
  reward: RewardResponse;
  balance: number;
  redeeming?: boolean;
  onSelect: (reward: RewardResponse) => void;
};

export function RewardCard({ balance, redeeming = false, reward, onSelect }: RewardCardProps) {
  const missingCoins = Math.max(0, reward.cost - balance);
  const canRedeem = missingCoins === 0;
  const progress = reward.cost === 0 ? 100 : (balance / reward.cost) * 100;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🎁</Text>
        <View style={styles.copy}>
          <Text style={styles.title}>{reward.title}</Text>
          {reward.description ? <Text style={styles.description}>{reward.description}</Text> : null}
        </View>
      </View>

      <View style={styles.meta}>
        <CoinBadge amount={reward.cost} />
        <Text style={styles.cost}>Custa {reward.cost} moedas</Text>
      </View>

      {!canRedeem ? (
        <View style={styles.progressPanel}>
          <StatusBadge emoji="🪙" label={`Faltam ${missingCoins} moedas`} variant="warning" />
          <ProgressBar
            accessibilityLabel={`${balance} de ${reward.cost} moedas`}
            value={progress}
          />
        </View>
      ) : null}

      <PrimaryButton
        accessibilityLabel={`Resgatar recompensa ${reward.title}`}
        disabled={!canRedeem}
        label="Resgatar recompensa"
        loading={redeeming}
        onPress={() => onSelect(reward)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cost: {
    ...typography.label,
    color: colors.accentDark,
  },
  progressPanel: {
    gap: spacing.sm,
  },
});
