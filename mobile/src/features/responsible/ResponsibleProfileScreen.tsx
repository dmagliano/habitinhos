import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, AppScreen, Card, SecondaryButton } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

type ResponsibleProfileScreenProps = {
  hasActiveChild?: boolean;
  onLogout: () => void | Promise<void>;
  onReturnToChild: () => void;
};

export function ResponsibleProfileScreen({
  hasActiveChild = false,
  onLogout,
  onReturnToChild,
}: ResponsibleProfileScreenProps) {
  const { session } = useAuth();
  const familyName = session?.family.name ?? 'Família';
  const responsibleName = session?.user.name ?? 'Responsável';
  const responsibleEmail = session?.user.email ?? '';

  return (
    <AppScreen>
      <AppHeader emoji="🙂" subtitle="Conta e modo de uso da família." title="Perfil" />

      <Card style={styles.profileCard} variant="highlight">
        <Text style={styles.cardLabel}>Responsável</Text>
        <Text style={styles.profileTitle}>{responsibleName}</Text>
        {responsibleEmail ? <Text style={styles.profileText}>{responsibleEmail}</Text> : null}
      </Card>

      <Card style={styles.profileCard}>
        <Text style={styles.cardLabel}>Família ativa</Text>
        <Text style={styles.profileTitle}>{familyName}</Text>
        <Text style={styles.profileText}>Você está gerenciando a família.</Text>
      </Card>

      <View style={styles.profileActions}>
        <SecondaryButton
          label={hasActiveChild ? 'Voltar para o modo criança' : 'Escolher criança'}
          onPress={onReturnToChild}
        />
        <SecondaryButton destructive label="Sair da conta" onPress={onLogout} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  profileActions: {
    gap: spacing.md,
  },
  profileCard: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  profileText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  profileTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
