import { StyleSheet, Text, View } from 'react-native';

import { Card, CoinBadge, EmojiAvatar, SecondaryButton } from '../../../components';
import { ResponsibleDashboardChildSummary } from '../../../api/types';
import { colors, spacing, typography } from '../../../theme';

type ChildSummaryCardProps = {
  child: ResponsibleDashboardChildSummary;
  onOpenDetail: (childId: string) => void;
};

export function ChildSummaryCard({ child, onOpenDetail }: ChildSummaryCardProps) {
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
      <CoinBadge amount={child.balance} />
      <SecondaryButton
        accessibilityLabel={`Ver detalhes de ${child.name}`}
        label="Ver detalhes"
        onPress={() => onOpenDetail(child.id)}
      />
    </Card>
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
});
