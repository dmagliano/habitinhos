import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ResponsibleDashboardResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { responsibleService } from './responsibleService';
import { ApprovalCard } from './components/ApprovalCard';
import { ChildSummaryCard } from './components/ChildSummaryCard';
import { EmptyState } from './components/EmptyState';
import { MetricSummaryCard } from './components/MetricSummaryCard';

type ResponsibleHomeScreenProps = {
  navigation?: {
    navigate: (
      route: 'ResponsibleApprovals' | 'ResponsibleChildDetail' | 'ResponsibleChildForm' | 'ResponsibleMissionForm',
      params?: { childId: string },
    ) => void;
  };
};

type LoadState = 'loading' | 'ready' | 'error';

export function ResponsibleHomeScreen({ navigation }: ResponsibleHomeScreenProps) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [dashboard, setDashboard] = useState<ResponsibleDashboardResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const metrics = useMemo(() => getMetrics(dashboard), [dashboard]);

  const loadDashboard = useCallback(async () => {
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
      void loadDashboard();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadDashboard]);

  const openChildDetail = (childId: string) => {
    navigation?.navigate('ResponsibleChildDetail', { childId });
  };
  const openChildForm = () => {
    navigation?.navigate('ResponsibleChildForm');
  };
  const openMissionForm = () => {
    navigation?.navigate('ResponsibleMissionForm');
  };
  const openApprovals = () => {
    navigation?.navigate('ResponsibleApprovals');
  };

  return (
    <AppScreen>
      <AppHeader
        emoji="🧭"
        greeting="Família em movimento"
        subtitle="Acompanhe crianças, missões, moedas e resgates."
        title="Olá, responsável"
      />

      {loadState === 'loading' ? (
        <Card style={styles.stateCard} variant="highlight">
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando painel...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar o painel.</Text>
          <PrimaryButton label="Tentar novamente" onPress={loadDashboard} />
        </Card>
      ) : null}

      {loadState === 'ready' && dashboard ? (
        <>
          <View style={styles.metricGrid}>
            {metrics.map((metric) => (
              <MetricSummaryCard key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </View>

          <SectionTitle title="Suas crianças" />
          {dashboard.children.length === 0 ? (
            <EmptyState
              actionLabel="Nova criança"
              body="Cadastre uma criança para organizar missões, moedas e recompensas da família."
              emoji="⭐"
              onAction={openChildForm}
              title="Nenhuma criança cadastrada"
            />
          ) : (
            <View style={styles.list}>
              {dashboard.children.map((child) => (
                <ChildSummaryCard child={child} key={child.id} onOpenDetail={openChildDetail} />
              ))}
            </View>
          )}

          <SectionTitle title="Ações rápidas" />
          <View style={styles.quickActions}>
            <PrimaryButton label="Nova missão" onPress={openMissionForm} />
            <PrimaryButton label="Nova recompensa" onPress={() => undefined} />
            <PrimaryButton label="Nova criança" onPress={openChildForm} />
          </View>

          {dashboard.pendingApprovalCount > 0 ? (
            <>
              <SectionTitle title="Aprovações" />
              <ApprovalCard count={dashboard.pendingApprovalCount} onOpenApprovals={openApprovals} />
            </>
          ) : null}

          <SectionTitle title="Resgates recentes" />
          {dashboard.recentRedemptions.length === 0 ? (
            <EmptyState
              body="Quando uma criança resgatar uma recompensa, ela aparece aqui."
              emoji="🎁"
              title="Nenhum resgate recente"
            />
          ) : (
            <View style={styles.list}>
              {dashboard.recentRedemptions.map((redemption) => (
                <Card key={redemption.id} style={styles.redemptionCard}>
                  <Text style={styles.redemptionTitle}>{redemption.rewardTitle}</Text>
                  <Text style={styles.redemptionMeta}>
                    {redemption.childName} · {redemption.rewardCost} moedas
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </>
      ) : null}
    </AppScreen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function getMetrics(dashboard: ResponsibleDashboardResponse | null): { label: string; value: string }[] {
  const children = dashboard?.children.length ?? 0;
  const approvals = dashboard?.pendingApprovalCount ?? 0;
  const openMissions =
    dashboard?.children.reduce(
      (total, child) => total + child.missionCounts.PENDING + child.missionCounts.AWAITING_APPROVAL,
      0,
    ) ?? 0;
  const redemptions = dashboard?.recentRedemptions.length ?? 0;

  return [
    { label: 'Crianças', value: `${children} ${children === 1 ? 'criança' : 'crianças'}` },
    { label: 'Aprovações', value: `${approvals} ${approvals === 1 ? 'aprovação' : 'aprovações'}` },
    {
      label: 'Missões abertas',
      value: `${openMissions} ${openMissions === 1 ? 'missão aberta' : 'missões abertas'}`,
    },
    { label: 'Resgates recentes', value: `${redemptions} ${redemptions === 1 ? 'resgate' : 'resgates'}` },
  ];
}

const styles = StyleSheet.create({
  stateCard: {
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stateEmoji: {
    fontSize: 28,
  },
  stateTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  quickActions: {
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
});
