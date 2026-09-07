import { useState } from 'react';
import { Modal } from '../Modal/Modal';
import {
  applyImport,
  backup,
  mergeJournal,
  notifyJournal,
  readJournal,
  validateBackup
} from '../../lib/journal';
import type { Journal } from '../../lib/journal';
function download(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ExportImport({ onClose }: { onClose: () => void }) {
  const [preview, setPreview] = useState<Partial<Journal> | null>(null);
  const [message, setMessage] = useState('');
  const [conflicts, setConflicts] = useState<Journal['conflicts']>([]);
  const action = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Storage unavailable.');
    }
  };
  const button =
    'rounded-lg border border-srf-blue/30 px-4 py-3 text-srf-blue hover:bg-srf-lotus/30';
  return (
    <Modal
      onClose={onClose}
      ariaLabel="Preserve your journal"
      panelClassName="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
    >
      <div className="flex justify-between gap-4">
        <h3 className="font-heading text-2xl text-srf-blue">
          Preserve your journal
        </h3>
        <button className={button} onClick={onClose}>
          Close
        </button>
      </div>
      <p className="my-4">
        Backups contain your private reflections. Keep downloaded files
        somewhere you trust.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          className={button}
          onClick={() =>
            action(() => {
              download(
                backup(readJournal(localStorage)),
                'srf-complete-backup.json'
              );
              setMessage('Backup download requested.');
            })
          }
        >
          Complete Backup
        </button>
        <button
          className={button}
          onClick={() =>
            action(() =>
              download(
                {
                  type: 'srf-notes',
                  version: '2.0',
                  data: readJournal(localStorage).notes
                },
                'srf-notes.json'
              )
            )
          }
        >
          Export Notes
        </button>
        <button
          className={button}
          onClick={() =>
            action(() =>
              download(
                {
                  type: 'srf-favorites',
                  version: '2.0',
                  data: readJournal(localStorage).favorites
                },
                'srf-favorites.json'
              )
            )
          }
        >
          Export Favorites
        </button>
        <button
          className={button}
          onClick={() =>
            action(() => {
              const raw = localStorage.getItem('srf-import-recovery');
              if (!raw) throw new Error('No import recovery backup yet.');
              download(JSON.parse(raw).backup, 'srf-before-import.json');
            })
          }
        >
          Download recovery backup
        </button>
        <button
          className={button}
          onClick={() =>
            action(() => {
              setConflicts(readJournal(localStorage).conflicts);
              setMessage(
                'Conflicting versions are retained below and included in complete backups.'
              );
            })
          }
        >
          View preserved conflicts
        </button>
      </div>
      <label className="block my-6">
        Choose a backup to preview
        <input
          className="block mt-2 w-full"
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            setPreview(null);
            if (!file) return;
            try {
              if (file.size > 10_000_000)
                throw new Error('Backup exceeds 10 MB.');
              const incoming = validateBackup(JSON.parse(await file.text()));
              const current = readJournal(localStorage);
              const merged = mergeJournal(current, incoming);
              setPreview(incoming);
              setMessage(
                `${Object.keys(incoming.notes ?? {}).length} notes, ${(incoming.favorites ?? []).length} favorites, ${Object.keys(incoming.drafts ?? {}).length} drafts. ${merged.conflicts.length - current.conflicts.length} conflicting versions will be preserved. Existing notes and appearance stay in place.`
              );
            } catch (err) {
              setMessage(
                err instanceof Error ? err.message : 'Could not read file.'
              );
            }
          }}
        />
      </label>
      <p role="status" className="my-4">
        {message}
      </p>
      {preview && (
        <div className="flex gap-3">
          <button
            className={button}
            onClick={() =>
              action(() => {
                applyImport(localStorage, preview);
                notifyJournal();
                setPreview(null);
                setMessage(
                  'Merged. Original journal retained in the recovery backup.'
                );
              })
            }
          >
            Merge into journal
          </button>
          <button className={button} onClick={() => setPreview(null)}>
            Cancel import
          </button>
        </div>
      )}
      {conflicts.map((n, i) => (
        <article className="my-4 border-t pt-3" key={i}>
          <h4>
            {n.dateKey}, {new Date(n.timestamp).toLocaleString()}
          </h4>
          <p className="whitespace-pre-wrap break-words">{n.content}</p>
        </article>
      ))}
    </Modal>
  );
}
