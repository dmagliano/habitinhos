import { render, screen } from '@testing-library/react-native';

import App from '../../App';

jest.mock('../storage/tokenStorage', () => ({
  tokenStorage: {
    getToken: jest.fn(() => new Promise(() => undefined)),
    setToken: jest.fn(),
    clearToken: jest.fn(),
  },
}));

describe('App', () => {
  it('renders the initial Habitinhos loading shell', () => {
    render(<App />);

    expect(screen.getByText('Habitinhos')).toBeOnTheScreen();
    expect(screen.getByText('Preparando sua família...')).toBeOnTheScreen();
  });
});
