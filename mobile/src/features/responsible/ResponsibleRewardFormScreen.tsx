import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { KeyboardAvoidingViewProps } from 'react-native';

import { RewardRequest } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { CoinValueControl } from './components/CoinValueControl';
import { ConfirmActionSheet } from './components/ConfirmActionSheet';
import { ResponsibleFormSection } from './components/ResponsibleFormSection';
import { responsibleService } from './responsibleService';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleRewardForm'>;
type LoadState = 'loading' | 'ready' | 'error';

type FormErrors = {
  title?: string;
  cost?: string;
};

export function ResponsibleRewardFormScreen({ navigation, route }: Props) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const rewardId = route.params?.rewardId;
  const isEditMode = Boolean(rewardId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('1');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadState, setLoadState] = useState<LoadState>(isEditMode ? 'loading' : 'ready');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeactivateVisible, setConfirmDeactivateVisible] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const parsedCost = useMemo(() => Number.parseInt(cost, 10), [cost]);

  const loadReward = useCallback(async () => {
    if (!token || !rewardId) {
      return;
    }

    setLoadState('loading');

    try {
      const reward = await responsibleService.getReward(token, rewardId);
      setTitle(reward.title);
      setDescription(reward.description ?? '');
      setCost(String(reward.cost));
      setConfirmDeactivateVisible(false);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, [rewardId, token]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadTimeout = setTimeout(() => {
      void loadReward();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [isEditMode, loadReward]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = 'Informe o nome da recompensa.';
    }

    if (!Number.isFinite(parsedCost) || parsedCost < 1) {
      nextErrors.cost = 'Informe ao menos 1 moeda.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const rewardBody = (): RewardRequest => ({
    title: title.trim(),
    description: description.trim(),
    cost: parsedCost,
  });

  const handleSubmit = async () => {
    if (!token || submitting || !validate()) {
      return;
    }

    setSubmitting(true);

    try {
      if (rewardId) {
        await responsibleService.updateReward(token, rewardId, rewardBody());
        navigation.navigate('ResponsibleTabs');
        return;
      }

      await responsibleService.createReward(token, rewardBody());
      navigation.navigate('ResponsibleTabs');
    } catch {
      setErrors({ title: 'Não conseguimos salvar a recompensa. Revise as informações e tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!token || !rewardId || deactivating) {
      return;
    }

    setDeactivating(true);

    try {
      await responsibleService.deactivateReward(token, rewardId);
      navigation.navigate('ResponsibleTabs');
    } catch {
      setErrors({ title: 'Não conseguimos desativar agora. Tente novamente.' });
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={getResponsibleRewardFormKeyboardBehavior(Platform.OS)} style={styles.keyboardAvoider}>
      <AppScreen>
        <AppHeader
          action={<SecondaryButton label="Cancelar" onPress={navigation.goBack} />}
          emoji="🎁"
          subtitle="Defina uma recompensa para o catálogo das crianças."
          title={isEditMode ? 'Editar recompensa' : 'Nova recompensa'}
        />

        {loadState === 'loading' ? (
          <Card style={styles.stateCard} variant="highlight">
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.stateTitle}>Carregando recompensa...</Text>
          </Card>
        ) : null}

        {loadState === 'error' ? (
          <Card style={styles.stateCard}>
            <Text style={styles.stateEmoji}>🛟</Text>
            <Text style={styles.stateTitle}>Não conseguimos carregar esta recompensa.</Text>
            <SecondaryButton label="Tentar novamente" onPress={loadReward} />
          </Card>
        ) : null}

        {loadState === 'ready' ? (
          <Card style={styles.form}>
            <ResponsibleFormSection helper="Use um nome curto para a criança reconhecer no catálogo." title="Dados">
              <View style={styles.field}>
                <Text style={styles.label}>Nome da recompensa</Text>
                <TextInput
                  accessibilityLabel="Nome da recompensa"
                  autoCapitalize="sentences"
                  onChangeText={setTitle}
                  placeholder="Cinema em família"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={title}
                />
                {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  accessibilityLabel="Descrição"
                  multiline
                  onChangeText={setDescription}
                  placeholder="Explique o combinado da recompensa"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.textArea]}
                  value={description}
                />
              </View>
            </ResponsibleFormSection>

            <ResponsibleFormSection helper="Custo que será debitado do saldo da criança." title="Custo">
              <CoinValueControl error={errors.cost} onChange={setCost} value={cost} />
            </ResponsibleFormSection>

            <PrimaryButton
              disabled={submitting}
              label={submitting ? 'Salvando recompensa' : 'Salvar recompensa'}
              loading={submitting}
              onPress={handleSubmit}
            />

            {isEditMode ? (
              <SecondaryButton
                destructive
                disabled={deactivating}
                label="Desativar recompensa"
                onPress={() => setConfirmDeactivateVisible(true)}
              />
            ) : null}
          </Card>
        ) : null}

        {loadState === 'ready' && confirmDeactivateVisible ? (
          <ConfirmActionSheet
            body="A recompensa deixa de aparecer para as crianças, mas resgates anteriores continuam no histórico."
            cancelLabel="Cancelar"
            confirmAccessibilityLabel={`Confirmar desativação de ${title || 'recompensa'}`}
            confirmLabel="Desativar"
            loading={deactivating}
            loadingLabel="Desativando recompensa"
            onCancel={() => setConfirmDeactivateVisible(false)}
            onConfirm={handleDeactivate}
            title="Desativar recompensa?"
          />
        ) : null}
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

export function getResponsibleRewardFormKeyboardBehavior(platformOS: string): KeyboardAvoidingViewProps['behavior'] {
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
  textArea: {
    minHeight: 96,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
});
