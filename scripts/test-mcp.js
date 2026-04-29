import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(REPO_ROOT, 'config', 'vee-config.json');

const MCP_URL = 'https://dev.virlo.ai/api/mcp/mcp';

function loadKey() {
  if (process.env.VIRLO_API_KEY) return process.env.VIRLO_API_KEY;
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error('No vee-config.json and no VIRLO_API_KEY env var. Run npm run install-vee first.');
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const key = config?.virlo?.api_key;
  if (!key || key.startsWith('YOUR_')) {
    throw new Error('No Virlo API key in vee-config.json. Run npm run install-vee.');
  }
  return key;
}

async function callMcp(key, toolName, args = {}) {
  const fetch = (await import('node-fetch')).default;
  const body = {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000000),
    method: 'tools/call',
    params: { name: toolName, arguments: args },
  };
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    return { ok: false, status: res.status, error: await res.text().catch(() => '') };
  }
  const text = await res.text();
  // SSE response - parse the data line(s)
  const dataLines = text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim());
  if (dataLines.length === 0) {
    return { ok: false, status: 200, error: 'no data lines in SSE response' };
  }
  try {
    const parsed = JSON.parse(dataLines[dataLines.length - 1]);
    if (parsed.error) return { ok: false, status: 200, error: parsed.error.message || JSON.stringify(parsed.error) };
    return { ok: true, result: parsed.result };
  } catch (err) {
    return { ok: false, status: 200, error: `JSON parse: ${err.message}` };
  }
}

async function listTools(key) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  });
  if (!res.ok) return null;
  const text = await res.text();
  const dataLines = text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim());
  if (dataLines.length === 0) return null;
  try {
    const parsed = JSON.parse(dataLines[dataLines.length - 1]);
    return parsed?.result?.tools?.map((t) => t.name) || null;
  } catch {
    return null;
  }
}

// Test plan: tools that are FREE and READ-ONLY only.
// Never call tools that spend credits (search_keywords, lookup_creator, create_niche_monitor, etc.)
const TESTS = [
  { tool: 'list_niche_monitors', args: {}, label: 'List niche monitors (Comet)' },
  { tool: 'list_keyword_searches', args: { limit: 1 }, label: 'List keyword searches (Orbit history)' },
  { tool: 'list_tracked_items', args: { type: 'both' }, label: 'List tracked creators + videos' },
  { tool: 'get_credit_balance', args: {}, label: 'Get credit balance' },
];

function pad(s, n) { return String(s).padEnd(n); }

async function run() {
  console.log('');
  console.log('Vee MCP Smoke Test');
  console.log('==================');
  console.log('');

  let key;
  try {
    key = loadKey();
  } catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
  }

  console.log('Step 1: Auth + tools/list...');
  const tools = await listTools(key);
  if (!tools) {
    console.error('  FAIL: could not authenticate or fetch tool list. Check your Virlo API key.');
    process.exit(1);
  }
  console.log(`  PASS: authenticated. ${tools.length} tools available.`);
  console.log('');

  console.log('Step 2: Free read-only smoke tests...');
  console.log('');
  console.log(`  ${pad('test', 50)} ${pad('status', 8)} notes`);
  console.log(`  ${'-'.repeat(50)} ${'-'.repeat(8)} ${'-'.repeat(40)}`);

  let pass = 0;
  let fail = 0;

  for (const test of TESTS) {
    if (!tools.includes(test.tool)) {
      console.log(`  ${pad(test.label, 50)} ${pad('SKIP', 8)} tool not in MCP server: ${test.tool}`);
      continue;
    }
    const result = await callMcp(key, test.tool, test.args);
    if (result.ok) {
      console.log(`  ${pad(test.label, 50)} ${pad('PASS', 8)} -`);
      pass++;
    } else {
      const note = `${result.status ? `HTTP ${result.status} ` : ''}${result.error?.slice(0, 60) || ''}`;
      console.log(`  ${pad(test.label, 50)} ${pad('FAIL', 8)} ${note}`);
      fail++;
    }
  }

  console.log('');
  console.log(`Result: ${pass} passed, ${fail} failed.`);
  console.log('');

  // Coverage check - flag if expected tools are missing from the MCP server
  const expected = [
    'search_keywords', 'get_trends', 'get_trends_digest', 'get_trending_videos',
    'search_hashtags', 'get_hashtag_performance',
    'create_niche_monitor', 'manage_niche_monitor', 'list_niche_monitors', 'get_niche_monitor_data',
    'lookup_creator', 'batch_lookup_creators',
    'analyze_video',
    'track_creator', 'track_video', 'list_tracked_items', 'get_tracking_report',
    'list_creator_posts', 'get_posting_cadence', 'collect_creator_posts',
    'search_sounds', 'get_trending_sounds', 'get_creator_sounds',
    'get_sound_details', 'get_sound_usage_history', 'get_sound_videos',
    'get_credit_balance', 'check_job_status',
    'list_keyword_searches', 'get_keyword_search_results',
  ];
  const missing = expected.filter((t) => !tools.includes(t));
  const extra = tools.filter((t) => !expected.includes(t));

  if (missing.length) {
    console.log('Missing tools (expected by skill, not in MCP server):');
    for (const t of missing) console.log(`  - ${t}`);
    console.log('');
  }
  if (extra.length) {
    console.log('New tools (in MCP server, not yet documented in skill):');
    for (const t of extra) console.log(`  + ${t}`);
    console.log('');
  }

  if (fail > 0 || missing.length > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Smoke test crashed:', err.message);
  process.exit(1);
});
