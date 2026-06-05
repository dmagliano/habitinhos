import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, PrimaryButton, SecondaryButton, StatusBadge } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

export function AuthWelcomeScreen({ navigation }: Props) {
  return (
    <AppScreen>
      <View style={styles.content}>
        <View accessibilityLabel="Ilustração de missões, moedas e recompensas" accessible style={styles.illustration}>
          <View style={[styles.illustrationTile, styles.tileCoin]}>
            <Text style={styles.tileEmoji}>🪙</Text>
          </View>
          <View style={[styles.illustrationTile, styles.tileStar]}>
            <Text style={styles.tileEmoji}>⭐</Text>
          </View>
          <View style={[styles.illustrationTile, styles.tileCheck]}>
            <Text style={styles.tileEmoji}>✅</Text>
          </View>
          <View style={[styles.illustrationTile, styles.tileGift]}>
            <Text style={styles.tileEmoji}>🎁</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.brand}>Habitinhos</Text>
          <Text style={styles.headline}>Transforme tarefas em pequenas conquistas</Text>
          <Text style={styles.supporting}>Organize missões, moedas e recompensas da família.</Text>
        </View>

        <Card style={styles.entryCard}>
          <Text style={styles.cardTitle}>Comece pela sua conta</Text>
          <Text style={styles.cardCopy}>Entre ou crie uma família para acompanhar as pequenas conquistas.</Text>

          <View style={styles.actions}>
            <PrimaryButton label="Login" onPress={() => navigation.navigate('AuthLogin')} />
            <SecondaryButton label="Registro" onPress={() => navigation.navigate('AuthRegister')} />
          </View>
        </Card>

        <StatusBadge emoji="🪙" label="Missões, moedas e recompensas em família" variant="selected" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  illustration: {
    alignSelf: 'center',
    height: 236,
    marginBottom: spacing.sm,
    position: 'relative',
    width: 252,
  },
  illustrationTile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    height: 104,
    justifyContent: 'center',
    position: 'absolute',
    width: 104,
  },
  tileCoin: {
    left: 16,
    top: 0,
  },
  tileStar: {
    right: 12,
    top: spacing.lg,
  },
  tileCheck: {
    left: 0,
    top: 122,
  },
  tileGift: {
    right: 0,
    top: 138,
  },
  tileEmoji: {
    fontSize: 38,
  },
  hero: {
    gap: spacing.sm,
  },
  brand: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  headline: {
    ...typography.display,
    color: colors.textPrimary,
  },
  supporting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  entryCard: {
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  cardCopy: {
    ...typography.body,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.sm,
  },
});
