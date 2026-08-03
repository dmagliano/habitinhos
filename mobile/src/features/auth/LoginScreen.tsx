import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { KeyboardAvoidingViewProps } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppScreen, Card, PrimaryButton, SecondaryButton, SecureTextInput, StatusBadge } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';

import { useAuth } from './AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthLogin'>;

export function LoginScreen({ navigation }: Partial<Props> = {}) {
  const { errorMessage, login, retryRestore, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(false);
  const isLoading = status === 'loading';
  const showRetry = status === 'error' && Boolean(errorMessage);

  async function handleSubmit() {
    if (isLoading) {
      return;
    }

    await login(email.trim(), password, rememberSession);
  }

  return (
    <KeyboardAvoidingView behavior={getLoginKeyboardBehavior(Platform.OS)} style={styles.keyboardAvoider}>
      <AppScreen>
        <View style={styles.content}>
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
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <SecureTextInput
                accessibilityLabel="Senha"
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect={false}
                onChangeText={setPassword}
                placeholder="Sua senha"
                placeholderTextColor={colors.textMuted}
                spellCheck={false}
                style={styles.input}
                value={password}
                visibilityLabel="senha"
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={() => navigation?.navigate('AuthPasswordReset')}
              style={({ pressed }) => [styles.forgotButton, pressed && styles.forgotButtonPressed]}
            >
              <Text style={styles.forgotLabel}>Esqueci minha senha</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Mantenha-me conectado"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberSession }}
              disabled={isLoading}
              onPress={() => setRememberSession((current) => !current)}
              style={({ pressed }) => [
                styles.rememberRow,
                pressed && styles.rememberRowPressed,
                isLoading && styles.rememberRowDisabled,
              ]}
            >
              <View style={[styles.checkbox, rememberSession && styles.checkboxChecked]}>
                {rememberSession ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </View>
              <Text style={styles.rememberLabel}>Mantenha-me conectado</Text>
            </Pressable>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <PrimaryButton
              label={isLoading ? 'Entrando...' : 'Entrar na conta'}
              loading={isLoading}
              onPress={handleSubmit}
            />

            {showRetry ? <SecondaryButton label="Tentar novamente" onPress={retryRestore} /> : null}
          </Card>

          <StatusBadge emoji="🪙" label="Missões, moedas e recompensas em família" variant="selected" />
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

export function getLoginKeyboardBehavior(platformOS: string): KeyboardAvoidingViewProps['behavior'] {
  return platformOS === 'ios' ? 'padding' : 'height';
}

const styles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  content: {
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
  rememberRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
  },
  rememberRowPressed: {
    opacity: 0.82,
  },
  rememberRowDisabled: {
    opacity: 0.56,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxMark: {
    ...typography.label,
    color: colors.textInverse,
    lineHeight: 20,
  },
  rememberLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  error: {
    ...typography.body,
    color: colors.error,
  },
  forgotButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    minHeight: 40,
    justifyContent: 'center',
  },
  forgotButtonPressed: {
    opacity: 0.72,
  },
  forgotLabel: {
    ...typography.label,
    color: colors.primaryDark,
  },
});
