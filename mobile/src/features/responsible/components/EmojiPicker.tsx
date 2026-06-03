import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../../../theme';

type EmojiOption = {
  key: string;
  emoji: string;
  label: string;
};

type EmojiPickerProps = {
  selectedKey: string;
  onSelect: (key: string) => void;
};

const options: EmojiOption[] = [
  { key: 'fox', emoji: '🦊', label: 'Raposa' },
  { key: 'cat', emoji: '🐱', label: 'Gato' },
  { key: 'dog', emoji: '🐶', label: 'Cachorro' },
  { key: 'bear', emoji: '🐻', label: 'Urso' },
  { key: 'star', emoji: '⭐', label: 'Estrela' },
];

export function EmojiPicker({ onSelect, selectedKey }: EmojiPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {options.map((option) => {
        const selected = option.key === selectedKey;

        return (
          <Pressable
            accessibilityLabel={`Escolher avatar ${option.label}`}
            accessibilityRole="button"
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.primaryDark,
  },
  option: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    marginRight: spacing.sm,
    minHeight: 64,
    minWidth: 72,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
});
