import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type StatusBadgeVariant = 'pending' | 'selected' | 'success' | 'warning' | 'error';

type StatusBadgeProps = {
  label: string;
  emoji?: string;
  variant?: StatusBadgeVariant;
};

const variantStyles = {
  pending: { backgroundColor: colors.surfaceSoft, color: colors.textSecondary },
  selected: { backgroundColor: colors.primarySoft, color: colors.primaryDark },
  success: { backgroundColor: colors.successSoft, color: colors.success },
  warning: { backgroundColor: colors.warningSoft, color: colors.accentDark },
  error: { backgroundColor: colors.errorSoft, color: colors.error },
} as const;

export function StatusBadge({ label, emoji, variant = 'pending' }: StatusBadgeProps) {
  const palette = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    ...typography.label,
  },
});
