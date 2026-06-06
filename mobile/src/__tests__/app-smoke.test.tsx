import { cleanup, render, screen } from '@testing-library/react-native';

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
    render(<App />);

    expect(screen.getByText('Habitinhos')).toBeOnTheScreen();
    expect(screen.getByText('Preparando sua família...')).toBeOnTheScreen();
  });

});
