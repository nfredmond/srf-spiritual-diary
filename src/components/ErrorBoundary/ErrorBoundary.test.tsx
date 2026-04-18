import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Silence React's own error re-logging so the test output stays readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('shows the reload toast when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dismiss/i })).toBeInTheDocument();
  });

  it('Dismiss clears the error and re-renders children', async () => {
    function ConditionalBoom({ shouldThrow }: { shouldThrow: boolean }) {
      if (shouldThrow) throw new Error('boom');
      return <p>recovered</p>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalBoom shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <ConditionalBoom shouldThrow={false} />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: /Dismiss/i }));
    expect(screen.getByText('recovered')).toBeInTheDocument();
  });
});
