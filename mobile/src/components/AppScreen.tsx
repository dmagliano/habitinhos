import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

type AppScreenProps = PropsWithChildren<{
  scroll?: boolean;
  centered?: boolean;
  scrollToEndOnKeyboard?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}>;

export function AppScreen({
  children,
  scroll = true,
  centered = false,
  scrollToEndOnKeyboard = false,
  style,
  contentStyle,
}: AppScreenProps) {
  const [keyboardPaddingBottom, setKeyboardPaddingBottom] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const content = <View style={[styles.content, centered && styles.centered, contentStyle]}>{children}</View>;

  const handleContentSizeChange = () => {
    if (shouldScrollToEndAfterKeyboardLayout(scrollToEndOnKeyboard, keyboardPaddingBottom)) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardPaddingBottom(Math.max(event.endCoordinates.height, spacing.xxxl));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardPaddingBottom(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {scroll ? (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardPaddingBottom > 0 && { paddingBottom: keyboardPaddingBottom },
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={handleContentSizeChange}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export function shouldScrollToEndAfterKeyboardLayout(enabled: boolean, keyboardPaddingBottom: number): boolean {
  return enabled && keyboardPaddingBottom > 0;
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
