#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { buildSpiritualImagePrompt } from './lib/prompt-engine.mjs';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function boolEnv(name, defaultValue) {
  const value = process.env[name];
  if (value == null || value === '') return defaultValue;
  return value === 'true';
}

function getPacificDateParts() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  return {
    year,
    month,
    day,
    runDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    dateKey: `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

async function loadFallbackEntry(dateKey) {
  const jsonPath = path.resolve(__dirname, '../public/data/diary-entries.json');
  const raw = await fs.readFile(jsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const entry = parsed.entries?.[dateKey];
  if (!entry) {
    throw new Error(`No fallback entry found for ${dateKey} in diary-entries.json`);
  }
  return {
    date_key: dateKey,
    month: entry.month,
    day: entry.day,
    weekly_theme: entry.weeklyTheme || null,
    topic: entry.topic,
    quote: entry.quote,
    source: entry.source || 'Paramahansa Yogananda',
    book: entry.book || null,
    special_day: entry.specialDay || null,
  };
}

async function generateImage({ prompt, negativePrompt, runDate }) {
  const openai = new OpenAI({ apiKey: requiredEnv('OPENAI_API_KEY') });
  const primaryModel = process.env.SRF_GENERATION_MODEL || 'gpt-image-1';
  const models = primaryModel === 'dall-e-3' ? ['dall-e-3'] : [primaryModel, 'dall-e-3'];
  const errors = [];

  for (const model of models) {
    try {
      const response = await openai.images.generate({
        model,
        prompt: `${prompt}\n\nNegative prompt: ${negativePrompt}`,
        size: '1024x1024',
        quality: 'standard',
      });

      const imageData = response.data?.[0];
      if (!imageData) throw new Error('OpenAI returned no image data');

      const artifactDir = path.resolve(__dirname, `../artifacts/daily/${runDate}`);
      await fs.mkdir(artifactDir, { recursive: true });
      const imagePath = path.join(artifactDir, 'image.png');

      let imageUrl = imageData.url || null;
      if (imageData.b64_json) {
        const buffer = Buffer.from(imageData.b64_json, 'base64');
        await fs.writeFile(imagePath, buffer);
      } else if (imageUrl) {
        const download = await fetch(imageUrl);
        if (!download.ok) {
          throw new Error(`Failed to download image URL: ${download.status}`);
        }
        const arrayBuffer = await download.arrayBuffer();
        await fs.writeFile(imagePath, Buffer.from(arrayBuffer));
      } else {
        throw new Error('OpenAI returned neither b64_json nor url');
      }

      return { model, imageUrl, imagePath };
    } catch (err) {
      errors.push(`${model}: ${err.message}`);
    }
  }

  throw new Error(`Image generation failed for all models. ${errors.join(' | ')}`);
}

async function runGog(args) {
  const { stdout } = await execFileAsync('gog', args, { encoding: 'utf8' });
  return stdout.trim();
}

async function runOpenClaw(args) {
  const { stdout } = await execFileAsync('openclaw', args, { encoding: 'utf8' });
  return stdout.trim();
}

async function ensureDriveHierarchy(rootFolderId, runDate) {
  const [year, month] = runDate.split('-');
  const monthFolder = `${year}-${month}`;

  await runGog(['drive', 'mkdir', '--parent', rootFolderId, '--name', monthFolder, '--if-missing']);
  const folderId = (await runGog([
    'drive',
    'mkdir',
    '--parent',
    rootFolderId,
    '--name',
    `${monthFolder}/${runDate}`,
    '--if-missing',
    '--print-id',
  ])).split('\n').pop();

  if (!folderId) {
    throw new Error('Could not resolve Drive folder id for daily artifact folder');
  }

  return folderId;
}

async function uploadArtifactsToDrive(folderId, imagePath, metadataPath) {
  const imageUpload = await runGog(['drive', 'upload', '--parent', folderId, '--file', imagePath]);
  const metadataUpload = await runGog(['drive', 'upload', '--parent', folderId, '--file', metadataPath]);
  return { imageUpload, metadataUpload };
}

async function deliverViaOpenClaw(channel, target, text) {
  const attempts = [
    ['send', '--channel', channel, '--target', target, '--text', text],
    ['message', 'send', '--channel', channel, '--target', target, '--text', text],
    ['system', 'event', '--text', text, '--mode', 'now', '--channel', channel, '--target', target],
  ];

  for (const args of attempts) {
    try {
      const output = await runOpenClaw(args);
      return { status: 'sent', messageId: output || null, error: null };
    } catch {
      // try next form
    }
  }

  return {
    status: 'warning',
    messageId: null,
    error: 'openclaw CLI send command not recognized; no channel message sent',
  };
}

async function sendEmailWithGog({ to, from, subject, text }) {
  const args = ['gmail', 'send', '--to', to, '--subject', subject, '--text', text];
  if (from) args.push('--from', from);
  const output = await runGog(args);
  return output || null;
}

async function main() {
  const supabase = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  const { runDate, dateKey, month, day } = getPacificDateParts();
  const allowOmSymbol = boolEnv('SRF_ALLOW_OM_SYMBOL', true);

  const { data: existingRender } = await supabase
    .from('daily_renders')
    .select('id, status, image_url, image_path, provider')
    .eq('run_date', runDate)
    .maybeSingle();

  if (existingRender?.status === 'success' && existingRender.image_path) {
    console.log(`[skip] render already completed for ${runDate}`);
    console.log(JSON.stringify({ runDate, status: 'skipped_existing_success', imagePath: existingRender.image_path }, null, 2));
    return;
  }

  let { data: entry } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('month', month)
    .eq('day', day)
    .maybeSingle();

  if (!entry) {
    entry = await loadFallbackEntry(dateKey);
    await supabase.from('diary_entries').upsert(entry, { onConflict: 'date_key' });
  }

  const promptResult = buildSpiritualImagePrompt(entry, { dateKey, allowOmSymbol });
  const generation = await generateImage({
    prompt: promptResult.prompt,
    negativePrompt: promptResult.negativePrompt,
    runDate,
  });

  const metadata = {
    runDate,
    dateKey,
    provider: generation.model,
    prompt: promptResult.prompt,
    negativePrompt: promptResult.negativePrompt,
    quote: entry.quote,
    source: entry.source,
    imagePath: generation.imagePath,
    imageUrl: generation.imageUrl,
    generatedAt: new Date().toISOString(),
  };

  const metadataPath = path.resolve(__dirname, `../artifacts/daily/${runDate}/metadata.json`);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  let driveStatus = { status: 'skipped', error: null };
  if (process.env.SRF_DRIVE_ROOT_FOLDER_ID) {
    try {
      const folderId = await ensureDriveHierarchy(process.env.SRF_DRIVE_ROOT_FOLDER_ID, runDate);
      await uploadArtifactsToDrive(folderId, generation.imagePath, metadataPath);
      driveStatus = { status: 'uploaded', error: null };
    } catch (err) {
      driveStatus = { status: 'warning', error: err.message };
    }
  }

  await supabase.from('daily_renders').upsert(
    {
      run_date: runDate,
      date_key: dateKey,
      quote: entry.quote,
      prompt: `${promptResult.prompt}\n\nNegative prompt: ${promptResult.negativePrompt}`,
      image_url: generation.imageUrl,
      image_path: generation.imagePath,
      provider: generation.model,
      status: 'success',
    },
    { onConflict: 'run_date' },
  );

  const logRows = [];
  const deliveryText = [
    `SRF Spiritual Diary ${runDate}`,
    '',
    `Theme: ${entry.weekly_theme || entry.weeklyTheme || entry.topic}`,
    `Quote: ${entry.quote}`,
    `Image: ${generation.imageUrl || generation.imagePath}`,
  ].join('\n');

  const channels = [
    {
      key: 'telegram',
      target: process.env.SRF_TELEGRAM_TARGET,
      channel: process.env.SRF_OPENCLAW_CHANNEL_TELEGRAM || 'telegram',
    },
    {
      key: 'slack',
      target: process.env.SRF_SLACK_TARGET,
      channel: process.env.SRF_OPENCLAW_CHANNEL_SLACK || 'slack',
    },
    {
      key: 'discord',
      target: process.env.SRF_DISCORD_TARGET,
      channel: process.env.SRF_OPENCLAW_CHANNEL_DISCORD || 'discord',
    },
  ];

  for (const item of channels) {
    if (!item.target) continue;
    const sent = await deliverViaOpenClaw(item.channel, item.target, deliveryText);
    logRows.push({
      run_date: runDate,
      channel: item.key,
      target: item.target,
      status: sent.status,
      message_id: sent.messageId,
      error: sent.error,
    });
  }

  if (process.env.SRF_EMAIL_TO) {
    try {
      const emailId = await sendEmailWithGog({
        to: process.env.SRF_EMAIL_TO,
        from: process.env.SRF_FROM_EMAIL || undefined,
        subject: `SRF Spiritual Diary ${runDate}`,
        text: deliveryText,
      });
      logRows.push({
        run_date: runDate,
        channel: 'gmail',
        target: process.env.SRF_EMAIL_TO,
        status: 'sent',
        message_id: emailId,
        error: null,
      });
    } catch (err) {
      logRows.push({
        run_date: runDate,
        channel: 'gmail',
        target: process.env.SRF_EMAIL_TO,
        status: 'error',
        message_id: null,
        error: err.message,
      });
    }
  }

  if (logRows.length > 0) {
    await supabase.from('delivery_logs').insert(logRows);
  }

  console.log(
    JSON.stringify(
      {
        runDate,
        dateKey,
        provider: generation.model,
        imagePath: generation.imagePath,
        imageUrl: generation.imageUrl,
        drive: driveStatus,
        deliveries: logRows.length,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error('[daily-pipeline] failed:', err.message);
  process.exit(1);
});
