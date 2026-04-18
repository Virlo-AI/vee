# Slideshow Structure Guide

How to create effective slideshow content (TikTok carousels, Instagram carousels, etc.)

**The 6-Slide Formula:**

| Slide | Purpose | What goes on it | Image prompt guidance |
|-------|---------|-----------------|----------------------|
| 1 | Hook | Bold, provocative statement or question that stops the scroll. Large text, high contrast. | Dark/moody background, minimal elements, space for text overlay |
| 2 | Problem | Specific pain point the audience feels daily. Make it visceral. | Visual metaphor for frustration/pain - tangled wires, person overwhelmed, cluttered desk |
| 3 | Insight | The "aha" - new perspective or mechanism. This is the value. | Clean, bright, clarity-themed - lightbulb moment, clear path, organized workspace |
| 4 | Proof | Data point, testimonial, or screenshot that backs the insight. | Charts, dashboards, before/after, social proof screenshots |
| 5 | Action | Step-by-step or how-to. Make it immediately actionable. | Tutorial-style, numbered steps, clean layout |
| 6 | CTA | What to do next. Follow, save, share, link in bio. | Brand-colored, bold CTA text, arrow pointing to action |

**Text Overlay Best Practices:**
- Maximum 10-12 words per slide
- Font size: minimum 5% of image width
- White text with black outline for readability on any background
- Position: top third or center for most platforms
- Leave margin from edges (at least 10% padding)
- One idea per slide - if you need more words, you need more slides

**Image Generation Tips:**
- Consistent style across all 6 slides (same provider, same style prompt suffix)
- Aspect ratio: 1080x1350 for Instagram/TikTok carousels, 1080x1920 for Stories/Reels
- Add style modifiers: "cinematic lighting, professional photography, editorial style"
- Avoid: text in AI-generated images (add text with overlay script instead)
- For brand consistency: include color palette in every prompt

**Slideshow Workflow:**
1. Research trending hooks in your niche via Virlo
2. Write 6 text overlays following the formula
3. Generate 6 images: `node scripts/generate-slides.js --prompt "[style]" --count 6`
4. Add text overlays: `node scripts/add-text-overlay.js --batch overlay-config.json`
5. Post via PostForMe: `node scripts/post-content.js --media ./output/slides-final/ --platforms tiktok,instagram`
