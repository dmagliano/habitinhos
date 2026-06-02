import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, AppScreen, Card, EmojiAvatar, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { ChildHomeScreen } from './ChildHomeScreen';
import { ChildMissionsScreen } from './ChildMissionsScreen';
import { BottomTabBar } from './components/BottomTabBar';

type ChildTabParamList = {
  ChildHome: undefined;
  ChildMissions: undefined;
  ChildRewards: undefined;
  ChildProfile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ChildTabs'>;

const Tab = createBottomTabNavigator<ChildTabParamList>();

export function ChildTabsScreen({ navigation, route }: Props) {
  const { child } = route.params;
  const { logout, session } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="ChildHome"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="ChildHome" options={{ title: 'Início' }}>
        {({ navigation: tabNavigation }) => (
          <ChildHomeScreen
            child={child}
            onOpenMissions={() => tabNavigation.navigate('ChildMissions')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ChildMissions" options={{ title: 'Missões' }}>
        {() => (
          <ChildMissionsScreen
            child={child}
            onOpenMissionDetail={(mission) =>
              navigation.navigate('ChildMissionDetail', { child, mission })
            }
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ChildRewards" options={{ title: 'Recompensas' }}>
        {() => (
          <PlaceholderTab
            body="As recompensas da família entram aqui depois da tela de missões."
            emoji="🎁"
            title="Recompensas"
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ChildProfile" options={{ title: 'Perfil' }}>
        {() => (
          <ProfileTab
            childName={child.name}
            familyName={session?.family.name}
            avatarKey={child.avatarKey}
            onBackToFamily={() => navigation.navigate('FamilyHub')}
            onLogout={logout}
            onSwitchChild={() => navigation.navigate('ChildProfileSelect')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function PlaceholderTab({ body, emoji, title }: { body: string; emoji: string; title: string }) {
  return (
    <AppScreen>
      <AppHeader emoji={emoji} title={title} />
      <Card style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Tudo no tempo certo</Text>
        <Text style={styles.placeholderBody}>{body}</Text>
      </Card>
    </AppScreen>
  );
}

function ProfileTab({
  avatarKey,
  childName,
  familyName,
  onBackToFamily,
  onLogout,
  onSwitchChild,
}: {
  avatarKey: string;
  childName: string;
  familyName?: string;
  onBackToFamily: () => void;
  onLogout: () => void | Promise<void>;
  onSwitchChild: () => void;
}) {
  return (
    <AppScreen>
      <AppHeader emoji="🙂" title="Perfil" />

      <Card style={styles.profileCard} variant="highlight">
        <View style={styles.profileHeader}>
          <EmojiAvatar emoji={getAvatarEmoji(avatarKey)} label={childName} size="xl" />
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{childName}</Text>
            {familyName ? <Text style={styles.familyName}>{familyName}</Text> : null}
          </View>
        </View>
      </Card>

      <View style={styles.profileActions}>
        <SecondaryButton label="Trocar criança" onPress={onSwitchChild} />
        <SecondaryButton label="Voltar para família" onPress={onBackToFamily} />
        <SecondaryButton destructive label="Sair da conta" onPress={onLogout} />
      </View>
    </AppScreen>
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
  placeholderCard: {
    gap: spacing.sm,
  },
  placeholderTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  placeholderBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  profileCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  profileName: {
    ...typography.display,
    color: colors.textPrimary,
  },
  familyName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  profileActions: {
    gap: spacing.md,
  },
});
