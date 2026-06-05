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
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';

import { useAuth } from './AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthRegister'>;

export function RegisterScreen({ navigation }: Props) {
  const { errorMessage, register, status } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [responsiblePin, setResponsiblePin] = useState('');
  const isLoading = status === 'loading';
  const registrationErrorMessage = isSessionRecoveryMessage(errorMessage) ? null : errorMessage;

  async function handleSubmit() {
    if (isLoading) {
      return;
    }

    await register({
      name: name.trim(),
      email: email.trim(),
      password,
      familyName: familyName.trim(),
      responsiblePin,
    });
  }

  return (
    <KeyboardAvoidingView behavior={getRegisterKeyboardBehavior(Platform.OS)} style={styles.keyboardAvoider}>
      <AppScreen>
        <View style={styles.content}>
          <Card style={styles.form}>
            <View style={styles.hero}>
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.copy}>Informe seus dados para criar a família no Habitinhos.</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                accessibilityLabel="Nome"
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={name}
              />
            </View>

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
              <TextInput
                accessibilityLabel="Senha"
                onChangeText={setPassword}
                placeholder="Crie uma senha"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nome da família</Text>
              <TextInput
                accessibilityLabel="Nome da família"
                autoCapitalize="words"
                onChangeText={setFamilyName}
                placeholder="Família Silva"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={familyName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PIN do responsável</Text>
              <TextInput
                accessibilityLabel="PIN do responsável"
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={(value) => setResponsiblePin(value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4 dígitos"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={styles.input}
                value={responsiblePin}
              />
              <Text style={styles.helper}>Use este PIN para entrar na gestão da família a partir do modo criança.</Text>
            </View>

            {registrationErrorMessage ? <Text style={styles.error}>{registrationErrorMessage}</Text> : null}

            <PrimaryButton
              label={isLoading ? 'Criando conta...' : 'Criar conta'}
              loading={isLoading}
              onPress={handleSubmit}
            />
            <SecondaryButton
              disabled={isLoading}
              label="Já tenho conta"
              onPress={() => navigation.navigate('AuthLogin')}
            />
          </Card>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

export function getRegisterKeyboardBehavior(platformOS: string): KeyboardAvoidingViewProps['behavior'] {
  return platformOS === 'ios' ? 'padding' : 'height';
}

function isSessionRecoveryMessage(message: string | null): boolean {
  if (!message) {
    return false;
  }

  return (
    message === 'Sua sessao terminou. Entre novamente para continuar.' ||
    message === 'Sua sessão terminou. Entre novamente para continuar.'
  );
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
  helper: {
    ...typography.body,
    color: colors.textMuted,
  },
});
