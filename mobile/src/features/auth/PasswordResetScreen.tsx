import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { KeyboardAvoidingViewProps } from 'react-native';

import { ApiError } from '../../api/types';
import { AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';

import { authService } from './authService';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthPasswordReset'>;

type ResetStep = 'request' | 'confirm' | 'done';

export function PasswordResetScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<ResetStep>('request');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function requestReset() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      await authService.requestPasswordReset(email.trim());
      setStep('confirm');
      setMessage('Enviamos as instruções para o e-mail informado.');
    } catch (error) {
      setErrorMessage(getResetErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmReset() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      await authService.confirmPasswordReset(resetToken, newPassword);
      setStep('done');
      setMessage('Senha atualizada. Você já pode entrar com a nova senha.');
    } catch (error) {
      setErrorMessage(getResetErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={getPasswordResetKeyboardBehavior(Platform.OS)} style={styles.keyboardAvoider}>
      <AppScreen>
        <View style={styles.content}>
          <Card style={styles.form}>
            <View style={styles.hero}>
              <Text style={styles.title}>Recuperar senha</Text>
              <Text style={styles.copy}>Informe o e-mail da conta para receber o código de redefinição.</Text>
            </View>

            {step === 'request' ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    accessibilityLabel="E-mail"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="voce@email.com"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={email}
                  />
                </View>

                <PrimaryButton
                  disabled={!email.trim()}
                  label={submitting ? 'Enviando...' : 'Enviar instruções'}
                  loading={submitting}
                  onPress={requestReset}
                />
              </>
            ) : null}

            {step === 'confirm' ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Código recebido</Text>
                  <TextInput
                    accessibilityLabel="Código recebido"
                    autoCapitalize="characters"
                    onChangeText={(value) => setResetToken(normalizeResetCode(value))}
                    placeholder="ABC123"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={resetToken}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Nova senha</Text>
                  <TextInput
                    accessibilityLabel="Nova senha"
                    onChangeText={setNewPassword}
                    placeholder="Nova senha"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    style={styles.input}
                    value={newPassword}
                  />
                </View>

                <PrimaryButton
                  disabled={!isValidResetCode(resetToken) || newPassword.length < 8}
                  label={submitting ? 'Salvando...' : 'Salvar nova senha'}
                  loading={submitting}
                  onPress={confirmReset}
                />
              </>
            ) : null}

            {message ? <Text style={styles.success}>{message}</Text> : null}
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <SecondaryButton
              disabled={submitting}
              label={step === 'done' ? 'Entrar' : 'Voltar'}
              onPress={() => navigation.navigate('AuthLogin')}
            />
          </Card>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

export function getPasswordResetKeyboardBehavior(platformOS: string): KeyboardAvoidingViewProps['behavior'] {
  return platformOS === 'ios' ? 'padding' : 'height';
}

function getResetErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage;
  }

  return 'Não conseguimos concluir esta ação. Tente novamente.';
}

function normalizeResetCode(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
}

function isValidResetCode(value: string): boolean {
  return /^[A-Z0-9]{6}$/.test(value);
}

const styles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  hero: {
    gap: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
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
  success: {
    ...typography.body,
    color: colors.success,
  },
});
