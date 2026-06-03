import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { KeyboardAvoidingViewProps } from 'react-native';

import { ChildResponse, MissionRequest, MissionResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { ChildPicker } from './components/ChildPicker';
import { CoinValueControl } from './components/CoinValueControl';
import { FeedbackBanner } from './components/FeedbackBanner';
import { ResponsibleFormSection } from './components/ResponsibleFormSection';
import { responsibleService } from './responsibleService';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleMissionForm'>;
type LoadState = 'loading' | 'ready' | 'error';
type Step = 'details' | 'assignment';

type FormErrors = {
  title?: string;
  coinValue?: string;
  assignment?: string;
};

const recurrenceOptions: { label: string; value: MissionRequest['recurrenceType'] }[] = [
  { label: 'Uma vez', value: 'ONCE' },
  { label: 'Diária', value: 'DAILY' },
  { label: 'Semanal', value: 'WEEKLY' },
  { label: 'Personalizada', value: 'CUSTOM' },
];

export function ResponsibleMissionFormScreen({ navigation, route }: Props) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const missionId = route.params?.missionId;
  const isEditMode = Boolean(missionId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coinValue, setCoinValue] = useState('1');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [recurrenceType, setRecurrenceType] = useState<MissionRequest['recurrenceType']>('ONCE');
  const [children, setChildren] = useState<ChildResponse[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [createdMission, setCreatedMission] = useState<MissionResponse | null>(null);
  const [step, setStep] = useState<Step>('details');
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(isEditMode ? 'loading' : 'ready');
  const [submitting, setSubmitting] = useState(false);

  const parsedCoinValue = useMemo(() => Number.parseInt(coinValue, 10), [coinValue]);
  const activeChildren = useMemo(() => children.filter((child) => child.active), [children]);

  const loadInitialData = useCallback(async () => {
    if (!token) {
      setLoadState('error');
      return;
    }

    setLoadState(isEditMode ? 'loading' : 'ready');

    try {
      const [childResponse, mission] = await Promise.all([
        responsibleService.listChildren(token, false),
        missionId ? responsibleService.getMission(token, missionId) : Promise.resolve(null),
      ]);
      setChildren(childResponse);

      if (mission) {
        setTitle(mission.title);
        setDescription(mission.description ?? '');
        setCoinValue(String(mission.coinValue));
        setRequiresApproval(mission.requiresApproval);
        setRecurrenceType(mission.recurrenceType);
      }

      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, [isEditMode, missionId, token]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadInitialData();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadInitialData]);

  const missionBody = (): MissionRequest => ({
    title: title.trim(),
    description: description.trim(),
    coinValue: parsedCoinValue,
    requiresApproval,
    recurrenceType,
  });

  const validateDetails = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = 'Informe o título da missão.';
    }

    if (!Number.isFinite(parsedCoinValue) || parsedCoinValue < 1) {
      nextErrors.coinValue = 'Informe ao menos 1 moeda.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveDetails = async () => {
    if (!token || submitting || !validateDetails()) {
      return;
    }

    setSubmitting(true);

    try {
      if (missionId) {
        await responsibleService.updateMission(token, missionId, missionBody());
        navigation.navigate('ResponsibleTabs');
        return;
      }

      const mission = await responsibleService.createMission(token, missionBody());
      setCreatedMission(mission);
      setFeedback(null);
      setStep('assignment');
    } catch {
      setErrors({ title: 'Não conseguimos salvar a missão. Revise as informações e tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignCreatedMission = async () => {
    if (!token || submitting || !createdMission) {
      return;
    }

    if (selectedChildIds.length === 0) {
      setErrors({ assignment: 'Selecione ao menos uma criança ou volte para atribuir depois.' });
      return;
    }

    setSubmitting(true);

    try {
      await responsibleService.assignMission(token, createdMission.id, {
        childIds: selectedChildIds,
        dueDate: normalizeDueDate(dueDate),
      });
      navigation.navigate('ResponsibleTabs');
    } catch {
      setFeedback('Missão criada. A atribuição ficou pendente; tente atribuir novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChild = (childId: string) => {
    setSelectedChildIds((current) =>
      current.includes(childId) ? current.filter((selectedId) => selectedId !== childId) : [...current, childId],
    );
    setErrors((current) => ({ ...current, assignment: undefined }));
  };

  return (
    <KeyboardAvoidingView behavior={getResponsibleMissionFormKeyboardBehavior(Platform.OS)} style={styles.keyboardAvoider}>
      <AppScreen>
        <AppHeader
          action={<SecondaryButton label="Cancelar" onPress={navigation.goBack} />}
          emoji="📋"
          subtitle={isEditMode ? 'Alterações valem para novas atribuições.' : 'Crie a missão e escolha quem deve fazer.'}
          title={isEditMode ? 'Editar missão' : 'Nova missão'}
        />

        {loadState === 'loading' ? (
          <Card style={styles.stateCard} variant="highlight">
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.stateTitle}>Carregando missão...</Text>
          </Card>
        ) : null}

        {loadState === 'error' ? (
          <Card style={styles.stateCard}>
            <Text style={styles.stateEmoji}>🛟</Text>
            <Text style={styles.stateTitle}>Não conseguimos carregar esta missão.</Text>
            <SecondaryButton label="Tentar novamente" onPress={loadInitialData} />
          </Card>
        ) : null}

        {loadState === 'ready' && step === 'details' ? (
          <MissionDetailsForm
            coinValue={coinValue}
            description={description}
            errors={errors}
            isEditMode={isEditMode}
            onChangeCoinValue={setCoinValue}
            onChangeDescription={setDescription}
            onChangeTitle={setTitle}
            onSelectRecurrence={setRecurrenceType}
            onSubmit={handleSaveDetails}
            recurrenceType={recurrenceType}
            requiresApproval={requiresApproval}
            submitting={submitting}
            title={title}
            toggleApproval={() => setRequiresApproval((current) => !current)}
          />
        ) : null}

        {loadState === 'ready' && step === 'assignment' && createdMission ? (
          <Card style={styles.form}>
            {feedback ? <FeedbackBanner title={feedback} variant="warning" /> : null}
            <ResponsibleFormSection
              helper={`${createdMission.title} · ${createdMission.coinValue} moedas · ${
                createdMission.requiresApproval ? 'precisa de aprovação' : 'crédito automático'
              }`}
              title="Quem deve fazer?"
            >
              <ChildPicker childrenOptions={activeChildren} onToggle={toggleChild} selectedIds={selectedChildIds} />
              {errors.assignment ? <Text style={styles.error}>{errors.assignment}</Text> : null}
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
              onPress={handleAssignCreatedMission}
            />
            <SecondaryButton label="Atribuir depois" onPress={() => navigation.navigate('ResponsibleTabs')} />
          </Card>
        ) : null}
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

function MissionDetailsForm({
  coinValue,
  description,
  errors,
  isEditMode,
  onChangeCoinValue,
  onChangeDescription,
  onChangeTitle,
  onSelectRecurrence,
  onSubmit,
  recurrenceType,
  requiresApproval,
  submitting,
  title,
  toggleApproval,
}: {
  coinValue: string;
  description: string;
  errors: FormErrors;
  isEditMode: boolean;
  onChangeCoinValue: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onSelectRecurrence: (value: MissionRequest['recurrenceType']) => void;
  onSubmit: () => void;
  recurrenceType: MissionRequest['recurrenceType'];
  requiresApproval: boolean;
  submitting: boolean;
  title: string;
  toggleApproval: () => void;
}) {
  return (
    <Card style={styles.form}>
      {isEditMode ? (
        <FeedbackBanner
          message="Missões já atribuídas mantêm o registro anterior."
          title="Alterações valem para novas atribuições."
          variant="warning"
        />
      ) : null}

      <ResponsibleFormSection helper="Use um título claro para a criança entender a tarefa." title="Dados da missão">
        <View style={styles.field}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            accessibilityLabel="Título"
            autoCapitalize="sentences"
            onChangeText={onChangeTitle}
            placeholder="Arrumar a cama"
            style={styles.input}
            value={title}
          />
          {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            accessibilityLabel="Descrição opcional"
            multiline
            onChangeText={onChangeDescription}
            placeholder="Detalhe o combinado da família"
            style={[styles.input, styles.textArea]}
            value={description}
          />
        </View>
      </ResponsibleFormSection>

      <ResponsibleFormSection helper="A frequência orienta como a família enxerga a missão." title="Frequência">
        <View style={styles.segmented}>
          {recurrenceOptions.map((option) => (
            <Pressable
              accessibilityLabel={`Selecionar frequência ${option.label}`}
              accessibilityRole="button"
              key={option.value}
              onPress={() => onSelectRecurrence(option.value)}
              style={[styles.segment, recurrenceType === option.value && styles.segmentSelected]}
            >
              <Text style={[styles.segmentLabel, recurrenceType === option.value && styles.segmentLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ResponsibleFormSection>

      <ResponsibleFormSection helper="Defina quanto a criança ganha ao concluir." title="Moedas">
        <CoinValueControl error={errors.coinValue} onChange={onChangeCoinValue} value={coinValue} />
      </ResponsibleFormSection>

      <ResponsibleFormSection
        helper="Com aprovação, a criança envia para revisão. Sem aprovação, o crédito é automático."
        title="Precisa aprovar antes de pagar moedas?"
      >
        <Pressable
          accessibilityLabel="Alternar exigência de aprovação"
          accessibilityRole="switch"
          accessibilityState={{ checked: requiresApproval }}
          onPress={toggleApproval}
          style={[styles.approvalToggle, requiresApproval && styles.approvalToggleSelected]}
        >
          <Text style={styles.toggleTitle}>{requiresApproval ? 'Sim, revisar antes' : 'Não, creditar automático'}</Text>
          <Text style={styles.toggleHelper}>
            {requiresApproval
              ? 'A missão entra na fila de aprovações.'
              : 'As moedas entram quando a criança concluir.'}
          </Text>
        </Pressable>
      </ResponsibleFormSection>

      <PrimaryButton
        disabled={submitting}
        label={submitting ? 'Salvando missão' : 'Salvar missão'}
        loading={submitting}
        onPress={onSubmit}
      />
    </Card>
  );
}

function normalizeDueDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getResponsibleMissionFormKeyboardBehavior(platformOS: string): KeyboardAvoidingViewProps['behavior'] {
  return platformOS === 'ios' ? 'padding' : 'height';
}

const styles = StyleSheet.create({
  approvalToggle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  approvalToggleSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
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
  segmented: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segment: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  segmentLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  segmentLabelSelected: {
    color: colors.primaryDark,
  },
  segmentSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
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
  toggleHelper: {
    ...typography.body,
    color: colors.textSecondary,
  },
  toggleTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
});
