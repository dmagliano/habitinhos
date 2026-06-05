import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../../../theme';

const tabCopy: Record<string, { emoji: string; label: string }> = {
  ChildHome: { emoji: '🏠', label: 'Início' },
  ChildMissions: { emoji: '✅', label: 'Missões' },
  ChildRewards: { emoji: '🎁', label: 'Recompensas' },
  ChildProfile: { emoji: '🙂', label: 'Perfil' },
};

export function BottomTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomSafeAreaHeight = getBottomTabSafeAreaHeight(insets.bottom);

  return (
    <View style={styles.shell}>
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
              <Text numberOfLines={1} style={[styles.label, isFocused && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {bottomSafeAreaHeight > 0 ? <View style={[styles.safeAreaSpacer, { height: bottomSafeAreaHeight }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.background,
  },
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    paddingTop: spacing.sm,
  },
  safeAreaSpacer: {
    backgroundColor: colors.background,
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
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.tabActive,
  },
});

export function getBottomTabSafeAreaHeight(insetBottom: number): number {
  return Math.max(insetBottom, 0);
}
