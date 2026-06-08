import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ApiError } from '../../api/types';
import { AppHeader, AppScreen, Card, CoinBadge, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { childService } from './childService';
import { EmptyState } from './components/EmptyState';
import { FeedbackBanner } from './components/FeedbackBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'ChildMissionDetail'>;
type DetailFeedback =
  | { type: 'completed'; coins: number; balance?: number }
  | { type: 'awaiting-approval' }
  | { type: 'error'; message: string }
  | null;

const MISSION_ERROR_COPY = 'Não conseguimos atualizar essa missão. Tente novamente.';

export function ChildMissionDetailScreen({ navigation, route }: Props) {
  const { child, mission } = route.params;
  const { session } = useAuth();
  const token = session?.token ?? null;
  const completingRef = useRef(false);
  const [completing, setCompleting] = useState(false);
  const [completedMissionId, setCompletedMissionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<DetailFeedback>(null);

  if (!mission) {
    return (
      <AppScreen>
        <EmptyState
          body="Volte para a lista e escolha uma missão disponível."
          emoji="🔎"
          title="Não encontramos essa missão."
        />
        <SecondaryButton label="Voltar para missões" onPress={() => navigation.goBack()} />
      </AppScreen>
    );
  }

  const completeMission = async () => {
    if (!token || completingRef.current) {
      return;
    }

    completingRef.current = true;
    setCompleting(true);
    setFeedback(null);

    try {
      const completedMission = await childService.completeMission(token, mission.id);
      setCompletedMissionId(mission.id);

      if (completedMission.status === 'AWAITING_APPROVAL') {
        setFeedback({ type: 'awaiting-approval' });
      } else if (completedMission.status === 'COMPLETED') {
        let balance: number | undefined;

        try {
          const walletResponse = await childService.getWallet(token, child.id);
          balance = walletResponse.balance;
        } catch {
          balance = undefined;
        }

        setFeedback({
          type: 'completed',
          coins: completedMission.snapshotCoinValue,
          balance,
        });
      }

      void childService.listPendingMissions(token, child.id).catch(() => undefined);
    } catch (error) {
      setFeedback({ type: 'error', message: getMissionErrorMessage(error) });
    } finally {
      completingRef.current = false;
      setCompleting(false);
    }
  };

  return (
    <AppScreen>
      <AppHeader
        action={<SecondaryButton label="Voltar" onPress={() => handleBack(navigation, child, completedMissionId)} />}
        emoji="✅"
        title="Detalhes da missão"
      />

      {feedback ? <DetailFeedbackBanner feedback={feedback} /> : null}

      <Card style={styles.hero} variant="highlight">
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.title}>{mission.snapshotTitle}</Text>
        {mission.snapshotDescription ? (
          <Text style={styles.description}>{mission.snapshotDescription}</Text>
        ) : null}
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoLabel}>Recompensa</Text>
        <CoinBadge amount={mission.snapshotCoinValue} />
      </Card>

      {mission.dueDate ? (
        <Card style={styles.infoCard}>
          <Text style={styles.infoLabel}>Para {formatDate(mission.dueDate)}</Text>
        </Card>
      ) : null}

      {mission.snapshotRequiresApproval ? (
        <Card style={styles.infoCard}>
          <Text style={styles.infoLabel}>Requer aprovação</Text>
          <Text style={styles.infoBody}>Um responsável vai revisar antes das moedas entrarem.</Text>
        </Card>
      ) : null}

      {mission.status === 'PENDING' && mission.rejectionReason ? (
        <Card style={styles.infoCard}>
          <Text style={styles.infoLabel}>Responsável pediu ajuste</Text>
          <Text style={styles.rejectionReason}>{mission.rejectionReason}</Text>
        </Card>
      ) : null}

      {mission.status === 'PENDING' && !completedMissionId ? (
        <PrimaryButton
          label="Marcar como concluída"
          loading={completing}
          onPress={completeMission}
          style={styles.completeButton}
        />
      ) : null}
    </AppScreen>
  );
}

function handleBack(
  navigation: Props['navigation'],
  child: Props['route']['params']['child'],
  completedMissionId: string | null,
) {
  if (completedMissionId) {
    navigation.navigate('ChildTabs', { child, completedMissionId });
    return;
  }

  navigation.goBack();
}

function DetailFeedbackBanner({ feedback }: { feedback: DetailFeedback }) {
  if (!feedback) {
    return null;
  }

  if (feedback.type === 'completed') {
    return (
      <FeedbackBanner
        message={
          typeof feedback.balance === 'number'
            ? `Saldo atualizado: ${feedback.balance} moedas`
            : undefined
        }
        title={`Missão concluída! +${feedback.coins} moedas`}
        variant="success"
      />
    );
  }

  if (feedback.type === 'awaiting-approval') {
    return (
      <FeedbackBanner
        statusLabel="Aguardando aprovação"
        title="Missão enviada! Um responsável vai revisar."
        variant="warning"
      />
    );
  }

  return <FeedbackBanner title={feedback.message} variant="error" />;
}

function getMissionErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.userMessage) {
    return error.userMessage;
  }

  return MISSION_ERROR_COPY;
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}`;
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  infoBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rejectionReason: {
    ...typography.body,
    color: colors.error,
  },
  completeButton: {
    marginTop: spacing.lg,
  },
});
