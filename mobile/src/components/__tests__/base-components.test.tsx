import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Card, EmojiAvatar, PrimaryButton, StatusBadge } from '..';

describe('base components', () => {
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
});
