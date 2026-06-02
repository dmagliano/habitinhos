import { StyleSheet, Text } from 'react-native';

import { Card } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

type EmptyStateProps = {
  emoji: string;
  title: string;
  body: string;
};

export function EmptyState({ body, emoji, title }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    gap: spacing.sm,
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
