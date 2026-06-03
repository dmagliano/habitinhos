import { StyleSheet, Text, View } from 'react-native';

import { Card, EmojiAvatar, SecondaryButton, StatusBadge } from '../../../components';
import { colors, spacing, typography } from '../../../theme';

type ManageListItemProps = {
  id: string;
  title: string;
  metadata: string;
  avatarKey?: string | null;
  active: boolean;
  onEdit?: () => void;
  actions?: {
    label: string;
    accessibilityLabel?: string;
    destructive?: boolean;
    onPress: () => void;
  }[];
  testID?: string;
};

export function ManageListItem({
  actions = [],
  active,
  avatarKey,
  id,
  metadata,
  onEdit,
  testID,
  title,
}: ManageListItemProps) {
  return (
    <Card style={active ? styles.card : styles.inactiveCard} testID={testID ?? `manage-item-${id}`}>
      <View style={styles.header}>
        <EmojiAvatar emoji={getAvatarEmoji(avatarKey)} label={title} size="md" />
        <View style={styles.copy}>
          <Text style={[styles.title, !active && styles.inactiveText]}>{title}</Text>
          <Text style={[styles.metadata, !active && styles.inactiveText]}>{metadata}</Text>
        </View>
        <StatusBadge label={active ? 'Ativa' : 'Inativa'} variant={active ? 'success' : 'pending'} />
      </View>

      {onEdit || actions.length > 0 ? (
        <View style={styles.actions}>
          {onEdit ? <SecondaryButton accessibilityLabel={`Editar ${title}`} label="Editar" onPress={onEdit} /> : null}
          {actions.map((action) => (
            <SecondaryButton
              accessibilityLabel={action.accessibilityLabel ?? action.label}
              destructive={action.destructive}
              key={action.label}
              label={action.label}
              onPress={action.onPress}
            />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function getAvatarEmoji(avatarKey: string | null | undefined): string {
  if (avatarKey === 'fox') {
    return '🦊';
  }

  if (avatarKey === 'cat') {
    return '🐱';
  }

  if (avatarKey === 'dog') {
    return '🐶';
  }

  if (avatarKey === 'bear') {
    return '🐻';
  }

  return '⭐';
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  inactiveCard: {
    backgroundColor: colors.surfaceSoft,
    gap: spacing.md,
    opacity: 0.76,
  },
  inactiveText: {
    color: colors.textMuted,
  },
  metadata: {
    ...typography.body,
    color: colors.textSecondary,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
