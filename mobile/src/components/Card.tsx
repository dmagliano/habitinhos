import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';

type CardVariant = 'default' | 'soft' | 'highlight';

type CardProps = PropsWithChildren<{
  variant?: CardVariant;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle;
}>;

export function Card({ children, variant = 'default', onPress, accessibilityLabel, style, testID }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, styles[variant], style]} testID={testID}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.cardPadding,
    ...shadows.card,
  },
  default: {
    backgroundColor: colors.surface,
  },
  soft: {
    backgroundColor: colors.surfaceSoft,
  },
  highlight: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.xl,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
