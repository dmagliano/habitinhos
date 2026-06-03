import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ResponsibleDashboardChildSummary, ResponsibleDashboardResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, CoinBadge, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { responsibleService } from './responsibleService';
import { EmptyState } from './components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleChildDetail'>;
type LoadState = 'loading' | 'ready' | 'error';

export function ResponsibleChildDetailScreen({ navigation, route }: Props) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const childId = route.params.childId;
  const [dashboard, setDashboard] = useState<ResponsibleDashboardResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const child = useMemo(
    () => dashboard?.children.find((item) => item.id === childId) ?? null,
    [childId, dashboard],
  );
  const redemptions = useMemo(
    () => dashboard?.recentRedemptions.filter((item) => item.childId === childId) ?? [],
    [childId, dashboard],
  );

  const loadDetail = useCallback(async () => {
    if (!token) {
      setDashboard(null);
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    try {
      const response = await responsibleService.getDashboard(token);
      setDashboard(response);
      setLoadState('ready');
    } catch {
      setDashboard(null);
      setLoadState('error');
    }
  }, [token]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadDetail();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadDetail]);

  return (
    <AppScreen>
      <AppHeader
        action={child ? <CoinBadge amount={child.balance} /> : null}
        emoji="⭐"
        subtitle="Resumo operacional da criança"
        title={child?.name ?? 'Detalhe da criança'}
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
          <SecondaryButton label="Tentar novamente" onPress={loadDetail} />
        </Card>
      ) : null}

      {loadState === 'ready' && !child ? (
        <EmptyState
          body="Verifique se a criança ainda está ativa na família."
          emoji="🔎"
          title="Criança não encontrada"
        />
      ) : null}

      {loadState === 'ready' && child ? (
        <>
          <Card style={styles.summaryCard} variant="highlight">
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childMeta}>{child.age} anos</Text>
            <CoinBadge amount={child.balance} />
          </Card>

          <MissionSummary child={child} />

          <SectionTitle title="Resgates recentes" />
          {redemptions.length === 0 ? (
            <EmptyState
              body="Os resgates desta criança aparecem aqui quando houver histórico recente."
              emoji="🎁"
              title="Nenhum resgate recente"
            />
          ) : (
            <View style={styles.list}>
              {redemptions.map((redemption) => (
                <Card key={redemption.id} style={styles.redemptionCard}>
                  <Text style={styles.redemptionTitle}>{redemption.rewardTitle}</Text>
                  <Text style={styles.redemptionMeta}>{redemption.rewardCost} moedas</Text>
                </Card>
              ))}
            </View>
          )}

          <SecondaryButton
            label="Editar criança"
            onPress={() => navigation.navigate('ResponsibleChildForm', { childId })}
            style={styles.editButton}
          />
        </>
      ) : null}
    </AppScreen>
  );
}

function MissionSummary({ child }: { child: ResponsibleDashboardChildSummary }) {
  return (
    <>
      <SectionTitle title="Missões" />
      <View style={styles.missionGrid}>
        <Card style={styles.missionCard}>
          <Text style={styles.metricValue}>{child.missionCounts.PENDING} pendentes</Text>
        </Card>
        <Card style={styles.missionCard}>
          <Text style={styles.metricValue}>
            {child.missionCounts.AWAITING_APPROVAL} aguardando aprovação
          </Text>
        </Card>
        <Card style={styles.missionCard}>
          <Text style={styles.metricValue}>{child.missionCounts.COMPLETED} concluídas</Text>
        </Card>
      </View>
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
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
  summaryCard: {
    gap: spacing.sm,
  },
  childName: {
    ...typography.display,
    color: colors.textPrimary,
  },
  childMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  missionGrid: {
    gap: spacing.md,
  },
  missionCard: {
    minHeight: 72,
  },
  metricValue: {
    ...typography.heading,
    color: colors.primaryDark,
  },
  list: {
    gap: spacing.md,
  },
  redemptionCard: {
    gap: spacing.xs,
  },
  redemptionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  redemptionMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  editButton: {
    marginTop: spacing.lg,
  },
});
