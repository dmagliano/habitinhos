import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../../api/types';
import { Card, PrimaryButton, SecondaryButton, SecureTextInput } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';

import { authService } from './authService';

type ResponsiblePinPromptProps = {
  token: string | null;
  onCancel: () => void;
  onForgotPin?: () => void;
  onVerified: () => void;
};

export function ResponsiblePinPrompt({ onCancel, onForgotPin, onVerified, token }: ResponsiblePinPromptProps) {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!token || submitting) {
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setErrorMessage('Informe o PIN de 4 dígitos.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await authService.verifyResponsiblePin(token, pin);
      setPin('');
      onVerified();
    } catch (error) {
      setErrorMessage(getPinErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={styles.card} variant="highlight">
      <View style={styles.copy}>
        <Text style={styles.title}>PIN do responsável</Text>
        <Text style={styles.helper}>Informe o PIN de 4 dígitos para gerenciar a família.</Text>
      </View>

      <SecureTextInput
        accessibilityLabel="PIN do responsável"
        autoComplete="off"
        keyboardType="number-pad"
        maxLength={4}
        onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 4))}
        placeholder="0000"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, styles.centeredSecureInput]}
        value={pin}
        visibilityLabel="PIN do responsável"
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <PrimaryButton
          disabled={!token || submitting}
          label={submitting ? 'Verificando PIN' : 'Confirmar PIN'}
          loading={submitting}
          onPress={submit}
        />
        <SecondaryButton disabled={submitting} label="Cancelar" onPress={onCancel} />
        {onForgotPin ? (
          <SecondaryButton disabled={submitting} label="Esqueci meu PIN" onPress={onForgotPin} />
        ) : null}
      </View>
    </Card>
  );
}

function getPinErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não conseguimos verificar o PIN. Tente novamente.';
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  copy: {
    gap: spacing.xs,
  },
  centeredSecureInput: {
    paddingLeft: 88,
  },
  error: {
    ...typography.body,
    color: colors.error,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
  },
  input: {
    ...typography.display,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
