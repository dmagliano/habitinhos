import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type CoinBadgeProps = {
  amount: number | string;
  label?: string;
};

export function CoinBadge({ amount, label = 'moedas' }: CoinBadgeProps) {
  return (
    <View accessibilityLabel={`${amount} ${label}`} style={styles.badge}>
      <Text style={styles.emoji}>🪙</Text>
      <Text style={styles.label}>
        {amount} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    ...typography.label,
    color: colors.accentDark,
  },
});
