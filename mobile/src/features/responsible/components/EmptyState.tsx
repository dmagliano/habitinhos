import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

type EmptyStateProps = {
  emoji: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ actionLabel, body, emoji, onAction, title }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: {
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
