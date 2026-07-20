import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { addDays } from 'date-fns';
import App from './App';
import { toMMDD } from './lib/diaryDate';

// Integration test for the core reading flow: load today's reading, move
// through days with the keyboard, and announce the change to screen readers.
// A small in-memory dataset (today ± 3 days) is served via a mocked fetch so
// the test is deterministic regardless of the real calendar date.

function buildDataset() {
  const today = new Date();
  const entries: Record<string, unknown> = {};
  for (let i = -3; i <= 3; i++) {
    const d = addDays(today, i);
    entries[toMMDD(d)] = {
      month: d.getMonth() + 1,
      day: d.getDate(),
      topic: `Topic ${i}`,
      weeklyTheme: `Theme ${i}`,
      quote: `Quote number ${i} about the divine`,
      source: i === 0 ? 'Paramahansa Yogananda' : 'Sri Gyanamata',
    };
  }
  return { entries };
}

describe('App (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('srf-onboarding-completed', 'true'); // skip the first-visit tour
    const data = buildDataset();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        String(url).includes('diary-entries.json')
          ? Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response)
          : Promise.reject(new Error(`unexpected fetch: ${url}`)),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders today's reading with faithful attribution and the unofficial disclaimer", async () => {
    render(<App />);

    expect(await screen.findByText(/Quote number 0 about the divine/)).toBeInTheDocument();
    // Attribution reflects the entry's real source (the em-dash form only appears
    // on the reading card, not the header/footer prose).
    expect(screen.getByText(/—\s*Paramahansa Yogananda/)).toBeInTheDocument();
    expect(screen.getAllByText(/not affiliated with/i).length).toBeGreaterThan(0);
  });

  it('advances a day on ArrowRight and announces the new reading to screen readers', async () => {
    render(<App />);
    await screen.findByText(/Quote number 0 about the divine/);

    fireEvent.keyDown(document.body, { key: 'ArrowRight' });

    expect(await screen.findByText(/Quote number 1 about the divine/)).toBeInTheDocument();
    expect(screen.queryByText(/Quote number 0 about the divine/)).not.toBeInTheDocument();

    // The polite live region carries the new day's topic.
    const announced = screen
      .getAllByRole('status')
      .map((n) => n.textContent)
      .join(' ');
    expect(announced).toMatch(/Topic 1/);
  });

  it('returns to today when T is pressed after navigating away', async () => {
    render(<App />);
    await screen.findByText(/Quote number 0 about the divine/);

    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    expect(await screen.findByText(/Quote number -1 about the divine/)).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: 't' });
    expect(await screen.findByText(/Quote number 0 about the divine/)).toBeInTheDocument();
  });
});
