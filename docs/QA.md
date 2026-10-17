# QA record — 2026-10-17

All results below were produced locally on macOS against the production build (`next build` + `next start`) in headless Chromium (Playwright 1.64, Chrome Headless Shell 156; WebGL via SwiftShader). No real devices, Safari or Firefox were tested.

## Automated checks

| Check                                                                | Result                                                                                       |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm lint` (ESLint, `--max-warnings 0`)                             | Pass                                                                                         |
| `pnpm typecheck` (strict TS, route types)                            | Pass                                                                                         |
| `pnpm build`                                                         | Pass — all 7 routes plus the share image prerender as static                                 |
| `pnpm format:check`                                                  | Pass                                                                                         |
| `pnpm test` (Playwright, desktop 1440×900 + mobile 390×844 projects) | **60 passed**, 16 skipped by design (desktop-only or mobile-only tests in the other project) |

The suite covers: every route renders with landmarks and one H1 and no console/runtime errors; every internal link resolves; in-page anchors exist; designed 404; tap-to-call numbers; desktop primary navigation and `aria-current`; the mobile menu (modal, focus wraps inside, Escape closes and restores focus, links navigate and close); skip link; no horizontal overflow and an unclipped H1 at 320×568, 375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×900 and 1920×1080 on every route; 44px targets for header, buttons, footer and phone links on a 375px phone; reduced motion (no curtain, Lenis or pins; all staged content visible); no-JS rendering; desktop pin engages and releases to the footer; phones never pin; WebGL failure keeps the still atmosphere with no errors; WebGL renders when available; curtain shows once per session; fail-safe when all app JS is blocked; axe (WCAG 2.0/2.1/2.2 A–AA tags) with **no serious or critical violations** on all six routes in both projects.

## Measurements (local, indicative only)

| Metric                                                       | Result                                                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| CLS at load, all routes, 390 and 1440 px, 4× CPU throttle    | 0.0000 everywhere (after fixing a SplitText re-wrap that produced 0.084 on `/shop`) |
| Hero LCP, phone, emulated slow 4G + 4× CPU, warm image cache | ~2.5 s                                                                              |
| Hero LCP, unthrottled, warm / cold image cache               | ~0.2 s / ~2.6 s (cold = first AVIF encode of that size)                             |
| Initial JS (compressed, home)                                | ~204 KB; Three.js (129 KB) loads after idle, outside the critical path              |
| Hero image transfer                                          | 109 KB AVIF desktop · 47 KB AVIF phone                                              |

These are local lab numbers, not field Web Vitals. Measure on the deployed URL (PageSpeed Insights / Vercel Speed Insights) before quoting performance.

## Visual review

Inspected by screenshot: the homepage scrolled end to end at 390×844, 768×1024, 1024×768, 1440×900 and 1920×1080; the hero at 320×568; all destination routes at 1440×900 and 390×844, the hero with WebGL at desktop and phone sizes, the curtain, the open mobile menu, and reduced motion. Curated sheets are in `docs/qa/`. The 1024×768, 1920×1080 and destination-page sheets were captured before three late fixes (button wrapping at 320 px, the tablet chapter word size and the SplitText guard); those fixes do not visibly change the layouts shown.

Issues found by inspection and fixed: hero gown cut short of the viewport edge; lead copy over the subject's crown on phones; campaign aperture feather cancelled by a second mask layer; "Wear your" pushed off-screen mid-scrub; oversized gaps between chapters; shader too dark with contour-like artefacts; "Movement." clipped on tablets; `/shop` button overflow at 320 px; menu focus leaving the dialog; a stale server serving an old build during review (environment, not code).

## Follow-up, 2026-10-17 (owner review)

Requested and done: logo directly on the dark background (derived on-dark variant); headline and portrait connected on landscape desktops (gap at 1440×783 reduced from ~312 px to ~70 px by sizing the portrait by width and enlarging the desktop headline; ~130 px at 1920); hair animated in WebGL. Bugs found and fixed: the owner's Safari console error (lost WebGL context, see `docs/DECISIONS.md`), and a texture allocation error caused by `srcset` density-corrected `naturalWidth`, found by inspecting the GL state when the portrait failed to draw. Verified in headless Chromium on the dev server at 1440×783, 1280×720, 1920×1080 and 390×844 (WebGL hand-over, no console errors), and by the full suite (60 passed, 16 skipped by design). **The Safari fix has not been verified in Safari**: please reload in Safari and confirm the dev overlay no longer reports the issue.

## Not verified

Safari/iOS and Firefox rendering; real phones and low-end GPUs; screen readers (only automated axe and keyboard checks were run); field performance on Vercel; Vercel deployment itself (not performed).

## Follow-up 2, 2026-10-17 — scroll-animated closing hair

Added at the owner's request; see `docs/DECISIONS.md`. Verified on the dev server in headless Chromium (CPU-rendered WebGL) at 1440×783 and 390×844: canvas created only near the section, ready, no console errors; absent under reduced motion. Inspected with the veil removed against the static image: aligned framing, waves and shine present, an edge smear found and fixed. Suite: 64 passed, 16 skipped by design.

Not measured: real-GPU frame rates. Automated Chrome here falls back to CPU rendering (about 3–14 fps even on non-WebGL parts of the page), so those numbers say nothing about real devices. A frame-time governor protects older GPUs; please judge smoothness in your own browser.

## Follow-up 3, 2026-10-17 — mobile optimisation

Lighthouse figures in `docs/DECISIONS.md`. Suite: 65 passed, 1 failed (axe colour contrast on the new mobile "Let it flow" caption), fixed by raising the caption to 82% opacity; the accessibility suite was re-run (12/12 passed). New phone tests: no curtain and nothing on screen hidden while scripts load; Lenis not downloaded; below-the-fold content reveals. The owner's 2014 MacBook Pro has no usable WebGL in Chrome ("GPU process was unable to boot") or Safari (context lost at creation), so the WebGL effects correctly show still images there; they need to be judged on a phone or newer computer.
