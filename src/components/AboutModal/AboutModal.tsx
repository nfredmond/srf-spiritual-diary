import { Dialog } from '@headlessui/react';
import { X, BookOpen, Heart, Lock, Keyboard } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 flex items-center justify-between border-b border-srf-blue/10 bg-white p-6 pb-4">
            <Dialog.Title className="font-heading text-2xl text-srf-blue">About this reader</Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-srf-blue/70 transition-colors hover:bg-srf-lotus/50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-6 pt-4 text-gray-800">
            <section>
              <div className="flex items-start gap-3">
                <BookOpen className="mt-1 h-5 w-5 flex-shrink-0 text-srf-blue" />
                <div>
                  <h3 className="mb-2 font-heading text-lg text-srf-blue">What this is</h3>
                  <p className="text-sm leading-relaxed">
                    A quiet reading companion that shows one entry each day from{' '}
                    <em>The Spiritual Diary</em> by Paramahansa Yogananda, with room for your own
                    reflections, favorite readings, and a meditation timer.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-3">
                <Heart className="mt-1 h-5 w-5 flex-shrink-0 text-gold-accent" />
                <div>
                  <h3 className="mb-2 font-heading text-lg text-srf-blue">Attribution</h3>
                  <p className="mb-2 text-sm leading-relaxed">
                    The readings are drawn from <em>The Spiritual Diary</em>, published by
                    Self-Realization Fellowship (Los Angeles, CA). The writings of Paramahansa Yogananda
                    are © Self-Realization Fellowship.
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-srf-blue">
                    This is an independent, unofficial devotional reader. It is not affiliated with,
                    endorsed by, or sponsored by Self-Realization Fellowship.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-3">
                <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-srf-blue" />
                <div>
                  <h3 className="mb-2 font-heading text-lg text-srf-blue">Your reflections stay with you</h3>
                  <p className="text-sm leading-relaxed">
                    Favorites, notes, reading history, and settings are stored only in your browser&apos;s
                    local storage. Nothing is sent to any server. Use the &ldquo;Preserve your
                    journal&rdquo; option in the menu to export a backup.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-3">
                <Keyboard className="mt-1 h-5 w-5 flex-shrink-0 text-srf-blue" />
                <div>
                  <h3 className="mb-2 font-heading text-lg text-srf-blue">Tips</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed">
                    <li>Arrow keys or swipe to move between days</li>
                    <li>
                      Press <kbd className="rounded border border-gray-300 bg-white/70 px-1.5 py-0.5 text-xs">?</kbd>{' '}
                      anytime to see every keyboard shortcut
                    </li>
                    <li>
                      Press <kbd className="rounded border border-gray-300 bg-white/70 px-1.5 py-0.5 text-xs">W</kbd>{' '}
                      to browse readings grouped by weekly theme
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="border-t border-srf-blue/10 pt-4">
              <p className="text-xs leading-relaxed text-gray-600">
                Offered freely as a devotional project, in loving gratitude to Paramahansa Yogananda and
                Self-Realization Fellowship. Not for sale, not monetized, not redistributed. To support
                Yogananda&apos;s teachings, please obtain official Self-Realization Fellowship publications
                directly from{' '}
                <a
                  href="https://yogananda.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-srf-blue underline transition-colors hover:text-gold-accent"
                >
                  yogananda.org
                </a>
                .
              </p>
            </section>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
