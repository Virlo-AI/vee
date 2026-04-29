import 'dotenv/config';
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { resolve, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_PATH = resolve(__dirname, '../config/vee-config.json');

const PLATFORM_KEYS = [
  'tiktok', 'instagram', 'facebook', 'x', 'linkedin',
  'youtube', 'threads', 'pinterest', 'bluesky'
];

const MEDIA_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov']);

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
    mediaUrls: [],
    platforms: null,
    schedule: null,
    draft: false,
    now: false,
    optimal: false,
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
      case '--media-urls':
        result.mediaUrls = (args[++i] || '').split(',').map(u => u.trim()).filter(Boolean);
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
      case '--now':
        result.now = true;
        break;
      case '--optimal':
        result.optimal = true;
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
  --caption     "text"              the post caption (required)
  --media       ./file.png,...      comma-separated file paths or directories
                                    (requires media_host_base_url in config to convert paths to URLs)
  --media-urls  https://...,...     comma-separated public URLs (preferred - postforme requires hosted media)
  --platforms   tiktok,instagram    comma-separated platforms (default: all enabled in config)
  --schedule    2026-04-20T10:00Z   iso 8601 datetime to schedule
  --draft                           save as draft, don't publish
  --now                             publish immediately (default if no --schedule)
  --optimal                         use Virlo's posting cadence to pick best time
                                    (requires --platforms with exactly one platform tracked in Virlo)
  --help                            show this

platforms: ${PLATFORM_KEYS.join(', ')}

note on media:
  PostForMe requires media to be served from public URLs.
  best path: pre-upload to S3/R2/Cloudflare Images, then pass --media-urls.
  alternate: set "defaults.media_host_base_url" in config and use --media with files
  whose names get appended to that base URL.
`);
}

function expandMediaPaths(paths) {
  const out = [];
  for (const p of paths) {
    const abs = resolve(process.cwd(), p);
    if (!existsSync(abs)) {
      throw new Error(`media path not found: ${abs}`);
    }
    if (statSync(abs).isDirectory()) {
      const entries = readdirSync(abs)
        .filter(f => MEDIA_EXTS.has(extname(f).toLowerCase()))
        .sort()
        .map(f => join(abs, f));
      out.push(...entries);
    } else {
      out.push(abs);
    }
  }
  return out;
}

function buildMediaPayload({ mediaUrls, mediaPaths, mediaHostBaseUrl }) {
  if (mediaUrls.length > 0 && mediaPaths.length > 0) {
    throw new Error('vee: pick one - --media-urls OR --media. not both.');
  }
  if (mediaUrls.length > 0) {
    return mediaUrls.map(url => ({ url }));
  }
  if (mediaPaths.length === 0) return [];

  const expanded = expandMediaPaths(mediaPaths);

  if (!mediaHostBaseUrl) {
    throw new Error(
      'vee: postforme requires media URLs. either pass --media-urls with hosted URLs, ' +
      'or set "defaults.media_host_base_url" in vee-config.json so vee can build URLs from filenames.'
    );
  }
  const base = mediaHostBaseUrl.replace(/\/+$/, '');
  return expanded.map(p => ({
    url: `${base}/${p.split(/[\\/]/).pop()}`,
  }));
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

function resolveSocialAccountIds(platforms, config) {
  const accounts = config.postforme?.social_accounts || {};
  const ids = [];
  const missing = [];
  for (const platform of platforms) {
    const id = accounts[platform];
    if (!id || id.startsWith('sa_REPLACE')) {
      missing.push(platform);
    } else {
      ids.push(id);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `vee: no postforme account id for ${missing.join(', ')}. ` +
      `add account ids under "postforme.social_accounts" in vee-config.json. ` +
      `find them at https://www.postforme.dev/developers (look for /social-accounts).`
    );
  }
  return ids;
}

async function fetchOptimalScheduleTime(platform, config) {
  const fetch = (await import('node-fetch')).default;
  const apiKey = config.virlo?.api_key || process.env.VIRLO_API_KEY;
  if (!apiKey) {
    throw new Error('vee: --optimal needs a virlo api key.');
  }
  const userHandle = config.virlo?.tracked_handles?.[platform];
  if (!userHandle) {
    throw new Error(
      `vee: --optimal needs a tracked virlo creator on ${platform}. ` +
      `add the creator id under "virlo.tracked_handles.${platform}" in vee-config.json.`
    );
  }
  const res = await fetch(
    `https://api.virlo.ai/v1/tracking/creators/${userHandle}/posting-cadence`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (!res.ok) {
    throw new Error(`vee: virlo posting-cadence returned ${res.status}.`);
  }
  const data = await res.json();
  const next = data?.next_optimal_time || data?.data?.next_optimal_time;
  if (!next) {
    throw new Error('vee: virlo did not return a next optimal time. fall back to --now or --schedule.');
  }
  return next;
}

async function post({
  caption,
  mediaPaths = [],
  mediaUrls = [],
  platforms = [],
  schedule = null,
  draft = false,
  optimal = false,
} = {}) {
  const fetch = (await import('node-fetch')).default;
  const config = loadConfig();

  const apiKey = config.postforme?.api_key || process.env.POSTFORME_API_KEY;
  if (!apiKey || apiKey === 'YOUR_POSTFORME_API_KEY') {
    throw new Error(
      'vee: no postforme api key. add it to vee-config.json or POSTFORME_API_KEY env var. ' +
      'get one at https://www.postforme.dev/developers.'
    );
  }

  const baseUrl = config.postforme?.base_url || 'https://api.postforme.dev';
  const resolvedPlatforms = resolvePlatforms(platforms, config);

  if (resolvedPlatforms.length === 0) {
    throw new Error('vee: no platforms to post to. enable some in vee-config.json or pass --platforms.');
  }

  const socialAccountIds = resolveSocialAccountIds(resolvedPlatforms, config);

  let resolvedSchedule = schedule;
  if (optimal) {
    if (resolvedPlatforms.length !== 1) {
      throw new Error('vee: --optimal needs exactly one platform via --platforms. it picks per-platform optimal times.');
    }
    resolvedSchedule = await fetchOptimalScheduleTime(resolvedPlatforms[0], config);
    console.log(`vee: optimal time picked - ${resolvedSchedule}`);
  }

  const mediaPayload = buildMediaPayload({
    mediaUrls,
    mediaPaths,
    mediaHostBaseUrl: config.defaults?.media_host_base_url,
  });

  const body = {
    caption,
    social_accounts: socialAccountIds,
    media: mediaPayload,
  };

  if (resolvedSchedule) body.scheduled_at = resolvedSchedule;
  if (draft) body.status = 'draft';

  const modeLabel = draft
    ? 'draft mode'
    : resolvedSchedule
      ? `scheduled for ${resolvedSchedule}`
      : 'publishing now';
  console.log(`vee: posting to ${resolvedPlatforms.length} platform${resolvedPlatforms.length !== 1 ? 's' : ''}: ${resolvedPlatforms.join(', ')} (${modeLabel})...`);

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
  if (allLive && !draft && !resolvedSchedule) console.log(`vee: we're live.`);
  else if (draft) console.log(`vee: saved as draft.`);
  else if (resolvedSchedule) console.log(`vee: locked in for ${resolvedSchedule}.`);
  else console.log(`vee: done. check the results above for any issues.`);

  return {
    id: data.id || null,
    caption,
    platforms: results,
    scheduled_at: resolvedSchedule || null,
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

  if (parsed.optimal && parsed.schedule) {
    console.error('vee: pick one - --optimal or --schedule. not both.');
    process.exit(1);
  }

  try {
    const result = await post({
      caption: parsed.caption,
      mediaPaths: parsed.media,
      mediaUrls: parsed.mediaUrls,
      platforms: parsed.platforms || [],
      schedule: parsed.schedule,
      draft: parsed.draft,
      optimal: parsed.optimal,
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
