import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteDisplay } from './QuoteDisplay';
import type { DiaryEntry } from '../../types/DiaryEntry';

const baseEntry: DiaryEntry = {
  month: 4,
  day: 17,
  topic: 'Prayer',
  quote: 'Prayer is the direct pipeline to the Divine.',
  source: 'Paramahansa Yogananda',
};

describe('QuoteDisplay', () => {
  it('renders the topic, quote, and source', () => {
    render(<QuoteDisplay entry={baseEntry} dateKey="04-17" />);

    expect(screen.getByText('Prayer')).toBeInTheDocument();
    expect(
      screen.getByText(/Prayer is the direct pipeline to the Divine/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Paramahansa Yogananda/)).toBeInTheDocument();
  });

  it('renders the weekly theme pill when present', () => {
    render(
      <QuoteDisplay
        entry={{ ...baseEntry, weeklyTheme: 'Devotion' }}
        dateKey="04-17"
      />,
    );

    expect(screen.getByText(/Weekly Theme/i)).toBeInTheDocument();
    expect(screen.getByText('Devotion')).toBeInTheDocument();
  });

  it('fires onToggleFavorite when the favorite button is clicked', async () => {
    const onToggleFavorite = vi.fn();
    render(
      <QuoteDisplay
        entry={baseEntry}
        dateKey="04-17"
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Add to favorites/i }),
    );

    expect(onToggleFavorite).toHaveBeenCalledOnce();
  });

  it('reflects the favorited state in the aria-label', () => {
    render(
      <QuoteDisplay
        entry={baseEntry}
        dateKey="04-17"
        isFavorite={true}
        onToggleFavorite={() => {}}
      />,
    );

    expect(
      screen.getByRole('button', { name: /Remove from favorites/i }),
    ).toBeInTheDocument();
  });

  it('fires onOpenNotes when the notes button is clicked', async () => {
    const onOpenNotes = vi.fn();
    render(
      <QuoteDisplay
        entry={baseEntry}
        dateKey="04-17"
        onOpenNotes={onOpenNotes}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Personal notes/i }));

    expect(onOpenNotes).toHaveBeenCalledOnce();
  });

  it('omits favorite and notes buttons when their callbacks are absent', () => {
    render(<QuoteDisplay entry={baseEntry} dateKey="04-17" />);

    expect(
      screen.queryByRole('button', { name: /favorites/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Personal notes/i }),
    ).not.toBeInTheDocument();
  });
});
