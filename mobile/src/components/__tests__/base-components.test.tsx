import { fireEvent, render, screen } from '@testing-library/react-native';
import { act } from 'react';
import { Keyboard, ScrollView, Text } from 'react-native';

import { AppScreen, Card, EmojiAvatar, PrimaryButton, StatusBadge } from '..';
import { shouldScrollToEndAfterKeyboardLayout } from '../AppScreen';

describe('base components', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('renders PrimaryButton with accessible label and disabled state', () => {
    const onPress = jest.fn();

    render(<PrimaryButton disabled label="Entrar na conta" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Entrar na conta' });

    expect(button).toBeDisabled();
    expect(button).toHaveStyle({ minHeight: 56 });

    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders a pressable Card with content', () => {
    const onPress = jest.fn();

    render(
      <Card accessibilityLabel="Escolher modo responsavel" onPress={onPress} variant="highlight">
        <Text>Sou responsavel</Text>
      </Card>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Escolher modo responsavel' }));

    expect(screen.getByText('Sou responsavel')).toBeOnTheScreen();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders StatusBadge and EmojiAvatar with PT-BR labels', () => {
    render(
      <>
        <StatusBadge emoji="✨" label="Em preparacao" variant="warning" />
        <EmojiAvatar emoji="👨‍👩‍👧" label="Avatar da familia" size="lg" />
        <EmojiAvatar emoji="⭐" label="Avatar estrela" size="xl" />
      </>,
    );

    expect(screen.getByText('Em preparacao')).toBeOnTheScreen();
    expect(screen.getByLabelText('Avatar da familia')).toBeOnTheScreen();
    expect(screen.getByText('⭐')).toHaveStyle({ lineHeight: 52 });
  });

  it('adds scroll space while the keyboard is visible', () => {
    const listeners: Record<string, (event?: unknown) => void> = {};
    jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, listener) => {
      listeners[eventName] = listener as (event?: unknown) => void;
      return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
    });

    const { UNSAFE_getByType } = render(
      <AppScreen scrollToEndOnKeyboard>
        <Text>PIN do responsável</Text>
      </AppScreen>,
    );

    act(() => {
      const showKeyboard = listeners.keyboardDidShow ?? listeners.keyboardWillShow;
      showKeyboard?.({ endCoordinates: { height: 280 } });
    });

    expect(UNSAFE_getByType(ScrollView).props.contentContainerStyle).toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingBottom: 280 })]),
    );

    act(() => {
      UNSAFE_getByType(ScrollView).props.onContentSizeChange();
    });

    expect(shouldScrollToEndAfterKeyboardLayout(true, 280)).toBe(true);
    expect(shouldScrollToEndAfterKeyboardLayout(true, 0)).toBe(false);
    expect(shouldScrollToEndAfterKeyboardLayout(false, 280)).toBe(false);

    act(() => {
      const hideKeyboard = listeners.keyboardDidHide ?? listeners.keyboardWillHide;
      hideKeyboard?.();
    });

    expect(UNSAFE_getByType(ScrollView).props.contentContainerStyle).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingBottom: 280 })]),
    );
  });
});
