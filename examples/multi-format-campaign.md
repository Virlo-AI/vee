# Example: Multi-Format Campaign

Research one niche once, then generate scripts, social posts, ad copy, briefs, and a content calendar from the same intelligence.

**Scenario:** You're an SMMA agency onboarding a new skincare client called GlowLab. You need a full content package for their first month, fast.

**Total research cost:** ~$2.50

---

## The principle behind this workflow

Most agencies do the research per deliverable - writing a script, then researching again to write an ad, then researching again for the brief. That's redundant and expensive. One deep research session should power everything.

Run the research once. Extract all the patterns. Then route each deliverable to the right template, all informed by the same data.

---

## Step 1: Set up ongoing niche intelligence

```
"Set up a weekly niche monitor for skincare brands on TikTok, Reels, and Shorts. Keywords: skincare routine, glass skin, skin barrier, moisturizer tips. Minimum 10K views."
```

Vee states the cost: "niche monitor costs $0.50 to create."

Vee runs `create_niche_monitor`:
- Keywords: `["skincare routine", "glass skin", "skin barrier", "moisturizer tips"]`
- Platforms: TikTok, Instagram, YouTube
- Cadence: weekly
- Min views: 10,000

This runs on autopilot every week and accumulates data. Everything you create for GlowLab going forward can be informed by fresh niche data without spending another credit.

---

## Step 2: Run a one-time deep dive for the launch package

```
"Also run a one-time deep search on skincare content from this month"
```

Vee states the cost: "$0.50 for the keyword search."

Vee runs `search_keywords`:
- Same keyword set
- Time period: this_month
- Returns the full dataset with creator outliers and Meta ad results included

---

## Step 3: Look up GlowLab's top 3 competitors

```
"Look up these three competitor accounts: @dermaflux on TikTok, @clearskinstudio on Instagram, @labskincare on TikTok"
```

Vee states the cost: "3 creator lookups at $0.50 each - that's $1.50 total."

Vee runs `batch_lookup_creators` for all three simultaneously:
- Full profiles with follower counts and engagement averages
- Recent video history with per-video performance
- Outlier analysis - which of their videos outperformed their own average, and by how much
- Posting cadence per account

**Total research cost so far: $2.50**

---

## Step 4: Analyze - extract the patterns

```
"Analyze everything. What hooks are working, what formats are winning, when are the top performers posting?"
```

Vee pulls from the completed searches and lookups (all free reads) and synthesizes:

**Hook patterns (from outlier analysis):**
- Before/after hooks dominate - used in 6 of the top 10 outlier videos
- "I was doing X wrong" confession hooks generate strong completion rates
- Tutorial-promise hooks ("Here's exactly how I got glass skin in 30 days") perform above niche median

**Format breakdown:**
- Before/after split-screen: 230% higher engagement than single-frame talking head
- Ingredient breakdown carousels: trending up this month, 3 of the last 7 days' top performers
- Routine walkthroughs: consistent middle-tier performer, reliable for follower retention

**Posting cadence across top competitors:**
- Median: 5-7 posts per week
- Best windows: 7-9am and 6-8pm in the target timezone
- Saturday is the lowest-competition day with above-average engagement rates

This is the brief that informs every deliverable below.

---

## Step 5: Create the full content package

Each request routes to the correct template and applies the niche data above. None of these outputs are generic - every structure comes from what the research found.

**5 TikTok and Reels scripts:**
```
"Create 5 TikTok and Reels scripts for GlowLab based on the hook patterns and formats from the research"
```
Vee loads `content-templates/short-form-video.md` and writes 5 scripts using the before/after and tutorial-promise hooks confirmed by data. Each script specifies the hook type, body structure, and CTA.

**10 LinkedIn posts (founder thought leadership):**
```
"Write 10 LinkedIn posts for GlowLab's founder - thought leadership style, positioning her as an ingredient expert"
```
Vee loads `content-templates/social-posts.md`, LinkedIn section - thought leadership and perspective shift post types. Posts draw on the ingredient breakdown format that's trending in the niche.

**5 Meta ad variations:**
```
"Draft Meta ad copy - 5 variations using the before/after format. Target women 25-40 interested in skincare."
```
Vee loads `content-templates/ads-landing-pages.md`, Before & After ad template. Each variation uses a different pain point drawn from the niche research - the most-mentioned frustrations from comments on competitor videos.

**UGC creator brief:**
```
"Create a UGC creator brief for GlowLab's next 3 influencer partnerships"
```
Vee loads `content-templates/strategy-briefs.md`, UGC brief section. The brief includes:
- Hook direction based on what's converting in the niche
- 3 reference videos pulled from the outlier data (the actual URLs of what's working)
- Format specs with the platform requirements
- Dos and don'ts informed by competitor analysis

**4-week content calendar:**
```
"Build a 4-week content calendar for GlowLab"
```
Vee loads `content-templates/strategy-briefs.md`, content calendar section. Posting schedule is built around the cadence data: 5 posts per week, 7-9am and 6-8pm, Saturday high-priority slot. Topics are drawn from the niche monitor's top-performing themes.

---

## Step 6: Package the client deliverable

```
"Package the competitive analysis into a client-ready report for GlowLab"
```
Vee loads `content-templates/reports-intelligence.md`, social intelligence report format.

**Report includes:**
- Niche overview: 2,300 videos analyzed this month, 180 outliers identified
- Competitor performance breakdown: per-account metrics with comparisons
- Format recommendations: ranked by performance data, not opinion
- The 4-week content calendar
- Virlo-powered attribution note: all data sourced from [virlo.ai](https://virlo.ai/?via=organic)

The report is ready to export as PDF directly from Virlo's export feature, or Vee can format it for a Google Doc or Notion page delivery.

---

## What you hand over

After one research session:
- 5 TikTok/Reels scripts, ready to film
- 10 LinkedIn posts, ready to schedule
- 5 Meta ad variations, ready to test
- 1 UGC brief, ready for outreach
- 1 4-week content calendar with timing and topics
- 1 client-facing competitive intelligence report

All built from the same $2.50 of research. The niche monitor keeps running weekly, so month 2's content package costs $0.50 to refresh - not another full research session.
