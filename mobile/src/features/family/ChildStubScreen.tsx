import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { AppHeader, AppScreen, Card, SecondaryButton, StatusBadge } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ChildStub'>;

export function ChildStubScreen({ navigation }: Props) {
  const { logout } = useAuth();

  return (
    <AppScreen>
      <AppHeader action={<SecondaryButton destructive label="Sair" onPress={logout} />} emoji="⭐" title="Área da criança" />
      <Card style={styles.card}>
        <StatusBadge emoji="🌱" label="Quase pronto" variant="selected" />
        <Text style={styles.title}>Área da criança</Text>
        <Text style={styles.copy}>Logo as missões e recompensas da família aparecem aqui.</Text>
      </Card>
      <SecondaryButton label="Trocar modo" onPress={() => navigation.navigate('FamilyHub')} />
      <SecondaryButton destructive label="Sair da conta" onPress={logout} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
