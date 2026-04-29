import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'vee-config.json');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  return null;
}

function resolveProvider(args, config) {
  return (
    args.provider ||
    config?.image_gen?.provider ||
    process.env.IMAGE_GEN_PROVIDER ||
    'openai'
  );
}

function resolveApiKey(provider, config) {
  const fromConfig = config?.image_gen?.api_key;
  const fromEnv = {
    openai: process.env.OPENAI_API_KEY,
    stability: process.env.STABILITY_API_KEY,
    replicate: process.env.REPLICATE_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
  }[provider];
  return fromConfig || fromEnv || '';
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

// OpenAI DALL-E 3 supports: 1024x1024, 1024x1792 (portrait), 1792x1024 (landscape)
function resolveOpenAISize(size, aspectRatio) {
  if (size) return size;
  if (aspectRatio === '9:16' || aspectRatio === 'portrait') return '1024x1792';
  if (aspectRatio === '16:9' || aspectRatio === 'landscape') return '1792x1024';
  return '1024x1024';
}

async function generateOpenAI({ prompt, count, apiKey, size, aspectRatio }) {
  const fetch = (await import('node-fetch')).default;
  const resolvedSize = resolveOpenAISize(size, aspectRatio);

  const urls = [];
  for (let i = 0; i < count; i++) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: resolvedSize,
        response_format: 'url',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`openai error (image ${i + 1}): ${err}`);
    }
    const data = await res.json();
    urls.push(data.data[0].url);
  }
  return urls;
}

// Stability SDXL supports specific dimensions only; pick closest match
function resolveStabilityDims(size, aspectRatio) {
  if (size) {
    const [w, h] = size.split('x').map(Number);
    if (w && h) return { width: w, height: h };
  }
  if (aspectRatio === '9:16' || aspectRatio === 'portrait') return { width: 768, height: 1344 };
  if (aspectRatio === '16:9' || aspectRatio === 'landscape') return { width: 1344, height: 768 };
  return { width: 1024, height: 1024 };
}

async function generateStability({ prompt, count, apiKey, size, aspectRatio }) {
  const fetch = (await import('node-fetch')).default;
  const { width, height } = resolveStabilityDims(size, aspectRatio);

  const urls = [];
  for (let i = 0; i < count; i++) {
    const res = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: 7,
          height,
          width,
          samples: 1,
          steps: 30,
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`stability error (image ${i + 1}): ${err}`);
    }
    const data = await res.json();
    const b64 = data.artifacts[0].base64;
    urls.push(`data:image/png;base64,${b64}`);
  }
  return urls;
}

async function generateReplicate({ prompt, count, apiKey, aspectRatio }) {
  const fetch = (await import('node-fetch')).default;

  const MODEL_VERSION = 'black-forest-labs/flux-schnell';
  // Flux supports: 1:1, 16:9, 9:16, 21:9, 9:21, 4:5, 5:4, 3:4, 4:3, 2:3, 3:2
  const ratio = aspectRatio === 'portrait' ? '9:16'
    : aspectRatio === 'landscape' ? '16:9'
    : aspectRatio || '1:1';
  const urls = [];

  for (let i = 0; i < count; i++) {
    // Create prediction
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: { prompt, num_outputs: 1, aspect_ratio: ratio },
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`replicate create error (image ${i + 1}): ${err}`);
    }
    const prediction = await createRes.json();
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;

    // Poll until done
    let output = null;
    let attempts = 0;
    while (!output && attempts < 60) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Token ${apiKey}` },
      });
      if (!pollRes.ok) {
        const err = await pollRes.text();
        throw new Error(`replicate poll error (image ${i + 1}): ${err}`);
      }
      const pollData = await pollRes.json();
      if (pollData.status === 'succeeded') {
        output = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
      } else if (pollData.status === 'failed') {
        throw new Error(`replicate failed (image ${i + 1}): ${pollData.error || 'unknown error'}`);
      }
      attempts++;
    }
    if (!output) throw new Error(`replicate timed out waiting for image ${i + 1}`);
    urls.push(output);
  }
  return urls;
}

async function generateGemini({ prompt, count, apiKey }) {
  const fetch = (await import('node-fetch')).default;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  const urls = [];

  for (let i = 0; i < count; i++) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`gemini error (image ${i + 1}): ${err}`);
    }
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'));
    if (!imagePart) {
      throw new Error(`gemini returned no image for slide ${i + 1}`);
    }
    urls.push(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
  }
  return urls;
}

const PROVIDERS = {
  openai: generateOpenAI,
  stability: generateStability,
  replicate: generateReplicate,
  gemini: generateGemini,
};

// ---------------------------------------------------------------------------
// Downloader
// ---------------------------------------------------------------------------

async function downloadImage(source, dest) {
  // base64 data URI - decode directly
  if (source.startsWith('data:')) {
    const base64 = source.split(',')[1];
    fs.writeFileSync(dest, Buffer.from(base64, 'base64'));
    return;
  }
  // Remote URL - fetch and write
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(source);
  if (!res.ok) throw new Error(`failed to download image: status ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
}

// ---------------------------------------------------------------------------
// CLI args parser
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function resolveOutDir(outputDir, config) {
  // Explicit --output-dir wins
  if (outputDir) {
    return path.isAbsolute(outputDir)
      ? path.join(outputDir, 'slides')
      : path.join(__dirname, '..', outputDir, 'slides');
  }
  // Fall back to config default
  const configDir = config?.defaults?.output_dir;
  if (configDir) {
    return path.isAbsolute(configDir)
      ? path.join(configDir, 'slides')
      : path.join(__dirname, '..', configDir, 'slides');
  }
  // Last resort: project-root output/slides
  return path.join(__dirname, '..', 'output', 'slides');
}

async function generateSlides({
  prompt,
  count = 6,
  provider: providerArg,
  outputDir,
  size,
  aspectRatio,
} = {}) {
  const config = loadConfig();

  const provider = providerArg || resolveProvider({}, config);
  const apiKey = resolveApiKey(provider, config);
  const slideCount = Number(count);
  const outDir = resolveOutDir(outputDir, config);

  if (!prompt) throw new Error('prompt is required');
  if (!apiKey) throw new Error(`no api key found for provider: ${provider}`);
  if (!PROVIDERS[provider]) throw new Error(`unknown provider: ${provider}. use openai / stability / replicate / gemini`);

  console.log(`\ngenerating ${slideCount} slides... provider: ${provider}... this is gonna look good`);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const generateFn = PROVIDERS[provider];
  const urls = await generateFn({ prompt, count: slideCount, apiKey, size, aspectRatio });

  console.log(`  got ${urls.length} image(s) back. saving...`);

  const filePaths = [];
  for (let i = 0; i < urls.length; i++) {
    const filename = `slide-${i + 1}.png`;
    const dest = path.join(outDir, filename);
    await downloadImage(urls[i], dest);
    filePaths.push(dest);
    console.log(`  saved: ${dest}`);
  }

  console.log(`\ndone. ${filePaths.length} slide(s) ready in ${outDir}\n`);
  return filePaths;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const args = parseArgs(process.argv.slice(2));

  if (!args.prompt) {
    console.error(
`
missing --prompt. example:
  node generate-slides.js --prompt "fitness motivation" --count 6 --provider openai

flags:
  --prompt        image generation prompt (required)
  --count         how many slides (default: 6)
  --provider      openai | stability | replicate | gemini
  --output-dir    where to save slides (default: config.defaults.output_dir)
  --size          explicit dimensions like "1024x1792" (openai/stability only)
  --aspect-ratio  portrait | landscape | 9:16 | 16:9 | 1:1 (recommended over --size)
`
    );
    process.exit(1);
  }

  generateSlides({
    prompt: args.prompt,
    count: args.count ? Number(args.count) : 6,
    provider: args.provider,
    outputDir: args['output-dir'],
    size: args.size,
    aspectRatio: args['aspect-ratio'],
  }).catch((err) => {
    console.error(`\nslide gen failed: ${err.message}\n`);
    process.exit(1);
  });
}

export { generateSlides };
