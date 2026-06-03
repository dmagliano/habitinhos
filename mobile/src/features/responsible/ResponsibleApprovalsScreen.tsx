import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { AssignedMissionResponse, ChildResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { ApprovalCard } from './components/ApprovalCard';
import { ConfirmActionSheet } from './components/ConfirmActionSheet';
import { EmptyState } from './components/EmptyState';
import { FeedbackBanner } from './components/FeedbackBanner';
import { ResponsibleFormSection } from './components/ResponsibleFormSection';
import { responsibleService } from './responsibleService';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleApprovals'>;
type LoadState = 'loading' | 'ready' | 'error';

export function ResponsibleApprovalsScreen({ navigation }: Props) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [approvals, setApprovals] = useState<AssignedMissionResponse[]>([]);
  const [children, setChildren] = useState<ChildResponse[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [feedback, setFeedback] = useState<{ title: string; variant: 'success' | 'error' } | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AssignedMissionResponse | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const childrenById = useMemo(
    () => new Map(children.map((child) => [child.id, child])),
    [children],
  );

  const loadApprovals = useCallback(async () => {
    if (!token) {
      setApprovals([]);
      setChildren([]);
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    try {
      const [approvalResponse, childResponse] = await Promise.all([
        responsibleService.listPendingApprovals(token),
        responsibleService.listChildren(token, true),
      ]);
      setApprovals(approvalResponse);
      setChildren(childResponse);
      setLoadState('ready');
    } catch {
      setApprovals([]);
      setChildren([]);
      setLoadState('error');
    }
  }, [token]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadApprovals();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadApprovals]);

  const handleApprove = async (approval: AssignedMissionResponse) => {
    if (!token || submittingId) {
      return;
    }

    const childName = childrenById.get(approval.childId)?.name ?? 'criança';
    setSubmittingId(approval.id);

    try {
      await responsibleService.approveAssignedMission(token, approval.id);
      setFeedback({
        title: `Missão aprovada. +${approval.snapshotCoinValue} moedas para ${childName}.`,
        variant: 'success',
      });
      await loadApprovals();
    } catch {
      setFeedback({ title: 'Não conseguimos revisar essa missão. Tente novamente.', variant: 'error' });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async () => {
    if (!token || !rejecting || submittingId) {
      return;
    }

    setSubmittingId(rejecting.id);

    try {
      const reason = rejectReason.trim();
      await responsibleService.rejectAssignedMission(
        token,
        rejecting.id,
        reason ? { reason } : {},
      );
      setFeedback({ title: 'Missão rejeitada.', variant: 'success' });
      setRejecting(null);
      setRejectReason('');
      await loadApprovals();
    } catch {
      setFeedback({ title: 'Não conseguimos revisar essa missão. Tente novamente.', variant: 'error' });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <AppScreen>
      <AppHeader
        action={<SecondaryButton label="Voltar" onPress={navigation.goBack} />}
        emoji="⏳"
        subtitle="Revise conclusões antes de liberar moedas."
        title="Aprovações pendentes"
      />

      {feedback ? <FeedbackBanner title={feedback.title} variant={feedback.variant} /> : null}

      {loadState === 'loading' ? (
        <Card style={styles.stateCard} variant="highlight">
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando aprovações...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar as aprovações.</Text>
          <SecondaryButton label="Tentar novamente" onPress={loadApprovals} />
        </Card>
      ) : null}

      {loadState === 'ready' && approvals.length === 0 ? (
        <EmptyState
          body="As missões enviadas pelas crianças aparecem aqui."
          emoji="✅"
          title="Tudo revisado por enquanto"
        />
      ) : null}

      {loadState === 'ready' && approvals.length > 0 ? (
        <View style={styles.list}>
          {approvals.map((approval) => {
            const childName = childrenById.get(approval.childId)?.name ?? 'Criança';
            const disabled = submittingId === approval.id;

            return (
              <ApprovalCard
                childName={childName}
                coinValue={approval.snapshotCoinValue}
                completedAt={approval.completedAt}
                disabled={disabled}
                key={approval.id}
                missionTitle={approval.snapshotTitle}
                onApprove={() => handleApprove(approval)}
                onReject={() => {
                  setRejecting(approval);
                  setRejectReason('');
                }}
              />
            );
          })}
        </View>
      ) : null}

      {rejecting ? (
        <Card style={styles.rejectCard}>
          <ResponsibleFormSection
            helper="Você pode adicionar um motivo para a criança entender."
            title="Rejeitar essa conclusão?"
          >
            <TextInput
              accessibilityLabel="Motivo da rejeição"
              multiline
              onChangeText={setRejectReason}
              placeholder="Motivo opcional"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.textArea]}
              value={rejectReason}
            />
          </ResponsibleFormSection>
          <ConfirmActionSheet
            body="A missão volta como rejeitada sem creditar moedas."
            cancelLabel="Cancelar"
            confirmAccessibilityLabel={`Confirmar rejeição de ${rejecting.snapshotTitle}`}
            confirmLabel="Rejeitar"
            loading={submittingId === rejecting.id}
            loadingLabel="Rejeitando missão"
            onCancel={() => setRejecting(null)}
            onConfirm={handleReject}
            title="Confirmar rejeição"
          />
        </Card>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
  list: {
    gap: spacing.md,
  },
  rejectCard: {
    gap: spacing.md,
    marginTop: spacing.lg,
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
