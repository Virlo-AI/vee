import 'dotenv/config';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'vee-config.json');
const CONFIG_DIR = path.join(__dirname, '..', 'config');

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'x', 'linkedin', 'facebook', 'threads', 'pinterest', 'bluesky'];
const IMAGE_PROVIDERS = ['openai', 'stability', 'replicate', 'gemini'];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (question) =>
  new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));

const print = (...args) => console.log(...args);

async function checkVirloKey(apiKey) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('https://dev.virlo.ai/api/credits/balance', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`status ${res.status}: ${body}`);
  }
  return res.json();
}

async function promptPlatforms(existing) {
  print('\nwhich platforms do you want to enable?');
  print(`(type y/n for each. enter = keep current)\n`);

  const result = {};
  for (const p of PLATFORMS) {
    const current = existing?.[p] ?? false;
    const hint = current ? 'Y/n' : 'y/N';
    const answer = await ask(`  ${p} [${hint}]: `);
    if (answer === '') {
      result[p] = current;
    } else {
      result[p] = answer.toLowerCase() === 'y';
    }
  }
  return result;
}

async function promptImageProvider(existing) {
  print(`\nimage gen provider? options: ${IMAGE_PROVIDERS.join(' / ')}`);
  const hint = existing ? ` (current: ${existing})` : '';
  let provider = '';
  while (!IMAGE_PROVIDERS.includes(provider)) {
    const raw = await ask(`  provider${hint}: `);
    provider = raw === '' && existing ? existing : raw.toLowerCase();
    if (!IMAGE_PROVIDERS.includes(provider)) {
      print(`  nah, pick one of: ${IMAGE_PROVIDERS.join(', ')}`);
    }
  }
  return provider;
}

async function run() {
  print('\nvee here. let\'s get you set up.\n');

  let existingConfig = null;
  if (fs.existsSync(CONFIG_PATH)) {
    existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const reconfigure = await ask('config already exists. reconfigure from scratch? [y/N]: ');
    if (reconfigure.toLowerCase() !== 'y') {
      print('\nalright, keeping existing config. nothing changed.\n');
      rl.close();
      return;
    }
    print('\ncool, let\'s redo it.\n');
  }

  const ex = existingConfig;

  // --- Virlo API key ---
  print('step 1: virlo api key');
  print('  sign up at https://virlo.ai/?via=organic');
  print('  then create your key at https://dev.virlo.ai/?via=organic (Settings → API Keys)');
  print('  format: virlo_tkn_...\n');
  const virloHint = ex?.virlo?.api_key ? ` (current: ${ex.virlo.api_key.slice(0, 8)}...)` : '';
  const virloKey = await ask(`  virlo api key${virloHint}: `);
  const finalVirloKey = virloKey === '' && ex?.virlo?.api_key ? ex.virlo.api_key : virloKey;

  if (!finalVirloKey) {
    print('\n  no api key entered. bailing.\n');
    rl.close();
    return;
  }

  // --- PostForMe API key ---
  print('\nstep 2: postforme api key');
  print('  sign up at https://www.postforme.dev/developers');
  print('  connect your social accounts in the dashboard, then copy the api key');
  print('  you will also need to copy your social_account ids per platform - paste them in vee-config.json under postforme.social_accounts after setup\n');
  const pfHint = ex?.postforme?.api_key ? ` (current: ${ex.postforme.api_key.slice(0, 8)}...)` : '';
  const pfKey = await ask(`  postforme api key${pfHint}: `);
  const finalPfKey = pfKey === '' && ex?.postforme?.api_key ? ex.postforme.api_key : pfKey;

  // --- Image gen ---
  print('\nstep 3: image generation');
  print('  pick one provider. get the key at:');
  print('    openai     -> https://platform.openai.com/api-keys');
  print('    stability  -> https://platform.stability.ai/account/keys');
  print('    replicate  -> https://replicate.com/account/api-tokens');
  print('    gemini     -> https://aistudio.google.com/app/apikey\n');
  const provider = await promptImageProvider(ex?.image_gen?.provider);
  const imgHint = ex?.image_gen?.api_key ? ` (current: ${ex.image_gen.api_key.slice(0, 8)}...)` : '';
  const imgKey = await ask(`  ${provider} api key${imgHint}: `);
  const finalImgKey = imgKey === '' && ex?.image_gen?.api_key ? ex.image_gen.api_key : imgKey;
  if (!finalImgKey) {
    print(`  heads up: no ${provider} key entered. slide generation will fail until you add one to vee-config.json or your env.`);
  }

  // --- Platforms ---
  print('\nstep 4: platforms');
  const platforms = await promptPlatforms(ex?.platforms);

  // --- Default niche keywords ---
  print('\nstep 5: default niche keywords');
  const existingKeywords = ex?.defaults?.niche_keywords ?? [];
  const kwHint = existingKeywords.length ? ` (current: ${existingKeywords.join(', ')})` : '';
  const kwRaw = await ask(`  keywords, comma-separated${kwHint}: `);
  const niche_keywords = kwRaw === '' && existingKeywords.length
    ? existingKeywords
    : kwRaw.split(',').map((k) => k.trim()).filter(Boolean);

  // --- Test Virlo connection ---
  print('\nTesting Virlo API connection...');
  try {
    await checkVirloKey(finalVirloKey);
    print('  Connected.');
  } catch (err) {
    print(`  Couldn't connect to Virlo: ${err.message}`);
    const proceed = await ask('  proceed anyway? [y/N]: ');
    if (proceed.toLowerCase() !== 'y') {
      print('\n  alright, fix the key and come back.\n');
      rl.close();
      return;
    }
  }

  // --- Build config ---
  const config = {
    virlo: {
      api_key: finalVirloKey,
      mcp_url: 'https://dev.virlo.ai/api/mcp/mcp',
      docs: 'https://dev.virlo.ai/docs/?via=organic',
    },
    postforme: {
      api_key: finalPfKey || '',
      base_url: 'https://api.postforme.dev',
      social_accounts: ex?.postforme?.social_accounts ?? {
        tiktok: '',
        instagram: '',
        youtube: '',
        x: '',
        linkedin: '',
        facebook: '',
        threads: '',
        pinterest: '',
        bluesky: '',
      },
    },
    image_gen: {
      provider,
      api_key: finalImgKey || '',
      model: provider === 'openai' ? 'dall-e-3' : provider,
    },
    platforms,
    defaults: {
      niche_keywords,
      posting_schedule: ex?.defaults?.posting_schedule ?? 'optimal',
      slide_count: ex?.defaults?.slide_count ?? 6,
      output_dir: ex?.defaults?.output_dir ?? './output',
      media_host_base_url: ex?.defaults?.media_host_base_url ?? '',
    },
  };

  // --- Write config ---
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

  print('\nalright, we\'re locked in. let\'s go find some trends.\n');
  print(`  config saved to: ${CONFIG_PATH}`);

  const enabledPlatforms = Object.entries(platforms)
    .filter(([, v]) => v)
    .map(([k]) => k);
  print(`  platforms: ${enabledPlatforms.join(', ') || 'none'}`);
  print(`  image gen: ${provider}`);
  print(`  keywords: ${niche_keywords.join(', ') || 'none set'}`);

  if (finalPfKey) {
    print('\none more thing - postforme social_account ids:');
    print('  open vee-config.json and fill in postforme.social_accounts.<platform>');
    print('  for every platform you enabled. find ids in your postforme dashboard.');
    print('  posting will fail until these are filled in.');
  }

  print('\nrun `npm run generate-slides` to start.\n');

  rl.close();
}

run().catch((err) => {
  print(`\nsomething broke during setup: ${err.message}\n`);
  rl.close();
  process.exit(1);
});

export { run };
