import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const TARGETS = [
  {
    label: 'Vee skill registration',
    path: path.join(os.homedir(), '.claude', 'skills', 'vee'),
    type: 'dir',
  },
  {
    label: 'Vee config (local)',
    path: path.join(REPO_ROOT, 'config', 'vee-config.json'),
    type: 'file',
  },
  {
    label: 'Vee memory (.vee/memory/)',
    path: path.join(REPO_ROOT, '.vee', 'memory'),
    type: 'dir',
  },
];

const MCP_PATH = path.join(os.homedir(), '.claude', '.mcp.json');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function removePath(p, type) {
  if (!exists(p)) return false;
  if (type === 'dir') fs.rmSync(p, { recursive: true, force: true });
  else fs.rmSync(p, { force: true });
  return true;
}

function clearVirloFromMcp() {
  if (!exists(MCP_PATH)) return null;
  try {
    const mcp = JSON.parse(fs.readFileSync(MCP_PATH, 'utf8'));
    if (!mcp.mcpServers || !mcp.mcpServers.virlo) return false;
    delete mcp.mcpServers.virlo;
    if (Object.keys(mcp.mcpServers).length === 0) {
      fs.rmSync(MCP_PATH, { force: true });
      return 'removed_file';
    }
    fs.writeFileSync(MCP_PATH, JSON.stringify(mcp, null, 2));
    return 'removed_entry';
  } catch (err) {
    return `error: ${err.message}`;
  }
}

async function run() {
  console.log('');
  console.log('Vee Reset');
  console.log('=========');
  console.log('');
  console.log('This wipes Vee from your machine so you can test the install flow from scratch.');
  console.log('');
  console.log('What will be removed:');
  for (const t of TARGETS) {
    console.log(`  ${exists(t.path) ? '[exists]' : '[ none ]'}  ${t.path}`);
  }
  console.log(`  ${exists(MCP_PATH) ? '[check ]' : '[ none ]'}  ${MCP_PATH} (only the "virlo" entry)`);
  console.log('');
  console.log('Your Virlo account, API keys, and the cloned repo itself are NOT touched.');
  console.log('');

  const confirm = await ask('Proceed? [y/N]: ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    rl.close();
    return;
  }

  console.log('');
  for (const t of TARGETS) {
    const removed = removePath(t.path, t.type);
    console.log(`  ${removed ? 'removed' : 'skipped (not present)'}: ${t.label}`);
  }

  const mcpResult = clearVirloFromMcp();
  if (mcpResult === 'removed_entry') console.log('  removed: Virlo entry from .mcp.json');
  else if (mcpResult === 'removed_file') console.log('  removed: .mcp.json (no other servers configured)');
  else if (mcpResult === false) console.log('  skipped: no Virlo entry in .mcp.json');
  else if (mcpResult === null) console.log('  skipped: .mcp.json does not exist');
  else console.log(`  warning: ${mcpResult}`);

  console.log('');
  console.log('Done. Vee is wiped. Run `npm run install-vee` to reinstall.');
  console.log('');
  rl.close();
}

run().catch((err) => {
  console.error('Reset failed:', err.message);
  rl.close();
  process.exit(1);
});
