import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton, SecureTextInput } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';
import { authService } from '../auth/authService';

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
  const [deleteConfirmationToken, setDeleteConfirmationToken] = useState('');
  const [deleteStep, setDeleteStep] = useState<'password' | 'confirmation'>('password');
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const familyName = session?.family.name ?? 'Família';
  const responsibleName = session?.user.name ?? 'Responsável';
  const responsibleEmail = session?.user.email ?? '';
  const deleting = status === 'loading' && showDeleteForm;
  const requestingDeleteCode = requestingDeletion && showDeleteForm;
  const deleteCodeReady = isValidDeleteCode(deleteConfirmationToken);

  async function handleRequestDeleteConfirmation() {
    if (requestingDeleteCode || !session?.token) {
      return;
    }

    setDeleteErrorMessage(null);
    setRequestingDeletion(true);

    try {
      await authService.requestAccountDeletion(session.token, deletePassword);
      setDeleteStep('confirmation');
    } catch (error) {
      setDeleteErrorMessage(getDeleteAccountErrorMessage(error));
    } finally {
      setRequestingDeletion(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleting) {
      return;
    }

    setDeleteErrorMessage(null);

    try {
      await deleteAccount(deletePassword, deleteConfirmationToken);
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
          <Text style={styles.profileText}>
            Esta ação remove o acesso da conta do responsável. Enviaremos um código para {responsibleEmail}.
          </Text>
          <View style={styles.field}>
            <Text style={styles.cardLabel}>Senha</Text>
            <SecureTextInput
              accessibilityLabel="Senha para excluir conta"
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect={false}
              onChangeText={setDeletePassword}
              placeholder="Sua senha"
              placeholderTextColor={colors.textMuted}
              spellCheck={false}
              style={styles.input}
              value={deletePassword}
              visibilityLabel="senha para excluir conta"
            />
          </View>
          {deleteStep === 'confirmation' ? (
            <View style={styles.field}>
              <Text style={styles.cardLabel}>Código recebido por e-mail</Text>
              <TextInput
                accessibilityLabel="Código para excluir conta"
                autoCapitalize="characters"
                maxLength={6}
                onChangeText={(value) => setDeleteConfirmationToken(formatDeleteCode(value))}
                placeholder="ABC123"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={deleteConfirmationToken}
              />
            </View>
          ) : null}
          {deleteErrorMessage ? <Text style={styles.error}>{deleteErrorMessage}</Text> : null}
          {deleteStep === 'password' ? (
            <PrimaryButton
              disabled={!deletePassword}
              label={requestingDeleteCode ? 'Enviando código...' : 'Enviar código de confirmação'}
              loading={requestingDeleteCode}
              onPress={handleRequestDeleteConfirmation}
            />
          ) : (
            <PrimaryButton
              disabled={!deletePassword || !deleteCodeReady}
              label={deleting ? 'Excluindo...' : 'Excluir minha conta'}
              loading={deleting}
              onPress={handleDeleteAccount}
            />
          )}
          <SecondaryButton
            disabled={deleting || requestingDeleteCode}
            label="Cancelar"
            onPress={() => {
              setShowDeleteForm(false);
              setDeletePassword('');
              setDeleteConfirmationToken('');
              setDeleteStep('password');
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

function formatDeleteCode(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
}

function isValidDeleteCode(value: string): boolean {
  return /^[A-Z0-9]{6}$/.test(value);
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
