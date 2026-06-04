import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ResponsibleDashboardRedemption, ResponsibleDashboardResponse } from '../../api/types';
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
      route:
        | 'ResponsibleApprovals'
        | 'ResponsibleChildDetail'
        | 'ResponsibleChildForm'
        | 'ResponsibleMissionForm'
        | 'ResponsibleRewardForm',
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
  const [recentRedemptionsFocused, setRecentRedemptionsFocused] = useState(false);
  const [deliveringRedemptionId, setDeliveringRedemptionId] = useState<string | null>(null);
  const [deliveryErrors, setDeliveryErrors] = useState<Record<string, string>>({});

  const metrics = useMemo(() => getMetrics(dashboard), [dashboard]);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setDashboard(null);
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    setRecentRedemptionsFocused(false);

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
  const openRewardForm = () => {
    navigation?.navigate('ResponsibleRewardForm');
  };
  const focusRecentRedemptions = () => {
    setRecentRedemptionsFocused(true);
  };
  const markRedemptionDelivered = async (redemption: ResponsibleDashboardRedemption) => {
    if (!token || deliveringRedemptionId || isDelivered(redemption)) {
      return;
    }

    setDeliveringRedemptionId(redemption.id);
    setDeliveryErrors((current) => {
      const next = { ...current };
      delete next[redemption.id];
      return next;
    });

    try {
      const delivered = await responsibleService.markRedemptionDelivered(token, redemption.id);
      setDashboard((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          recentRedemptions: current.recentRedemptions.map((currentRedemption) =>
            currentRedemption.id === redemption.id
              ? {
                  ...currentRedemption,
                  status: delivered.status,
                  deliveredAt: delivered.deliveredAt,
                }
              : currentRedemption,
          ),
        };
      });
    } catch {
      setDeliveryErrors((current) => ({
        ...current,
        [redemption.id]: 'Não conseguimos marcar como entregue. Tente novamente.',
      }));
    } finally {
      setDeliveringRedemptionId(null);
    }
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
            {metrics.map((metric) => {
              const isRecentRedemptions = metric.label === 'Resgates recentes';

              return (
                <MetricSummaryCard
                  accessibilityLabel={isRecentRedemptions ? 'Ver resgates recentes' : undefined}
                  helper={isRecentRedemptions ? 'Ver resgates recentes' : undefined}
                  key={metric.label}
                  label={metric.label}
                  onPress={isRecentRedemptions ? focusRecentRedemptions : undefined}
                  value={metric.value}
                />
              );
            })}
          </View>

          <SectionTitle title="Suas crianças" />
          {dashboard.children.length === 0 ? (
            <EmptyState
              actionLabel="Cadastrar criança"
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
            <PrimaryButton label="Nova Missão" onPress={openMissionForm} />
            <PrimaryButton label="Cadastrar Recompensa" onPress={openRewardForm} />
            <PrimaryButton label="Cadastrar criança" onPress={openChildForm} />
          </View>

          {dashboard.pendingApprovalCount > 0 ? (
            <>
              <SectionTitle title="Aprovações" />
              <ApprovalCard count={dashboard.pendingApprovalCount} onOpenApprovals={openApprovals} />
            </>
          ) : null}

          <View testID={recentRedemptionsFocused ? 'recent-redemptions-section-focused' : 'recent-redemptions-section'}>
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
                  <RedemptionSummaryCard
                    errorMessage={deliveryErrors[redemption.id]}
                    key={redemption.id}
                    loading={deliveringRedemptionId === redemption.id}
                    onMarkDelivered={markRedemptionDelivered}
                    redemption={redemption}
                  />
                ))}
              </View>
            )}
          </View>
        </>
      ) : null}
    </AppScreen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function RedemptionSummaryCard({
  errorMessage,
  loading,
  onMarkDelivered,
  redemption,
}: {
  errorMessage?: string;
  loading: boolean;
  onMarkDelivered: (redemption: ResponsibleDashboardRedemption) => void;
  redemption: ResponsibleDashboardRedemption;
}) {
  const delivered = isDelivered(redemption);
  const accessibilityLabel = delivered
    ? `${redemption.rewardTitle} entregue`
    : `Marcar ${redemption.rewardTitle} como entregue`;

  return (
    <Card style={styles.redemptionCard}>
      <View style={styles.redemptionHeader}>
        <View style={styles.redemptionTextColumn}>
          <Text style={[styles.redemptionTitle, delivered && styles.redemptionDeliveredText]}>
            {redemption.rewardTitle}
          </Text>
          <Text style={[styles.redemptionMeta, delivered && styles.redemptionDeliveredText]}>
            {redemption.childName} · {redemption.rewardCost} moedas
          </Text>
        </View>
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: delivered }}
          onPress={() => onMarkDelivered(redemption)}
          style={({ pressed }) => [styles.deliveredControl, pressed && styles.deliveredControlPressed]}
        >
          <View style={[styles.checkbox, delivered && styles.checkboxChecked]}>
            {delivered ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </View>
          <Text style={styles.deliveredLabel}>Entregue</Text>
        </Pressable>
      </View>
      {loading ? <Text style={styles.deliveryHelper}>Salvando...</Text> : null}
      {delivered && redemption.deliveredAt ? (
        <Text style={styles.deliveryDate}>Entregue em: {formatShortDate(redemption.deliveredAt)}</Text>
      ) : null}
      {errorMessage ? <Text style={styles.deliveryError}>{errorMessage}</Text> : null}
    </Card>
  );
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
    { label: 'Crianças', value: String(children) },
    { label: 'Aprovações', value: String(approvals) },
    { label: 'Missões abertas', value: String(openMissions) },
    { label: 'Resgates recentes', value: String(redemptions) },
  ];
}

function isDelivered(redemption: ResponsibleDashboardRedemption): boolean {
  return redemption.status === 'DELIVERED' || redemption.deliveredAt != null;
}

function formatShortDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
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
  redemptionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  redemptionTextColumn: {
    flex: 1,
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
  redemptionDeliveredText: {
    color: colors.textMuted,
  },
  deliveredControl: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  deliveredControlPressed: {
    opacity: 0.8,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.borderStrong,
    borderRadius: 4,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxMark: {
    ...typography.label,
    color: colors.textInverse,
  },
  deliveredLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  deliveryDate: {
    ...typography.body,
    color: colors.textMuted,
  },
  deliveryHelper: {
    ...typography.body,
    color: colors.textSecondary,
  },
  deliveryError: {
    ...typography.body,
    color: colors.error,
  },
});
