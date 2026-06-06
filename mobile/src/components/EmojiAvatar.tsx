import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '../theme';

type EmojiAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type EmojiAvatarProps = {
  emoji: string;
  label: string;
  size?: EmojiAvatarSize;
};

const sizeMap = {
  sm: 32,
  md: 44,
  lg: 56,
  xl: 72,
} as const;

const emojiSizeMap = {
  sm: 16,
  md: 22,
  lg: 28,
  xl: 36,
} as const;

const emojiLineHeightMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 52,
} as const;

export function EmojiAvatar({ emoji, label, size = 'md' }: EmojiAvatarProps) {
  const dimension = sizeMap[size];

  return (
    <View
      accessibilityLabel={label}
      accessible
      style={[styles.avatar, { height: dimension, width: dimension }]}
    >
      <Text style={[styles.emoji, { fontSize: emojiSizeMap[size], lineHeight: emojiLineHeightMap[size] }]}>
        {emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.full,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  emoji: {
    ...typography.body,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
