import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { ResponsibleHomeScreen } from './ResponsibleHomeScreen';
import { ResponsibleMissionsScreen } from './ResponsibleMissionsScreen';
import { ResponsibleProfileScreen } from './ResponsibleProfileScreen';
import { ResponsibleRewardsScreen } from './ResponsibleRewardsScreen';

type ResponsibleTabParamList = {
  ResponsibleHome: undefined;
  ResponsibleMissions: undefined;
  ResponsibleRewards: undefined;
  ResponsibleProfile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleTabs'>;

const Tab = createBottomTabNavigator<ResponsibleTabParamList>();

export function ResponsibleTabsScreen({ navigation, route }: Props) {
  const { logout } = useAuth();
  const activeChild = route.params?.activeChild;

  return (
    <Tab.Navigator
      initialRouteName="ResponsibleHome"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ResponsibleTabBar {...props} />}
    >
      <Tab.Screen name="ResponsibleHome" options={{ title: 'Início' }}>
        {({ navigation: tabNavigation }) => (
          <ResponsibleHomeScreen
            navigation={{
              navigate: (route, params) => {
                if (route === 'ResponsibleChildDetail' && params) {
                  navigation.navigate(route, params);
                  return;
                }

                if (route === 'ResponsibleChildForm') {
                  navigation.navigate(route);
                }

                if (route === 'ResponsibleChildren') {
                  navigation.navigate(route);
                }

                if (route === 'ChildProfileSelect') {
                  navigation.navigate(route);
                }

                if (route === 'ResponsibleMissionForm') {
                  navigation.navigate(route);
                }

                if (route === 'ResponsibleMissions') {
                  tabNavigation.navigate(route);
                }

                if (route === 'ResponsibleApprovals') {
                  navigation.navigate(route);
                }

                if (route === 'ResponsibleRewardForm') {
                  navigation.navigate(route);
                }
              },
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ResponsibleMissions" options={{ title: 'Missões' }}>
        {() => (
          <ResponsibleMissionsScreen
            onAssignMission={(missionId) => navigation.navigate('ResponsibleAssignmentForm', { missionId })}
            onCreateMission={() => navigation.navigate('ResponsibleMissionForm')}
            onEditMission={(missionId) => navigation.navigate('ResponsibleMissionForm', { missionId })}
            onOpenApprovals={() => navigation.navigate('ResponsibleApprovals')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ResponsibleRewards" options={{ title: 'Recompensas' }}>
        {() => (
          <ResponsibleRewardsScreen
            onCreateReward={() => navigation.navigate('ResponsibleRewardForm')}
            onEditReward={(rewardId) => navigation.navigate('ResponsibleRewardForm', { rewardId })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ResponsibleProfile" options={{ title: 'Perfil' }}>
        {() => (
          <ResponsibleProfileScreen
            hasActiveChild={Boolean(activeChild)}
            onReturnToChild={() => {
              if (activeChild) {
                navigation.navigate('ChildTabs', { child: activeChild });
                return;
              }

              navigation.navigate('ChildProfileSelect');
            }}
            onLogout={logout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const tabCopy: Record<keyof ResponsibleTabParamList, { emoji: string; label: string }> = {
  ResponsibleHome: { emoji: '🏠', label: 'Início' },
  ResponsibleMissions: { emoji: '📋', label: 'Missões' },
  ResponsibleRewards: { emoji: '🎁', label: 'Recompensas' },
  ResponsibleProfile: { emoji: '🙂', label: 'Perfil' },
};

function ResponsibleTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomSafeAreaHeight = getResponsibleTabBottomSafeAreaHeight(insets.bottom);

  return (
    <View style={styles.tabShell}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const copy = tabCopy[route.name as keyof ResponsibleTabParamList];
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
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
            >
              <Text style={styles.tabEmoji}>{copy?.emoji ?? '⭐'}</Text>
              <Text numberOfLines={1} style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {bottomSafeAreaHeight > 0 ? <View style={[styles.tabSafeArea, { height: bottomSafeAreaHeight }]} /> : null}
    </View>
  );
}

export function getResponsibleTabBottomSafeAreaHeight(insetBottom: number): number {
  return Math.max(insetBottom, 0);
}

const styles = StyleSheet.create({
  tabShell: {
    backgroundColor: colors.background,
  },
  tabContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    paddingTop: spacing.sm,
  },
  tabSafeArea: {
    backgroundColor: colors.background,
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabItem: {
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
  tabItemActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    ...typography.label,
    color: colors.tabInactive,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.tabActive,
  },
});
