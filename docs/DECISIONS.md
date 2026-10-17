# Decisions

Consequential choices made while building the cinematic edition, with the evidence behind them.

## Project and independence

- **Standalone project, own workspace root.** `package.json`, `pnpm-workspace.yaml`, `.npmrc`, lockfile and git repository live in this directory. Without its own `pnpm-workspace.yaml`, pnpm walks up and adopts the parent `naplin` workspace (npm was observed reading the parent `.npmrc`). `next.config.ts` pins `turbopack.root`/`outputFileTracingRoot` for the same reason. The original repository was verified unchanged (checksums of its lockfile, manifests and `.npmrc`, and a clean `git status` apart from this untracked folder).
- **Location:** built inside the original checkout (`naplin/naplin-cinematic`), then moved on 2026-10-17 to `Desktop/naplin-cinematic`, a sibling of `naplin`. Nothing references the other repository by path; the original repo was verified clean after the move.
- **Static rendering.** All routes prerender; there is no backend, form submission or personal-data collection.
- **`noindex` by default.** The site uses generated concept imagery and duplicates the brand's live site; robots are disabled until the owner approves public indexing (`src/app/layout.tsx`).

## Content and truthfulness

- Facts come from `docs/CONTENT.md` (owner brief, 2026-10-17) and the live site. Where the original repository said hours were unknown, the newer brief supplies **Monday–Saturday, 8:00 AM–8:00 PM**; the brief wins.
- **Both phone numbers are published**, confirmed by the owner on 2026-10-17.
- No prices, stock, programme details, durations, reviews or policies are stated. Shop, Book and Academy say plainly that ordering and online booking are not live and that details are confirmed by phone.
- **Academy enquiries are kept separate** from salon booking and shop enquiries (copy on `/book` and `/academy`).

## Imagery

- No image-generation tool was available, so the build uses the owner's eight approved concept photographs (full-quality PNG masters from the owner's earlier session) plus three images the owner generated and supplied during this build. Provenance per file: `docs/MEDIA.md`.
- **Every photograph is a separate file** with alt text and a visible disclosure. The concept mockup is used only as a reference in `docs/reference/` and is never served.
- **Logo directly on the dark page (owner direction, 2026-10-17).** The official crimson-to-plum artwork loses its plum half on ink, so an ivory label was used first. At the owner's request it now sits directly on the background as a derived on-dark variant: only the darkest tones are lifted toward 40% lightness, hue and shapes unchanged. Four treatments were compared on the real hero background (original, lifted, ivory, mixed); the lifted version was the most faithful one that stays legible. Original file untouched; an official on-dark lockup would replace it.
- **Campaign aperture instead of an upscaled 16:9.** The 1058 px crimson portrait is feathered into a field matched to its own backdrop (sampled `#5C0912`), so it reads full-bleed without enlarging the master.

## Motion and rendering

- **One motion stack:** GSAP 3.15 (ScrollTrigger, SplitText, now part of the free `gsap` package), Lenis 1.3. Lenis runs only for desktop fine pointers without reduced motion and is driven by `gsap.ticker` (no second RAF loop). Touch keeps native scrolling.
- **Content first:** every section is server-rendered and readable without JS. CSS stages entrance states only under `html.js` with motion allowed; a boot-script fail-safe reveals everything after 4 s if the motion layer never starts. Tested by blocking all app JS.
- **SplitText safety:** after splitting, the controller compares the element's height to its pre-split height. If splitting would re-wrap text (observed on "The Hair Edit." at 390 px, which caused CLS 0.084), it reverts and reveals the block whole. Split elements are made grid containers so mask margins cannot collapse. Result: CLS 0.0000 on all routes at 390 and 1440 px (local, 4× CPU throttle).
- **Pinned chapter only on desktop** (≥1024 px wide and ≥620 px tall). Phones and reduced motion get the natural vertical sequence; there is no horizontal scroll-jacking anywhere. The Hair Edit is a staggered spread on desktop and a native snap rail on phones: with three items, a pinned horizontal gallery would add friction without benefit.
- **WebGL (one canvas, hero only):** lazy-imported after idle (the Three.js chunk is outside the critical path). Two passes: the atmosphere renders into a target at 35–50% of the drawing buffer and is upscaled with full-resolution dither; the portrait renders at full resolution (DPR ≤ 2). 30 fps on phones, paused offscreen and in hidden tabs, nothing animated under reduced motion, skipped on Save-Data, disposed on unmount. The CSS still beneath is always present.
- **Animated hair (owner request).** The portrait `<img>` stays in the DOM for LCP, alt text and fallback. Once the canvas has fully faded in, an identical copy is drawn in WebGL and the `<img>` is hidden; the motion then ramps up from zero over 3 s, so the swap is invisible. A shader displaces only the hair, weighted by distance from the roots and masked out right of the shoulder line: a 4.2 s swing travelling root to tip, a lighter ripple and fine strand drift. Measured frame differences: the hair region changes visibly; the face region changes no more than the moving background behind it.
- **Closing hair field (owner request, 2026-10-17).** The closing chapter's macro hair photograph is redrawn in a second, lightweight WebGL canvas that is created only as the section approaches. Scroll progress drives slow waves along the strands and a soft shine across them; scroll speed stirs them slightly; the motion eases after scrolling stops. It renders at reduced resolution (it sits behind a 42% veil), pauses offscreen, ramps up from stillness over the static `<img>` (which stays as the fallback), and never runs with reduced motion or Save-Data. Displaced samples stay inside the photo via a 3% inset, matched by the static image.
- **Quality governor for older GPUs.** The development machine is a 2014 MacBook Pro (Intel Iris Pro), and automated browsers here render WebGL on the CPU only, so real-GPU frame rates could not be measured. Both scenes therefore watch their own frame times: if frames average slower than ~42 fps, they lower resolution, then cap at 30 fps, then hold a still frame.
- **Texture source for the portrait.** A `srcset` image reports a density-corrected `naturalWidth` (835 px for a 1080 px file at 1440 px wide), which made three.js allocate a smaller texture than the pixels it uploaded (`GL_INVALID_VALUE`). The scene decodes the chosen file (`currentSrc`, already cached) into a plain `Image` whose size matches its pixels.
- **Context robustness (Safari error, 2026-10-17).** The owner saw `THREE.WebGLRenderer: null is not an object (gl.getShaderPrecisionFormat…)` in Safari: a context that was already lost. The old code probed with a throwaway context it then force-lost, and created the scene on a React-owned canvas that would be reused after `forceContextLoss()` on remount. Now each scene creates a fresh canvas, creates and verifies its own WebGL2 context before three.js sees it, fails silently to the CSS still, and retries once after 1.5 s.
- **Curtain:** first visit to `/` per session only, never with reduced motion. Its rule tracks real readiness (fonts and hero image decode) with a 1.8 s cap; CSS hides it after 4 s even if JS fails.
- **Image formats: AVIF first.** Tested against WebP-only: WebP was about 3× heavier (333 KB vs 109 KB hero on desktop; 146 KB vs 47 KB on phones) and still ~1.5 s to encode cold. AVIF's one-off encode cost (~2.4 s locally on the first request per size) is cached by the optimiser/CDN, while its savings apply to every visit.

## Mobile optimisation (2026-10-17)

Measured with Lighthouse mobile (emulated mid-range phone, slow 4G, 4x CPU), median of three interleaved runs against the previous commit: performance 79 → 84 (steadier), Total Blocking Time 314 → 98 ms, Speed Index 3.9 → 2.9 s, time to interactive 5.4 → 4.5 s, JavaScript 345 → 207 KB, total weight 757 → 582 KB; accessibility and best practices 96 → 100. LCP stayed ~4.0–4.3 s: its remaining cost is paint delay on this machine's GPU-less Chrome, not loading.

- **WebGL context first, three.js second.** Components create the canvas and verify a WebGL2 context, then import the scene. Devices without WebGL, on Save-Data or reporting under 4 GB of memory never download three.js; it also waits for the page `load` event and idle time.
- **Lenis is imported only when desktop smooth scrolling applies.**
- **Phones never hide content while scripts load:** no curtain (desktop only), a CSS-only hero entrance, and reveals that leave on-screen content alone and fade the rest in through one batched trigger — no SplitText or clip-paths on phones.
- **Hero image fetch priority.** Next 16 deprecated `priority`; it no longer raised fetch priority, so the LCP image was requested at Low. It now uses `fetchPriority="high"` and `loading="eager"`.
- **Bytes:** image quality 88 → 80, tighter hero `sizes`, static weight-300 Cormorant files instead of the variable font (preloaded fonts ~100 → 67 KB).
- **Battery:** no fixed grain layer on phones; the closing hair field renders only while it moves.
- **Icons:** `icon.png`, `apple-icon.png` and a web manifest from the official on-dark logo, scaled on ink (no new mark).
- **"Let it flow" on phones (owner request):** the section takes the photograph's own backdrop colour (#66341F, sampled from its edges) and the photo is feathered on all sides, so image and section read as one. Desktop keeps the wine treatment.
