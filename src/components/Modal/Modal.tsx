import { type ReactNode } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { motion } from 'framer-motion';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  /** Accessible name for the dialog when it has no visible title element. */
  ariaLabel?: string;
  /** Classes for the panel surface (width, padding, etc.). */
  panelClassName?: string;
}

/**
 * A single accessible overlay used by every panel in the app. Built on Headless
 * UI's Dialog, so it provides — for free and correctly — a focus trap, Escape
 * to close, outside-click to close, focus restoration to the trigger, and
 * background scroll lock. The gentle entrance animation honors the reader's
 * reduced-motion preference via the app-level MotionConfig.
 */
export function Modal({ onClose, children, ariaLabel, panelClassName = '' }: ModalProps) {
  return (
    <Dialog open onClose={onClose} aria-label={ariaLabel} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={panelClassName}
          >
            {children}
          </motion.div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
