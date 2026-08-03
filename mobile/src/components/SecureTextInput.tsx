import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

type SecureTextInputProps = Omit<TextInputProps, 'secureTextEntry'> & {
  visibilityLabel: string;
};

export function SecureTextInput({ style, visibilityLabel, ...props }: SecureTextInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const actionLabel = isVisible ? 'Ocultar' : 'Exibir';

  return (
    <View style={styles.container}>
      <TextInput {...props} secureTextEntry={!isVisible} style={[style, styles.input]} />
      <Pressable
        accessibilityLabel={`${actionLabel} ${visibilityLabel}`}
        accessibilityRole="togglebutton"
        accessibilityState={{ checked: isVisible }}
        hitSlop={spacing.xs}
        onPress={() => setIsVisible((current) => !current)}
        style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
      >
        <Text style={styles.toggleLabel}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    paddingRight: 88,
  },
  toggle: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
    paddingHorizontal: spacing.sm,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  togglePressed: {
    opacity: 0.65,
  },
  toggleLabel: {
    ...typography.label,
    color: colors.primaryDark,
  },
});
