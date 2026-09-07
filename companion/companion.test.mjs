import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { spawn } from 'node:child_process';
import {
  childEnvironment,
  generationArgs,
  generationPrompt,
  codexStatus,
  failureMessage,
  JobManager,
  validatePng
} from './jobs.mjs';
import { startCompanion } from './server.mjs';
function png() {
  const chunk = (name, body) => {
    const tag = Buffer.from(name);
    const data = Buffer.concat([tag, body]);
    let crc = 0xffffffff;
    for (const b of data) {
      crc ^= b;
      for (let i = 0; i < 8; i++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    const out = Buffer.alloc(body.length + 12);
    out.writeUInt32BE(body.length);
    data.copy(out, 4);
    out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, out.length - 4);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(256);
  header.writeUInt32BE(256, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.alloc((256 * 3 + 1) * 256))),
    chunk('IEND', Buffer.alloc(0))
  ]);
}
const fixture = png();
async function terminal(jobs, id) {
  for (let i = 0; i < 200; i++) {
    const job = jobs.jobs.get(id);
    if (job.state !== 'running') return job;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error('Test job did not finish');
}
function launchCode(code) {
  return (_bin, _args, options) =>
    spawn(process.execPath, ['--input-type=module', '-e', code], options);
}
test('only Astra and ChatGPT are requested; key credentials and shell tools are excluded', () => {
  const env = childEnvironment({
    HOME: '/home/test',
    PATH: '/bin',
    OPENAI_API_KEY: 'secret',
    CODEX_API_KEY: 'secret',
    AWS_SECRET_ACCESS_KEY: 'secret',
    NODE_OPTIONS: 'bad',
    OPENAI_BASE_URL: 'bad'
  });
  assert.deepEqual(env, { HOME: '/home/test', PATH: '/bin' });
  const args = generationArgs('/tmp/job');
  assert.equal(args[args.indexOf('--model') + 1], 'gpt-6-astra');
  assert.ok(args.includes('forced_login_method="chatgpt"'));
  assert.ok(args.includes('--ignore-user-config'));
  assert.ok(args.includes('features.shell_tool=false'));
  const prompt = generationPrompt('Peace', 'nature');
  assert.match(prompt, /built-in image generation/);
  assert.doesNotMatch(prompt, /PRIVATE REFLECTION/);
});
test('Codex absence, API auth and signed-out state fail closed', async () => {
  assert.equal((await codexStatus('/definitely/missing/codex')).ready, false);
  for (const message of ['Not logged in', 'Logged in using API key'])
    assert.equal(
      (
        await codexStatus(
          'fake',
          launchCode(`console.log(${JSON.stringify(message)})`)
        )
      ).ready,
      false
    );
  assert.equal(
    (
      await codexStatus(
        'fake',
        launchCode('console.log("Logged in using ChatGPT")')
      )
    ).ready,
    true
  );
  assert.match(failureMessage('requires a newer version of Codex'), /Astra/);
  assert.match(failureMessage('usage limit reached'), /allowance/);
  assert.match(failureMessage('401 authentication'), /Sign in/);
});
test('PNG decoder rejects truncated and corrupt image output', () => {
  assert.deepEqual(validatePng(fixture), { width: 256, height: 256 });
  assert.throws(() => validatePng(Buffer.from('not an image')));
  assert.throws(() => validatePng(fixture.subarray(0, 50)));
  const bad = Buffer.from(fixture);
  bad[bad.length - 15] ^= 1;
  assert.throws(() => validatePng(bad), /checksum/);
});
test('jobs save valid artwork and reject invalid output, model failures and quota errors', async () => {
  for (const mode of ['valid', 'invalid', 'model', 'quota']) {
    const root = await mkdtemp(join(tmpdir(), 'diary-test-'));
    const launch = (_bin, args, options) => {
      const dir = args[args.indexOf('--cd') + 1];
      const script =
        mode === 'valid'
          ? `import{writeFileSync}from'node:fs';writeFileSync(${JSON.stringify(join(dir, 'result.png'))},Buffer.from('${fixture.toString('base64')}','base64'));`
          : mode === 'invalid'
            ? `import{writeFileSync}from'node:fs';writeFileSync(${JSON.stringify(join(dir, 'result.png'))},'bad');`
            : `console.error('${mode === 'model' ? 'model unavailable' : 'usage limit reached'}');process.exit(1);`;
      return launchCode(script)(_bin, args, options);
    };
    const manager = new JobManager({ root, launch });
    await manager.initialize();
    const job = await manager.create('01-01', 'Peace', 'nature');
    const result = await terminal(manager, job.id);
    assert.equal(result.state, mode === 'valid' ? 'completed' : 'failed');
    if (mode === 'valid') {
      assert.deepEqual(
        await readFile(join(root, job.id, 'artwork.png')),
        fixture
      );
      const reopened = new JobManager({ root });
      await reopened.initialize();
      assert.equal(reopened.jobs.get(job.id).state, 'completed');
      const record=JSON.parse(await readFile(join(root,job.id,'job.json'),'utf8'));record.id='../other-job';await writeFile(join(root,job.id,'job.json'),JSON.stringify(record));const damaged=new JobManager({root});await damaged.initialize();assert.equal(damaged.jobs.size,0);
    } else if (mode === 'model') assert.match(result.message, /Astra/);
    else if (mode === 'quota') assert.match(result.message, /allowance/);
    await manager.close();
  }
});
test('cancellation, timeout and restart keep interrupted jobs out of completed state', async () => {
  const root = await mkdtemp(join(tmpdir(), 'diary-test-'));
  const launch = launchCode('setInterval(()=>{},1000)');
  const manager = new JobManager({ root, launch, timeoutMs: 100 });
  await manager.initialize();
  const cancelled = await manager.create('01-01', 'Peace', 'nature');
  await manager.cancel(cancelled.id);
  assert.equal(manager.jobs.get(cancelled.id).state, 'cancelled');
  const timed = await manager.create('01-01', 'Peace', 'nature');
  assert.equal((await terminal(manager, timed.id)).state, 'failed');
  assert.match(manager.jobs.get(timed.id).message, /timed out/);
  const restarted = await manager.create('01-01', 'Peace', 'nature');
  const recovered = new JobManager({ root });
  await recovered.initialize();
  assert.equal(recovered.jobs.get(restarted.id).state, 'failed');
  await manager.close();
});
test('HTTP companion rejects hostile origin, missing session, private fields and traversal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'diary-http-test-'));
  const manager = new JobManager({
    root,
    launch: launchCode('setInterval(()=>{},1000)')
  });
  const app = await startCompanion({
    port: 0,
    dist: join(process.cwd(), 'public'),
    manager,
    status: async () => ({
      ready: true,
      message: 'Test ChatGPT authentication'
    })
  });
  try {
    const statusUrl = app.origin + '/api/status';
    assert.equal((await fetch(statusUrl)).status, 403);
    assert.equal(
      (
        await fetch(statusUrl, {
          headers: {
            'X-Diary-Client': 'reader',
            Origin: 'https://hostile.example'
          }
        })
      ).status,
      403
    );
    const status = await (
      await fetch(statusUrl, { headers: { 'X-Diary-Client': 'reader' } })
    ).json();
    assert.equal(status.model, 'gpt-6-astra');
    const headers = {
      'X-Diary-Client': 'reader',
      'X-Diary-Session': status.token,
      'Content-Type': 'application/json'
    };
    assert.equal(
      (
        await fetch(app.origin + '/api/jobs', {
          method: 'POST',
          headers: { ...headers, 'X-Diary-Session': 'wrong' },
          body: JSON.stringify({ dateKey: '01-01', style: 'nature' })
        })
      ).status,
      403
    );
    assert.equal(
      (
        await fetch(app.origin + '/api/jobs', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            dateKey: '01-01',
            style: 'nature',
            journal: 'PRIVATE REFLECTION'
          })
        })
      ).status,
      400
    );
    assert.equal(
      (
        await fetch(app.origin + '/api/jobs', {
          method: 'POST',
          headers,
          body: JSON.stringify({ dateKey: '02-29', style: 'nature' })
        })
      ).status,
      400
    );
    const response = await fetch(app.origin + '/api/jobs', {
      method: 'POST',
      headers,
      body: JSON.stringify({ dateKey: '01-01', style: 'nature' })
    });
    assert.equal(response.status, 201);
    const job = await response.json();
    assert.equal(
      (await fetch(app.origin + `/api/jobs/${job.id}`, { headers })).status,
      200
    );
    assert.equal(
      (await fetch(app.origin + `/api/jobs/${job.id}/image`, { headers }))
        .status,
      404
    );
    assert.equal(
      (
        await fetch(app.origin + '/api/jobs', {
          method: 'POST',
          headers,
          body: JSON.stringify({ dateKey: '01-01', style: 'nature' })
        })
      ).status,
      409
    );
    assert.equal(
      (
        await (
          await fetch(app.origin + `/api/jobs/${job.id}/cancel`, {
            method: 'POST',
            headers
          })
        ).json()
      ).state,
      'cancelled'
    );
    assert.equal(
      (await fetch(app.origin + '/%2e%2e%2fpackage.json')).status,
      404
    );
  } finally {
    await app.close();
  }
});
