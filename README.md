# Vee

A full-stack marketing intelligence and content agent. Powered by [Virlo](https://virlo.ai/?via=organic).

Vee doesn't guess what to post. He researches your entire niche, finds what's already working, creates content based on that intelligence, posts it to 9 platforms, tracks performance, and optimizes - all from one conversation.

```
RESEARCH  →  ANALYZE  →  CREATE  →  POST  →  TRACK  →  OPTIMIZE
  Virlo       Virlo     Content     Post      Virlo      Virlo +
  MCP         MCP       Studio +    ForMe     MCP        PostForMe
                        Copy Genie
```

## What Vee Does

**Research** - Search millions of indexed videos across TikTok, Instagram Reels, YouTube Shorts, and Meta Ads. Set up persistent niche monitors that run on autopilot. Look up any creator's full analytics. Find what's trending before everyone else does.

**Analyze** - Extract hook patterns, identify outlier content, benchmark competitors, classify what formats are working and why. Not vibes - data.

**Create** - Generate any marketing deliverable informed by real performance data:
- Short-form video scripts, slideshows, hook variations, UGC scripts
- LinkedIn posts, X/Twitter threads, Instagram captions, Reddit posts
- Meta/Google/TikTok/LinkedIn ad copy, landing pages, sales pages
- Cold email sequences, welcome flows, nurture campaigns, DM sequences
- Blog posts, newsletters, case studies, lead magnets, webinar scripts
- Creative briefs, UGC briefs, content calendars, SEO briefs
- Competitive reports, performance reports, trend analysis
- Product descriptions, app store copy, FAQ content

**Post** - Publish to TikTok, Instagram, Facebook, X, LinkedIn, YouTube, Threads, Pinterest, and Bluesky. Schedule posts, save drafts, or publish instantly.

**Track** - Monitor your content and competitors over time with daily AI-generated reports, metric snapshots, and posting cadence analysis.

**Optimize** - Morning diagnostics, 2x2 performance matrix, niche-level comparison against market outliers, trend-based recommendations, auto-generate new variations from winners.

## Quick Start

Open Claude Code and tell your agent:

```
install Vee for me from https://github.com/Virlo-AI/vee
```

Your agent clones the repo, installs dependencies, registers Vee as a Claude Code skill, wires up the Virlo MCP server, and walks you through API key signups. The whole thing takes ~3 minutes. The only required key is Virlo - PostForMe and image gen are optional and can be added later.

When the installer prompts you to sign up, it gives you direct links to the developer dashboards (no front-end onboarding tutorials, no forced trials):

- Virlo (required): [dev.virlo.ai/signup/?via=organic](https://dev.virlo.ai/signup/?via=organic) - $5 minimum credit to use the API
- PostForMe (optional, only if you want Vee to post): [postforme.dev/developers](https://www.postforme.dev/developers)
- Image gen (optional, only if you want Vee to generate slides): pick one - OpenAI, Stability, Replicate, or Gemini

### Doing it manually

If you'd rather run it yourself:

```bash
git clone https://github.com/Virlo-AI/vee.git
cd vee
npm run install-vee
```

Same wizard, same result. You can re-run `npm run install-vee` any time to update keys.

### Talk to Vee

Once installed, open Claude Code and say:

```
"hey vee, research the fitness niche and draft 5 TikTok scripts based on what's trending"
```

## What You Can Ask Vee

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

## How It Works

Vee connects three services:

| Service | Role | What It Provides |
|---------|------|-----------------|
| [Virlo API](https://dev.virlo.ai/docs/?via=organic) | Intelligence layer | Niche research, creator tracking, video analysis, trend detection, outlier identification across TikTok, Reels, Shorts, and Meta Ads |
| [PostForMe API](https://postforme.dev) | Posting layer | Multi-platform publishing (9 platforms), scheduling, per-post analytics |
| Image Gen API | Visual layer | AI image generation for slideshows (OpenAI, Stability, Replicate, or Gemini) |

## Repo Structure

```
vee/
├── SKILL.md                      # The skill definition (install this)
├── scripts/
│   ├── setup.js                  # Onboarding wizard
│   ├── generate-slides.js        # AI image generation (4 providers)
│   ├── add-text-overlay.js       # node-canvas text overlays
│   ├── post-content.js           # PostForMe - post to 9 platforms
│   ├── check-analytics.js        # PostForMe - pull metrics
│   └── daily-report.js           # Morning diagnostic
├── copy-genie/                   # Copywriting intelligence
│   ├── hex-stack.md              # SPARKS framework
│   └── common-frameworks.md      # PAS, AIDA, 4Ps, and more
├── content-templates/            # Templates for every deliverable
│   ├── short-form-video.md
│   ├── social-posts.md
│   ├── ads-landing-pages.md
│   ├── email-outreach.md
│   ├── long-form-content.md
│   ├── strategy-briefs.md
│   ├── reports-intelligence.md
│   └── product-ecom-copy.md
├── references/                   # Quick reference guides
├── examples/                     # Walkthrough demos
└── config/
    └── vee-config.example.json
```

## Virlo API Costs

Vee is transparent about costs. He tells you before every paid operation.

| Operation | Cost |
|-----------|------|
| Keyword search (Orbit) | $0.50 |
| Niche monitor creation | $0.50 |
| Creator lookup | $0.50 |
| Video analysis | $0.50 |
| Trending videos | $0.25 |
| Trends (`get_trends`) | $0.25 |
| Trend digest | $0.25 |
| Creator/video tracking | $0.25/cycle |
| Hashtag search | $0.05 |
| Hashtag performance | $0.05 |
| Sound search / details / trending / videos / history / per-creator | $0.05 each |
| Manage niche monitor (update/deactivate) | Free |
| Balance check, list tracked items, reading results | Free |

Full API docs at [dev.virlo.ai/docs](https://dev.virlo.ai/docs/?via=organic)

## Examples

Check the `examples/` folder for full walkthroughs:
- **slideshow-campaign.md** - Research → generate → post → track → optimize
- **multi-format-campaign.md** - One research session → scripts + posts + ads + briefs
- **client-report.md** - Social intelligence report as a sales tool
- **competitor-tracking.md** - Persistent competitor monitoring setup

## Who This Is For

- **Agency owners** running multiple client accounts who need every client's niche researched, briefed, and reported on without hiring a research team
- **Ecom/DTC brands** spending $5-15K/month on UGC creators who need to find outlier creators before competitors do, discover hidden audience segments in comments, and brief creators from proven hooks instead of gut feelings
- **CMOs / growth teams** who need real-time competitive intelligence, content performance benchmarked against market outliers, and data-backed creative decisions they can actually defend to the CEO
- **UGC operators / creator managers** who need to identify which creators actually drive views vs which ones just look good on paper, and track creator performance over time
- **Solo founders / first-time builders** who need an entire marketing operation - research, content, posting, tracking - running in 30 minutes a day without a team or agency budget
- **Personal brands** monetizing through coaching, courses, masterminds, or high-ticket offers who need to know what their peers' hooks are converting before building their next piece of content
- **Independent content operators** running their own faces and voices on TikTok, Reels, or YouTube Shorts - making revenue through ad rev, sponsorships, UGC deals, and digital products - who need to research what's working in their niche and reverse-engineer outlier hooks beat-by-beat
- **Local and brick-and-mortar businesses** (cafes, gyms, dental offices, real estate, beauty, restaurants) who need their social presence built from trends actually moving in their service area
- **API builders / developers** who want to plug Virlo's intelligence into their own products and workflows - custom dashboards, client-facing tools, automated pipelines
- **Freelance marketers / consultants** who want to deliver competitive intelligence reports as a service, pitch clients with real niche data, and build retainers around research their clients can't do themselves
- **Ad buyers / media buyers** who need Meta Ads intelligence showing what competitors are spending on, cross-referenced with organic winners to validate creative angles before spending budget
- **Sales teams doing outbound** who need cold emails built from trending pain points in their prospect's niche, LinkedIn posts for personal brand, and competitive reports as lead magnets

## Support

Stuck setting up Vee or hitting an error during install? Email [info@virlo.ai](mailto:info@virlo.ai) and we'll unstick you. For Virlo API questions specifically, the docs at [dev.virlo.ai/docs](https://dev.virlo.ai/docs/?via=organic) have a playground you can test endpoints in.

## License

MIT - see [LICENSE](LICENSE)

---

Built by [Red Labs LLC](https://virlo.ai/?via=organic). Virlo is the #1 short-form content intelligence platform.
