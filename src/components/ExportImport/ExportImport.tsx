import { motion } from 'framer-motion';
import { X, Download, Upload, FileText, Heart, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ExportImportProps {
  onClose: () => void;
}

export function ExportImport({ onClose }: ExportImportProps) {
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const clearMessageTimeoutRef = useRef<number | null>(null);

  const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  const setStatus = (message: string, type: 'success' | 'error') => {
    setStatusType(type);
    setStatusMessage(message);

    if (clearMessageTimeoutRef.current) {
      window.clearTimeout(clearMessageTimeoutRef.current);
    }

    clearMessageTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (clearMessageTimeoutRef.current) {
        window.clearTimeout(clearMessageTimeoutRef.current);
      }
    };
  }, []);

  const validateImportPayload = (payload: unknown) => {
    if (!isObjectRecord(payload)) {
      throw new Error('Invalid file format');
    }

    const { type, version, data } = payload;
    if (typeof type !== 'string' || typeof version !== 'string' || data === undefined) {
      throw new Error('Invalid file format');
    }

    switch (type) {
      case 'srf-favorites':
        if (!Array.isArray(data)) {
          throw new Error('Invalid favorites data');
        }
        return {
          type,
          data,
        };
      case 'srf-notes':
        if (!isObjectRecord(data)) {
          throw new Error('Invalid notes data');
        }
        return {
          type,
          data,
        };
      case 'srf-complete-backup':
        if (!isObjectRecord(data)) {
          throw new Error('Invalid backup data');
        }
        if ('favorites' in data && !Array.isArray(data.favorites)) {
          throw new Error('Invalid favorites data');
        }
        if ('notes' in data && !isObjectRecord(data.notes)) {
          throw new Error('Invalid notes data');
        }
        if ('history' in data && !isObjectRecord(data.history)) {
          throw new Error('Invalid history data');
        }
        if ('theme' in data && typeof data.theme !== 'string') {
          throw new Error('Invalid theme data');
        }
        return {
          type,
          data,
        };
      default:
        throw new Error('Unknown backup type');
    }
  };

  const handleExportFavorites = () => {
    const favorites = localStorage.getItem('srf-favorites');
    if (!favorites) {
      setStatus('No favorites to export', 'error');
      return;
    }

    try {
      const data = {
        type: 'srf-favorites',
        version: '2.0',
        exportDate: new Date().toISOString(),
        data: JSON.parse(favorites),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `srf-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus('Favorites exported successfully.', 'success');
    } catch {
      setStatus('Unable to export favorites. Stored data appears invalid.', 'error');
    }
  };

  const handleExportNotes = () => {
    const notes = localStorage.getItem('srf-notes');
    if (!notes) {
      setStatus('No notes to export', 'error');
      return;
    }

    try {
      const data = {
        type: 'srf-notes',
        version: '2.0',
        exportDate: new Date().toISOString(),
        data: JSON.parse(notes),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `srf-notes-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus('Notes exported successfully.', 'success');
    } catch {
      setStatus('Unable to export notes. Stored data appears invalid.', 'error');
    }
  };

  const handleExportAll = () => {
    try {
      const favorites = localStorage.getItem('srf-favorites');
      const notes = localStorage.getItem('srf-notes');
      const history = localStorage.getItem('srf-reading-history');
      const theme = localStorage.getItem('srf-theme');

      const data = {
        type: 'srf-complete-backup',
        version: '2.0',
        exportDate: new Date().toISOString(),
        data: {
          favorites: favorites ? JSON.parse(favorites) : [],
          notes: notes ? JSON.parse(notes) : {},
          history: history ? JSON.parse(history) : {},
          theme: theme || 'light',
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `srf-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus('Complete backup exported successfully.', 'success');
    } catch {
      setStatus('Unable to export complete backup. Stored data appears invalid.', 'error');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedContent = JSON.parse(content);
        const data = validateImportPayload(parsedContent);

        let imported = 0;

        switch (data.type) {
          case 'srf-favorites':
            localStorage.setItem('srf-favorites', JSON.stringify(data.data));
            imported = data.data.length;
            setStatus(`Successfully imported ${imported} favorites!`, 'success');
            break;

          case 'srf-notes':
            localStorage.setItem('srf-notes', JSON.stringify(data.data));
            imported = Object.keys(data.data).length;
            setStatus(`Successfully imported ${imported} notes!`, 'success');
            break;

          case 'srf-complete-backup':
            if (data.data.favorites) {
              localStorage.setItem('srf-favorites', JSON.stringify(data.data.favorites));
            }
            if (data.data.notes) {
              localStorage.setItem('srf-notes', JSON.stringify(data.data.notes));
            }
            if (data.data.history) {
              localStorage.setItem('srf-reading-history', JSON.stringify(data.data.history));
            }
            if (typeof data.data.theme === 'string') {
              localStorage.setItem('srf-theme', data.data.theme);
            }
            setStatus('Successfully imported complete backup! Please refresh the page.', 'success');
            break;

          default:
            throw new Error('Unknown backup type');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid file format';
        setStatus(`Error: ${message}`, 'error');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Backup & Restore
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Export Section */}
        <div className="mb-6">
          <h4 className="font-heading text-lg text-srf-blue mb-3 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Data
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handleExportFavorites}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl hover:shadow-md transition-all"
            >
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-sm font-medium">Export Favorites</span>
            </button>

            <button
              onClick={handleExportNotes}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl hover:shadow-md transition-all"
            >
              <BookOpen className="w-8 h-8 text-srf-gold" />
              <span className="text-sm font-medium">Export Notes</span>
            </button>

            <button
              onClick={handleExportAll}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-srf-blue to-srf-gold text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Download className="w-8 h-8" />
              <span className="text-sm font-medium">Complete Backup</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <h4 className="font-heading text-lg text-srf-blue mb-3 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import / Restore
          </h4>
          <label className="block">
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border-2 border-dashed border-srf-blue/30 hover:border-srf-blue hover:bg-srf-blue/5 transition-all cursor-pointer">
              <Upload className="w-12 h-12 text-srf-blue" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Click to select backup file</p>
                <p className="text-xs text-gray-500 mt-1">Supports .json files exported from this app</p>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg text-center ${
                statusType === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
              role={statusType === 'error' ? 'alert' : 'status'}
              aria-live={statusType === 'error' ? 'assertive' : 'polite'}
            >
              {statusMessage}
            </motion.div>
          )}
          <div
            className="sr-only"
            role="status"
            aria-live={statusType === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
          >
            {statusMessage}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Regular backups ensure you never lose your favorites, notes, and reading progress. Export your data periodically for safekeeping!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
