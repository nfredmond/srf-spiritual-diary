import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateNavigator } from './DateNavigator';

describe('DateNavigator', () => {
  it('renders the formatted selected date', () => {
    render(
      <DateNavigator
        selectedDate={new Date(2026, 3, 17)}
        onDateChange={() => {}}
      />,
    );

    expect(screen.getByText('April 17')).toBeInTheDocument();
  });

  it('Previous-day button calls onDateChange with the day before', async () => {
    const onDateChange = vi.fn();
    render(
      <DateNavigator
        selectedDate={new Date(2026, 3, 17)}
        onDateChange={onDateChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Previous day/i }));

    expect(onDateChange).toHaveBeenCalledOnce();
    const arg = onDateChange.mock.calls[0][0] as Date;
    expect(arg.getDate()).toBe(16);
    expect(arg.getMonth()).toBe(3);
  });

  it('Next-day button calls onDateChange with the day after', async () => {
    const onDateChange = vi.fn();
    render(
      <DateNavigator
        selectedDate={new Date(2026, 3, 17)}
        onDateChange={onDateChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Next day/i }));

    const arg = onDateChange.mock.calls[0][0] as Date;
    expect(arg.getDate()).toBe(18);
  });

  it('Today button calls onDateChange with a fresh current date', async () => {
    const onDateChange = vi.fn();
    render(
      <DateNavigator
        selectedDate={new Date(2026, 3, 17)}
        onDateChange={onDateChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /^Today$/i }));

    expect(onDateChange).toHaveBeenCalledOnce();
    const arg = onDateChange.mock.calls[0][0] as Date;
    const now = new Date();
    expect(arg.getFullYear()).toBe(now.getFullYear());
    expect(arg.getMonth()).toBe(now.getMonth());
    expect(arg.getDate()).toBe(now.getDate());
  });

  it('clicking the date label opens the date picker modal', async () => {
    render(
      <DateNavigator
        selectedDate={new Date(2026, 3, 17)}
        onDateChange={() => {}}
      />,
    );

    // The date-label button's accessible name is its text content ("April 17")
    await userEvent.click(screen.getByRole('button', { name: /April 17/i }));

    // DatePickerModal renders a Dialog
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});

it('allows typing a replacement year and prevents selecting from an incomplete year', async () => {
  const onDateChange = vi.fn();
  render(<DateNavigator selectedDate={new Date(2026, 1, 28)} onDateChange={onDateChange} />);
  await userEvent.click(screen.getByTitle('Choose a date'));
  const year = screen.getByRole('spinbutton', { name: 'Year' });
  await userEvent.clear(year);
  expect(screen.getByLabelText('February 28', { exact: true })).toBeDisabled();
  await userEvent.type(year, '2024');
  await userEvent.click(screen.getByRole('button', { name: 'February 29, reading unavailable' }));
  expect(onDateChange).toHaveBeenCalledWith(new Date(2024, 1, 29));
});
