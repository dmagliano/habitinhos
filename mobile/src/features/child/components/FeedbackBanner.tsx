import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '../../../components';
import { colors, radius, spacing, typography } from '../../../theme';

type FeedbackVariant = 'success' | 'warning' | 'error';

type FeedbackBannerProps = {
  title: string;
  message?: string;
  variant: FeedbackVariant;
  statusLabel?: string;
};

const palette = {
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    textColor: colors.success,
    badgeVariant: 'success',
    emoji: '✅',
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    textColor: colors.accentDark,
    badgeVariant: 'warning',
    emoji: '⏳',
  },
  error: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
    textColor: colors.error,
    badgeVariant: 'error',
    emoji: '🛟',
  },
} as const;

export function FeedbackBanner({ message, statusLabel, title, variant }: FeedbackBannerProps) {
  const selectedPalette = palette[variant];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: selectedPalette.backgroundColor,
          borderColor: selectedPalette.borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{selectedPalette.emoji}</Text>
        <Text style={[styles.title, { color: selectedPalette.textColor }]}>{title}</Text>
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {statusLabel ? (
        <StatusBadge
          emoji={selectedPalette.emoji}
          label={statusLabel}
          variant={selectedPalette.badgeVariant}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    ...typography.heading,
    flex: 1,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
