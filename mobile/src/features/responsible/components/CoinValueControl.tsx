import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../theme';

type CoinValueControlProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function CoinValueControl({ error, onChange, value }: CoinValueControlProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Recompensa</Text>
      <TextInput
        accessibilityLabel="Recompensa em moedas"
        keyboardType="number-pad"
        onChangeText={onChange}
        placeholder="1"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={value}
      />
      <Text style={styles.helper}>Mínimo de 1 moeda.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.body,
    color: colors.error,
  },
  field: {
    gap: spacing.xs,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
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
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
