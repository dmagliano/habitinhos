import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../theme';

type ResponsibleFormSectionProps = PropsWithChildren<{
  title: string;
  helper?: string;
}>;

export function ResponsibleFormSection({ children, helper, title }: ResponsibleFormSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: spacing.xs,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
