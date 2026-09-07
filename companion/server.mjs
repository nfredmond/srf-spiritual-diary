import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { homedir } from 'node:os';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { JobManager, codexStatus, MODEL } from './jobs.mjs';
import { validateDiaryData } from '../src/lib/diaryData.ts';
const repo = fileURLToPath(new URL('../', import.meta.url));
export async function startCompanion({
  port = 4317,
  root = join(homedir(), '.local/share/spiritual-diary/artwork'),
  dist = join(repo, 'dist'),
  bin = process.env.SRF_CODEX_BIN || 'codex',
  manager,
  status = () => codexStatus(bin)
} = {}) {
  const jobs = manager ?? new JobManager({ root, bin });
  await jobs.initialize();
  const data = validateDiaryData(
    JSON.parse(await readFile(join(dist, 'data/diary-entries.json'), 'utf8'))
  );
  const token = randomBytes(32).toString('hex');
  let creating = false;
  const sameToken = (v) =>
    typeof v === 'string' &&
    v.length === token.length &&
    timingSafeEqual(Buffer.from(v), Buffer.from(token));
  const send = (res, code, value) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(value));
  };
  let origin;
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (
      req.headers.host !== new URL(origin).host ||
      (req.headers.origin && req.headers.origin !== origin) ||
      req.headers['sec-fetch-site'] === 'cross-site'
    )
      return send(res, 403, { error: 'Local same-origin access required.' });
    try {
      const url = new URL(req.url, origin),
        path = url.pathname;
      if (path.startsWith('/api/')) {
        // A custom header forces hostile sites through a denied CORS preflight.
        if (req.headers['x-diary-client'] !== 'reader')
          return send(res, 403, { error: 'Reader access required.' });
        if (req.method === 'GET' && path === '/api/status')
          return send(res, 200, {
            ...(await status()),
            model: MODEL,
            token,
            jobs: [...jobs.jobs.values()]
              .map((j) => jobs.public(j))
              .sort((a, b) => b.created.localeCompare(a.created))
              .slice(0, 100)
          });
        if (!sameToken(req.headers['x-diary-session']))
          return send(res, 403, {
            error: 'Session access required. Reconnect the reader.'
          });
        if (req.method === 'POST' && path === '/api/jobs') {
          if (creating)
            return send(res, 409, { error: 'Another generation is starting.' });
          if (req.headers['content-type'] !== 'application/json')
            return send(res, 415, { error: 'JSON required.' });
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > 1024)
              return send(res, 413, { error: 'Request too large.' });
          }
          const input = JSON.parse(body);
          if (
            !input ||
            Object.keys(input).some((k) => !['dateKey', 'style'].includes(k)) ||
            !data.entries[input.dateKey] ||
            !['nature', 'abstract'].includes(input.style)
          )
            return send(res, 400, {
              error: 'Choose an available reading and artwork style.'
            });
          creating = true;
          try {
            const auth = await status();
            if (!auth.ready) return send(res, 503, { error: auth.message });
            return send(
              res,
              201,
              await jobs.create(
                input.dateKey,
                data.entries[input.dateKey].topic,
                input.style
              )
            );
          } finally {
            creating = false;
          }
        }
        const match = path.match(
          /^\/api\/jobs\/([\da-f-]{36})(\/cancel|\/image)?$/
        );
        if (match) {
          const job = jobs.jobs.get(match[1]);
          if (!job) return send(res, 404, { error: 'Artwork job not found.' });
          if (req.method === 'GET' && !match[2])
            return send(res, 200, jobs.public(job));
          if (req.method === 'POST' && match[2] === '/cancel')
            return send(res, 200, await jobs.cancel(job.id));
          if (
            req.method === 'GET' &&
            match[2] === '/image' &&
            job.state === 'completed'
          ) {
            res.writeHead(200, {
              'Content-Type': 'image/png',
              'Content-Disposition': `attachment; filename="diary-artwork-${job.dateKey}-${job.id}.png"`
            });
            return res.end(
              await readFile(join(jobs.root, job.id, 'artwork.png'))
            );
          }
        }
        return send(res, 404, { error: 'Endpoint not found.' });
      }
      if (!['GET', 'HEAD'].includes(req.method))
        return send(res, 405, { error: 'Method not allowed.' });
      const file = await realpath(
        resolve(
          dist,
          '.' + decodeURIComponent(path === '/' ? '/index.html' : path)
        )
      ).catch(() => null);
      const base = await realpath(dist);
      if (!file || !file.startsWith(base + sep))
        return send(res, 404, { error: 'File not found.' });
      const bytes = await readFile(file);
      const type =
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
          '.woff2': 'font/woff2'
        }[extname(file)] ?? 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch (e) {
      send(res, e instanceof SyntaxError ? 400 : 409, {
        error:
          e instanceof SyntaxError
            ? 'Invalid JSON.'
            : 'Request could not be completed. Check whether another job is running and retry.'
      });
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolveListen);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
  return {
    server,
    jobs,
    origin,
    close: async () => {
      await jobs.close();
      await new Promise((r) => server.close(r));
    }
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const app = await startCompanion({
    port: Number(process.env.SRF_PORT ?? 4317)
  });
  console.log(`Spiritual Diary companion: ${app.origin}`);
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.once(signal, () => void app.close().then(() => process.exit(0)));
}
