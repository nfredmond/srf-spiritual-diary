import { Dialog } from '@headlessui/react';
import { X, BookOpen, Heart, Lock, Keyboard } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 flex justify-between items-center p-6 pb-4 bg-gradient-to-br from-srf-white to-srf-lotus/20 border-b border-srf-blue/10">
            <Dialog.Title className="font-heading text-2xl text-srf-blue">
              About this reader
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 pt-4 space-y-6 text-gray-800">
            <section>
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-srf-blue mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-heading text-lg text-srf-blue mb-2">What this is</h3>
                  <p className="text-sm leading-relaxed">
                    A personal reading companion that shows one entry per day from{' '}
                    <em>The Spiritual Diary</em> by Paramahansa Yogananda, with room
                    for your own reflections, favorites, and a meditation timer.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-srf-gold mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-heading text-lg text-srf-blue mb-2">Attribution</h3>
                  <p className="text-sm leading-relaxed mb-2">
                    Quotes are sourced from <em>The Spiritual Diary</em>, published
                    by Self-Realization Fellowship (Los Angeles, CA). Yogananda&apos;s
                    writings are © Self-Realization Fellowship.
                  </p>
                  <p className="text-sm leading-relaxed font-medium text-srf-blue">
                    This site is an unofficial personal devotional reader. It is not
                    affiliated with, endorsed by, or sponsored by Self-Realization
                    Fellowship.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-srf-blue mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-heading text-lg text-srf-blue mb-2">Your data stays with you</h3>
                  <p className="text-sm leading-relaxed">
                    Favorites, notes, reading streaks, and settings are stored only
                    in your browser&apos;s local storage. Nothing is sent to any
                    server. Use the preserve-journal button in the toolbar to
                    export a backup.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-3">
                <Keyboard className="w-5 h-5 text-srf-blue mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-heading text-lg text-srf-blue mb-2">Tips</h3>
                  <ul className="text-sm leading-relaxed space-y-1 list-disc list-inside">
                    <li>Arrow keys or swipe to move between days</li>
                    <li>
                      Press <kbd className="px-1.5 py-0.5 bg-white/70 border border-gray-300 rounded text-xs">?</kbd>{' '}
                      anytime to see every keyboard shortcut
                    </li>
                    <li>
                      Press <kbd className="px-1.5 py-0.5 bg-white/70 border border-gray-300 rounded text-xs">W</kbd>{' '}
                      to browse readings grouped by weekly theme
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="pt-4 border-t border-srf-blue/10">
              <p className="text-xs text-gray-600 leading-relaxed">
                Built by Nathaniel Ford Redmond as a personal devotional project.
                Not for sale, not monetized, not redistributed. If you want to
                support Paramahansa Yogananda&apos;s teachings, please purchase
                official Self-Realization Fellowship publications directly from{' '}
                <a
                  href="https://yogananda.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-srf-blue underline hover:text-srf-gold transition-colors"
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
