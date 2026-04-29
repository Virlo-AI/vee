# Example: Persistent Competitor Monitoring

Set up long-term tracking of competitor accounts and get weekly intelligence that compounds over time.

**Scenario:** You manage social for a SaaS company called DataPulse. You want ongoing visibility into what 5 competitor accounts are posting, what's landing, and where the gaps are that DataPulse can move into.

---

## The difference between one-time and persistent monitoring

A keyword search gives you a snapshot. Competitor tracking gives you a timeline.

Snapshots are useful for pitches and briefs. Timelines tell you when a competitor changes strategy, which topics are trending up vs. fading, and which accounts are on an upward trajectory before they become impossible to unseat.

The longer you track, the more the data compounds. Month 3 patterns are more valuable than month 1 patterns, because you have baseline data to measure change against.

---

## Step 1: Identify the competitors to track

You already know who you're watching. If you don't, run a keyword search first (`search_keywords`) to find who's dominating the SaaS analytics content space, then decide which accounts matter most.

For DataPulse, the five accounts to track:
- @mixpanel on TikTok
- @amplitude_hq on Instagram
- @posthog on YouTube
- @metabaseio on TikTok
- @june_so on TikTok

---

## Step 2: Set up creator tracking

```
"Track all 5 of these competitor accounts. Daily scraping, give me weekly AI reports."
```

Vee runs `track_creator` for each account:
- `scrape_cadence`: daily
- Virlo pulls fresh metrics every 24 hours
- AI-generated performance reports are available on demand at any time

**What tracking collects for each creator:**
- New posts published since the last scrape
- Per-post metrics: views, likes, comments, shares
- Virality Score for each new post
- Follower count changes
- Engagement rate trends

Reads after setup: `get_tracking_report`, `list_creator_posts`, `get_posting_cadence`.

---

## Step 3: Set up a niche monitor for the market

Creator tracking covers specific accounts. A niche monitor covers the whole space - including new entrants you haven't thought to track yet.

```
"Create a weekly niche monitor for SaaS analytics content. Keywords: product analytics, user analytics, analytics platform, data-driven product, SaaS metrics. TikTok and Instagram."
```

Vee runs `create_niche_monitor`:
- Cadence: weekly
- Min views: 5,000 (lower threshold to catch rising content before it peaks)

This runs every week automatically and shows you what's trending at the niche level, regardless of which accounts are driving it.

---

## Step 4: The weekly review

Every week (or whenever you want a briefing):

```
"Give me this week's competitor intelligence digest"
```

Vee pulls from all tracking sources:

1. `get_tracking_report` for all 5 creators - AI-generated summaries of what each posted, what performed, and what's notable
2. `list_creator_posts` for each creator - the actual post list with per-post metrics
3. `get_posting_cadence` for each creator - frequency data showing if anyone changed their posting rate
4. `get_niche_monitor_data` - what the niche monitor surfaced this week beyond the tracked accounts

**Weekly digest structure Vee outputs:**

**Competitor Activity**
- Per-account: posts published, average views this week, top-performing post and its Virality Score
- Anyone who went unusually quiet or suddenly increased frequency

**Outlier Alerts**
- Any video from a tracked competitor that significantly exceeded their own baseline
- Flagged with: the topic, the format, the hook type, and what specifically the Virality Score analysis identified as the driver

**Niche Trends**
- Topics emerging in the broader niche this week that none of your tracked competitors have covered yet
- These are your content gaps to move into before they do

**Content Opportunities**
- 3-5 specific content ideas for DataPulse based on what the data shows working across the niche
- Each idea is tied to a data point, not generated from nothing

---

## Step 5: React when something breaks through

Sometimes a competitor posts something that significantly outperforms their baseline. When that happens, you want to understand it fast.

```
"Mixpanel just posted something that looks like it's outperforming. Analyze it."
```

Vee runs `analyze_video` on the URL:
- Compares this video's performance against Mixpanel's average
- Pulls the Virality Score and explains the components driving it
- Identifies: hook type used, content format, topic angle, posting time
- Generates 3 adaptation ideas for DataPulse accounts

This is the reactive layer. The niche monitor and creator tracking handle the proactive layer (surfacing what's trending before you ask). Video analysis handles the reactive layer (breaking down a specific outlier when it appears).

---

## Step 6: Monthly stakeholder report

```
"Generate a monthly competitive landscape report for our leadership team"
```

Vee loads `content-templates/reports-intelligence.md` and generates a formal report.

**Monthly report covers:**
- 30-day performance trends across all 5 tracked competitors
- Share of voice comparison: who's dominating the niche in views and engagement
- Content strategy shifts: did any competitor change their format mix, posting cadence, or topic focus this month?
- Niche-level trends from the monitor: what themes gained traction and which are fading
- DataPulse's opportunities: specific gaps identified from the data with a recommended action for each

The report is ready to export as PDF directly from Virlo. The tracking data that powers it has been accumulating automatically since Day 1 - no one had to manually collect it.

---

## What compounds over time

Month 1 gives you a baseline. Month 2 shows you trends. Month 3 shows you strategy shifts.

By month 3, you know:
- Which competitor is gaining momentum and why
- Which content formats are rising vs. fading across the niche
- How DataPulse's own content (if you're tracking your own account too) compares to the niche baseline
- Which topics are undersaturated that your competitors haven't moved into yet

That intelligence isn't available any other way. You can't manually track 5 accounts across multiple platforms every day, extract the pattern data, and turn it into a weekly briefing. Vee does it automatically. You just need to know what to do with what he surfaces.
