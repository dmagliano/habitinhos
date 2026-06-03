import { StyleSheet, Text } from 'react-native';

import { Card } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

type MetricSummaryCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function MetricSummaryCard({ helper, label, value }: MetricSummaryCardProps) {
  return (
    <Card style={styles.card} variant="soft">
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.xs,
    minHeight: 104,
  },
  value: {
    ...typography.heading,
    color: colors.primaryDark,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
