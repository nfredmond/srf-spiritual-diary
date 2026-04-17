import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeekRhythm } from './WeekRhythm';

const fixture = {
  entries: {
    '04-14': { month: 4, day: 14, topic: 'Patience', quote: 'q', source: 's' },
    '04-15': { month: 4, day: 15, topic: 'Humility', quote: 'q', source: 's' },
    '04-16': { month: 4, day: 16, topic: 'Prayer', quote: 'q', source: 's' },
    '04-17': { month: 4, day: 17, topic: 'Devotion', quote: 'q', source: 's' },
    '04-18': { month: 4, day: 18, topic: 'Surrender', quote: 'q', source: 's' },
    '04-19': { month: 4, day: 19, topic: 'Faith', quote: 'q', source: 's' },
    '04-20': { month: 4, day: 20, topic: 'Joy', quote: 'q', source: 's' },
  },
};

describe('WeekRhythm', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(fixture) }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders 7 tiles centered on the selected date with topics from JSON', async () => {
    render(
      <WeekRhythm
        selectedDate={new Date(2026, 3, 17)}
        visitedKeys={[]}
        onSelectDate={() => {}}
      />,
    );

    // 7 tile buttons
    const tiles = screen.getAllByRole('button');
    expect(tiles).toHaveLength(7);

    // After fetch resolves, topics render
    await waitFor(() => {
      expect(screen.getByText('Devotion')).toBeInTheDocument();
    });
    expect(screen.getByText('Patience')).toBeInTheDocument();
    expect(screen.getByText('Joy')).toBeInTheDocument();
  });

  it('marks the selected tile with aria-current="date"', () => {
    render(
      <WeekRhythm
        selectedDate={new Date(2026, 3, 17)}
        visitedKeys={[]}
        onSelectDate={() => {}}
      />,
    );

    const current = screen.getByRole('button', { current: 'date' });
    expect(current).toHaveTextContent('17');
  });

  it('calls onSelectDate when a tile is clicked', async () => {
    const onSelectDate = vi.fn();
    render(
      <WeekRhythm
        selectedDate={new Date(2026, 3, 17)}
        visitedKeys={[]}
        onSelectDate={onSelectDate}
      />,
    );

    // Click the rightmost tile (3 days after selected → day 20)
    const tiles = screen.getAllByRole('button');
    await userEvent.click(tiles[tiles.length - 1]);

    expect(onSelectDate).toHaveBeenCalledOnce();
    const arg = onSelectDate.mock.calls[0][0] as Date;
    expect(arg.getDate()).toBe(20);
  });

  it('tags visited tiles in their aria-label', async () => {
    render(
      <WeekRhythm
        selectedDate={new Date(2026, 3, 17)}
        visitedKeys={['04-15']}
        onSelectDate={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Humility')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /Wed 15, Humility \(visited\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Thu 16, Prayer$/i }),
    ).toBeInTheDocument();
  });
});
