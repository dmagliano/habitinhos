import { act, cleanup, render, screen } from '@testing-library/react-native';

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

  it('keeps the presentation visible for 3 seconds before showing login and register entry', async () => {
    jest.useFakeTimers();
    jest.mocked(tokenStorage.getToken).mockResolvedValueOnce(null);

    render(<App />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.getByText('Preparando sua família...')).toBeOnTheScreen();
    expect(screen.queryByText('Comece pela sua conta')).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(2999);
    });

    expect(screen.queryByText('Comece pela sua conta')).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    expect(screen.getByText('Comece pela sua conta')).toBeOnTheScreen();
  });
});
