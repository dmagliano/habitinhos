import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, AppScreen, Card, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

type ResponsibleTabParamList = {
  ResponsibleHome: undefined;
  ResponsibleMissions: undefined;
  ResponsibleRewards: undefined;
  ResponsibleProfile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleTabs'>;

const Tab = createBottomTabNavigator<ResponsibleTabParamList>();

export function ResponsibleTabsScreen({ navigation }: Props) {
  const { logout, session } = useAuth();
  const familyName = session?.family.name ?? 'sua família';

  return (
    <Tab.Navigator
      initialRouteName="ResponsibleHome"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ResponsibleTabBar {...props} />}
    >
      <Tab.Screen name="ResponsibleHome" options={{ title: 'Início' }}>
        {() => (
          <PlaceholderTab
            emoji="🧭"
            helper="O painel com crianças, missões, aprovações e resgates será carregado pela API."
            title="Área do responsável"
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ResponsibleMissions" options={{ title: 'Missões' }}>
        {() => (
          <PlaceholderTab
            emoji="📋"
            helper="Gerenciamento de missões e aprovações entra nas próximas etapas desta fase."
            title="Missões"
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ResponsibleRewards" options={{ title: 'Recompensas' }}>
        {() => (
          <PlaceholderTab
            emoji="🎁"
            helper="Gerenciamento de recompensas será ligado aos dados reais do backend."
            title="Recompensas"
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ResponsibleProfile" options={{ title: 'Perfil' }}>
        {() => (
          <ProfileTab
            familyName={familyName}
            onBackToFamily={() => navigation.navigate('FamilyHub')}
            onLogout={logout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function PlaceholderTab({ emoji, helper, title }: { emoji: string; helper: string; title: string }) {
  return (
    <AppScreen>
      <AppHeader emoji={emoji} subtitle={helper} title={title} />
    </AppScreen>
  );
}

function ProfileTab({
  familyName,
  onBackToFamily,
  onLogout,
}: {
  familyName: string;
  onBackToFamily: () => void;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <AppScreen>
      <AppHeader emoji="🙂" title="Perfil" />

      <Card style={styles.profileCard} variant="highlight">
        <Text style={styles.profileTitle}>Responsável</Text>
        <Text style={styles.profileText}>{familyName}</Text>
      </Card>

      <View style={styles.profileActions}>
        <SecondaryButton label="Voltar para família" onPress={onBackToFamily} />
        <SecondaryButton destructive label="Sair da conta" onPress={onLogout} />
      </View>
    </AppScreen>
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
  const bottomPadding = Math.max(insets.bottom + spacing.sm, spacing.lg);

  return (
    <View style={[styles.tabContainer, { paddingBottom: bottomPadding }]}>
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
  );
}

const styles = StyleSheet.create({
  profileActions: {
    gap: spacing.md,
  },
  profileCard: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  profileText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  profileTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  tabContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
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
