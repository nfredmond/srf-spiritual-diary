import { Dialog } from '@headlessui/react';
import { ArrowLeft, ArrowRight, Check, Sparkles, Compass, Wrench } from 'lucide-react';
import { useState } from 'react';

interface OnboardingTourProps {
  onComplete: () => void;
}

interface Panel {
  icon: typeof Sparkles;
  title: string;
  body: React.ReactNode;
}

const PANELS: Panel[] = [
  {
    icon: Sparkles,
    title: 'Welcome',
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        <p>
          This is a personal reading companion for{' '}
          <em>The Spiritual Diary</em> by Paramahansa Yogananda. Each day it
          shows a single topic and quote to sit with.
        </p>
        <p>
          It&apos;s an unofficial devotional reader — not affiliated with
          Self-Realization Fellowship. Your favorites and notes stay in your
          browser; nothing is sent anywhere.
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
            <kbd className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200 text-xs">← →</kbd>{' '}
            or swipe — previous / next day
          </li>
          <li>
            <kbd className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200 text-xs">T</kbd>{' '}
            — jump back to today
          </li>
          <li>
            <kbd className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200 text-xs">R</kbd>{' '}
            — a random reading
          </li>
          <li>
            <kbd className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200 text-xs">W</kbd>{' '}
            — browse readings grouped by weekly theme
          </li>
        </ul>
      </div>
    ),
  },
  {
    icon: Wrench,
    title: 'The toolbar, top-right',
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        <ul className="space-y-2">
          <li>Search the full year by keyword or topic</li>
          <li>Save favorites and write private reflections</li>
          <li>Meditation timer with gentle bells</li>
          <li>Reading calendar, reflection overview, preserve-journal export</li>
        </ul>
        <p className="pt-2 text-xs text-gray-600">
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-xs">?</kbd>{' '}
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          <div className="bg-gradient-to-r from-srf-blue to-srf-gold p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Icon className="w-6 h-6" />
              </div>
              <Dialog.Title className="font-heading text-2xl">
                {panel.title}
              </Dialog.Title>
            </div>
          </div>

          <div className="p-6 min-h-[180px]">{panel.body}</div>

          <div className="flex items-center justify-between px-6 pb-6 pt-2 border-t border-srf-blue/10">
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
                  className="text-sm text-gray-600 hover:text-srf-blue transition-colors px-3 py-2"
                >
                  Skip
                </button>
              ) : (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="p-2 rounded-full hover:bg-white/60 transition-colors"
                  aria-label="Previous"
                >
                  <ArrowLeft className="w-4 h-4 text-srf-blue" />
                </button>
              )}

              {isLast ? (
                <button
                  onClick={onComplete}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-full hover:shadow-lg transition-all text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Got it
                </button>
              ) : (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-full hover:shadow-lg transition-all text-sm font-medium"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
