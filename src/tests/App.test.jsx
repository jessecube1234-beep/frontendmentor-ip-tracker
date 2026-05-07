import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../App.jsx';

vi.mock('leaflet', () => {
  const marker = {
    _map: {},
    addTo: vi.fn(() => marker),
    setLatLng: vi.fn(),
  };

  const map = {
    setView: vi.fn(() => map),
    remove: vi.fn(),
  };

  return {
    default: {
      divIcon: vi.fn(() => ({})),
      map: vi.fn(() => map),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      control: { zoom: vi.fn(() => ({ addTo: vi.fn() })) },
      marker: vi.fn(() => marker),
    },
  };
});

describe('App', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_IPIFY_API_KEY', 'test-key');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ip: '8.8.8.8',
        isp: 'Google',
        location: {
          city: 'Mountain View',
          region: 'California',
          postalCode: '94043',
          timezone: '-07:00',
          lat: 37.386,
          lng: -122.0838,
        },
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('shows validation message for invalid input', async () => {
    render(<App />);

    const input = screen.getByLabelText(/search for any ip address or domain/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'bad input');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(
      screen.getByText(/enter a valid ipv4 address or domain/i)
    ).toBeInTheDocument();
  });

  it('renders lookup results after submit', async () => {
    render(<App />);

    const input = screen.getByLabelText(/search for any ip address or domain/i);
    await userEvent.clear(input);
    await userEvent.type(input, '8.8.8.8');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
    });
    expect(screen.getByText(/mountain view, california, 94043/i)).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('shows api error message when request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ messages: ['Rate limit exceeded'] }),
    });

    render(<App />);

    const input = screen.getByLabelText(/search for any ip address or domain/i);
    await userEvent.clear(input);
    await userEvent.type(input, '79.127.187.171');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/api limit reached/i)).toBeInTheDocument();
    });
  });
});
