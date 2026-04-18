import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_PATH = resolve(__dirname, '../config/vee-config.json');

const PLATFORM_KEYS = [
  'tiktok', 'instagram', 'facebook', 'x', 'linkedin',
  'youtube', 'threads', 'pinterest', 'bluesky'
];

const MIME_TYPES = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.mp4':  'video/mp4',
  '.mov':  'video/quicktime',
  '.avi':  'video/x-msvideo',
  '.pdf':  'application/pdf',
};

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    console.error('vee: no config found. copy vee-config.example.json to vee-config.json and fill it in.');
    process.exit(1);
  }
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    console.error('vee: config file is broken. check the json syntax.');
    process.exit(1);
  }
}

function parseArgs(args) {
  const result = {
    caption: null,
    media: [],
    platforms: null,
    schedule: null,
    draft: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--caption':
        result.caption = args[++i];
        break;
      case '--media':
        result.media = (args[++i] || '').split(',').map(p => p.trim()).filter(Boolean);
        break;
      case '--platforms':
        result.platforms = (args[++i] || '').split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
        break;
      case '--schedule':
        result.schedule = args[++i];
        break;
      case '--draft':
        result.draft = true;
        break;
      case '--help':
      case '-h':
        result.help = true;
        break;
    }
  }

  return result;
}

function printHelp() {
  console.log(`
vee / post-content

usage:
  node post-content.js --caption "your caption" [options]

options:
  --caption   "text"              the post caption (required)
  --media     ./file.png,...      comma-separated file paths
  --platforms tiktok,instagram    comma-separated platforms (default: all enabled in config)
  --schedule  2026-04-20T10:00Z   iso 8601 datetime to schedule
  --draft                         save as draft, don't publish
  --help                          show this

platforms: ${PLATFORM_KEYS.join(', ')}
`);
}

function resolveMedia(paths) {
  return paths.map(p => {
    const abs = resolve(process.cwd(), p);
    if (!existsSync(abs)) {
      throw new Error(`media file not found: ${abs}`);
    }
    const ext = extname(abs).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const data = readFileSync(abs);
    const base64 = data.toString('base64');
    return { path: abs, mime, base64, filename: abs.split(/[\\/]/).pop() };
  });
}

function resolvePlatforms(requested, config) {
  const enabled = PLATFORM_KEYS.filter(k => config.platforms?.[k] === true);

  if (!requested || requested.length === 0) return enabled;

  const invalid = requested.filter(p => !PLATFORM_KEYS.includes(p));
  if (invalid.length > 0) {
    console.error(`vee: unknown platforms: ${invalid.join(', ')}. valid options: ${PLATFORM_KEYS.join(', ')}`);
    process.exit(1);
  }

  return requested;
}

async function post({ caption, mediaPaths = [], platforms = [], schedule = null, draft = false } = {}) {
  const fetch = (await import('node-fetch')).default;
  const config = loadConfig();

  const apiKey = config.postforme?.api_key || process.env.POSTFORME_API_KEY;
  if (!apiKey || apiKey === 'YOUR_POSTFORME_API_KEY') {
    throw new Error('vee: no postforme api key. add it to vee-config.json or POSTFORME_API_KEY env var.');
  }

  const baseUrl = config.postforme?.base_url || 'https://api.postforme.dev';
  const resolvedPlatforms = resolvePlatforms(platforms, config);

  if (resolvedPlatforms.length === 0) {
    throw new Error('vee: no platforms to post to. enable some in vee-config.json or pass --platforms.');
  }

  let mediaPayload = [];
  if (mediaPaths.length > 0) {
    console.log(`vee: loading ${mediaPaths.length} media file${mediaPaths.length !== 1 ? 's' : ''}...`);
    const files = resolveMedia(mediaPaths);
    mediaPayload = files.map(f => ({
      filename: f.filename,
      content_type: f.mime,
      data: f.base64,
    }));
  }

  const body = {
    caption,
    social_accounts: resolvedPlatforms,
    media: mediaPayload,
  };

  if (schedule) body.scheduled_at = schedule;
  if (draft) body.draft = true;

  console.log(`vee: posting to ${resolvedPlatforms.length} platform${resolvedPlatforms.length !== 1 ? 's' : ''}: ${resolvedPlatforms.join(', ')}${draft ? ' (draft mode)' : ''}${schedule ? ` · scheduled for ${schedule}` : ''}...`);

  const res = await fetch(`${baseUrl}/social-posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errMsg = `status ${res.status}`;
    try {
      const errBody = await res.json();
      errMsg = errBody.message || errBody.error || JSON.stringify(errBody);
    } catch {
      errMsg = await res.text().catch(() => errMsg);
    }
    throw new Error(`vee: postforme said no. ${errMsg}`);
  }

  const data = await res.json();

  const results = [];
  const platforms_result = data.platforms || data.results || data.accounts || {};

  for (const platform of resolvedPlatforms) {
    const platformData = platforms_result[platform] || {};
    const status = platformData.status || (res.ok ? 'sent' : 'failed');
    const postId = platformData.post_id || platformData.id || data.id || null;
    results.push({ platform, status, post_id: postId });
    console.log(`  ${platform}: ${status}${postId ? ` · id ${postId}` : ''}`);
  }

  const allLive = results.every(r => ['sent', 'published', 'scheduled', 'draft'].includes(r.status));
  if (allLive && !draft && !schedule) console.log(`vee: we're live.`);
  else if (draft) console.log(`vee: saved as draft.`);
  else if (schedule) console.log(`vee: locked in for ${schedule}.`);
  else console.log(`vee: done. check the results above for any issues.`);

  return {
    id: data.id || null,
    caption,
    platforms: results,
    scheduled_at: schedule || null,
    draft,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const parsed = parseArgs(args);

  if (!parsed.caption) {
    console.error('vee: --caption is required. what are you posting?');
    process.exit(1);
  }

  try {
    const result = await post({
      caption: parsed.caption,
      mediaPaths: parsed.media,
      platforms: parsed.platforms || [],
      schedule: parsed.schedule,
      draft: parsed.draft,
    });

    return result;
  } catch (err) {
    console.error(err.message || String(err));
    process.exit(1);
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  main();
}

export { post };
export default post;
