import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AboutModal } from './AboutModal';

describe('AboutModal', () => {
  it('renders the four sections', () => {
    render(<AboutModal onClose={() => {}} />);

    expect(screen.getByRole('heading', { name: /About this reader/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /What this is/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Attribution/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your data stays with you/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Tips$/i })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<AboutModal onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /Close/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('links to yogananda.org with target=_blank and rel=noopener noreferrer', () => {
    render(<AboutModal onClose={() => {}} />);

    const link = screen.getByRole('link', { name: /yogananda\.org/i });
    expect(link).toHaveAttribute('href', 'https://yogananda.org');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('discloses the unofficial / unaffiliated posture', () => {
    render(<AboutModal onClose={() => {}} />);

    expect(
      screen.getByText(/unofficial personal devotional reader/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not affiliated with, endorsed by, or sponsored/i),
    ).toBeInTheDocument();
  });
});
