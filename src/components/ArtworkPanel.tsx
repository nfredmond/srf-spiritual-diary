import { useEffect, useState } from 'react';
interface Job {
  id: string;
  dateKey: string;
  state: 'running' | 'completed' | 'failed' | 'cancelled';
  message: string;
}
export function ArtworkPanel({ dateKey }: { dateKey: string }) {
  const [imageUrl, setImageUrl] = useState('');
  const [connected, setConnected] = useState(false),
    [ready, setReady] = useState(false),
    [token, setToken] = useState(''),
    [message, setMessage] = useState(''),
    [job, setJob] = useState<Job | null>(null),
    [style, setStyle] = useState('nature'),
    [busy, setBusy] = useState(false);
  const api = async (path: string, method = 'GET', body?: unknown) => {
    const response = await fetch(path, {
      method,
      headers: {
        'X-Diary-Client': 'reader',
        'X-Diary-Session': token,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.headers.get('content-type')?.includes('application/json'))
      throw new Error('Local companion is not running.');
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || 'Local companion unavailable.');
    return data;
  };
  const connect = async () => {
    setBusy(true);
    try {
      const data = await api('/api/status');
      setToken(data.token);
      setConnected(true);
      setReady(data.ready);
      setMessage(data.message);
      setJob(data.jobs.find((j: Job) => j.dateKey === dateKey) ?? null);
    } catch {
      setMessage(
        'To use artwork, run npm run companion on your computer and open http://127.0.0.1:4317. The public reader works without it.'
      );
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (!job || job.state !== 'running') return;
    let active = true;
    const timer = setInterval(() => {
      void api(`/api/jobs/${job.id}`)
        .then((j) => {
          if (active) {
            setJob(j);
            setMessage('');
          }
        })
        .catch(() => {
          if (active)
            setMessage(
              'Connection lost. Generation may still be running. Reconnect to check.'
            );
        });
    }, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [job?.id, job?.state, token]);
  useEffect(() => {
    if (job?.state !== 'completed') {
      setImageUrl('');
      return;
    }
    let active = true,
      url = '';
    void fetch(`/api/jobs/${job.id}/image`, {
      headers: { 'X-Diary-Client': 'reader', 'X-Diary-Session': token }
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Image unavailable');
        return response.blob();
      })
      .then((blob) => {
        if (active) {
          url = URL.createObjectURL(blob);
          setImageUrl(url);
        }
      })
      .catch(() => {
        if (active)
          setMessage(
            'Artwork is saved but its preview could not be loaded. Reconnect to retry.'
          );
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [job?.id, job?.state, token]);
  const action = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Artwork request failed.');
    } finally {
      setBusy(false);
    }
  };
  const button =
    'rounded-lg border border-srf-blue/30 px-4 py-2 disabled:opacity-50';
  return (
    <section className="mt-6 border-t pt-4 text-srf-blue">
      <h4 className="font-heading text-xl">Optional artwork</h4>
      <p className="my-3 text-sm">
        Create nature or abstract art inspired by this topic. Uses your
        signed-in Codex allowance. Your reflection stays private. The exact
        reading is kept separately in the quotation card above.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          disabled={busy}
          className={button}
          onClick={() => void connect()}
        >
          {connected ? 'Reconnect artwork' : 'Connect local artwork'}
        </button>
        {connected && (
          <>
            <label>
              Style{' '}
              <select
                className="rounded border p-2"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="nature">Nature</option>
                <option value="abstract">Abstract</option>
              </select>
            </label>
            <button
              className={button}
              disabled={!ready || busy || job?.state === 'running'}
              onClick={() =>
                void action(async () => {
                  setJob(await api('/api/jobs', 'POST', { dateKey, style }));
                  setMessage('');
                })
              }
            >
              {job?.state === 'failed' || job?.state === 'cancelled'
                ? 'Retry artwork'
                : 'Create artwork'}
            </button>
          </>
        )}
        {job?.state === 'running' && (
          <button
            className={button}
            disabled={busy}
            onClick={() =>
              void action(async () =>
                setJob(await api(`/api/jobs/${job.id}/cancel`, 'POST'))
              )
            }
          >
            Cancel generation
          </button>
        )}
        {job?.state === 'completed' && (
          <button
            className={button}
            disabled={busy}
            onClick={() =>
              void action(async () => {
                const response = await fetch(`/api/jobs/${job.id}/image`, {
                  headers: {
                    'X-Diary-Client': 'reader',
                    'X-Diary-Session': token
                  }
                });
                if (!response.ok)
                  throw new Error(
                    'Could not download artwork. Reconnect and retry.'
                  );
                const url = URL.createObjectURL(await response.blob());
                const a = document.createElement('a');
                a.href = url;
                a.download = `diary-artwork-${dateKey}.png`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              })
            }
          >
            Download artwork
          </button>
        )}
      </div>
      {imageUrl && (
        <figure className="mt-4">
          <img
            className="w-full rounded-lg"
            src={imageUrl}
            alt="Generated nature or abstract artwork inspired by the reading topic"
          />
          <figcaption className="text-xs mt-2">
            AI-generated artwork. The quotation is preserved separately above.
          </figcaption>
        </figure>
      )}
      <p role="status" className="mt-3 text-sm">
        {message || job?.message}
      </p>
    </section>
  );
}
