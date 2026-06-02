import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, AppScreen, Card, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyHub'>;

export function FamilyHubScreen({ navigation }: Props) {
  const { logout, session } = useAuth();
  const familyName = session?.family.name ?? 'sua família';

  return (
    <AppScreen>
      <AppHeader
        action={<SecondaryButton destructive label="Sair" onPress={logout} />}
        emoji="👨‍👩‍👧"
        subtitle={`Você está na família ${familyName}.`}
        title="Escolha como quer entrar"
      />

      <View style={styles.options}>
        <RoleCard
          description="Acompanhe missões, crianças e recompensas quando a área estiver pronta."
          emoji="🧭"
          label="Sou responsável"
          onPress={() => navigation.navigate('ResponsibleStub')}
        />
        <RoleCard
          description="Escolha um perfil para brincar com as missões da família."
          emoji="⭐"
          label="Sou criança"
          onPress={() => navigation.navigate('ChildProfileSelect')}
        />
      </View>

      <SecondaryButton destructive label="Sair da conta" onPress={logout} />
    </AppScreen>
  );
}

function RoleCard({ description, emoji, label, onPress }: { description: string; emoji: string; label: string; onPress: () => void }) {
  return (
    <Card accessibilityLabel={label} onPress={onPress} variant="highlight">
      <View style={styles.roleHeader}>
        <Text style={styles.roleEmoji}>{emoji}</Text>
        <Text style={styles.roleTitle}>{label}</Text>
      </View>
      <Text style={styles.roleDescription}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  roleDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
