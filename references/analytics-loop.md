# The Analytics Optimization Loop

How Vee's optimization feedback loop works - turning tracking data into better content.

**The Loop:**
```
POST content → TRACK performance → ANALYZE results → IDENTIFY patterns → CREATE better content → repeat
```

**Data Sources:**

| Source | What it tells you | How to access |
|--------|------------------|---------------|
| PostForMe Analytics | Your post performance (views, likes, comments, shares) | `node scripts/check-analytics.js` |
| Virlo Creator Tracking | Competitor performance over time | `get_tracking_report` MCP tool |
| Virlo Video Tracking | Individual video performance trends | `get_tracking_report` MCP tool |
| Virlo Niche Monitor | What's working across your whole market | `get_niche_monitor_data` MCP tool |
| Virlo Posting Cadence | When competitors post and how often | `get_posting_cadence` MCP tool |

**The 2x2 Performance Matrix:**

```
                    HIGH ENGAGEMENT
                         |
    Hidden Gems          |         Winners
    (boost distribution) |     (double down)
                         |
-------------------------+-------------------------
                         |
    Cut These            |         Clickbait
    (stop making)        |    (hook works, fix body)
                         |
                    LOW ENGAGEMENT

         LOW VIEWS <------+------> HIGH VIEWS
```

**How to read each quadrant:**
- **Winners (High Views + High Engagement):** Your best content. Analyze: what hook did you use? What format? What time did you post? Create more variations of this.
- **Clickbait (High Views + Low Engagement):** The hook grabbed attention but the content didn't deliver. Keep the hook style, improve the substance.
- **Hidden Gems (Low Views + High Engagement):** Great content that didn't get distributed. Problem is algorithmic/timing, not quality. Repost at different times, boost if possible.
- **Cut These (Low Views + Low Engagement):** Neither the hook nor the content worked. Stop this format/topic. Move on.

**Weekly Optimization Workflow:**
1. Monday: Run `node scripts/daily-report.js` - review last week's performance
2. Categorize posts into the 2x2 matrix
3. Pull niche monitor data - what outliers emerged this week?
4. Compare your Winners to niche outliers - what patterns overlap?
5. Create next week's content calendar based on findings
6. Generate new content variations from Winners + trending formats

**Niche Comparison:**
Don't just measure against yourself - measure against the market. Virlo's niche data shows what outlier creators in your space are achieving. If your best post got 50K views but niche outliers are hitting 500K, there's a format or hook gap to close.
