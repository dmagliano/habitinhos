import { StyleSheet, Text, View } from 'react-native';

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
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 88,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  value: {
    ...typography.display,
    color: colors.primaryDark,
  },
  label: {
    flex: 1,
    ...typography.label,
    color: colors.textPrimary,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
