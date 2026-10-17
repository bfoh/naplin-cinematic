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
- **Every photograph is a separate file** with alt text. Per-image "Generated campaign concept" captions were removed at the owner's direction (2026-10-17); the footer, `/story`, `/shop` and `/academy` keep plain-language notes that the photography is generated concept imagery. The concept mockup is used only as a reference in `docs/reference/` and is never served.
- **Logo directly on the dark page (owner direction, 2026-10-17).** The official crimson-to-plum artwork loses its plum half on ink, so an ivory label was used first. At the owner's request it now sits directly on the background as a derived on-dark variant: only the darkest tones are lifted toward 40% lightness, hue and shapes unchanged. Four treatments were compared on the real hero background (original, lifted, ivory, mixed); the lifted version was the most faithful one that stays legible. Original file untouched; an official on-dark lockup would replace it.
- **Campaign aperture instead of an upscaled 16:9.** The 1058 px crimson portrait is feathered into a field matched to its own backdrop (sampled `#5C0912`), so it reads full-bleed without enlarging the master.

## Motion and rendering

- **One motion stack:** GSAP 3.15 (ScrollTrigger, SplitText, now part of the free `gsap` package), Lenis 1.3. Lenis runs only for desktop fine pointers without reduced motion and is driven by `gsap.ticker` (no second RAF loop). Touch keeps native scrolling.
- **Content first:** every section is server-rendered and readable without JS. CSS stages entrance states only under `html.js` with motion allowed; a boot-script fail-safe reveals everything after 4 s if the motion layer never starts. Tested by blocking all app JS.
- **SplitText safety:** after splitting, the controller compares the element's height to its pre-split height. If splitting would re-wrap text (observed on "The Hair Edit." at 390 px, which caused CLS 0.084), it reverts and reveals the block whole. Split elements are made grid containers so mask margins cannot collapse. Result: CLS 0.0000 on all routes at 390 and 1440 px (local, 4× CPU throttle).
- **Pinned chapter only on desktop** (≥1024 px wide and ≥620 px tall; phones later gained the same sequence on a CSS-sticky stage, see Owner review 5). Phones and reduced motion get the natural vertical sequence; there is no horizontal scroll-jacking anywhere. The Hair Edit is a staggered spread on desktop and a native snap rail on phones: with three items, a pinned horizontal gallery would add friction without benefit.
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
- **Phones never hide content while scripts load:** no curtain (desktop only), a CSS-only hero entrance, and reveals that leave on-screen content alone. (Superseded in part by Owner review 5: phones now use the desktop reveals for content below the fold.)
- **Hero image fetch priority.** Next 16 deprecated `priority`; it no longer raised fetch priority, so the LCP image was requested at Low. It now uses `fetchPriority="high"` and `loading="eager"`.
- **Bytes:** image quality 88 → 80, tighter hero `sizes`, static weight-300 Cormorant files instead of the variable font (preloaded fonts ~100 → 67 KB).
- **Battery:** no fixed grain layer on phones; the closing hair field renders only while it moves.
- **Icons:** `icon.png`, `apple-icon.png` and a web manifest from the official on-dark logo, scaled on ink (no new mark).
- **"Let it flow" on phones (owner request):** the section takes the photograph's own backdrop colour (#66341F, sampled from its edges) and the photo is feathered on all sides, so image and section read as one. Desktop keeps the wine treatment.

## Owner review, 2026-10-17 (live site)

- **Captions removed** from all images at the owner's request; site-wide imagery notes and alt text remain (see above).
- **"Let it flow" on phones:** edge-to-edge and crisp (top fade only) so the portrait stands out; its backdrop still matches the section colour (#66341F).
- **Desktop hair animation froze — fixed.** The quality governor compared the _average_ frame time against 24 ms after a 45-frame warm-up; one-off start-up tasks on desktop (SplitText, shader compilation; up to ~700 ms each) pushed the average over the limit and stepped the scene down to a still frame on capable machines. It now uses the median of each window, needs two slow windows in a row, waits ~2 s before judging, and freezes only below ~25 fps. The level is exposed as `data-quality` on the canvas. Verified at 1440×783: level 0 throughout ~80 s and continuous hair movement (software WebGL).

## Owner review 2, 2026-10-17

- **"Let it flow" on phones:** the section keeps its colour (#66341F) and the portrait's studio backdrop is removed (Apple Vision foreground lifting, macOS's built-in subject model; checked at 2x for hair-edge halos), so she rests directly on the section, crisp. Phones drop the parallax overscan so the crown is never cropped; only the bust's lower edge fades. Desktop keeps the full photograph under the wine veil; each device downloads only its own image.
- **Scroll-driven hair, visible everywhere:** the closing texture is now clearly visible (field 85% opacity, overlay dark only behind the copy) and turns and drifts with the scroll on every device with motion allowed, including those without WebGL (owner's 2014 Mac). WebGL strand waves on top are stronger (amplitude about doubled, faster phase, brighter sheen). Verified on phone, phone without WebGL and desktop: rotation -1.8° → 0° → +1.5° across the section.
- **Hero hair answers the scroll:** scroll progress through the hero advances the swing and scroll speed throws the hair further, settling when scrolling stops (WebGL devices).

## Owner review 3, 2026-10-17

- **"Let it flow" on phones:** back to the section's original wine (`--oxblood`), with every edge of the portrait crisp, no fades. On wine the soft hair edges showed an orange halo from the removed terracotta backdrop, so the cut-out's edge colours are decontaminated (foreground recovered from C = aF + (1-a)B with a locally estimated backdrop, faintest alpha band trimmed) by `scripts/defringe-cutout.py`; verified at 2x before and after.

## Owner review 4, 2026-10-17 — hero hair and the scroll

The owner still saw no hero hair movement while scrolling. Two causes:

1. **The scroll response was imperceptible.** Scrolling only shifted the phase of a swing that was already moving, plus a speed boost that faded within ~150 ms; frame comparisons showed scrolled frames changing barely more than idle ones.
2. **No WebGL, no hair motion.** The owner's 2014 Mac has no usable WebGL in Chrome or Safari, and the hair moved only in WebGL.

Fix:

- **One motion model** (`src/components/hero/hair-motion.ts`) shared by the shader and a new fallback. It keeps the idle swing and adds three scroll-driven parts. **Lift:** the tips rise and sweep outward with scroll progress through the hero, up to 7.5% of the portrait height at the tips, and lower again when scrolling back. **Toss:** a spring driven by scroll speed (about 1.1 swings a second, lightly damped) flicks the tips up and out, then swings back past rest and settles within ~2 s. **Travelling ripples:** these run from roots to tips as the visitor scrolls. Roots, face, neck, shoulder and gown never move.
- **2D-canvas fallback** (`hair-canvas-2d.ts`) for devices without WebGL. It redraws the portrait over its `<img>` in 4-pixel columns, each shifted by the same model, so there is no stretching or seams; everything right of the shoulder line is drawn once, unmoved. It lowers resolution, then frame rate, if drawing is slow, but never stops. The atmosphere stays the CSS still.
- **The WebGL governor no longer freezes the scroll response.** On a slow GPU it now stops only the idle motion; the scene still redraws while the scroll moves the hair.

Measured in headless Chromium on a 390×844 phone, comparing the outer hair band with the portrait at rest:

- **WebGL:** −20 to −28 px after a 240–260 px scroll, against −9 px of idle swing.
- **2D fallback:** −20 to −27 px, against ±8 px.
- **Face:** unchanged throughout.

A test now measures the fallback's hair-tip offset directly. It is under 2.5% of the portrait height at rest and lifted beyond 4% after scrolling; with the lift disabled it fails as expected.

## Owner review 5, 2026-10-18 — desktop scroll animations on phones

The owner saw none of the desktop scroll animations on phones. Phones had a deliberately lighter path: below-the-fold content faded up once, with no line splitting, image wipes, parallax, hero scroll-out or scroll-driven stages. Phones (and portrait tablets) now get the desktop choreography:

- **Reveals:** the same line-by-line text, fades and image wipes as desktop for everything below the fold. Content already on screen is never hidden. Text is split into lines only as it comes within reach (60% of a screen ahead), so the layout work is spread over the scroll.
- **Parallax** on every screen size. Frames may narrow the range in CSS (`--parallax-from`/`--parallax-to`). The "Let it flow" cut-out uses 0 → 9%, sinking only, because rising would crop her crown.
- **Hero scroll-out:** the copy lifts and fades while the portrait drifts, as on desktop.
- **Texture / Movement / Finish** and **Wear your confidence** play the desktop scrubbed sequences on a `position: sticky` stage, not a JS pin. Sticky is composited, so it stays smooth under touch momentum and needs no pin spacer. The section's height supplies the scroll: 340svh and 215svh, close to the desktop pin lengths.
  - **Layout:** the words sit over the foot of the photograph, with a gradient for legibility. The open aperture is feathered at the top and bottom as well as the sides.
  - **When it applies:** phones and tablets at least 560 px tall, with motion allowed and JS present (`html.js`). Short landscape phones and reduced motion keep the earlier behaviour.
- **Load cost:** a first version toggled a class at hydration. That forced a full style and layout pass, about 100 ms under 4× CPU throttle. Now CSS lays the stages out from first paint and shows their opening frame. Each sequence is set up in its own idle callback; the section is below the fold. If scripts never arrive, the boot failsafe (4 s) returns to the natural sequence. Scripts that arrive after the failsafe get a reveal per tier instead of the stage.
- **2D hair fallback, cheaper:** found while measuring. The fallback rescaled the full photograph for each of ~100 columns every frame: about 55 ms frames under 4× CPU, as repeated long tasks. It now scales the photograph once into a buffer, redraws only the hair region with 1:1 copies, and as a last resort redraws only while the scroll moves the hair.

Lighthouse mobile (median of three, home): performance 84, Total Blocking Time 130 ms (previous commit ~100 ms), time to interactive 4.5 s (unchanged), CLS 0.
