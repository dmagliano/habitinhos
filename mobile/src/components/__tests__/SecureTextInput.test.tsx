import { fireEvent, render, screen } from '@testing-library/react-native';

import { SecureTextInput } from '../SecureTextInput';

describe('SecureTextInput', () => {
  it('keeps the value and toggles visibility with accessible state', () => {
    render(
      <SecureTextInput
        accessibilityLabel="Senha"
        onChangeText={jest.fn()}
        value="segredo123"
        visibilityLabel="senha"
      />,
    );

    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    const showButton = screen.getByRole('togglebutton', { name: 'Exibir senha' });
    expect(showButton.props.accessibilityState).toEqual({ checked: false });

    fireEvent.press(showButton);

    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Senha').props.value).toBe('segredo123');
    const hideButton = screen.getByRole('togglebutton', { name: 'Ocultar senha' });
    expect(hideButton.props.accessibilityState).toEqual({ checked: true });

    fireEvent.press(hideButton);

    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
  });
});
