# CODEX MASTER PROMPT — HAIR BY NAPLIN CINEMATIC EDITION

Build an **entirely new standalone project** named `naplin-cinematic`, in its own directory, NOT inside the existing `naplin` repository. This is a second visual direction for the same brand. **Never modify the existing project**. The two sites must have separate package manifests, dependencies, apps, assets, environment configuration, tests, Git history if initialized, and Vercel deployment. Do not import code, media, config, or CSS from the original site via relative paths, symlinks or runtime URLs. If the original project is available, treat it as read-only reference for business facts and official brand assets; copy only owner-authorized assets into this new project and preserve their provenance. If the original logo is not accessible, request it; never substitute a generated logo and call it official.

Read this package's README and all `docs/` files first. They are the source of truth for content, palette, asset manifest, constraints and QA. Keep these files in the new project's `docs/` directory. The included `assets/reference/cinematic-art-direction.png` is a generated moodboard/mockup, NOT an existing website screenshot and NOT production photography. Do not use the whole moodboard as a website background or crop it into purported authentic imagery.

## Mission

Create an Awwwards-caliber, cinematic luxury beauty experience for **HAIR BY NAPLIN**, a real hair/salon/Academy brand in Kumasi, Ghana. The site is a working interactive creative concept, not a fake fully operational commerce system. Art direction: HAIR IS THE ART. MOVEMENT IS THE LANGUAGE. CONFIDENCE IS THE FEELING. Inspired by luxury fragrance and fashion editorial choreography, but uniquely about the physical motion, texture, craftsmanship and emotional expression of hair. Rich ink black, wine, ivory, rare champagne-gold details. High-contrast editorial serif, fine sans labels, large negative space, film grain, image masking, exquisite hair photography, subtle WebGL atmosphere.

## Technical setup

Initialize a standalone Next.js App Router + React + strict TypeScript project using pnpm, ESLint, Prettier and Playwright. Keep styles organized and CSS scoped. Install compatible GSAP, ScrollTrigger, SplitText, Lenis, Three.js, lucide-react if needed. Check actual current APIs. Use GSAP context/cleanup in React. For Lenis, synchronize its update with ScrollTrigger using one GSAP ticker and refresh appropriately; no competing RAF loops. Desktop smooth scrolling is optional if it causes usability/performance issues. Do not override native touch scroll. Three.js is limited to one hero atmosphere: organic slow wine/ink fluid shader, faint champagne light, no obvious particles, no smoke obscuring face/hair. Use a still CSS/image fallback if WebGL fails; cap DPR, stop rendering offscreen, dispose correctly, lazy load browser-only systems. Respect reduced motion comprehensively.

## Actual page composition

1. Optional short first-visit black curtain loader with Hair By Naplin lettering and fine progress rule; no fake forced wait, always fail-safe.
2. Full-viewport hero: striking West African beauty model with long dark glossy hair sweeping naturally, atmospheric wine/ink WebGL behind/around photography; monumental serif H1 `Hair is a feeling.` with italic `feeling.`; eyebrow `HAIR BY NAPLIN · KUMASI`; copy `Luxury hair. Expert styling. Practical training. One world of beauty, rooted in Kumasi.`; prominent `EXPLORE THE HAIR` and `BOOK AN APPOINTMENT`; official logo visible and readable.
3. Gentle velocity-aware italic marquee `HAIR BY NAPLIN ✦ MADE TO MOVE ✦ KUMASI ✦ THE ART OF HAIR ✦`.
4. Pinned desktop narrative `TEXTURE / MOVEMENT / FINISH` with hair macro imagery and sequential masked typography. Previous tier recedes; next enters. Pin releases naturally. On mobile render a vertical natural sequence, not a long pin.
5. `Let it flow.` wine editorial chapter with a powerful model/hair-motion image on right, integrated with oversized italic typography and `The movement is the mood.` caption; deliberate mobile recomposition.
6. `The Hair Edit` editorial collection gallery featuring frontal wigs, closure wigs and luxury hair bundles. Desktop horizontal scroll only if measured and accessible; mobile native swipe or vertical stack. No invented SKU, prices, stock or purchase success.
7. `Wear your confidence.` full-bleed photographic campaign reveal with clip mask and restrained type animation.
8. `From hair to artistry.` salon section, interactive large-type service rows: Hairstyling, Retouching, Pony styles, Pedicure; clear booking CTA, honest concept status.
9. `The art is in the hands.` Academy feature with actual craft-focused concept imagery of braiding, wig construction, extensions, mannequin practice; strong Academy CTA, no fictional class claims.
10. `Rooted in Kumasi. Made for your confidence.` intimate brand-story chapter; use authentic salon photos only when verified.
11. Three-pillar navigation `HAIR / SALON / ACADEMY` with restrained editorial image interaction.
12. Closing `Your hair. Your story.` with Shop / Book / Academy actions, footer with business identity, hours and confirmed contact details.

## Navigation and destinations

Build a refined global header and full-screen mobile menu. Include Shop, Services, Academy, Our Story, and Book. All links must work. Create lightweight but polished standalone destination routes or clearly honest preview destinations; do not leave broken links. Preserve discoverable Shop/Book/Academy actions. This is an interactive brand experience, not an inaccessible animation reel.

## Imagery

Use the media manifest in `docs/MEDIA.md` and generate/source **individual production assets** through tools actually available. The generated concept mockup is NOT a substitute for these assets. If image generation is unavailable to Codex, do not fabricate completed image files or claim generation; create asset placeholders with clearly labeled fallback treatment and a `MEDIA_TODO.md` containing exact generation prompts. Do not hotlink arbitrary images or misrepresent generated images as actual Naplin clients, staff, premises or classes. Record every image's provenance. Keep natural skin tones and physically realistic hair; no universal gold duotone filter.

## Motion details

One weighted easing language (expo-out-like). SplitText sequential serif character/line reveals; image clip masks with tiny zoom settle; gentle scroll-linked parallax; subtle grain; hairline progress indicator; optional thin-ring custom cursor on fine pointer desktop only. Magnetic CTA only when unobtrusive. No excessive animation, random letter movement, continuous zoom, scroll-jacking, forced long intro, heavy pointer effects on mobile, or giant animation dependency stack. Content must be readable when JS animation is unavailable. GSAP pins and scroll galleries must not trap keyboard/touch users.

## Mobile

Purpose-designed 320–430px layouts, hero face and hair art-directed, H1 never clips, quick nav, readable logo, appropriate safe areas, no desktop pinning, lighter shader/static fallback, reduced motion and efficient images. Test 320×568, 375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×900, 1920×1080. Test full scroll, mobile menu, Shop, Book, Academy, focus, Escape, no horizontal overflow, image crops, footer and CLS.

## Performance/accessibility

Correct next/image sizes and priority, below-fold lazy loading, minimize JS, prevent hydration mismatch, cleanup listeners/canvases/timelines, maintain semantic H1/landmarks/alt text, visible focus, contrast, 44px touch targets, keyboard navigation, reduced-motion support, shader failure fallback. Avoid fake claims about LCP/INP without measurements.

## Build sequence

1. Audit supplied starter kit, business facts, available assets, and tooling.
2. Initialize standalone project in NEW directory. Confirm original site remains untouched.
3. Implement complete static responsive layout with typography and realistic copy.
4. Add asset generation/integration, or explicit placeholders and a media task list if no generation tool.
5. Implement GSAP/Lenis foundation, reveals, pinned hair chapter, gallery and route cleanup.
6. Add shader last, only after the static design is excellent.
7. Add microinteractions, cursor, grain, progress and curtain with fail-safes.
8. Run lint, typecheck, production build, Playwright, accessibility and visual screenshot review; iterate on any weak mobile crop/typography.
9. Document commands for local dev, production build and separate Vercel deployment; explain asset replacements and configuration.

## Final report

Give the exact new project path, list of files/routes, implemented effects, generated assets and provenance, screenshots/viewport QA, accessibility and performance checks, test/build results, outstanding assets, and deployment steps. Explicitly confirm no original repository files were modified. Never claim features, photos or testing are complete when they are not.

**Final creative standard:** This should feel like an international luxury beauty film made interactive, but grounded in the real Hair By Naplin brand and usable as a genuine customer-facing foundation. The website must communicate `HAIR BY NAPLIN — BEAUTY IN MOTION` without becoming a fragrance-template clone.
