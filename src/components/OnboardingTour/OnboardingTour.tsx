import { Dialog } from '@headlessui/react';
import { ArrowLeft, ArrowRight, Check, Sunrise, Compass, Wrench } from 'lucide-react';
import { useState } from 'react';

interface OnboardingTourProps {
  onComplete: () => void;
}

interface Panel {
  icon: typeof Sunrise;
  title: string;
  body: React.ReactNode;
}

const PANELS: Panel[] = [
  {
    icon: Sunrise,
    title: 'Welcome',
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        <p>
          This is a quiet reading companion for <em>The Spiritual Diary</em> by Paramahansa Yogananda.
          Each day it offers a single topic and reading to sit with.
        </p>
        <p>
          It&apos;s an independent, unofficial devotional reader — not affiliated with Self-Realization
          Fellowship. Your favorites and reflections stay in your browser; nothing is sent anywhere.
        </p>
      </div>
    ),
  },
  {
    icon: Compass,
    title: 'Move through the year',
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        <ul className="space-y-2">
          <li>
            <kbd className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs">← →</kbd> or
            swipe — previous / next day
          </li>
          <li>
            <kbd className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs">T</kbd> — jump
            back to today
          </li>
          <li>
            <kbd className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs">R</kbd> — let a
            reading find you
          </li>
          <li>
            <kbd className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs">W</kbd> —
            browse readings grouped by weekly theme
          </li>
        </ul>
      </div>
    ),
  },
  {
    icon: Wrench,
    title: 'The quiet toolbar',
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        <ul className="space-y-2">
          <li>Search available readings by keyword or topic</li>
          <li>Save favorite readings and write private reflections</li>
          <li>A meditation timer with a gentle bell</li>
          <li>
            The <span className="font-medium">⋯</span> menu holds the reading calendar, weekly themes,
            and a backup of your journal
          </li>
        </ul>
        <p className="pt-2 text-xs text-gray-600">
          Press <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs">?</kbd>{' '}
          anytime to see every keyboard shortcut.
        </p>
      </div>
    ),
  },
];

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const panel = PANELS[step];
  const Icon = panel.icon;
  const isLast = step === PANELS.length - 1;

  return (
    <Dialog open={true} onClose={onComplete} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="reader-modal w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="bg-srf-blue p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/15 p-2">
                <Icon className="h-6 w-6" />
              </div>
              <Dialog.Title className="font-heading text-2xl" style={{ color: 'white' }}>{panel.title}</Dialog.Title>
            </div>
          </div>

          <div className="min-h-[180px] p-6">{panel.body}</div>

          <div className="flex items-center justify-between border-t border-srf-blue/10 px-6 pb-6 pt-2">
            <div className="flex gap-1.5" role="tablist" aria-label="Tour progress">
              {PANELS.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === step ? 'w-6 bg-srf-blue' : 'w-2 bg-srf-blue/30'
                  }`}
                  aria-current={index === step ? 'step' : undefined}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step === 0 ? (
                <button
                  onClick={onComplete}
                  className="px-3 py-2 text-sm text-gray-600 transition-colors hover:text-srf-blue"
                >
                  Skip
                </button>
              ) : (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-full p-2 transition-colors hover:bg-srf-lotus/50"
                  aria-label="Previous"
                >
                  <ArrowLeft className="h-4 w-4 text-srf-blue" />
                </button>
              )}

              {isLast ? (
                <button
                  onClick={onComplete}
                  className="flex items-center gap-2 rounded-full bg-srf-blue px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-srf-blue-700"
                >
                  <Check className="h-4 w-4" />
                  Got it
                </button>
              ) : (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center gap-2 rounded-full bg-srf-blue px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-srf-blue-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
