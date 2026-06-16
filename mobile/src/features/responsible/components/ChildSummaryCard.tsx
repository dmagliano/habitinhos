import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, CoinBadge, EmojiAvatar, SecondaryButton } from '../../../components';
import { ResponsibleDashboardChildSummary, ResponsibleDashboardMissionPreview } from '../../../api/types';
import { colors, spacing, typography } from '../../../theme';

type ChildSummaryCardProps = {
  child: ResponsibleDashboardChildSummary;
  onOpenDetail: (childId: string) => void;
};

type MissionPreviewStatus = ResponsibleDashboardMissionPreview['status'];

const PREVIEW_GROUPS: {
  emptyLabel: string;
  label: string;
  status: MissionPreviewStatus;
}[] = [
  {
    emptyLabel: 'Nenhuma pendente recente.',
    label: 'Pendentes',
    status: 'PENDING',
  },
  {
    emptyLabel: 'Nenhuma aprovação recente.',
    label: 'Aprovações',
    status: 'AWAITING_APPROVAL',
  },
  {
    emptyLabel: 'Nenhuma concluída recente.',
    label: 'Concluídas',
    status: 'COMPLETED',
  },
];

export function ChildSummaryCard({ child, onOpenDetail }: ChildSummaryCardProps) {
  const [expandedStatus, setExpandedStatus] = useState<MissionPreviewStatus | null>(null);
  const missionPreviewsByStatus = useMemo(
    () => groupMissionPreviewsByStatus(child.missionPreviews),
    [child.missionPreviews],
  );

  return (
    <Card style={styles.card} testID={`child-summary-${child.id}`}>
      <View style={styles.header}>
        <EmojiAvatar emoji={getAvatarEmoji(child.avatarKey)} label={child.name} size="md" />
        <View style={styles.copy}>
          <Text style={styles.name}>{child.name}</Text>
          <Text style={styles.meta}>{child.age} anos</Text>
        </View>
      </View>

      <Text style={styles.missionSummary}>{getMissionSummary(child)}</Text>
      <View style={styles.previewPanel}>
        <Text style={styles.previewScope}>Últimos 7 dias</Text>
        {PREVIEW_GROUPS.map((group) => {
          const previews = missionPreviewsByStatus[group.status] ?? [];
          const expanded = expandedStatus === group.status;

          return (
            <View key={group.status} style={styles.previewGroup}>
              <Pressable
                accessibilityLabel={`${expanded ? 'Ocultar' : 'Mostrar'} ${group.label.toLowerCase()} de ${child.name}`}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={() => setExpandedStatus(expanded ? null : group.status)}
                style={({ pressed }) => [styles.previewHeader, pressed && styles.previewHeaderPressed]}
              >
                <Text style={styles.previewLabel}>{group.label}</Text>
                <View style={styles.previewCountRow}>
                  <Text style={styles.previewCount}>{previews.length}</Text>
                  <Text style={styles.previewToggle}>{expanded ? '-' : '+'}</Text>
                </View>
              </Pressable>

              {expanded ? (
                <View style={styles.previewList}>
                  {previews.length > 0 ? (
                    previews.map((mission) => (
                      <Text key={mission.id} style={styles.previewTitle}>
                        {mission.title}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.previewEmpty}>{group.emptyLabel}</Text>
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      <CoinBadge amount={child.balance} />
      <SecondaryButton
        accessibilityLabel={`Ver detalhes de ${child.name}`}
        label="Ver detalhes"
        onPress={() => onOpenDetail(child.id)}
      />
    </Card>
  );
}

function groupMissionPreviewsByStatus(previews: ResponsibleDashboardMissionPreview[]) {
  return previews.reduce<Partial<Record<MissionPreviewStatus, ResponsibleDashboardMissionPreview[]>>>(
    (groups, preview) => {
      groups[preview.status] = [...(groups[preview.status] ?? []), preview];
      return groups;
    },
    {},
  );
}

function getMissionSummary(child: ResponsibleDashboardChildSummary): string {
  const pending = child.missionCounts.PENDING;
  const awaiting = child.missionCounts.AWAITING_APPROVAL;

  return `${pending} ${pending === 1 ? 'pendente' : 'pendentes'} · ${awaiting} aguardando`;
}

function getAvatarEmoji(avatarKey: string | null | undefined): string {
  if (avatarKey === 'fox') {
    return '🦊';
  }

  if (avatarKey === 'cat') {
    return '🐱';
  }

  if (avatarKey === 'dog') {
    return '🐶';
  }

  if (avatarKey === 'bear') {
    return '🐻';
  }

  return '⭐';
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  missionSummary: {
    ...typography.label,
    color: colors.primaryDark,
  },
  previewPanel: {
    gap: spacing.xs,
  },
  previewScope: {
    ...typography.label,
    color: colors.textMuted,
  },
  previewGroup: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewHeader: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  previewHeaderPressed: {
    opacity: 0.82,
  },
  previewLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  previewCountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewCount: {
    ...typography.label,
    color: colors.primaryDark,
  },
  previewToggle: {
    ...typography.heading,
    color: colors.textSecondary,
    minWidth: 14,
    textAlign: 'center',
  },
  previewList: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  previewTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  previewEmpty: {
    ...typography.body,
    color: colors.textMuted,
  },
});
