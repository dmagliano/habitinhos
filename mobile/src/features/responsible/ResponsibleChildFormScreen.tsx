import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { KeyboardAvoidingViewProps } from 'react-native';

import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { EmojiPicker } from './components/EmojiPicker';
import { ResponsibleFormSection } from './components/ResponsibleFormSection';
import { responsibleService } from './responsibleService';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleChildForm'>;
type LoadState = 'loading' | 'ready' | 'error';

type FormErrors = {
  name?: string;
  age?: string;
};

export function ResponsibleChildFormScreen({ navigation, route }: Props) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const childId = route.params?.childId;
  const isEditMode = Boolean(childId);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [avatarKey, setAvatarKey] = useState('fox');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadState, setLoadState] = useState<LoadState>(isEditMode ? 'loading' : 'ready');
  const [submitting, setSubmitting] = useState(false);

  const title = isEditMode ? 'Editar criança' : 'Nova criança';
  const parsedAge = useMemo(() => Number.parseInt(age, 10), [age]);

  const loadChild = useCallback(async () => {
    if (!token || !childId) {
      return;
    }

    setLoadState('loading');

    try {
      const child = await responsibleService.getChild(token, childId);
      setName(child.name);
      setAge(String(child.age));
      setAvatarKey(child.avatarKey);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, [childId, token]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadTimeout = setTimeout(() => {
      void loadChild();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [isEditMode, loadChild]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Informe o nome da criança.';
    }

    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      nextErrors.age = 'Informe uma idade maior que zero.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting || !token || !validate()) {
      return;
    }

    setSubmitting(true);

    const body = {
      name: name.trim(),
      age: parsedAge,
      avatarKey,
    };

    try {
      if (childId) {
        await responsibleService.updateChild(token, childId, body);
        navigation.navigate('ResponsibleChildDetail', { childId, feedback: 'child-updated' });
        return;
      }

      await responsibleService.createChild(token, body);
      navigation.navigate('ResponsibleChildren', { feedback: 'child-created' });
    } catch {
      setErrors({ name: 'Não conseguimos salvar agora. Tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={getResponsibleFormKeyboardBehavior(Platform.OS)} style={styles.keyboardAvoider}>
      <AppScreen>
        <AppHeader
          action={<SecondaryButton label="Cancelar" onPress={navigation.goBack} />}
          emoji="⭐"
          subtitle="Dados usados nas missões, moedas e recompensas da família."
          title={title}
        />

        {loadState === 'loading' ? (
          <Card style={styles.stateCard} variant="highlight">
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.stateTitle}>Carregando criança...</Text>
          </Card>
        ) : null}

        {loadState === 'error' ? (
          <Card style={styles.stateCard}>
            <Text style={styles.stateEmoji}>🛟</Text>
            <Text style={styles.stateTitle}>Não conseguimos carregar esta criança.</Text>
            <SecondaryButton label="Tentar novamente" onPress={loadChild} />
          </Card>
        ) : null}

        {loadState === 'ready' ? (
          <Card style={styles.form}>
            <ResponsibleFormSection helper="Use o nome que a família reconhece no dia a dia." title="Perfil">
              <View style={styles.field}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  accessibilityLabel="Nome"
                  autoCapitalize="words"
                  onChangeText={setName}
                  placeholder="Nome da criança"
                  style={styles.input}
                  value={name}
                />
                {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Idade</Text>
                <TextInput
                  accessibilityLabel="Idade"
                  keyboardType="number-pad"
                  onChangeText={setAge}
                  placeholder="Idade"
                  style={styles.input}
                  value={age}
                />
                {errors.age ? <Text style={styles.error}>{errors.age}</Text> : null}
              </View>
            </ResponsibleFormSection>

            <ResponsibleFormSection helper="Escolha um avatar simples para identificar a criança." title="Avatar">
              <EmojiPicker onSelect={setAvatarKey} selectedKey={avatarKey} />
            </ResponsibleFormSection>

            <PrimaryButton
              disabled={submitting}
              label={submitting ? 'Salvando criança' : 'Salvar criança'}
              loading={submitting}
              onPress={handleSubmit}
            />
          </Card>
        ) : null}
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

export function getResponsibleFormKeyboardBehavior(platformOS: string): KeyboardAvoidingViewProps['behavior'] {
  return platformOS === 'ios' ? 'padding' : 'height';
}

const styles = StyleSheet.create({
  error: {
    ...typography.body,
    color: colors.error,
  },
  field: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.lg,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  keyboardAvoider: {
    flex: 1,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  stateCard: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stateEmoji: {
    fontSize: 28,
  },
  stateTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
