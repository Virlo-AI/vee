import 'dotenv/config';
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  const configPath = resolve(__dirname, '../config/vee-config.json');
  if (!existsSync(configPath)) {
    console.error('no config found. copy vee-config.example.json to vee-config.json and fill it in.');
    process.exit(1);
  }
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

async function virloGet(path, apiKey, baseUrl = 'https://api.virlo.ai') {
  const { default: fetch } = await import('node-fetch');
  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`virlo api ${path} returned ${res.status}`);
  }
  return res.json();
}

async function fetchTrackedCreators(apiKey) {
  try {
    const data = await virloGet('/v1/tracking/creators', apiKey);
    return data?.data ?? data ?? [];
  } catch (err) {
    console.error(`couldn't pull tracked creators. ${err.message}`);
    return [];
  }
}

async function fetchTrackedVideos(apiKey) {
  try {
    const data = await virloGet('/v1/tracking/videos', apiKey);
    return data?.data ?? data ?? [];
  } catch (err) {
    console.error(`couldn't pull tracked videos. ${err.message}`);
    return [];
  }
}

async function fetchCreatorSnapshots(creatorId, apiKey) {
  try {
    const data = await virloGet(
      `/v1/tracking/creators/${creatorId}/snapshots?limit=7`,
      apiKey,
    );
    return data?.data ?? data ?? [];
  } catch {
    return [];
  }
}

async function fetchVideoSnapshots(videoId, apiKey) {
  try {
    const data = await virloGet(
      `/v1/tracking/videos/${videoId}/snapshots?limit=7`,
      apiKey,
    );
    return data?.data ?? data ?? [];
  } catch {
    return [];
  }
}

async function fetchTrendDigest(apiKey) {
  try {
    const data = await virloGet('/v1/trends/digest', apiKey);
    return data?.data ?? data ?? null;
  } catch (err) {
    console.error(`trend digest failed. ${err.message}`);
    return null;
  }
}

async function loadPostForMeAnalytics({ hours = 24, limit = 50 } = {}) {
  try {
    const analyticsPath = resolve(__dirname, './check-analytics.js');
    if (!existsSync(analyticsPath)) return null;
    const mod = await import(analyticsPath);
    const fn = mod.checkAnalytics ?? mod.default;
    if (typeof fn !== 'function') return null;
    // Silence the sub-script's stdout while we just want the data.
    const origLog = console.log;
    console.log = () => {};
    let result;
    try {
      result = await fn({ all: true, limit, asJson: true });
    } finally {
      console.log = origLog;
    }
    const allPosts = Array.isArray(result?.posts) ? result.posts : [];
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recent = allPosts.filter((p) => {
      const created = p.created_at ? new Date(p.created_at).getTime() : null;
      return created !== null && created >= cutoff;
    });
    const items = recent.map((p) => ({
      id: p.post_id,
      caption: p.caption,
      title: p.caption?.slice(0, 60),
      views: p.aggregates?.views ?? null,
      likes: p.aggregates?.likes ?? null,
      comments: p.aggregates?.comments ?? null,
      shares: p.aggregates?.shares ?? null,
      engagement_rate: p.aggregates?.engagement_rate ?? null,
    }));
    const viewsList = items.map((i) => i.views ?? 0).sort((a, b) => a - b);
    const engList = items.map((i) => i.engagement_rate ?? 0).sort((a, b) => a - b);
    const median = (arr) => arr.length === 0 ? 0 : arr[Math.floor(arr.length / 2)];
    const viewMed = median(viewsList);
    const engMed = median(engList);
    const quadrants = {
      highViewsHighEng: [],
      highViewsLowEng: [],
      lowViewsHighEng: [],
      lowViewsLowEng: [],
    };
    for (const i of items) {
      const hv = (i.views ?? 0) >= viewMed;
      const he = (i.engagement_rate ?? 0) >= engMed;
      if (hv && he) quadrants.highViewsHighEng.push(i);
      else if (hv && !he) quadrants.highViewsLowEng.push(i);
      else if (!hv && he) quadrants.lowViewsHighEng.push(i);
      else quadrants.lowViewsLowEng.push(i);
    }
    return { items, quadrants };
  } catch {
    return null;
  }
}

function deltaStr(a, b) {
  if (a == null || b == null) return 'n/a';
  const diff = a - b;
  if (diff === 0) return '±0';
  return diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
}

function latestAndPrev(snapshots) {
  if (!snapshots?.length) return [null, null];
  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.created_at ?? b.date ?? 0) - new Date(a.created_at ?? a.date ?? 0),
  );
  return [sorted[0], sorted[1] ?? null];
}

function fmtNum(n) {
  if (n == null) return 'n/a';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function recommendations(creatorData, videoData, postData) {
  const recs = [];

  const topCreator = creatorData
    .filter((c) => c._delta?.followers != null)
    .sort((a, b) => (b._delta?.followers ?? 0) - (a._delta?.followers ?? 0))[0];

  if (topCreator) {
    recs.push(
      `${topCreator.handle ?? topCreator.username ?? 'your top creator'} is moving. worth looking at what they posted in the last 48h.`,
    );
  }

  const topVideo = videoData
    .filter((v) => v._delta?.views != null)
    .sort((a, b) => (b._delta?.views ?? 0) - (a._delta?.views ?? 0))[0];

  if (topVideo) {
    recs.push(
      `"${topVideo.title ?? topVideo.url ?? 'a tracked video'}" is picking up ${fmtNum(topVideo._delta.views)} new views. study the hook.`,
    );
  }

  if (postData?.quadrants) {
    const { highViewsLowEng } = postData.quadrants;
    if (highViewsLowEng?.length) {
      recs.push(
        `${highViewsLowEng.length} post${highViewsLowEng.length !== 1 ? 's' : ''} got reach but killed the engagement. check the cta - probably missing or too soft.`,
      );
    }
    const { lowViewsHighEng } = postData.quadrants;
    if (lowViewsHighEng?.length) {
      recs.push(
        `${lowViewsHighEng.length} post${lowViewsHighEng.length !== 1 ? 's' : ''} got strong engagement but low reach. the hook probably needs work.`,
      );
    }
  }

  if (!recs.length) {
    recs.push('nothing wild happened. stable day. keep posting.');
  }

  return recs;
}

function buildReport({ date, creators, videos, posts, trends }) {
  const lines = [];

  lines.push(`# daily report — ${date}`);
  lines.push(`\ngood morning. here's what happened while you were sleeping.\n`);
  lines.push(`---\n`);

  lines.push(`## tracked creators\n`);
  if (!creators.length) {
    lines.push(`no tracked creators yet.\n`);
  } else {
    for (const c of creators) {
      const handle = c.handle ?? c.username ?? c.id;
      const platform = c.platform ?? '';
      const followers = fmtNum(c._latest?.followers ?? c.followers_count ?? null);
      const deltaFollowers = deltaStr(
        c._latest?.followers ?? null,
        c._prev?.followers ?? null,
      );
      const newVideos = c._delta?.new_videos ?? 'n/a';

      lines.push(`**${handle}** (${platform})`);
      lines.push(`- followers: ${followers} (${deltaFollowers} since yesterday)`);
      lines.push(`- new videos: ${newVideos}`);
      lines.push('');
    }
  }

  lines.push(`---\n`);
  lines.push(`## tracked videos\n`);

  if (!videos.length) {
    lines.push(`no tracked videos yet.\n`);
  } else {
    for (const v of videos) {
      const title = v.title ?? v.url ?? v.id;
      const views = fmtNum(v._latest?.views ?? v.view_count ?? null);
      const deltaViews = deltaStr(
        v._latest?.views ?? null,
        v._prev?.views ?? null,
      );
      const likes = fmtNum(v._latest?.likes ?? v.like_count ?? null);
      const deltaLikes = deltaStr(
        v._latest?.likes ?? null,
        v._prev?.likes ?? null,
      );

      lines.push(`**${title}**`);
      lines.push(`- views: ${views} (${deltaViews})`);
      lines.push(`- likes: ${likes} (${deltaLikes})`);
      lines.push('');
    }
  }

  lines.push(`---\n`);
  lines.push(`## your posts (last 24h)\n`);

  if (!posts?.items?.length) {
    lines.push(`nothing posted in the last 24h — or postforme isn't connected yet.\n`);
  } else {
    for (const p of posts.items) {
      const title = p.title ?? p.caption?.slice(0, 60) ?? p.id;
      lines.push(`**${title}**`);
      lines.push(`- views: ${fmtNum(p.views ?? null)} | likes: ${fmtNum(p.likes ?? null)} | comments: ${fmtNum(p.comments ?? null)} | shares: ${fmtNum(p.shares ?? null)}`);
      lines.push('');
    }

    if (posts.quadrants) {
      lines.push(`### 2×2 performance matrix\n`);
      const q = posts.quadrants;

      lines.push(`**high views + high engagement** (${q.highViewsHighEng.length} posts) — winners. reverse-engineer these.`);
      if (q.highViewsHighEng.length) {
        lines.push(q.highViewsHighEng.map((p) => `  - ${p.title ?? p.caption?.slice(0, 50) ?? p.id}`).join('\n'));
      }
      lines.push('');

      lines.push(`**high views + low engagement** (${q.highViewsLowEng.length} posts) — reach is there. cta is broken.`);
      if (q.highViewsLowEng.length) {
        lines.push(q.highViewsLowEng.map((p) => `  - ${p.title ?? p.caption?.slice(0, 50) ?? p.id}`).join('\n'));
      }
      lines.push('');

      lines.push(`**low views + high engagement** (${q.lowViewsHighEng.length} posts) — hook failed. content is solid.`);
      if (q.lowViewsHighEng.length) {
        lines.push(q.lowViewsHighEng.map((p) => `  - ${p.title ?? p.caption?.slice(0, 50) ?? p.id}`).join('\n'));
      }
      lines.push('');

      lines.push(`**low views + low engagement** (${q.lowViewsLowEng.length} posts) — skip. move on.\n`);
    }
  }

  lines.push(`---\n`);
  lines.push(`## trending in your niche\n`);

  if (!trends) {
    lines.push(`couldn't pull trends today. try again later.\n`);
  } else {
    const trendList = Array.isArray(trends) ? trends : trends.trends ?? trends.groups ?? [];
    if (!trendList.length) {
      lines.push(`no trend data returned.\n`);
    } else {
      for (const t of trendList.slice(0, 5)) {
        const label = t.label ?? t.name ?? t.topic ?? JSON.stringify(t).slice(0, 60);
        const count = t.video_count ?? t.count ?? null;
        lines.push(`- **${label}**${count != null ? ` — ${fmtNum(count)} videos` : ''}`);
      }
      lines.push('');
    }
  }

  lines.push(`---\n`);
  lines.push(`## recommendations\n`);

  const recs = recommendations(
    creators,
    videos,
    posts,
  );
  for (const r of recs) {
    lines.push(`- ${r}`);
  }
  lines.push('');

  lines.push(`---`);
  lines.push(`\n*generated by vee — virlo content agent*`);

  return lines.join('\n');
}

function saveReport(content, outputDir) {
  const dir = resolve(outputDir ?? join(__dirname, '../output/reports'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const filePath = join(dir, `report-${date}.md`);
  writeFileSync(filePath, content, 'utf8');
  return filePath;
}

async function generateReport(configOverride) {
  const config = configOverride ?? loadConfig();
  const virloKey = config.virlo?.api_key ?? process.env.VIRLO_API_KEY;
  const outputDir = config.defaults?.output_dir
    ? join(resolve(__dirname, '..'), config.defaults.output_dir, 'reports')
    : null;

  if (!virloKey || virloKey === 'YOUR_VIRLO_API_KEY') {
    console.error("no virlo api key set. add it to vee-config.json or VIRLO_API_KEY env var.");
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  console.log(`\ngood morning. pulling data for ${date}...\n`);

  console.log('fetching tracked creators...');
  const rawCreators = await fetchTrackedCreators(virloKey);

  console.log('fetching creator snapshots...');
  const creators = await Promise.all(
    rawCreators.map(async (c) => {
      const id = c.id ?? c.creator_id;
      const snaps = id ? await fetchCreatorSnapshots(id, virloKey) : [];
      const [latest, prev] = latestAndPrev(snaps);
      return {
        ...c,
        _latest: latest,
        _prev: prev,
        _delta: {
          followers: deltaNum(latest?.followers, prev?.followers),
          new_videos: deltaNum(latest?.video_count, prev?.video_count),
        },
      };
    }),
  );

  console.log('fetching tracked videos...');
  const rawVideos = await fetchTrackedVideos(virloKey);

  console.log('fetching video snapshots...');
  const videos = await Promise.all(
    rawVideos.map(async (v) => {
      const id = v.id ?? v.video_id;
      const snaps = id ? await fetchVideoSnapshots(id, virloKey) : [];
      const [latest, prev] = latestAndPrev(snaps);
      return {
        ...v,
        _latest: latest,
        _prev: prev,
        _delta: {
          views: deltaNum(latest?.views, prev?.views),
          likes: deltaNum(latest?.likes, prev?.likes),
        },
      };
    }),
  );

  console.log('fetching trend digest...');
  const trendRaw = await fetchTrendDigest(virloKey);

  console.log('checking postforme analytics...');
  const pfRaw = await loadPostForMeAnalytics();
  const posts = pfRaw ?? { items: [], quadrants: null };

  const report = buildReport({
    date,
    creators,
    videos,
    posts,
    trends: trendRaw,
  });

  console.log('\n' + '─'.repeat(60) + '\n');
  console.log(report);
  console.log('\n' + '─'.repeat(60) + '\n');

  const savedPath = saveReport(report, outputDir);
  console.log(`report saved. ${savedPath}\n`);

  return { report, path: savedPath, date };
}

function deltaNum(a, b) {
  if (a == null || b == null) return null;
  return a - b;
}

export { generateReport };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateReport().catch((err) => {
    console.error(`vee crashed. ${err.message}`);
    process.exit(1);
  });
}
