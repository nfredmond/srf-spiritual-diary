import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingTour } from './OnboardingTour';

describe('OnboardingTour', () => {
  it('starts on the Welcome panel', () => {
    render(<OnboardingTour onComplete={() => {}} />);

    expect(screen.getByRole('heading', { name: /Welcome/i })).toBeInTheDocument();
    // Step 0 shows Skip, not Back
    expect(screen.getByRole('button', { name: /Skip/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Previous/i })).not.toBeInTheDocument();
  });

  it('Skip on step 0 calls onComplete', async () => {
    const onComplete = vi.fn();
    render(<OnboardingTour onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Skip/i }));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('Next advances through all three panels and the final Got-it calls onComplete', async () => {
    const onComplete = vi.fn();
    render(<OnboardingTour onComplete={onComplete} />);

    // Panel 1 → Panel 2
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByRole('heading', { name: /Move through the year/i })).toBeInTheDocument();

    // Panel 2 → Panel 3
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByRole('heading', { name: /The toolbar/i })).toBeInTheDocument();

    // Panel 3 has Got it instead of Next
    expect(screen.queryByRole('button', { name: /^Next$/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Got it/i }));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('exposes the current step via aria-current on the progress dots', async () => {
    render(<OnboardingTour onComplete={() => {}} />);

    const tablist = screen.getByRole('tablist', { name: /Tour progress/i });
    const dots = tablist.querySelectorAll('span');
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute('aria-current', 'step');
    expect(dots[1]).not.toHaveAttribute('aria-current');

    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    expect(dots[0]).not.toHaveAttribute('aria-current');
    expect(dots[1]).toHaveAttribute('aria-current', 'step');
  });
});
