import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput } from 'react-native';
import type { KeyboardAvoidingViewProps } from 'react-native';

import { ChildResponse, MissionResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { ChildPicker } from './components/ChildPicker';
import { FeedbackBanner } from './components/FeedbackBanner';
import { ResponsibleFormSection } from './components/ResponsibleFormSection';
import { responsibleService } from './responsibleService';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleAssignmentForm'>;
type LoadState = 'loading' | 'ready' | 'error';

export function ResponsibleAssignmentFormScreen({ navigation, route }: Props) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const { missionId } = route.params;
  const [mission, setMission] = useState<MissionResponse | null>(null);
  const [children, setChildren] = useState<ChildResponse[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeChildren = useMemo(() => children.filter((child) => child.active), [children]);

  const loadAssignmentData = useCallback(async () => {
    if (!token) {
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    try {
      const [missionResponse, childResponse] = await Promise.all([
        responsibleService.getMission(token, missionId),
        responsibleService.listChildren(token, false),
      ]);
      setMission(missionResponse);
      setChildren(childResponse);
      setError(null);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, [missionId, token]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadAssignmentData();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadAssignmentData]);

  const toggleChild = (childId: string) => {
    setSelectedChildIds((current) =>
      current.includes(childId) ? current.filter((selectedId) => selectedId !== childId) : [...current, childId],
    );
    setError(null);
  };

  const handleAssign = async () => {
    if (!token || submitting || !mission) {
      return;
    }

    if (selectedChildIds.length === 0) {
      setError('Selecione ao menos uma criança.');
      return;
    }

    setSubmitting(true);

    try {
      await responsibleService.assignMission(token, mission.id, {
        childIds: selectedChildIds,
        dueDate: normalizeDueDate(dueDate),
      });
      navigation.navigate('ResponsibleTabs');
    } catch {
      setError('Não conseguimos atribuir a missão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={getResponsibleAssignmentKeyboardBehavior(Platform.OS)} style={styles.keyboardAvoider}>
      <AppScreen>
        <AppHeader
          action={<SecondaryButton label="Cancelar" onPress={navigation.goBack} />}
          emoji="📋"
          subtitle={mission ? mission.title : 'Escolha as crianças para esta missão.'}
          title="Atribuir missão"
        />

        {loadState === 'loading' ? (
          <Card style={styles.stateCard} variant="highlight">
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.stateTitle}>Carregando atribuição...</Text>
          </Card>
        ) : null}

        {loadState === 'error' ? (
          <Card style={styles.stateCard}>
            <Text style={styles.stateEmoji}>🛟</Text>
            <Text style={styles.stateTitle}>Não conseguimos carregar a missão.</Text>
            <SecondaryButton label="Tentar novamente" onPress={loadAssignmentData} />
          </Card>
        ) : null}

        {loadState === 'ready' && mission ? (
          <Card style={styles.form}>
            {error ? <FeedbackBanner title={error} variant="error" /> : null}
            <ResponsibleFormSection
              helper={`${mission.coinValue} moedas · ${mission.requiresApproval ? 'precisa de aprovação' : 'crédito automático'}`}
              title="Quem deve fazer?"
            >
              <ChildPicker childrenOptions={activeChildren} onToggle={toggleChild} selectedIds={selectedChildIds} />
            </ResponsibleFormSection>

            <ResponsibleFormSection helper="Use o formato AAAA-MM-DD ou deixe em branco." title="Prazo opcional">
              <TextInput
                accessibilityLabel="Data limite opcional"
                onChangeText={setDueDate}
                placeholder="2026-06-10"
                style={styles.input}
                value={dueDate}
              />
            </ResponsibleFormSection>

            <PrimaryButton
              disabled={submitting}
              label={submitting ? 'Atribuindo missão' : 'Atribuir missão'}
              loading={submitting}
              onPress={handleAssign}
            />
          </Card>
        ) : null}
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

function normalizeDueDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getResponsibleAssignmentKeyboardBehavior(platformOS: string): KeyboardAvoidingViewProps['behavior'] {
  return platformOS === 'ios' ? 'padding' : 'height';
}

const styles = StyleSheet.create({
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
