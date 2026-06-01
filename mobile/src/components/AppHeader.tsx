import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

import { EmojiAvatar } from './EmojiAvatar';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  greeting?: string;
  emoji?: string;
  action?: ReactNode;
};

export function AppHeader({ title, subtitle, greeting, emoji, action }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        {emoji ? <EmojiAvatar emoji={emoji} label={title} size="md" /> : null}
        <View style={styles.copy}>
          {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  identity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    ...typography.label,
    color: colors.textMuted,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  action: {
    minHeight: 44,
    minWidth: 44,
  },
});
