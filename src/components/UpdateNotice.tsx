import { useRegisterSW } from 'virtual:pwa-register/react';
export function UpdateNotice({ paused }: { paused: boolean }) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <aside
      className="fixed bottom-3 left-3 right-3 z-40 rounded-xl border bg-white p-4 shadow-lg"
      role="status"
    >
      <p>
        A reader update is ready.{' '}
        {paused
          ? 'Close open panels after saving your work to update.'
          : 'Saved drafts will be available after reloading.'}
      </p>
      <button
        className="mt-2 rounded border px-4 py-2 disabled:opacity-50"
        disabled={paused}
        onClick={() => void updateServiceWorker(true)}
      >
        Update and reload
      </button>
    </aside>
  );
}
