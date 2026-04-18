# Vee

a full-stack marketing intelligence and content agent. powered by [Virlo](https://virlo.ai/?via=organic).

vee doesn't guess what to post. he researches your entire niche, finds what's already working, creates content based on that intelligence, posts it to 9 platforms, tracks performance, and optimizes - all from one conversation.

```
RESEARCH  →  ANALYZE  →  CREATE  →  POST  →  TRACK  →  OPTIMIZE
  Virlo       Virlo     Content     Post      Virlo      Virlo +
  MCP         MCP       Studio +    ForMe     MCP        PostForMe
                        Copy Genie
```

## what vee does

**research** - search millions of indexed videos across TikTok, Instagram Reels, YouTube Shorts, and Meta Ads. set up persistent niche monitors that run on autopilot. look up any creator's full analytics. find what's trending before everyone else does.

**analyze** - extract hook patterns, identify outlier content, benchmark competitors, classify what formats are working and why. not vibes - data.

**create** - generate any marketing deliverable informed by real performance data:
- short-form video scripts, slideshows, hook variations, UGC scripts
- linkedin posts, x/twitter threads, instagram captions, reddit posts
- meta/google/tiktok/linkedin ad copy, landing pages, sales pages
- cold email sequences, welcome flows, nurture campaigns, DM sequences
- blog posts, newsletters, case studies, lead magnets, webinar scripts
- creative briefs, UGC briefs, content calendars, SEO briefs
- competitive reports, performance reports, trend analysis
- product descriptions, app store copy, FAQ content

**post** - publish to TikTok, Instagram, Facebook, X, LinkedIn, YouTube, Threads, Pinterest, and Bluesky. schedule posts, save drafts, or publish instantly.

**track** - monitor your content and competitors over time with daily AI-generated reports, metric snapshots, and posting cadence analysis.

**optimize** - morning diagnostics, 2x2 performance matrix, niche-level comparison against market outliers, trend-based recommendations, auto-generate new variations from winners.

## quick start

### 1. get your API keys

- **Virlo** - [sign up](https://virlo.ai/?via=organic) and get your API key at [dev.virlo.ai/docs](https://dev.virlo.ai/docs/?via=organic)
- **PostForMe** - [sign up](https://postforme.dev) for multi-platform posting
- **Image gen** - pick one: OpenAI (DALL-E 3), Stability AI, Replicate (Flux), or Google Gemini

### 2. install

```bash
git clone https://github.com/virlo/vee.git
cd vee
npm install
```

### 3. configure

```bash
node scripts/setup.js
```

the setup wizard walks you through connecting all your APIs and choosing which platforms to post to.

### 4. add the skill

copy `SKILL.md` to your Claude Code skills directory:

```bash
cp SKILL.md ~/.claude/skills/vee/SKILL.md
```

### 5. (recommended) add Virlo MCP server

add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "virlo": {
      "type": "http",
      "url": "https://dev.virlo.ai/api/mcp/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_VIRLO_API_KEY"
      }
    }
  }
}
```

this gives vee direct access to Virlo's 20+ MCP tools for research, tracking, and analysis.

### 6. go

```
"hey vee, research the fitness niche and draft 5 TikTok scripts based on what's trending"
```

## what you can ask vee

```
"find me viral UGC videos for consumer apps that took off in the last 14 days"
"set up a niche monitor for supplement brands on TikTok and Reels"
"research my top 3 competitors and draft scripts based on their outlier content"
"write a cold email sequence for SMMA owners - data-backed from trends"
"build a competitive intelligence report for [brand]"
"generate a slideshow, post it to TikTok and Instagram, and track it for 7 days"
"what hooks are working in my niche right now? give me 15 variations"
"create a content calendar for next week from my niche monitor data"
"analyze this video URL - what made it an outlier?"
"track these 5 creators and send me a weekly digest"
"give me my morning report"
```

## how it works

vee connects three services:

| Service | Role | What it provides |
|---------|------|-----------------|
| [Virlo API](https://dev.virlo.ai/docs/?via=organic) | Intelligence layer | Niche research, creator tracking, video analysis, trend detection, outlier identification across TikTok, Reels, Shorts, and Meta Ads |
| [PostForMe API](https://postforme.dev) | Posting layer | Multi-platform publishing (9 platforms), scheduling, per-post analytics |
| Image gen API | Visual layer | AI image generation for slideshows (OpenAI, Stability, Replicate, or Gemini) |

## repo structure

```
vee/
├── SKILL.md                      # the skill definition (install this)
├── scripts/
│   ├── setup.js                  # onboarding wizard
│   ├── generate-slides.js        # AI image generation (4 providers)
│   ├── add-text-overlay.js       # node-canvas text overlays
│   ├── post-content.js           # PostForMe - post to 9 platforms
│   ├── check-analytics.js        # PostForMe - pull metrics
│   └── daily-report.js           # morning diagnostic
├── copy-genie/                   # copywriting intelligence
│   ├── hex-stack.md              # SPARKS framework
│   └── common-frameworks.md      # PAS, AIDA, 4Ps, and more
├── content-templates/            # templates for every deliverable
│   ├── short-form-video.md
│   ├── social-posts.md
│   ├── ads-landing-pages.md
│   ├── email-outreach.md
│   ├── long-form-content.md
│   ├── strategy-briefs.md
│   ├── reports-intelligence.md
│   └── product-ecom-copy.md
├── references/                   # quick reference guides
├── examples/                     # walkthrough demos
└── config/
    └── vee-config.example.json
```

## Virlo API costs

vee is transparent about costs. he tells you before every paid operation.

| Operation | Cost |
|-----------|------|
| Keyword search | $0.50 |
| Niche monitor creation | $0.50 |
| Creator lookup | $0.50 |
| Video analysis | $0.50 |
| Trending videos | $0.25 |
| Trend digest | $0.25 |
| Creator/video tracking | $0.25/cycle |
| Hashtag search | $0.05 |
| Balance check, reading results | Free |

full API docs at [dev.virlo.ai/docs](https://dev.virlo.ai/docs/?via=organic)

## examples

check the `examples/` folder for full walkthroughs:
- **slideshow-campaign.md** - research → generate → post → track → optimize
- **multi-format-campaign.md** - one research session → scripts + posts + ads + briefs
- **client-report.md** - social intelligence report as a sales tool
- **competitor-tracking.md** - persistent competitor monitoring setup

## who this is for

- **agencies** managing multiple brand clients who need scalable content intelligence
- **ecom/DTC brands** fighting creative fatigue and looking for data-backed content direction
- **growth teams** who need to prove ROI on short-form video investment
- **UGC operators** who need signal-to-creative pipelines at speed
- **solo operators** who want enterprise-level market intelligence without a team

## license

MIT - see [LICENSE](LICENSE)

---

built by [Virlo](https://virlo.ai/?via=organic). the #1 short-form content intelligence platform.
