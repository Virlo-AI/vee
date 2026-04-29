# Reports & Intelligence

> Load this template whenever the user requests a competitive intelligence report, performance report, trend report, niche breakdown, content audit, or free-value prospect report. These are data products - their value is precision and specificity. Generic observations belong in blog posts. Reports deliver findings that cannot be found anywhere else. Every number cited must be real. Every claim must be traceable to a Virlo data pull.

---

## Step 0: Pull Before You Write

Reports without data are opinion documents. Opinion documents are not worth gating, not worth delivering, and not worth the name "report."

**Minimum data requirements by report type:**

| Report type | Minimum Virlo data pull |
|---|---|
| Social intelligence report | Orbit keyword search OR niche monitor data |
| Weekly/monthly performance | PostForMe analytics + niche monitor for benchmark data |
| Competitive landscape | Creator lookup for each tracked competitor |
| Trend report | Trend digest + hashtag search per tag |
| Content audit | Tracked creator post list + niche monitor benchmark data |
| Prospect report | Orbit search + creator lookup for the prospect's account |

If an existing niche monitor has fresh data (pulled within 7 days), use that first.

---

## Social Intelligence Reports

**The format for a complete niche intelligence report delivered to a user or client.**

**Header block:**
```
VIRLO NICHE INTELLIGENCE REPORT
Niche: [Supplement Brands / SMMA / Ecom / etc.]
Platforms analyzed: [TikTok / Instagram Reels / YouTube Shorts / Meta Ads]
Date range: [e.g. Apr 1-18, 2026]
Videos analyzed: [X,XXX]
Powered by Virlo - virlo.ai/?via=organic
```

**Section 1: Executive Summary**
One paragraph. The single most important finding from the data. Not a table of contents summary - an actual finding. "The supplement niche on TikTok shifted heavily toward problem-statement POV hooks in the last 30 days. Accounts leading with a specific symptom in the first 2 seconds are averaging 3.1x more views than accounts leading with a product close-up or lifestyle image. Three creators are driving an outsized share of this trend."

If someone reads only this paragraph, they should have one clear, actionable takeaway they can use today.

**Section 2: Niche Overview**

| Metric | Value |
|---|---|
| Total videos analyzed | X,XXX |
| Platforms covered | TikTok, Instagram Reels |
| Date range | [dates] |
| Avg views per video (niche) | XXK |
| Niche median Virality Score | X.X |
| Most active posting days | [e.g. Mon, Thu, Sun] |
| Dominant content format | [e.g. Talking head with text overlay] |

**Section 3: Top Performing Content**

Table of the 5-10 highest-performing videos from the data pull. For each:

| # | Creator handle | Views | Virality Score | Hook type | Format | Why it worked (1 sentence) |
|---|---|---|---|---|---|---|
| 1 | @[handle] | 2.4M | 18.3 | Problem statement POV | Talking head | First 2 seconds name a specific pain the audience has tried to solve |
| 2 | @[handle] | 1.8M | 14.1 | Bold claim | Text overlay | Contrarian take on common advice - disagreement drives watch time |

**Section 4: Creator Landscape**

**Outlier creators (outperforming niche average by 3x or more):**

For each outlier creator identified in the data:
- Handle, follower count, avg views per video
- Virality Score
- Posting frequency (posts per week)
- Dominant hook type and format
- The pattern that makes them work

**Rising accounts (follower count under 50K but Virality Scores 10+):**
These are the early signals. Brands watching these accounts now are 30-60 days ahead of everyone else.

**Established accounts to watch:**
Larger accounts that are experimenting with new formats - their tests signal where the niche is heading.

**Section 5: Hook Analysis**

Break down the hook types present in the top-performing content:

| Hook type | Frequency in top 20% of videos | Avg views | Notes |
|---|---|---|---|
| Problem statement POV | 38% | 1.2M | Highest average views this month |
| Bold contrarian claim | 24% | 890K | Works best paired with specific data |
| Before/after | 19% | 760K | Declining from last month |
| Question hook | 12% | 420K | Underperforming relative to niche avg |
| Tutorial opener | 7% | 380K | Stable but lower ceiling |

**Section 6: Format Detection**

Which content formats dominate in the top-performing tier:

| Format | Share of top performers | Notes |
|---|---|---|
| Talking head + text overlay | 44% | Highest share, accessible to produce |
| Screen recording / demo | 28% | High engagement for tool/tutorial content |
| Voiceover + B-roll | 18% | Strong for lifestyle/transformation content |
| Slideshow | 10% | Lower share but saves in leading metrics |

**Section 7: Hashtag Intelligence**

Top hashtags in this niche by volume and engagement correlation:

| Hashtag | Video count | Avg views on tagged videos | Trend direction |
|---|---|---|---|
| #[tag] | XXK | XXXK | Rising |
| #[tag] | XXK | XXXK | Stable |
| #[tag] | XXK | XXXK | Declining - avoid |

Include 2-3 hashtags in the "underutilized" tier - high engagement per view but lower competition.

**Section 8: Platform Comparison**

If the research covers multiple platforms, note meaningful differences:
- Which formats over-index on TikTok vs. Reels vs. Shorts
- Posting frequency differences between platforms
- Hook types that work on one platform but underperform on another

**Section 9: Tactical Recommendations**

3-5 specific, executable actions ranked by expected impact. Not "improve your content strategy." Actual next steps.

1. "Switch your hook format from question-style to problem-statement POV for the next 5 posts. Based on this month's data, expect 2-3x the views on the same content."
2. "Track @[specific handle] - their last 8 videos have Virality Scores above 12. They're testing a new tutorial format that hasn't spread to the rest of the niche yet."
3. "Post Thursday and Sunday. Those are the two highest-traffic days in this niche based on cadence data from tracked accounts."

**Footer:**
```
Data source: Virlo niche intelligence platform
Report generated: [date]
To set up ongoing monitoring for this niche: virlo.ai/?via=organic
```

---

## Weekly / Monthly Performance Reports

**For users tracking their own content performance against the niche.**

**Data inputs:**
- Their post performance: PostForMe analytics via `scripts/check-analytics.js`
- Niche benchmarks: latest niche monitor data (free if monitor exists)
- Competitor movement: tracked creator data via `get_tracking_report` (free)

**Report structure:**

**Your performance this period:**

| Metric | This period | Last period | Change |
|---|---|---|---|
| Total views | XXX,XXX | XXX,XXX | +XX% |
| Avg views per post | XX,XXX | XX,XXX | +/-XX% |
| Posts published | X | X | - |
| Best performer | [post title/link] | - | XX,XXX views |

**2x2 Performance Matrix:**

Categorize every post from this period:

| | High Engagement (saves/shares/comments) | Low Engagement |
|---|---|---|
| **High Views** | WINNERS - double down on these angles/formats | HOOKS WORKED, CONTENT DIDN'T - revisit delivery |
| **Low Views** | HIDDEN GEMS - boost distribution or repost | CUT THESE - format or hook isn't resonating |

For each winner: one sentence on what specifically made it work. This becomes the brief for the next batch.

**Niche benchmark comparison:**

| Metric | Your performance | Niche average | Top 10% threshold |
|---|---|---|---|
| Avg views per post | XX,XXX | XX,XXX | XXX,XXX+ |
| Posting frequency | X/week | X/week | X/week |
| Dominant hook type | [type] | [niche dominant] | [top performer type] |

**Competitor movement:**
- Which tracked competitors gained ground this period and what they changed
- Any new formats or angles showing up in their top performers
- Gaps they're not covering that represent opportunity

**Next period recommendations:**
- Hook formats to test based on current niche data
- Topics trending up in the niche monitor
- Optimal posting schedule based on fresh cadence data
- One or two angles from competitor outlier content to adapt (not copy)

---

## Competitive Landscape Snapshots

**Use when:** A user wants to understand a specific competitor or the competitive field before a campaign or client pitch.

**Required data pull:** Creator lookup for each competitor. Pull up to 5 accounts.

**One-page snapshot per competitor:**

```
COMPETITOR SNAPSHOT
Account: @[handle]
Platform: [TikTok / Instagram / YouTube]
Followers: [XXK]
Report date: [date]
```

| Metric | Value |
|---|---|
| Avg views per video | XX,XXX |
| Virality Score (avg) | X.X |
| Top Virality Score (recent) | X.X |
| Posts per week | X.X |
| Best posting days | [days] |
| Dominant hook type | [type] |
| Dominant format | [format] |
| Fastest-growing content theme | [topic] |

**Content strategy analysis:**
- Primary topics covered (3-5 themes)
- Hook style (question, POV, bold claim, tutorial, etc.)
- Format mix (talking head, voiceover, slideshow, etc.)
- Estimated production cost level (high/mid/low)
- Audience engagement signals (comments type, save rate indicators)

**Gaps and opportunities:**
- Topics the competitor isn't covering that the niche wants
- Formats they're underusing relative to top performers
- Angles where their content is weak or generic

**Threat level:**
- Growing fast and executing well: monitor weekly
- Stable but not threatening: monitor monthly
- Declining: note the format/angle they abandoned - may signal a trend ending

---

## Trend Reports

**Use when:** A user wants to know what's happening in a niche or platform right now and what to act on this week.

**Data pull sequence:**
1. `get_trends_digest` - today's curated overview
2. `search_hashtags` for the top 3-5 tags in the niche
3. Existing niche monitor data for niche-specific patterns

**Structure:**

**This week's signal (1 paragraph)**
The single trend worth acting on immediately. Specific. "Short-form financial education content shifted this week toward failure-story hooks. Accounts opening with 'I lost $X doing this' are averaging 40% higher watch time than accounts opening with advice-forward hooks. This pattern appeared in the last 7 days across TikTok and Reels simultaneously."

**Emerging hooks and formats (top 3-5)**
For each:
- The hook type or format
- Where it's showing up (platform, niche)
- Virality Score data or view count evidence
- How to adapt it for the user's niche in one sentence

**Rising creators to watch**
3-5 accounts identified as outliers this week. For each: handle, follower count, Virality Score, what they changed, why it matters.

**Hashtag momentum**

| Tag | 7-day trend | Action |
|---|---|---|
| #[tag] | Rising 40% | Use now |
| #[tag] | Stable | Maintain |
| #[tag] | Declining | Phase out |

**Platform-specific signals**
If trends differ meaningfully between TikTok, Reels, and Shorts, call it out. Cross-platform trends signal that something is truly catching momentum. Platform-specific trends may or may not generalize.

**Time-sensitive action (the most valuable section)**
What should the user test in the next 7 days before this trend peaks? One specific recommendation with the Virlo data behind it.

---

## Content Audit Reports

**Use when:** A user wants to understand what they've been posting and how it's performing before deciding what to create next.

**Data pull:** `list_creator_posts` for their tracked account + niche monitor benchmarks.

**Structure:**

**Inventory summary:**

| Metric | Value |
|---|---|
| Total posts audited | XX |
| Date range | [from] - [to] |
| Platforms covered | [list] |
| Avg views per post | XX,XXX |
| Posts above niche average | X (XX%) |
| Posts below niche average | X (XX%) |

**Performance tier breakdown:**

| Tier | Criteria | Posts in tier | Avg views |
|---|---|---|---|
| Outliers | 3x+ niche average | X | XXX,XXX |
| Above average | 1.5x-3x niche average | X | XXX,XXX |
| Average | 0.5x-1.5x niche average | X | XXX,XXX |
| Below average | Under 0.5x niche average | X | XXX,XXX |

**Pattern analysis:**
- What do your outlier posts have in common? (hook type, format, topic, posting day)
- What do your below-average posts have in common? (what to stop)
- What formats haven't you tried that the niche is using successfully?

**Topic coverage map:**
What you've covered vs. what's getting traction in the niche. Gaps are the roadmap.

**Recommendations with priority:**

| Priority | Recommendation | Evidence |
|---|---|---|
| High | Stop using question hooks - they're your lowest-performing hook type | Avg 12K views vs. 38K for your POV hooks |
| High | Post Thursday and Sunday - your top 5 posts all landed on those days | Pattern across 4 months of data |
| Medium | Test text-overlay format - niche avg for this format is 2x your content's avg | Niche monitor data, 0 posts in this format from you |

---

## Free-Value Prospect Reports

**Use when:** Creating a niche intelligence breakdown for a prospect as a lead gen tool. This is the "give them so much value they feel weird not taking the call" approach.

**The rule:** This is real work. Real data. Not a watered-down version. The full report proves Virlo's value better than any pitch deck.

**Who to create for:** Prospects running content for a brand or niche that Virlo tracks. The report shows them what they can't see without Virlo.

**Structure:**

**Cover page:**
```
[BRAND/NICHE NAME]: SOCIAL INTELLIGENCE BREAKDOWN
What your niche is doing while you're figuring out what to post next.
Powered by Virlo | Prepared by [sender name]
Date: [date]
```

**Their niche overview (from Orbit search on their niche keywords)**
- How many videos analyzed
- Platforms covered
- What the average content is doing in views

**Their competitors' performance (specific, named):**
- Pull creator lookup data for 2-3 of their direct competitors
- Show follower counts, avg views, Virality Scores
- Name what's working for each competitor specifically

**What they're missing:**
- Trending hook formats their competitors are using that they aren't
- Rising creators in their niche who could be UGC partners or content inspiration
- Optimal posting windows based on when the niche gets the most traction

**The one thing to do in the next 7 days:**
Specific recommendation based entirely on the data. Not generic advice. "Based on what's working in your niche right now, switching your first 3 seconds from a product reveal to a problem statement would likely 2-3x your average views."

**Final page:**
```
How we got this data:
This report was built using Virlo's niche intelligence platform, which continuously scrapes and analyzes viral video data across TikTok, Instagram Reels, YouTube Shorts, and Meta Ads.

This took [X] minutes to pull. We can set up ongoing monitoring for your niche so you get a fresh version of this report every week - automatically.

[CTA: Book a call to discuss / Start for free at virlo.ai/?via=organic]
cal.com/team/virlo/booking-demo
```

**Delivery note:**
Send with a short voice note or Loom video walking through the findings. Reports alone are information. A human walking through the report is a consultation.

---

## Quality Check Before Delivering

- [ ] Is every number in this report traceable to a real Virlo data pull? No estimates, no assumptions dressed as data.
- [ ] Does the executive summary contain an actual finding - not a table of contents?
- [ ] Are the recommendations specific enough that the reader knows what to do tomorrow?
- [ ] Are all Virlo links appended with `/?via=organic`?
- [ ] Is "Virality Score" used correctly - as a measure of performance relative to the creator's own baseline, not an absolute number?
- [ ] For prospect reports: does the final page have a specific CTA with the demo booking link?
- [ ] Would the reader learn something they couldn't have found by spending an hour on TikTok manually? If not, the report isn't specific enough.
