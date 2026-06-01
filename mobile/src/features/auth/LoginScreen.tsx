import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Card, PrimaryButton, SecondaryButton, StatusBadge } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';

import { useAuth } from './AuthContext';

export function LoginScreen() {
  const { errorMessage, login, retryRestore, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isLoading = status === 'loading';
  const showRetry = status === 'error' && Boolean(errorMessage);

  async function handleSubmit() {
    if (isLoading) {
      return;
    }

    await login(email.trim(), password);
  }

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Habitinhos</Text>
          <Text style={styles.headline}>Transforme tarefas em pequenas conquistas</Text>
          <Text style={styles.supporting}>Entre para acompanhar missões, moedas e recompensas da família.</Text>
        </View>

        <Card style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              accessibilityLabel="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="voce@email.com"
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              accessibilityLabel="Senha"
              onChangeText={setPassword}
              placeholder="Sua senha"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <PrimaryButton
            label={isLoading ? 'Entrando...' : 'Entrar na conta'}
            loading={isLoading}
            onPress={handleSubmit}
          />

          {showRetry ? <SecondaryButton label="Tentar novamente" onPress={retryRestore} /> : null}
        </Card>

        <StatusBadge emoji="🪙" label="Missões, moedas e recompensas em família" variant="selected" />
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
  },
  brand: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  headline: {
    ...typography.display,
    color: colors.textPrimary,
  },
  supporting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
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
});
