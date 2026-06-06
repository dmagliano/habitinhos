import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ChildResponse } from '../../api/types';
import { AppHeader, AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';

import { EmptyState } from './components/EmptyState';
import { ManageListItem } from './components/ManageListItem';
import { responsibleService } from './responsibleService';

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleChildren'>;
type LoadState = 'loading' | 'ready' | 'error';

export function ResponsibleChildrenScreen({ navigation }: Props) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [children, setChildren] = useState<ChildResponse[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const sortedChildren = useMemo(() => sortChildren(children), [children]);

  const loadChildren = useCallback(async () => {
    if (!token) {
      setChildren([]);
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    try {
      const response = await responsibleService.listChildren(token, true);
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

  const openCreate = () => navigation.navigate('ResponsibleChildForm');
  const openEdit = (childId: string) => navigation.navigate('ResponsibleChildForm', { childId });
  const returnHome = () => navigation.navigate('ResponsibleTabs');

  return (
    <AppScreen>
      <AppHeader
        action={
          <View style={styles.headerActions}>
            <SecondaryButton label="Retornar ao início" onPress={returnHome} />
            <PrimaryButton label="Cadastrar criança" onPress={openCreate} />
          </View>
        }
        emoji="⭐"
        subtitle="Veja crianças ativas e inativas da família."
        title="Crianças"
      />

      {loadState === 'loading' ? (
        <Card style={styles.stateCard} variant="highlight">
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.stateTitle}>Carregando crianças...</Text>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🛟</Text>
          <Text style={styles.stateTitle}>Não conseguimos carregar as crianças.</Text>
          <SecondaryButton label="Tentar novamente" onPress={loadChildren} />
        </Card>
      ) : null}

      {loadState === 'ready' && sortedChildren.length === 0 ? (
        <EmptyState
          actionLabel="Cadastrar criança"
          body="Cadastre uma criança para começar a organizar missões, moedas e recompensas."
          emoji="⭐"
          onAction={openCreate}
          title="Nenhuma criança cadastrada"
        />
      ) : null}

      {loadState === 'ready' && sortedChildren.length > 0 ? (
        <View style={styles.list}>
          {sortedChildren.map((child) => (
            <ManageListItem
              active={child.active}
              avatarKey={child.avatarKey}
              id={child.id}
              key={child.id}
              metadata={`${child.age} anos`}
              onEdit={() => openEdit(child.id)}
              testID={`manage-child-${child.id}`}
              title={child.name}
            />
          ))}
        </View>
      ) : null}
    </AppScreen>
  );
}

function sortChildren(children: ChildResponse[]): ChildResponse[] {
  return [...children].sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    return left.name.localeCompare(right.name, 'pt-BR');
  });
}

const styles = StyleSheet.create({
  headerActions: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  stateCard: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stateEmoji: {
    fontSize: 28,
  },
  stateTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
