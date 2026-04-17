// Image generation providers for the daily pipeline.
//
// The provider is chosen at runtime via SRF_IMAGE_PROVIDER. Default is
// `gemini` so existing behavior (and the Vercel-side pipeline) stays
// the same. `comfyui` targets a local ComfyUI server and uploads the
// resulting PNG to Supabase Storage so the public URL can be saved in
// `daily_renders.image_url` exactly the way Gemini's data URL was.
//
// Each provider returns ImageGenResult:
//   {
//     model: string;      // full provider-specific model id
//     provider: string;   // 'gemini' | 'comfyui' | custom
//     imageUrl: string;   // data URL (gemini) OR public https URL (comfyui)
//     imagePath: string;  // local artifact PNG path
//   }
//
// Providers also write the raw PNG to artifacts/daily/<runDate>/image.png.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

async function writeArtifact({ runDate, artifactRoot, bytes }) {
  const dir = path.join(artifactRoot, 'daily', runDate);
  await fs.mkdir(dir, { recursive: true });
  const imagePath = path.join(dir, 'image.png');
  await fs.writeFile(imagePath, bytes);
  return imagePath;
}

// ------------------------- Gemini -------------------------

class GeminiImageProvider {
  constructor({ artifactRoot }) {
    this.artifactRoot = artifactRoot;
  }

  async generate({ prompt, negativePrompt, runDate }) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing required env var: GEMINI_API_KEY or GOOGLE_GENAI_API_KEY');
    }

    const model =
      process.env.SRF_GENERATION_MODEL ||
      process.env.SRF_GOOGLE_IMAGE_MODEL ||
      'gemini-2.5-flash-image';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}\n\nNegative prompt: ${negativePrompt}` }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      },
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Google Gemini image generation failed');
    }

    const parts = payload?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p?.inlineData?.data);
    const imageBase64 = imagePart?.inlineData?.data;
    if (!imageBase64) {
      throw new Error('Google Gemini returned no image data');
    }

    const mimeType = imagePart?.inlineData?.mimeType || 'image/png';
    const bytes = Buffer.from(imageBase64, 'base64');
    const imagePath = await writeArtifact({ runDate, artifactRoot: this.artifactRoot, bytes });

    return {
      model,
      provider: 'gemini',
      imageUrl: `data:${mimeType};base64,${imageBase64}`,
      imagePath,
    };
  }
}

// ------------------------- ComfyUI -------------------------

function buildComfyWorkflow({ prompt, negativePrompt, checkpoint, lora, steps, cfg, width, height, seed, sampler, scheduler }) {
  // Minimal SDXL workflow: Checkpoint (+ optional LoRA) → two CLIP prompts →
  // KSampler → VAE → SaveImage. Node IDs are string keys per the ComfyUI API.
  // When no LoRA is requested we skip the LoraLoader node entirely — ComfyUI's
  // LoraLoader rejects an empty `lora_name`, and Turbo checkpoints don't need
  // extra step-reduction LoRAs.
  const hasLora = Boolean(lora);
  const modelSource = hasLora ? ['2', 0] : ['1', 0];
  const clipSource = hasLora ? ['2', 1] : ['1', 1];

  const workflow = {
    '1': {
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: checkpoint },
    },
    '3': {
      class_type: 'CLIPTextEncode',
      inputs: { text: prompt, clip: clipSource },
    },
    '4': {
      class_type: 'CLIPTextEncode',
      inputs: { text: negativePrompt, clip: clipSource },
    },
    '5': {
      class_type: 'EmptyLatentImage',
      inputs: { width, height, batch_size: 1 },
    },
    '6': {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps,
        cfg,
        sampler_name: sampler,
        scheduler,
        denoise: 1.0,
        model: modelSource,
        positive: ['3', 0],
        negative: ['4', 0],
        latent_image: ['5', 0],
      },
    },
    '7': {
      class_type: 'VAEDecode',
      inputs: { samples: ['6', 0], vae: ['1', 2] },
    },
    '8': {
      class_type: 'SaveImage',
      inputs: { images: ['7', 0], filename_prefix: `srf-${seed}` },
    },
  };

  if (hasLora) {
    workflow['2'] = {
      class_type: 'LoraLoader',
      inputs: {
        lora_name: lora,
        strength_model: 1.0,
        strength_clip: 1.0,
        model: ['1', 0],
        clip: ['1', 1],
      },
    };
  }

  return workflow;
}

async function comfyPostPrompt({ host, workflow, clientId }) {
  const res = await fetch(`${host}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow, client_id: clientId }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error?.message || body?.node_errors?.[0]?.message || 'ComfyUI /prompt failed');
  }
  if (!body.prompt_id) {
    throw new Error('ComfyUI /prompt did not return a prompt_id');
  }
  return body.prompt_id;
}

async function comfyWaitForResult({ host, promptId, timeoutMs }) {
  const deadline = Date.now() + timeoutMs;
  let delay = 750;
  while (Date.now() < deadline) {
    const res = await fetch(`${host}/history/${promptId}`);
    if (res.ok) {
      const body = await res.json();
      const entry = body?.[promptId];
      if (entry?.outputs) {
        const outputs = entry.outputs;
        // SaveImage is node '8' in our workflow.
        const images = outputs['8']?.images || Object.values(outputs).flatMap((o) => o.images || []);
        const first = images?.[0];
        if (first?.filename) return first;
      }
    }
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay + 250, 2000);
  }
  throw new Error(`ComfyUI did not return an image within ${timeoutMs}ms`);
}

async function comfyFetchImage({ host, filename, subfolder, type }) {
  const params = new URLSearchParams({ filename, subfolder: subfolder || '', type: type || 'output' });
  const res = await fetch(`${host}/view?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`ComfyUI /view failed: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToSupabaseStorage({ bytes, runDate }) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required to upload ComfyUI output');
  }
  const bucket = process.env.SRF_IMAGE_BUCKET || 'daily-renders';
  const objectPath = `${runDate}.png`;
  const endpoint = `${url}/storage/v1/object/${bucket}/${objectPath}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
      'Cache-Control': '3600',
    },
    body: bytes,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase Storage upload failed: ${res.status} ${err}`);
  }
  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
}

class ComfyUIImageProvider {
  constructor({ artifactRoot }) {
    this.artifactRoot = artifactRoot;
    this.host = (process.env.SRF_COMFY_HOST || 'http://127.0.0.1:8188').replace(/\/$/, '');
    // Default: DreamShaperXL Turbo — painterly / devotional-art bias, already distilled
    // for ~6–8 steps at low CFG. Much better fit for SRF diary artwork than photoreal
    // checkpoints like RealVisXL, which tend to drift toward portraits.
    this.checkpoint = process.env.SRF_COMFY_CHECKPOINT || 'DreamShaperXL_Turbo_v2_1.safetensors';
    // Turbo checkpoints are already distilled — stacking an 8-step LoRA is redundant and
    // often harmful. Leave empty by default; set SRF_COMFY_LORA if pairing with a non-turbo.
    this.lora = process.env.SRF_COMFY_LORA ?? '';
    this.steps = Number(process.env.SRF_COMFY_STEPS || 8);
    // Turbo checkpoints want CFG ~2–3, not 5+.
    this.cfg = Number(process.env.SRF_COMFY_CFG || 2.5);
    this.sampler = process.env.SRF_COMFY_SAMPLER || 'dpmpp_sde';
    this.scheduler = process.env.SRF_COMFY_SCHEDULER || 'karras';
    this.timeoutMs = Number(process.env.SRF_COMFY_TIMEOUT_MS || 180_000);
    const size = (process.env.SRF_COMFY_SIZE || '1024x1024').split('x').map(Number);
    this.width = size[0] || 1024;
    this.height = size[1] || 1024;
  }

  async generate({ prompt, negativePrompt, runDate }) {
    const clientId = crypto.randomUUID();
    const seed = Math.floor(Math.random() * 0x7fffffff);

    const workflow = buildComfyWorkflow({
      prompt,
      negativePrompt,
      checkpoint: this.checkpoint,
      lora: this.lora,
      steps: this.steps,
      cfg: this.cfg,
      width: this.width,
      height: this.height,
      seed,
      sampler: this.sampler,
      scheduler: this.scheduler,
    });

    const promptId = await comfyPostPrompt({ host: this.host, workflow, clientId });
    const image = await comfyWaitForResult({
      host: this.host,
      promptId,
      timeoutMs: this.timeoutMs,
    });
    const bytes = await comfyFetchImage({
      host: this.host,
      filename: image.filename,
      subfolder: image.subfolder,
      type: image.type,
    });

    const imagePath = await writeArtifact({ runDate, artifactRoot: this.artifactRoot, bytes });
    const publicUrl = await uploadToSupabaseStorage({ bytes, runDate });

    return {
      model: `comfyui:${this.checkpoint}`,
      provider: 'comfyui',
      imageUrl: publicUrl,
      imagePath,
    };
  }
}

// ------------------------- Factory -------------------------

export function getImageProvider({ artifactRoot } = {}) {
  const selected = (process.env.SRF_IMAGE_PROVIDER || 'gemini').toLowerCase();
  const root = artifactRoot || path.resolve(process.cwd(), 'artifacts');
  if (selected === 'comfyui') return new ComfyUIImageProvider({ artifactRoot: root });
  if (selected === 'gemini') return new GeminiImageProvider({ artifactRoot: root });
  throw new Error(`Unknown SRF_IMAGE_PROVIDER: ${selected} (expected "gemini" or "comfyui")`);
}

export { GeminiImageProvider, ComfyUIImageProvider };
