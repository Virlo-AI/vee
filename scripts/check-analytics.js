import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_PATH = resolve(__dirname, '../config/vee-config.json');

const METRIC_COLS = ['platform', 'views', 'likes', 'comments', 'shares', 'engagement rate'];
const COL_WIDTHS  = [12, 10, 10, 10, 10, 16];

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
    postId: null,
    all: false,
    json: false,
    limit: 10,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--post-id':
        result.postId = args[++i];
        break;
      case '--all':
        result.all = true;
        break;
      case '--json':
        result.json = true;
        break;
      case '--limit':
        result.limit = parseInt(args[++i], 10) || 10;
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
vee / check-analytics

usage:
  node check-analytics.js --post-id abc123
  node check-analytics.js --all [--limit 20]

options:
  --post-id   id      get analytics for a single post
  --all               list recent posts and their metrics
  --limit     n       number of posts to return when using --all (default: 10)
  --json              output raw json instead of table
  --help              show this
`);
}

function pad(str, len, right = false) {
  const s = String(str ?? '-');
  if (right) return s.slice(0, len).padStart(len);
  return s.slice(0, len).padEnd(len);
}

function formatNumber(n) {
  if (n == null || n === '' || isNaN(Number(n))) return '-';
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}m`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}k`;
  return String(num);
}

function formatRate(n) {
  if (n == null || n === '' || isNaN(Number(n))) return '-';
  return `${Number(n).toFixed(2)}%`;
}

function buildRow(cols) {
  return cols.map((val, i) => pad(val, COL_WIDTHS[i], i > 0)).join('  ');
}

function printTable(rows) {
  const header = buildRow(METRIC_COLS.map(c => c.toUpperCase()));
  const divider = COL_WIDTHS.map(w => '-'.repeat(w)).join('  ');
  console.log(header);
  console.log(divider);
  for (const row of rows) {
    console.log(buildRow(row));
  }
  console.log(divider);
}

function extractPlatformMetrics(raw) {
  const platforms = raw.platforms || raw.accounts || raw.results || {};
  const entries = [];

  if (typeof platforms === 'object' && !Array.isArray(platforms)) {
    for (const [platform, data] of Object.entries(platforms)) {
      const metrics = data.metrics || data.analytics || data || {};
      entries.push({
        platform,
        views:           metrics.views           ?? metrics.impressions ?? null,
        likes:           metrics.likes            ?? metrics.reactions   ?? null,
        comments:        metrics.comments         ?? null,
        shares:          metrics.shares           ?? metrics.reposts    ?? null,
        engagement_rate: metrics.engagement_rate  ?? metrics.engagement ?? null,
      });
    }
  } else if (Array.isArray(platforms)) {
    for (const item of platforms) {
      const metrics = item.metrics || item.analytics || item || {};
      entries.push({
        platform:        item.platform || item.name || 'unknown',
        views:           metrics.views           ?? metrics.impressions ?? null,
        likes:           metrics.likes            ?? metrics.reactions   ?? null,
        comments:        metrics.comments         ?? null,
        shares:          metrics.shares           ?? metrics.reposts    ?? null,
        engagement_rate: metrics.engagement_rate  ?? metrics.engagement ?? null,
      });
    }
  }

  return entries;
}

function computeAggregates(entries) {
  const agg = { views: 0, likes: 0, comments: 0, shares: 0, total_engagement: 0, platforms_counted: 0 };

  for (const e of entries) {
    agg.views    += Number(e.views)    || 0;
    agg.likes    += Number(e.likes)    || 0;
    agg.comments += Number(e.comments) || 0;
    agg.shares   += Number(e.shares)   || 0;
    agg.platforms_counted++;
  }

  agg.total_engagement = agg.likes + agg.comments + agg.shares;
  agg.engagement_rate  = agg.views > 0
    ? ((agg.total_engagement / agg.views) * 100).toFixed(2)
    : null;

  return agg;
}

function printPostAnalytics(post, entries) {
  const agg = computeAggregates(entries);

  const rows = entries.map(e => [
    e.platform,
    formatNumber(e.views),
    formatNumber(e.likes),
    formatNumber(e.comments),
    formatNumber(e.shares),
    formatRate(e.engagement_rate),
  ]);

  rows.push([
    'TOTAL',
    formatNumber(agg.views),
    formatNumber(agg.likes),
    formatNumber(agg.comments),
    formatNumber(agg.shares),
    agg.engagement_rate != null ? formatRate(agg.engagement_rate) : '-',
  ]);

  if (post.id)      console.log(`post id: ${post.id}`);
  if (post.caption) console.log(`caption: ${post.caption.slice(0, 80)}${post.caption.length > 80 ? '...' : ''}`);
  console.log('');
  printTable(rows);
  console.log('');
  console.log(`total reach: ${formatNumber(agg.views)} views across ${agg.platforms_counted} platform${agg.platforms_counted !== 1 ? 's' : ''}`);
}

async function getPostAnalytics(postId) {
  const fetch = (await import('node-fetch')).default;
  const config = loadConfig();

  const apiKey = config.postforme?.api_key || process.env.POSTFORME_API_KEY;
  if (!apiKey || apiKey === 'YOUR_POSTFORME_API_KEY') {
    throw new Error('vee: no postforme api key. add it to vee-config.json or POSTFORME_API_KEY env var.');
  }

  const baseUrl = config.postforme?.base_url || 'https://api.postforme.dev';

  const res = await fetch(`${baseUrl}/social-posts/${encodeURIComponent(postId)}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    let errMsg = `status ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body.message || body.error || JSON.stringify(body);
    } catch {
      errMsg = await res.text().catch(() => errMsg);
    }
    throw new Error(`vee: couldn't pull that post. ${errMsg}`);
  }

  const data = await res.json();
  const entries = extractPlatformMetrics(data);
  return { post: data, entries };
}

async function listRecentPosts(limit = 10) {
  const fetch = (await import('node-fetch')).default;
  const config = loadConfig();

  const apiKey = config.postforme?.api_key || process.env.POSTFORME_API_KEY;
  if (!apiKey || apiKey === 'YOUR_POSTFORME_API_KEY') {
    throw new Error('vee: no postforme api key. add it to vee-config.json or POSTFORME_API_KEY env var.');
  }

  const baseUrl = config.postforme?.base_url || 'https://api.postforme.dev';
  const url = `${baseUrl}/social-posts?limit=${limit}&sort=created_at:desc`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    let errMsg = `status ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body.message || body.error || JSON.stringify(body);
    } catch {
      errMsg = await res.text().catch(() => errMsg);
    }
    throw new Error(`vee: list failed. ${errMsg}`);
  }

  const data = await res.json();
  const posts = data.data || data.posts || data.results || (Array.isArray(data) ? data : []);
  return posts;
}

async function checkAnalytics({ postId = null, all = false, asJson = false, limit = 10 } = {}) {
  if (!postId && !all) {
    throw new Error('vee: pass --post-id or --all.');
  }

  if (postId) {
    console.log(`vee: pulling your numbers for post ${postId}... let's see how we did`);
    const { post, entries } = await getPostAnalytics(postId);

    if (asJson) {
      const agg = computeAggregates(entries);
      const output = { post_id: postId, post, platform_metrics: entries, aggregates: agg };
      console.log(JSON.stringify(output, null, 2));
      return output;
    }

    console.log('');
    printPostAnalytics(post, entries);
    return { post, platform_metrics: entries, aggregates: computeAggregates(entries) };

  } else {
    console.log(`vee: pulling recent posts... let's see how we did`);
    const posts = await listRecentPosts(limit);

    if (posts.length === 0) {
      console.log("vee: nothing posted yet. let's fix that.");
      return { posts: [] };
    }

    if (asJson) {
      const output = posts.map(p => ({
        post_id: p.id || p.post_id || null,
        caption: p.caption || null,
        created_at: p.created_at || null,
        platform_metrics: extractPlatformMetrics(p),
        aggregates: computeAggregates(extractPlatformMetrics(p)),
      }));
      console.log(JSON.stringify(output, null, 2));
      return { posts: output };
    }

    console.log('');

    for (const post of posts) {
      const entries = extractPlatformMetrics(post);
      const id = post.id || post.post_id || '?';
      const cap = post.caption ? post.caption.slice(0, 60) + (post.caption.length > 60 ? '...' : '') : '(no caption)';
      console.log(`--- ${id}  "${cap}"`);
      if (entries.length > 0) {
        printPostAnalytics(post, entries);
      } else {
        console.log('  no per-platform data yet.');
        console.log('');
      }
    }

    return {
      posts: posts.map(p => ({
        post_id: p.id || p.post_id || null,
        caption: p.caption || null,
        platform_metrics: extractPlatformMetrics(p),
        aggregates: computeAggregates(extractPlatformMetrics(p)),
      })),
    };
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const parsed = parseArgs(args);

  if (!parsed.postId && !parsed.all) {
    console.error('vee: pass --post-id <id> or --all.');
    process.exit(1);
  }

  try {
    await checkAnalytics({
      postId: parsed.postId,
      all: parsed.all,
      asJson: parsed.json,
      limit: parsed.limit,
    });
  } catch (err) {
    console.error(err.message || String(err));
    process.exit(1);
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  main();
}

export { checkAnalytics, getPostAnalytics, listRecentPosts, extractPlatformMetrics, computeAggregates };
export default checkAnalytics;
