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

describe('availability and return visits',()=>{
  beforeEach(()=>{localStorage.clear();localStorage.setItem('srf-onboarding-completed','true');});
  afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
  it('shows February 29 honestly and navigates only after choosing February 28',async()=>{
    vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date(2024,1,29,12));
    vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({entries:{'02-28':{month:2,day:28,topic:'Test topic',weeklyTheme:'Test theme',quote:'February 28 test reading',source:'Test author'}}})})));
    render(<App/>);expect(await screen.findByText('Reading unavailable for February 29')).toBeInTheDocument();expect(screen.queryByText(/February 28 test reading/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Read February 28 instead'}));expect(await screen.findByText(/February 28 test reading/)).toBeInTheDocument();
  });
  it('distinguishes HTTP failure from missing content and retries',async()=>{
    const fetcher=vi.fn().mockResolvedValueOnce({ok:false}).mockResolvedValue({ok:true,json:async()=>buildDataset()});vi.stubGlobal('fetch',fetcher);
    render(<App/>);expect(await screen.findByText('Readings could not be loaded')).toBeInTheDocument();expect(screen.queryByText(/Reading unavailable for/)).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Retry loading'}));expect(await screen.findByText(/Quote number 0 about the divine/)).toBeInTheDocument();expect(screen.getByRole('navigation',{name:/Reading rhythm/})).toHaveTextContent('Topic 0');
  });
  it('rolls today into the new year on focus while preserving an open reflection',async()=>{
    vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date(2024,11,31,23,59));const data=buildDataset();vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>data})));
    render(<App/>);await screen.findByText(/Quote number 0 about the divine/);fireEvent.click(screen.getByRole('button',{name:'Reflect'}));await screen.findByRole('textbox');fireEvent.change(screen.getByRole('textbox'),{target:{value:'year end draft'}});
    vi.setSystemTime(new Date(2025,0,1,0,1));fireEvent.focus(window);expect(screen.getByRole('textbox')).toHaveValue('year end draft');fireEvent.click(screen.getByRole('button',{name:'Close'}));fireEvent.focus(window);expect(await screen.findByText(/Quote number 1 about the divine/)).toBeInTheDocument();
  });
});
