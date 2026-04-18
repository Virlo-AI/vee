# Virlo API Quick Reference

All Virlo MCP tools available to Vee, organized by use case.

**Authentication:**
- MCP Server URL: `https://dev.virlo.ai/api/mcp/mcp`
- Auth: Bearer token in headers
- API docs: [dev.virlo.ai/docs](https://dev.virlo.ai/docs/?via=organic)
- Balance check: always free

**Cost Summary:**

| Tier | Cost | Tools |
|------|------|-------|
| Free | $0.00 | Balance check, list tracked items, read search results, read niche data, read tracking reports/snapshots |
| Low | $0.05 | Hashtag search, hashtag performance |
| Medium | $0.25 | Trending videos, trend groups, trend digest, creator/video tracking per cycle |
| High | $0.50 | Keyword search, niche monitor creation, creator lookup, video analysis |

**Research Tools:**

`search_keywords` - $0.50
- Search across TikTok, Instagram, YouTube by keyword
- Params: keywords (array, 1-10), time_period (today/this_week/this_month/this_year), platforms, min_views
- Returns: job ID (async - auto-polls for ~55 seconds)
- Get results: `get_keyword_search_results` with orbit_id + data_type (videos/ads/outliers)

`get_trends` - $0.25
- Current trend groups with optional date range
- Params: start_date, end_date (ISO 8601), limit (max 100)

`get_trends_digest` - $0.25
- Today's curated trend digest. No params needed.

`get_trending_videos` - $0.25
- Top viral videos from last 24-48 hours
- Params: platform (optional filter), limit (max 100)

`search_hashtags` - $0.05
- Search trending hashtags across platforms
- Params: start_date, end_date (YYYY-MM-DD, max 90-day range), platform, order_by (count/views), limit

`get_hashtag_performance` - $0.05
- Detailed metrics for a specific hashtag
- Params: hashtag (without #), start_date, end_date

**Monitoring Tools:**

`create_niche_monitor` - $0.50
- Persistent keyword monitoring that runs on schedule
- Params: name, keywords (1-20), platforms, cadence (daily/weekly/monthly), min_views, time_range
- Get data: `get_niche_monitor_data` with comet_id + data_type (overview/videos/ads/outliers)

`list_niche_monitors` - Free
- List all your monitors

`manage_niche_monitor` - Free
- Update or deactivate a monitor

**Creator Intelligence:**

`lookup_creator` - $0.50
- Full profile + analytics for any creator
- Params: platform, username, include (videos/outliers), max_videos

`batch_lookup_creators` - $0.50 each
- Look up multiple creators (up to 25)
- Params: creators array [{platform, username}], include, max_videos

**Video Analysis:**

`analyze_video` - $0.50
- Outlier performance analysis for any video URL
- Params: url, platform

**Tracking:**

`track_creator` - $0.25/cycle
- Params: platform, handle or url, scrape_cadence

`track_video` - $0.25/cycle
- Params: url, platform, scrape_cadence

`list_tracked_items` - Free
- Params: type (creators/videos/both), platform, search

`get_tracking_report` - Free
- Params: type, id, data (details/report/snapshots)

`list_creator_posts` - Free
- Params: creator_id, sort, limit, start_date, end_date

`get_posting_cadence` - Free
- Params: creator_id

`collect_creator_posts` - $0.50-$2.00
- On-demand deep collection. Depth: standard ($0.50, 50 videos), deep ($1.00, 200), full ($2.00, 500)

**Utility:**

`get_credit_balance` - Free
- Check your current balance

`check_job_status` - Free
- Check async job status. Types: orbit, satellite_creator, satellite_video, satellite_batch, post_collection
