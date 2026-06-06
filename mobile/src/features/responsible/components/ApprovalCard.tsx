import { StyleSheet, Text, View } from 'react-native';

import { Card, CoinBadge, SecondaryButton, StatusBadge } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

type ApprovalShortcutProps = {
  count: number;
  onOpenApprovals: () => void;
};

type ApprovalQueueProps = {
  childName: string;
  completedAt: string | null;
  coinValue: number;
  disabled?: boolean;
  missionTitle: string;
  onApprove: () => void;
  onReject: () => void;
};

type ApprovalCardProps = ApprovalShortcutProps | ApprovalQueueProps;

export function ApprovalCard(props: ApprovalCardProps) {
  if ('count' in props) {
    return <ApprovalShortcut count={props.count} onOpenApprovals={props.onOpenApprovals} />;
  }

  return <ApprovalQueueItem {...props} />;
}

function ApprovalShortcut({ count, onOpenApprovals }: ApprovalShortcutProps) {
  return (
    <Card style={styles.card} variant="highlight">
      <View style={styles.header}>
        <Text style={styles.title}>{getApprovalTitle(count)}</Text>
        <StatusBadge emoji="⏳" label={`${count}`} variant="warning" />
      </View>
      <Text style={styles.body}>Revise conclusões antes de liberar moedas quando a missão exige aprovação.</Text>
      <SecondaryButton
        accessibilityLabel="Abrir aprovações"
        label="Ver aprovações"
        onPress={onOpenApprovals}
      />
    </Card>
  );
}

function ApprovalQueueItem({
  childName,
  coinValue,
  completedAt,
  disabled = false,
  missionTitle,
  onApprove,
  onReject,
}: ApprovalQueueProps) {
  return (
    <Card style={styles.card} testID={`approval-${missionTitle}`}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{missionTitle}</Text>
          <Text style={styles.body}>{childName}{completedAt ? ` · concluída em ${formatDate(completedAt)}` : ''}</Text>
        </View>
        <CoinBadge amount={coinValue} />
      </View>
      <StatusBadge emoji="⏳" label="Aguardando aprovação" variant="warning" />
      <View style={styles.queueActions}>
        <SecondaryButton
          accessibilityLabel={`Rejeitar missão ${missionTitle} de ${childName}`}
          destructive
          disabled={disabled}
          label="Rejeitar"
          onPress={onReject}
          style={styles.actionButton}
        />
        <SecondaryButton
          accessibilityLabel={`Aprovar missão ${missionTitle} de ${childName}`}
          disabled={disabled}
          label="Aprovar"
          onPress={onApprove}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
}

function getApprovalTitle(count: number): string {
  if (count === 1) {
    return '1 missão aguardando aprovação';
  }

  return `${count} missões aguardando aprovação`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  card: {
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    flex: 1,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  queueActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
