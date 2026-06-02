import { StyleSheet, Text, View } from 'react-native';

import { AssignedMissionResponse } from '../../../api/types';
import { Card, CoinBadge, PrimaryButton, SecondaryButton, StatusBadge } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

type MissionCardProps = {
  mission: AssignedMissionResponse;
  completing?: boolean;
  onComplete?: (mission: AssignedMissionResponse) => void;
  onOpenDetail?: (mission: AssignedMissionResponse) => void;
};

const statusCopy = {
  PENDING: { emoji: '🟡', label: 'Pendente', variant: 'pending' },
  AWAITING_APPROVAL: { emoji: '⏳', label: 'Aguardando aprovação', variant: 'warning' },
  COMPLETED: { emoji: '✅', label: 'Concluída', variant: 'success' },
  REJECTED: { emoji: '🟠', label: 'Revisar com responsável', variant: 'error' },
  CANCELLED: { emoji: '🔒', label: 'Indisponível', variant: 'pending' },
} as const;

export function MissionCard({ completing = false, mission, onComplete, onOpenDetail }: MissionCardProps) {
  const copy = statusCopy[mission.status];
  const isPending = mission.status === 'PENDING';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>✅</Text>
        <View style={styles.copy}>
          <Text style={styles.title}>{mission.snapshotTitle}</Text>
          {mission.snapshotDescription ? (
            <Text style={styles.description}>{mission.snapshotDescription}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.meta}>
        <CoinBadge amount={mission.snapshotCoinValue} />
        <StatusBadge emoji={copy.emoji} label={copy.label} variant={copy.variant} />
      </View>

      {mission.dueDate ? <Text style={styles.dueDate}>Para {formatDate(mission.dueDate)}</Text> : null}

      {isPending ? (
        <View style={styles.actions}>
          <PrimaryButton
            accessibilityLabel={`Concluir missão ${mission.snapshotTitle}`}
            label="Concluir missão"
            loading={completing}
            onPress={() => onComplete?.(mission)}
            style={styles.actionButton}
          />
          <SecondaryButton
            accessibilityLabel={`Ver detalhes ${mission.snapshotTitle}`}
            label="Ver detalhes"
            onPress={() => onOpenDetail?.(mission)}
            style={styles.actionButton}
          />
        </View>
      ) : null}
    </Card>
  );
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}`;
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
  dueDate: {
    ...typography.label,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
