import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const SKILL_DEST_DIR = path.join(os.homedir(), '.claude', 'skills', 'vee');
const MCP_PATH = path.join(os.homedir(), '.claude', '.mcp.json');
const CONFIG_PATH = path.join(REPO_ROOT, 'config', 'vee-config.json');
const CONFIG_EXAMPLE_PATH = path.join(REPO_ROOT, 'config', 'vee-config.example.json');

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'x', 'linkedin', 'facebook', 'threads', 'pinterest', 'bluesky'];
const IMAGE_PROVIDERS = {
  openai: { label: 'OpenAI (DALL-E 3)', signup: 'https://platform.openai.com/api-keys', model: 'dall-e-3' },
  stability: { label: 'Stability AI', signup: 'https://platform.stability.ai/account/keys', model: 'stability' },
  replicate: { label: 'Replicate (Flux)', signup: 'https://replicate.com/account/api-tokens', model: 'replicate' },
  gemini: { label: 'Google Gemini', signup: 'https://aistudio.google.com/app/apikey', model: 'gemini' },
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
const log = (...args) => console.log(...args);

async function checkVirloKey(apiKey) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('https://dev.virlo.ai/api/credits/balance', {
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`status ${res.status}: ${body}`);
  }
  return res.json();
}

function ensureNodeInstall() {
  log('\nInstalling dependencies...');
  try {
    execSync('npm install --no-audit --no-fund', { cwd: REPO_ROOT, stdio: 'inherit' });
    log('  Done.');
  } catch {
    log('  Note: optional dependency install had issues (likely the canvas native build).');
    log('  Core deps installed. Slide overlay generation may be unavailable until you run:');
    log('    npm install canvas');
    log('  in the vee directory. Continuing.');
  }
}

function ensureSkillCopied() {
  log('\nRegistering Vee with Claude Code...');
  fs.mkdirSync(SKILL_DEST_DIR, { recursive: true });
  fs.copyFileSync(path.join(REPO_ROOT, 'SKILL.md'), path.join(SKILL_DEST_DIR, 'SKILL.md'));
  log(`  SKILL.md copied to ${SKILL_DEST_DIR}`);
}

function ensureMcpEntry(virloKey) {
  log('\nWiring up the Virlo MCP server...');
  let mcp = { mcpServers: {} };
  if (fs.existsSync(MCP_PATH)) {
    try {
      mcp = JSON.parse(fs.readFileSync(MCP_PATH, 'utf8'));
      mcp.mcpServers = mcp.mcpServers || {};
    } catch {
      log('  Existing .mcp.json is invalid JSON. Backing up and rewriting.');
      fs.copyFileSync(MCP_PATH, MCP_PATH + '.bak');
      mcp = { mcpServers: {} };
    }
  } else {
    fs.mkdirSync(path.dirname(MCP_PATH), { recursive: true });
  }

  mcp.mcpServers.virlo = {
    type: 'http',
    url: 'https://dev.virlo.ai/api/mcp/mcp',
    headers: { Authorization: `Bearer ${virloKey}` },
  };

  fs.writeFileSync(MCP_PATH, JSON.stringify(mcp, null, 2));
  log(`  MCP server registered at ${MCP_PATH}`);
}

async function promptVirloKey() {
  log('\nStep 1/4: Virlo API key (required)');
  log('');
  log('  Vee needs a Virlo API key to research, track, and pull intelligence.');
  log('  Sign up here:');
  log('');
  log('  >> https://dev.virlo.ai/signup/?via=organic <<');
  log('');
  log('  Create your API key in the dashboard and paste it below.');
  log('');
  while (true) {
    const key = await ask('  Paste your Virlo API key: ');
    if (!key) {
      log('  No key entered. You cannot continue without a Virlo key.');
      const retry = await ask('  Try again? [Y/n]: ');
      if (retry.toLowerCase() === 'n') throw new Error('install aborted: no virlo key');
      continue;
    }
    log('  Testing the key...');
    try {
      await checkVirloKey(key);
      log('  Connected.');
      return key;
    } catch (err) {
      log(`  The key did not validate: ${err.message}`);
      const proceed = await ask('  Try a different key? [Y/n]: ');
      if (proceed.toLowerCase() === 'n') {
        const force = await ask('  Save it anyway and let Vee tell you later? [y/N]: ');
        if (force.toLowerCase() === 'y') return key;
        throw new Error('install aborted: virlo key did not validate');
      }
    }
  }
}

async function promptPostForMe() {
  log('\nStep 2/4: PostForMe API key + connected accounts (optional)');
  log('');
  log('  PostForMe handles posting to TikTok, Instagram, X, LinkedIn, YouTube, etc.');
  log('  Sign up here:');
  log('');
  log('  >> https://www.postforme.dev/developers <<');
  log('');
  log('  In the dashboard:');
  log('  1. Connect each social account you want Vee to post to');
  log('  2. Copy your API key');
  log('  3. For each connected account, copy the social_account ID (format: sa_...)');
  log('');

  const skip = await ask('  Skip PostForMe for now? You can add it later. [y/N]: ');
  if (skip.toLowerCase() === 'y') {
    return { apiKey: '', socialAccounts: {} };
  }

  const apiKey = await ask('  Paste your PostForMe API key: ');

  log('');
  log('  Now paste your social_account IDs for each platform you connected.');
  log('  Press ENTER to skip a platform.');
  log('');

  const socialAccounts = {};
  for (const platform of PLATFORMS) {
    const id = await ask(`  ${platform.padEnd(10)} social_account id: `);
    socialAccounts[platform] = id || '';
  }
  return { apiKey, socialAccounts };
}

async function promptImageGen() {
  log('\nStep 3/4: Image generation (optional)');
  log('');
  log('  Pick ONE provider (only needed if you want Vee to generate slides/images).');
  log('  Press ENTER to skip - you can add this later.');
  log('');
  for (const [key, info] of Object.entries(IMAGE_PROVIDERS)) {
    log(`    ${key.padEnd(10)} - ${info.label} - ${info.signup}`);
  }
  log('');

  let provider = '';
  while (provider !== '' && !IMAGE_PROVIDERS[provider]) {
    provider = (await ask('  Which provider? (openai/stability/replicate/gemini, blank to skip): ')).toLowerCase();
    if (provider === '') return { provider: 'openai', apiKey: '' };
    if (!IMAGE_PROVIDERS[provider]) {
      log('  Pick one of: openai, stability, replicate, gemini');
    }
  }

  log(`  Get your ${provider} key here: ${IMAGE_PROVIDERS[provider].signup}`);
  const apiKey = await ask(`  Paste your ${provider} api key (or ENTER to skip): `);
  return { provider, apiKey };
}

async function promptPlatforms() {
  log('\nStep 4/4: Which platforms should Vee post to by default?');
  log('  (You can change this later in vee-config.json. Answer y/n for each.)');
  log('');
  const platforms = {};
  for (const p of PLATFORMS) {
    const answer = (await ask(`  ${p.padEnd(10)} [y/N]: `)).toLowerCase();
    platforms[p] = answer === 'y';
  }
  return platforms;
}

async function run() {
  log('');
  log('Vee installer');
  log('=============');
  log('');
  log('Total time: ~3 minutes. Only the Virlo API key is required.');
  log('');

  const virloKey = await promptVirloKey();
  const postforme = await promptPostForMe();
  const imageGen = await promptImageGen();
  const platforms = await promptPlatforms();

  ensureNodeInstall();
  ensureSkillCopied();
  ensureMcpEntry(virloKey);

  let mediaHostBaseUrl = '';
  if (postforme.apiKey) {
    log('');
    log('  One optional thing: PostForMe needs hosted media URLs for posts.');
    log('  If you have an S3/R2/Cloudflare Images bucket, paste its public base URL.');
    log('  Vee will build URLs by appending the filename. Press ENTER to skip.');
    log('');
    mediaHostBaseUrl = await ask('  Media host base URL (or ENTER): ');
  }

  const config = {
    virlo: {
      api_key: virloKey,
      mcp_url: 'https://dev.virlo.ai/api/mcp/mcp',
      docs: 'https://dev.virlo.ai/docs/?via=organic',
      tracked_handles: {},
    },
    postforme: {
      api_key: postforme.apiKey,
      base_url: 'https://api.postforme.dev',
      social_accounts: postforme.socialAccounts,
    },
    image_gen: {
      provider: imageGen.provider,
      api_key: imageGen.apiKey,
      model: IMAGE_PROVIDERS[imageGen.provider]?.model || imageGen.provider,
    },
    platforms,
    defaults: {
      niche_keywords: [],
      posting_schedule: 'optimal',
      slide_count: 6,
      output_dir: './output',
      media_host_base_url: mediaHostBaseUrl,
    },
  };

  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  log('');
  log('Done. Vee is installed.');
  log(`  Config: ${CONFIG_PATH}`);
  log(`  Skill:  ${path.join(SKILL_DEST_DIR, 'SKILL.md')}`);
  log(`  MCP:    ${MCP_PATH}`);
  log('');
  log('Next: open Claude Code and say "hey vee, give me my morning report" or');
  log('      "research [your niche]" to start.');
  log('');

  if (!postforme.apiKey) {
    log('  Reminder: posting is disabled until you add a PostForMe key + social_account IDs.');
  }
  if (!imageGen.apiKey) {
    log('  Reminder: slide generation is disabled until you add an image gen key.');
  }
  if (postforme.apiKey && !mediaHostBaseUrl) {
    log('  Reminder: posting needs media URLs. Either pass --media-urls per post,');
    log('            or set defaults.media_host_base_url in vee-config.json.');
  }

  rl.close();
}

run().catch((err) => {
  console.error('');
  console.error('Install failed:', err.message);
  console.error('');
  rl.close();
  process.exit(1);
});
