import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../../theme';

type ProgressBarProps = {
  value: number;
  accessibilityLabel: string;
};

export function ProgressBar({ accessibilityLabel, value }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(value, 100));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessible
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${clampedValue}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    height: 12,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    height: '100%',
  },
});
