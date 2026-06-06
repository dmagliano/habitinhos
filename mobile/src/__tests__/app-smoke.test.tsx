import { cleanup, render, screen, waitFor } from '@testing-library/react-native';

import App from '../../App';
import { tokenStorage } from '../storage/tokenStorage';

jest.mock('../storage/tokenStorage', () => ({
  tokenStorage: {
    getToken: jest.fn(),
    setToken: jest.fn(),
    clearToken: jest.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(tokenStorage.getToken).mockResolvedValue(null);
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('renders the initial Habitinhos loading shell', () => {
    jest.useFakeTimers();

    render(<App />);

    expect(screen.getByText('Habitinhos')).toBeOnTheScreen();
    expect(screen.getByText('Preparando sua família...')).toBeOnTheScreen();
  });

  it('shows login and register entry after auth restore and presentation delay', async () => {
    jest.useRealTimers();
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce(null);

    render(<App />);

    expect(screen.getByText('Preparando sua família...')).toBeOnTheScreen();
    expect(screen.queryByText('Comece pela sua conta')).not.toBeOnTheScreen();

    await waitFor(() => expect(screen.getByText('Comece pela sua conta')).toBeOnTheScreen(), {
      timeout: 7000,
    });
  }, 10000);
});
