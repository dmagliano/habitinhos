import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ChildResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, EmojiAvatar, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { childService } from './childService';

type Props = NativeStackScreenProps<RootStackParamList, 'ChildProfileSelect'>;

type LoadState = 'loading' | 'ready' | 'error';

const avatarEmojiByKey: Record<string, string> = {
  bear: '🐻',
  cat: '🐱',
  dog: '🐶',
  fox: '🦊',
  star: '⭐',
};

export function ChildProfileSelectScreen({ navigation }: Props) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [children, setChildren] = useState<ChildResponse[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const activeChildren = useMemo(() => children.filter((child) => child.active), [children]);

  const loadChildren = useCallback(async () => {
    if (!token) {
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    setSelectedChild(null);

    try {
      const response = await childService.listChildren(token);
      setChildren(response);
      setLoadState('ready');
    } catch {
      setChildren([]);
      setLoadState('error');
    }
  }, [token]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadChildren();
    }, 0);

    return () => clearTimeout(loadTimeout);
  }, [loadChildren]);

  const enterProfile = () => {
    if (selectedChild) {
      navigation.navigate('ChildTabs', { child: selectedChild });
    }
  };

  return (
    <AppScreen>
      <AppHeader
        emoji="⭐"
        subtitle="Escolha um perfil da família."
        title="Quem vai brincar agora?"
      />

      {loadState === 'loading' ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando perfis...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar os perfis. Tente novamente.</Text>
          <SecondaryButton label="Tentar novamente" onPress={loadChildren} />
        </Card>
      ) : null}

      {loadState === 'ready' && activeChildren.length === 0 ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🌱</Text>
          <Text style={styles.stateTitle}>Nenhuma criança cadastrada</Text>
          <Text style={styles.stateCopy}>Peça para um responsável criar um perfil primeiro.</Text>
        </Card>
      ) : null}

      {loadState === 'ready' && activeChildren.length > 0 ? (
        <View style={styles.list}>
          {activeChildren.map((child) => {
            const isSelected = selectedChild?.id === child.id;

            return (
              <Card
                accessibilityLabel={`Selecionar ${child.name}`}
                key={child.id}
                onPress={() => setSelectedChild(child)}
                style={isSelected ? styles.selectedCard : undefined}
                variant={isSelected ? 'highlight' : 'default'}
              >
                <View style={styles.childRow}>
                  <EmojiAvatar emoji={getAvatarEmoji(child.avatarKey)} label={child.name} size="lg" />
                  <View style={styles.childCopy}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childMeta}>
                      {child.age} {child.age === 1 ? 'ano' : 'anos'}
                    </Text>
                  </View>
                  {isSelected ? <Text style={styles.selectedLabel}>Selecionado</Text> : null}
                </View>
              </Card>
            );
          })}
        </View>
      ) : null}

      <PrimaryButton
        disabled={!selectedChild}
        label="Entrar no perfil"
        onPress={enterProfile}
        style={styles.enterButton}
      />
      <SecondaryButton label="Gerenciar família" onPress={() => navigation.navigate('ResponsibleTabs')} />
    </AppScreen>
  );
}

function getAvatarEmoji(avatarKey: string | null | undefined): string {
  if (!avatarKey) {
    return '⭐';
  }

  return avatarEmojiByKey[avatarKey] ?? '⭐';
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
  stateCopy: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  selectedCard: {
    borderColor: colors.primary,
  },
  childRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  childCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  childName: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  childMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  selectedLabel: {
    ...typography.label,
    color: colors.primaryDark,
  },
  enterButton: {
    marginBottom: spacing.md,
  },
});
