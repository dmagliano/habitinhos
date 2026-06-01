import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreen, PrimaryButton, StatusBadge } from '../../components';
import { colors, spacing, typography } from '../../theme';

import { useAuth } from './AuthContext';

export function AuthLoadingScreen() {
  const { errorMessage, retryRestore, status } = useAuth();
  const hasError = status === 'error' && Boolean(errorMessage);

  return (
    <AppScreen centered scroll={false}>
      <View style={styles.brandMark}>
        <Text style={styles.brandEmoji}>✨</Text>
      </View>
      <Text style={styles.brand}>Habitinhos</Text>
      <Text style={styles.copy}>{hasError ? errorMessage : 'Preparando sua família...'}</Text>
      {hasError ? (
        <>
          <StatusBadge emoji="!" label="Conexão indisponível" variant="warning" />
          <PrimaryButton label="Tentar novamente" onPress={retryRestore} />
        </>
      ) : (
        <ActivityIndicator color={colors.primaryDark} size="large" />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72,
  },
  brandEmoji: {
    fontSize: 32,
  },
  brand: {
    ...typography.display,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
