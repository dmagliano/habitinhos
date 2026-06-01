import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

type AppScreenProps = PropsWithChildren<{
  scroll?: boolean;
  centered?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}>;

export function AppScreen({ children, scroll = true, centered = false, style, contentStyle }: AppScreenProps) {
  const content = <View style={[styles.content, centered && styles.centered, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.bottomSafePadding,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
