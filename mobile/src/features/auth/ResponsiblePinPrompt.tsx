import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '../../api/types';
import { Card, PrimaryButton, SecondaryButton } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';

import { authService } from './authService';

type ResponsiblePinPromptProps = {
  token: string | null;
  onCancel: () => void;
  onVerified: () => void;
};

export function ResponsiblePinPrompt({ onCancel, onVerified, token }: ResponsiblePinPromptProps) {
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

      <TextInput
        accessibilityLabel="PIN do responsável"
        keyboardType="number-pad"
        maxLength={4}
        onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 4))}
        placeholder="0000"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        style={styles.input}
        value={pin}
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
