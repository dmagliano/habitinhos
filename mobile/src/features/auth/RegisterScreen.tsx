import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthRegister'>;

export function RegisterScreen({ navigation }: Props) {
  return (
    <AppScreen>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.copy}>Informe seus dados para criar a família no Habitinhos.</Text>
          <SecondaryButton label="Já tenho conta" onPress={() => navigation.navigate('AuthLogin')} />
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  card: {
    gap: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
