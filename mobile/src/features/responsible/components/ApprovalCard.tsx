import { StyleSheet, Text, View } from 'react-native';

import { Card, SecondaryButton, StatusBadge } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

type ApprovalCardProps = {
  count: number;
  onOpenApprovals: () => void;
};

export function ApprovalCard({ count, onOpenApprovals }: ApprovalCardProps) {
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

function getApprovalTitle(count: number): string {
  if (count === 1) {
    return '1 missão aguardando aprovação';
  }

  return `${count} missões aguardando aprovação`;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
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
});
