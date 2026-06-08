import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
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
  const { deleteAccount, session, status } = useAuth();
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const familyName = session?.family.name ?? 'Família';
  const responsibleName = session?.user.name ?? 'Responsável';
  const responsibleEmail = session?.user.email ?? '';
  const deleting = status === 'loading' && showDeleteForm;

  async function handleDeleteAccount() {
    if (deleting) {
      return;
    }

    setDeleteErrorMessage(null);

    try {
      await deleteAccount(deletePassword);
    } catch (error) {
      setDeleteErrorMessage(getDeleteAccountErrorMessage(error));
    }
  }

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
        <SecondaryButton destructive label="Excluir conta" onPress={() => setShowDeleteForm(true)} />
      </View>

      {showDeleteForm ? (
        <Card style={styles.deleteCard}>
          <Text style={styles.deleteTitle}>Excluir conta</Text>
          <Text style={styles.profileText}>Esta ação remove o acesso da conta do responsável.</Text>
          <View style={styles.field}>
            <Text style={styles.cardLabel}>Senha</Text>
            <TextInput
              accessibilityLabel="Senha para excluir conta"
              onChangeText={setDeletePassword}
              placeholder="Sua senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={deletePassword}
            />
          </View>
          {deleteErrorMessage ? <Text style={styles.error}>{deleteErrorMessage}</Text> : null}
          <PrimaryButton
            disabled={!deletePassword}
            label={deleting ? 'Excluindo...' : 'Excluir minha conta'}
            loading={deleting}
            onPress={handleDeleteAccount}
          />
          <SecondaryButton
            disabled={deleting}
            label="Cancelar"
            onPress={() => {
              setShowDeleteForm(false);
              setDeletePassword('');
              setDeleteErrorMessage(null);
            }}
          />
        </Card>
      ) : null}
    </AppScreen>
  );
}

function getDeleteAccountErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage;
  }

  return 'Não conseguimos excluir a conta. Tente novamente.';
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
  deleteCard: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  deleteTitle: {
    ...typography.heading,
    color: colors.error,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  error: {
    ...typography.body,
    color: colors.error,
  },
});
