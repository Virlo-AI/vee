# Example: Full Slideshow Campaign

End-to-end walkthrough - research, generate slides, add overlays, post, track, and optimize.

**Scenario:** You run a supplement brand called NovaPeak and want to create a TikTok and Instagram slideshow about protein timing myths.

**Time required:** 20-30 minutes to run through. 7 days of passive tracking after.

---

## Step 1: Research what's already working

```
"Hey Vee, research trending supplement content on TikTok and Reels from the last 7 days"
```

Vee runs `search_keywords`:
- Keywords: `["supplements", "protein", "fitness nutrition", "protein powder"]`
- Platforms: TikTok, Instagram
- Time period: this_week

Wait 30-55 seconds for the job to complete.

**What you get back:**
- Top-performing videos in the supplement niche, sorted by views
- Creator outliers - accounts whose videos massively outperformed their average
- Virality Scores for each result
- Hook patterns extracted from top performers

---

## Step 2: Analyze the results

```
"What hooks and formats are the outliers using?"
```

Vee runs `get_keyword_search_results` to pull the outlier analysis from the completed search.

**Example findings:**
- Slideshow carousels are outperforming talking-head videos 3:1 in this niche this week
- Top hook types: bold claim hooks ("stop doing this with your protein") and shock stat hooks ("85% of people are taking this wrong")
- Outlier videos average 850K views vs. the niche median of 40K
- The highest Virality Score in the results: a 6-slide carousel about supplement stacking myths

This is your brief. The slideshow format is confirmed by data, not guesswork.

---

## Step 3: Choose your angle

The outlier data points to protein timing myths as a high-performing topic. Carousels work. Bold claim hooks are dominating. Vee applies these findings from `content-templates/short-form-video.md` to structure the approach.

```
"Create a 6-slide carousel about protein timing myths. Use the bold claim hook style from the outlier data."
```

**Slide breakdown Vee builds:**

| Slide | Text | Image direction |
|---|---|---|
| 1 | "you're wasting your protein powder" | Dark gym, dramatic lighting, person mid-rep |
| 2 | "85% of people take protein at the wrong time" | Person looking at supplement shelf, confused expression |
| 3 | "the 30-minute anabolic window is a myth" | Clock visual, bold typography |
| 4 | "research shows: total daily intake matters more than timing" | Clean data visualization, chart style |
| 5 | "3 things that actually move the needle" | Clean numbered list, high contrast |
| 6 | "follow for evidence-based fitness" | Brand colors, strong CTA frame |

---

## Step 4: Generate the slides

Vee runs the image generation script:

```bash
node scripts/generate-slides.js \
  --prompt "dark moody fitness aesthetic, cinematic lighting, supplement photography" \
  --count 6 \
  --output-dir ./output/novapeak-protein-timing
```

This generates 6 base images using your configured image generation provider (DALL-E 3, Flux, Stability AI, or Gemini - set during `node scripts/setup.js`). The script outputs to a `slides/` subfolder under the path you pass.

Then applies text overlays. The overlay script accepts a batch JSON file (one entry per slide) describing which file gets which text:

```bash
node scripts/add-text-overlay.js \
  --batch ./output/novapeak-protein-timing/overlay-config.json \
  --outputDir ./output/novapeak-protein-timing/final
```

Output: 6 finished slide images in `./output/novapeak-protein-timing/final/`, sized to whatever the source images came in at. (Note: the generator returns 1024x1024 from OpenAI/Stability/Replicate. If you need true platform dimensions like 1080x1350 for Instagram or 1080x1920 for TikTok, run them through a resize step or pass an `--aspect-ratio` flag once that's added to the generator.)

---

## Step 5: Post it

```
"Post this slideshow to TikTok and Instagram right now"
```

Vee runs (after uploading the 6 final images to a public host - S3, R2, Cloudflare Images, etc.):

```bash
node scripts/post-content.js \
  --media-urls "https://cdn.example.com/protein-1.jpg,https://cdn.example.com/protein-2.jpg,https://cdn.example.com/protein-3.jpg,https://cdn.example.com/protein-4.jpg,https://cdn.example.com/protein-5.jpg,https://cdn.example.com/protein-6.jpg" \
  --platforms tiktok,instagram \
  --caption "you're wasting your protein powder. here's what actually matters 👇" \
  --now
```

PostForMe requires public URLs for media (no base64 or local files). If you set `defaults.media_host_base_url` in `vee-config.json`, you can also pass `--media ./output/novapeak-protein-timing/final` and Vee will build URLs from the filenames.

Both posts go live via PostForMe. Vee confirms with the post URLs once live.

**Scheduling instead:** If you want to post at the optimal time based on niche data:

```
"Schedule this for the best time in my niche"
```

Vee runs `get_posting_cadence` for tracked creators in the supplement niche, identifies the highest-performing windows, and passes `--optimal` to the post script. `--optimal` requires exactly one platform per call - run it twice if you want different optimal times for TikTok and Instagram.

---

## Step 6: Set up tracking

```
"Track both videos for 7 days"
```

Vee runs `track_video` for both the TikTok and Instagram post URLs:
- Scrape cadence: daily
- This pulls fresh metrics every 24 hours and runs an AI performance report at the end of the tracking period

---

## Step 7: Optimize (7 days later)

```
"How did the slideshow perform? What should I try differently?"
```

Vee runs `get_tracking_report` for both videos and compares against niche benchmarks from your active niche monitor.

**Example output:**
- TikTok: 120K views (above niche median of 40K - performing well)
- Instagram: 45K views (at niche median)
- The hook performed - slide 1 to slide 2 retention was strong
- Drop-off spike at slide 5 - the "3 things" list may have been too dense
- Recommendation: next version, one takeaway per slide instead of a list slide

Vee generates 3 new hook variations informed by what worked, ready to feed into the next campaign.

---

## What this workflow proves

The slideshow wasn't invented. It was built from data: the format was confirmed by outlier analysis, the hook type was the most common pattern in the top performers, the topic came from the niche's highest Virality Score content that week.

When the next campaign starts, Vee doesn't start from scratch - he starts from what the last campaign taught him.
