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
import { AppScreen, Card, PrimaryButton, SecondaryButton, SecureTextInput } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';

import { useAuth } from './AuthContext';
import { authService } from './authService';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsiblePinReset'>;

type ResetStep = 'request' | 'confirm' | 'done';

export function ResponsiblePinResetScreen({ navigation }: Props) {
  const { session } = useAuth();
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [step, setStep] = useState<ResetStep>('request');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasPinMismatch = confirmNewPin.length > 0 && confirmNewPin !== newPin;
  const hasValidPinConfirmation = /^\d{4}$/.test(newPin) && confirmNewPin === newPin;

  async function requestReset() {
    if (!session?.token || submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      await authService.requestResponsiblePinReset(session.token, password);
      setStep('confirm');
      setMessage('Enviamos o código para o e-mail da conta.');
    } catch (error) {
      setErrorMessage(getPinResetErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmReset() {
    if (!session?.token || submitting || !hasValidPinConfirmation) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      await authService.confirmResponsiblePinReset(session.token, resetToken, newPin);
      setStep('done');
      setMessage('PIN atualizado.');
    } catch (error) {
      setErrorMessage(getPinResetErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={getResponsiblePinResetKeyboardBehavior(Platform.OS)} style={styles.keyboardAvoider}>
      <AppScreen>
        <View style={styles.content}>
          <Card style={styles.form}>
            <View style={styles.hero}>
              <Text style={styles.title}>Recuperar PIN</Text>
              <Text style={styles.copy}>Confirme sua senha para receber o código de redefinição.</Text>
            </View>

            {step === 'request' ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Senha da conta</Text>
                  <TextInput
                    accessibilityLabel="Senha da conta"
                    onChangeText={setPassword}
                    placeholder="Sua senha"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    style={styles.input}
                    value={password}
                  />
                </View>

                <PrimaryButton
                  disabled={!password || !session?.token}
                  label={submitting ? 'Enviando...' : 'Enviar código'}
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
                  <Text style={styles.label}>Novo PIN</Text>
                  <SecureTextInput
                    accessibilityLabel="Novo PIN"
                    autoComplete="off"
                    keyboardType="number-pad"
                    maxLength={4}
                    onChangeText={(value) => setNewPin(value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="4 dígitos"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={newPin}
                    visibilityLabel="novo PIN"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Confirmar novo PIN</Text>
                  <SecureTextInput
                    accessibilityLabel="Confirmar novo PIN"
                    autoComplete="off"
                    keyboardType="number-pad"
                    maxLength={4}
                    onChangeText={(value) => setConfirmNewPin(value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Digite o PIN novamente"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={confirmNewPin}
                    visibilityLabel="confirmação do novo PIN"
                  />
                  {hasPinMismatch ? <Text style={styles.error}>Os PINs precisam ser iguais.</Text> : null}
                  {hasValidPinConfirmation ? <Text style={styles.success}>✓ PINs válidos e iguais.</Text> : null}
                </View>

                <PrimaryButton
                  disabled={!isValidResetCode(resetToken) || !hasValidPinConfirmation}
                  label={submitting ? 'Salvando...' : 'Salvar novo PIN'}
                  loading={submitting}
                  onPress={confirmReset}
                />
              </>
            ) : null}

            {message ? <Text style={styles.success}>{message}</Text> : null}
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <SecondaryButton
              disabled={submitting}
              label={step === 'done' ? 'Concluir' : 'Voltar'}
              onPress={() => navigation.goBack()}
            />
          </Card>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

export function getResponsiblePinResetKeyboardBehavior(platformOS: string): KeyboardAvoidingViewProps['behavior'] {
  return platformOS === 'ios' ? 'padding' : 'height';
}

function getPinResetErrorMessage(error: unknown): string {
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
