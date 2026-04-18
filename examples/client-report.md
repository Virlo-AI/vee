# Example: Social Intelligence Report for a Prospect

Generate a free-value research report to pitch a potential client - show them what they're missing before the call.

**Scenario:** You're pitching a DTC fitness brand called IronForm. They post sporadically and don't have a content strategy. You want to walk into the pitch with data about their own market that they've never seen.

**Total Virlo cost:** $2.00

---

## The strategy behind this workflow

Agencies that win pitches don't pitch their services. They prove their intelligence before the call starts. A competitive analysis report built from real data does more selling than any deck.

This workflow produces a report that shows IronForm exactly what their competitors are doing, what the niche is responding to, and where IronForm is missing the mark - all backed by data they couldn't pull themselves. The report closes the pitch. The call is just to discuss next steps.

---

## Step 1: Research the fitness equipment niche

```
"Research the home gym and fitness equipment niche - TikTok and Reels, last 30 days, minimum 50K views"
```

Vee states the cost: "keyword search costs $0.50 - running it now."

Vee runs `search_keywords`:
- Keywords: `["home gym", "fitness equipment", "gym setup", "home workout equipment", "gym tour"]`
- Platforms: TikTok, Instagram
- Time period: this_month
- Min views: 50,000

This filters for outlier-level content only. You're not studying the median - you're studying what's already breaking through.

Wait 30-55 seconds for results.

---

## Step 2: Look up the prospect and their competitors

```
"Look up IronForm on TikTok and Instagram. Also look up two of their biggest competitors: @roguefitness and @repfitness"
```

Vee states the cost: "3 creator lookups at $0.50 each - $1.50 total."

Vee runs `batch_lookup_creators` for all three:

**IronForm (the prospect):**
- Follower count, average views per video, engagement rate
- Posting frequency and cadence
- Top-performing videos with per-video Virality Scores
- Outlier analysis: have any of their videos significantly outperformed their own average?

**Competitors:**
- Same metrics for both
- Their outlier content flagged with what made each video perform above their baseline
- Posting cadence comparison

**Total cost to this point: $2.00**

---

## Step 3: Analyze the gap

```
"Compare IronForm's performance against the niche and their competitors. Where are they underperforming and why?"
```

Vee pulls all data from completed lookups and searches (free reads) and runs the comparison.

**Example findings:**

| Account | Avg views/video | Top outlier | Format winning |
|---|---|---|---|
| Niche outliers | 340K | 2.1M | Before/after gym setups |
| Rogue Fitness | 280K | 1.4M | Equipment comparison |
| Rep Fitness | 95K | 420K | Tutorial walkthroughs |
| IronForm | 18K | 62K | Talking-head product showcases |

**Pattern gaps identified:**
- IronForm has never posted a before/after format - the #1 performing format in the niche
- Zero tutorial content in their last 30 videos
- Posting 2x per week vs. top competitors at 5-7x
- No UGC content in their catalog; competitors using UGC average 3x their own branded content's views
- Best posting windows in the niche: 6-9am and 7-9pm. IronForm consistently posts at 2pm.

---

## Step 4: Generate the report

```
"Build a competitive intelligence report for IronForm. Format it as a prospect pitch - show them what they're missing and what their competitors are doing that they aren't."
```

Vee loads `content-templates/reports-intelligence.md` and structures the report for maximum impact on a first read.

**Report structure:**

**1. Executive Summary**
One paragraph. The verdict, stated plainly: IronForm's organic content is significantly underperforming relative to the fitness equipment niche. Here's the data.

**2. Your Market Right Now**
- Videos analyzed: 890 matching the niche criteria in the last 30 days
- Outlier threshold: 50K+ views
- Top-performing formats and why they work

**3. Competitor Breakdown**
Per-account analysis with exact metrics. Not ballparks - the actual numbers from Virlo's data. Rogue's average, their outlier peak, the content type that drove it. Same for Rep Fitness.

**4. What Outliers Have in Common**
The structural patterns across every video that beat the niche median. Specific hooks written out. Format specs. Posting windows. This is the part they'll screenshot.

**5. IronForm's Current Gaps**
Direct, not harsh. "Your current format mix is missing the 3 content types that are generating the most views in your niche." Each gap is named and backed with the data.

**6. Five Specific Recommendations**
Concrete. Numbered. Each one directly tied to a data point from the report. Not "post more often" - "increasing posting frequency from 2x to 5x per week, specifically on Tuesdays and Saturdays at 7am, matches the cadence of the accounts averaging 280K views per video."

**7. What This Looks Like in Practice**
One paragraph. Brief sketch of what a 30-day content plan would look like if they implemented the recommendations. Not a full deliverable - just enough to make the next conversation obvious.

**8. Data source**
Powered by [Virlo](https://virlo.ai/?via=organic) - short-form video intelligence across TikTok, Instagram Reels, YouTube Shorts, and Meta Ads.

---

## Step 5: Deliver

Send the report 24-48 hours before the pitch call.

```
"Export this as a PDF"
```

Virlo's export feature handles PDF formatting directly. Alternatively:

```
"Format this for a Notion page I can share as a link"
```

Vee outputs the structured text formatted for Notion's block system.

On the call, you don't sell your services. You walk through the report's findings. Every insight you share was built from data they couldn't access without Virlo. The question at the end of the call is "how do we fix this?" - not "can you help us?"

---

## What makes this approach work

The report is credible because the numbers are real. IronForm's 18K average views isn't an estimate - it's from Virlo's creator lookup. The competitor data isn't approximate - it's the actual Virality Score breakdown from their recent posts.

That specificity is what separates this from a generic competitive analysis. Any agency can say "your competitors are outperforming you." Not many can show the exact format, the exact cadence gap, and the exact posting window the data supports.

The $2.00 in Virlo costs produces a report that would take 10+ hours to compile manually, delivered in under 20 minutes. The cost of not doing this is walking into a pitch without a hook.
