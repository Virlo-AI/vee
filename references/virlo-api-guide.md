# Virlo API Quick Reference

All Virlo MCP tools available to Vee, organized by use case.

**Authentication:**
- MCP Server URL: `https://dev.virlo.ai/api/mcp/mcp`
- Auth: Bearer token in headers
- API docs: [dev.virlo.ai/docs](https://dev.virlo.ai/docs/?via=organic)

**Research Tools:**

`search_keywords`
- Search across TikTok, Instagram, YouTube by keyword
- Params: keywords (array, 1-10), time_period (today/this_week/this_month/this_year), platforms, min_views
- Returns: job ID (async - auto-polls for ~55 seconds)
- Get results: `get_keyword_search_results` with orbit_id + data_type (videos/ads/outliers)

`get_trends`
- Current trend groups with optional date range
- Params: start_date, end_date (ISO 8601), limit (max 100)

`get_trends_digest`
- Today's curated trend digest. No params needed.

`get_trending_videos`
- Top viral videos from last 24-48 hours
- Params: platform (optional filter), limit (max 100)

`search_hashtags`
- Search trending hashtags across platforms
- Params: start_date, end_date (YYYY-MM-DD, max 90-day range), platform, order_by (count/views), limit

`get_hashtag_performance`
- Detailed metrics for a specific hashtag
- Params: hashtag (without #), start_date, end_date

**Monitoring Tools:**

`create_niche_monitor`
- Persistent keyword monitoring that runs on schedule
- Params: name, keywords (1-20), platforms, cadence (daily/weekly/monthly), min_views, time_range
- Get data: `get_niche_monitor_data` with comet_id + data_type (overview/videos/ads/outliers)

`list_niche_monitors`
- List all your monitors

`manage_niche_monitor`
- Update or deactivate a monitor

**Creator Intelligence:**

`lookup_creator`
- Full profile + analytics for any creator
- Params: platform, username, include (videos/outliers), max_videos

`batch_lookup_creators`
- Look up multiple creators (up to 25)
- Params: creators array [{platform, username}], include, max_videos

**Video Analysis:**

`analyze_video`
- Outlier performance analysis for any video URL
- Params: url, platform

**Tracking:**

`track_creator`
- Params: platform, handle or url, scrape_cadence

`track_video`
- Params: url, platform, scrape_cadence

`list_tracked_items`
- Params: type (creators/videos/both), platform, search

`get_tracking_report`
- Params: type, id, data (details/report/snapshots)

`list_creator_posts`
- Params: creator_id, sort, limit, start_date, end_date

`get_posting_cadence`
- Params: creator_id

`collect_creator_posts`
- On-demand deep collection. Depth: standard (50 videos), deep (200), full (500)

**Sound Intelligence:**

`search_sounds`
- Search TikTok/Reels sounds by keyword
- Params: query, platform, limit
- Returns: sound metadata, usage counts, top videos

`get_trending_sounds`
- Currently trending sounds across short-form platforms
- Params: platform (optional filter), limit, time_period

`get_creator_sounds`
- All sounds a specific creator has used
- Params: creator_id or username + platform, limit

`get_sound_details`
- Full metadata for one sound
- Params: sound_id, platform
- Returns: title, author, duration, total video count, engagement summary

`get_sound_usage_history`
- Time-series adoption data for a sound (rising / peaking / declining)
- Params: sound_id, platform, start_date, end_date

`get_sound_videos`
- Top videos using a specific sound, ranked by performance
- Params: sound_id, platform, limit, sort

**Utility:**

`get_credit_balance`
- Check your current balance

`check_job_status`
- Check async job status. Types: orbit, satellite_creator, satellite_video, satellite_batch, post_collection
