# PostForMe API Quick Reference

PostForMe handles multi-platform posting, scheduling, and analytics for Vee.

**Base URL:** `https://api.postforme.dev`
**Auth:** Bearer token in Authorization header
**Developer portal:** [www.postforme.dev/developers](https://www.postforme.dev/developers) (sign up + dashboard)
**API reference:** [api.postforme.dev/docs](https://api.postforme.dev/docs) (Scalar interactive docs)

**Supported Platforms (9):**
TikTok, Instagram, Facebook, X (Twitter), LinkedIn, YouTube, Threads, Pinterest, Bluesky

**Pricing:**
- Starter: $10/month (up to 1,000 posts)
- Growth: $1,000/month (up to 200,000 posts)

**Core Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/social-posts` | Create and publish a post |
| GET | `/social-posts` | List recent posts |
| GET | `/social-posts/:id` | Get post details + analytics |

**Post Request Format:**
```json
{
  "caption": "your post caption here",
  "social_accounts": ["sa_1234abc", "sa_5678def"],
  "media": [
    {
      "url": "https://example.com/image.jpg"
    }
  ]
}
```

`social_accounts` takes account ID strings (format `sa_<id>`), NOT platform names. Find your IDs in the PostForMe dashboard under Connected Accounts. Vee resolves platform names to IDs from `config.postforme.social_accounts` so you can pass `--platforms tiktok,instagram` and Vee handles the mapping.

`media` requires public URLs - PostForMe does not accept base64 or local files. Pre-upload to S3, R2, Cloudflare Images, or any host that serves public URLs, then pass the URL.

**Scheduling:**
Add `scheduled_at` field with ISO 8601 datetime:
```json
{
  "caption": "scheduled post",
  "social_accounts": ["..."],
  "scheduled_at": "2026-04-20T10:00:00Z"
}
```

**Draft Mode:**
Set `status: "draft"` to save without publishing.

**Webhooks:**
PostForMe supports webhooks for real-time notifications on:
- Account connections
- Post status changes (published, failed, etc.)

**Analytics Response:**
Each post response includes per-platform metrics:
- Views / Impressions
- Likes / Reactions
- Comments
- Shares / Retweets / Reposts
- Engagement rate

**SDKs Available:**
- JavaScript/TypeScript
- Python
- Ruby
- Go
- Kotlin

**Vee Scripts That Use PostForMe:**
- `scripts/post-content.js` - Create and publish posts
- `scripts/check-analytics.js` - Pull per-post metrics
- `scripts/daily-report.js` - Analytics in morning diagnostic
