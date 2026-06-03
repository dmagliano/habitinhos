import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

type ConfirmActionSheetProps = {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmAccessibilityLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmActionSheet({
  body,
  cancelLabel,
  confirmAccessibilityLabel,
  confirmLabel,
  loading = false,
  loadingLabel,
  onCancel,
  onConfirm,
  title,
}: ConfirmActionSheetProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <View style={styles.actions}>
        <SecondaryButton disabled={loading} label={cancelLabel} onPress={onCancel} />
        <PrimaryButton
          accessibilityLabel={loading ? loadingLabel ?? confirmLabel : confirmAccessibilityLabel ?? confirmLabel}
          disabled={loading}
          label={loading ? loadingLabel ?? confirmLabel : confirmLabel}
          loading={loading}
          onPress={onConfirm}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  copy: {
    gap: spacing.xs,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
