import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type SecondaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function SecondaryButton({ label, onPress, disabled = false, destructive = false, accessibilityLabel, style }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      <Text style={[styles.label, destructive && styles.destructiveLabel, disabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.secondary,
  },
  disabled: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    ...typography.label,
    color: colors.secondaryDark,
  },
  destructiveLabel: {
    color: colors.error,
  },
  disabledLabel: {
    color: colors.textMuted,
  },
});
