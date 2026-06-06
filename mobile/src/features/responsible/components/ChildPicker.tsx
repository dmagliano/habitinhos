import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChildResponse } from '../../../api/types';
import { EmojiAvatar, StatusBadge } from '../../../components';
import { colors, radius, spacing, typography } from '../../../theme';

type ChildPickerProps = {
  childrenOptions: ChildResponse[];
  selectedIds: string[];
  onToggle: (childId: string) => void;
};

export function ChildPicker({ childrenOptions, onToggle, selectedIds }: ChildPickerProps) {
  if (childrenOptions.length === 0) {
    return <Text style={styles.empty}>Nenhuma criança ativa para atribuir agora.</Text>;
  }

  return (
    <View style={styles.list}>
      {childrenOptions.map((child) => {
        const selected = selectedIds.includes(child.id);

        return (
          <Pressable
            accessibilityLabel={`${selected ? 'Remover' : 'Selecionar'} ${child.name}`}
            accessibilityRole="button"
            key={child.id}
            onPress={() => onToggle(child.id)}
            style={[styles.item, selected && styles.itemSelected]}
            testID={`child-picker-${child.id}`}
          >
            <EmojiAvatar emoji={getAvatarEmoji(child.avatarKey)} label={child.name} size="sm" />
            <View style={styles.copy}>
              <Text style={styles.name}>{child.name}</Text>
              <Text style={styles.metadata}>{child.age} anos</Text>
            </View>
            {selected ? <StatusBadge label="Selecionada" variant="selected" /> : <Text style={styles.check}>○</Text>}
          </Pressable>
        );
      })}
    </View>
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
  check: {
    ...typography.heading,
    color: colors.textMuted,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
  },
  item: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 64,
    padding: spacing.md,
  },
  itemSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  list: {
    gap: spacing.sm,
  },
  metadata: {
    ...typography.body,
    color: colors.textSecondary,
  },
  name: {
    ...typography.label,
    color: colors.textPrimary,
  },
});
