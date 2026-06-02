import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../theme';

const tabCopy: Record<string, { emoji: string; label: string }> = {
  ChildHome: { emoji: '🏠', label: 'Início' },
  ChildMissions: { emoji: '✅', label: 'Missões' },
  ChildRewards: { emoji: '🎁', label: 'Recompensas' },
  ChildProfile: { emoji: '🙂', label: 'Perfil' },
};

export function BottomTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const copy = tabCopy[route.name];
        const options = descriptors[route.key]?.options;
        const label = copy?.label ?? options?.title ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            accessibilityLabel={`Abrir ${label}`}
            accessibilityRole="button"
            key={route.key}
            onPress={onPress}
            style={[styles.item, isFocused && styles.itemActive]}
          >
            <Text style={styles.emoji}>{copy?.emoji ?? '⭐'}</Text>
            <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  item: {
    alignItems: 'center',
    borderRadius: radius.full,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  itemActive: {
    backgroundColor: colors.primarySoft,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    ...typography.label,
    color: colors.tabInactive,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.tabActive,
  },
});
