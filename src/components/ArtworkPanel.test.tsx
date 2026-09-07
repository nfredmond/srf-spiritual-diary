import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ArtworkPanel } from './ArtworkPanel';

// Transport failures are deliberate fixtures, not evidence of a live Codex job.
const completed = {
  ready: true,
  token: 'test-session',
  message: 'Connected',
  jobs: [{ id: 'test-job', dateKey: '01-01', state: 'completed', message: 'Saved' }]
};
const response = (value: unknown) => ({
  ok: true,
  headers: new Headers({ 'Content-Type': 'application/json' }),
  json: async () => value
});

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('artwork reconnection', () => {
  it('retries a failed preview even when the job and session are unchanged', async () => {
    let attempts = 0;
    const fetcher = vi.fn(async (path: string) => {
      if (path === '/api/status') return response(completed);
      attempts++;
      if (attempts === 1) return { ok: false };
      return { ok: true, blob: async () => new Blob(['test image bytes']) };
    });
    vi.stubGlobal('fetch', fetcher);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-preview');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const app = render(<ArtworkPanel dateKey="01-01" />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect local artwork' }));
    await screen.findByText(/preview could not be loaded/);
    fireEvent.click(screen.getByRole('button', { name: 'Reconnect artwork' }));
    expect(await screen.findByRole('img')).toHaveAttribute('src', 'blob:test-preview');
    expect(attempts).toBe(2);
    expect(fetcher).toHaveBeenLastCalledWith('/api/jobs/test-job/image', {
      headers: { 'X-Diary-Client': 'reader', 'X-Diary-Session': 'test-session' }
    });
    app.unmount();
    expect(revoke).toHaveBeenCalledWith('blob:test-preview');
  });

  it('disables creation after losing the companion connection', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ ...completed, jobs: [] }))
      .mockRejectedValue(new Error('disconnected'));
    vi.stubGlobal('fetch', fetcher);
    render(<ArtworkPanel dateKey="01-01" />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect local artwork' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create artwork' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Reconnect artwork' }));
    await screen.findByText(/To use artwork/);
    expect(screen.getByRole('button', { name: 'Create artwork' })).toBeDisabled();
  });
});
