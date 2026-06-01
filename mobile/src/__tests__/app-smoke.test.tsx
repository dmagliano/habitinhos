import { render, screen } from '@testing-library/react-native';

import App from '../../App';

describe('App', () => {
  it('renders the initial Habitinhos shell', () => {
    render(<App />);

    expect(screen.getByText('Habitinhos')).toBeOnTheScreen();
    expect(screen.getByText('Preparando o app da familia...')).toBeOnTheScreen();
  });
});
