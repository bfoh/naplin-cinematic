# Implementation plan and checklist

Standalone Next.js App Router + strict TypeScript + pnpm project. One client
motion layer (GSAP + ScrollTrigger + SplitText, Lenis on desktop only) on top of
server-rendered, fully readable sections. One Three.js canvas, hero only.

## Phase 1 — Audit and foundation

- [x] Read kit README, master prompt, CONTENT, DESIGN, MEDIA, IMPLEMENTATION
- [x] Audit original site (read-only): official logo, 8 owner-approved concept photos, live copy at naplin-sage.vercel.app
- [x] No image-generation tool available to the agent; recorded in docs/MEDIA.md
- [x] Owner supplied 3 additional generated images; polished and integrated (provenance confirmed by owner)
- [x] Own `package.json`, `pnpm-workspace.yaml`, `.npmrc`, lockfile, git repo; original repo verified unchanged
- [x] Reproducible media pipeline (`pnpm media`) with recorded crops

## Phase 2 — Static, responsive, accessible experience

- [x] Tokens, fonts, global layout, header with logo label, mobile menu (dialog), footer
- [x] Home: hero, marquee, Texture/Movement/Finish, Let it flow, Hair Edit, Wear your confidence, Salon, Academy, Story, pillars, closing
- [x] Destinations: /shop, /services, /academy, /story, /book, 404
- [x] lint, typecheck, build; screenshots at phone and desktop

## Phase 3 — Motion

- [x] Lenis (desktop fine pointer only) on the GSAP ticker, ScrollTrigger sync, route refresh
- [x] Reveal controller (SplitText line masks, clip reveals, parallax) with no-JS / failsafe / reduced-motion paths
- [x] Pinned Texture/Movement/Finish (desktop only), confidence aperture, marquee velocity

## Phase 4 — WebGL

- [x] Hero wine/ink fluid shader, lazy-loaded, DPR cap, offscreen pause, dispose, CSS fallback

## Phase 5 — Microinteractions

- [x] Curtain (first visit, fail-safe), progress hairline, grain, cursor ring (fine pointer), magnetic CTAs

## Phase 6 — QA

- [x] Playwright: routes, nav, menu focus/Escape, overflow at 8 viewports, reduced motion, WebGL failure, axe
- [x] Visual review (screenshots) at 320×568, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080; automated overflow/H1 checks at all eight sizes including 375×812 and 430×932
- [x] Production build; README deploy steps; MEDIA_TODO.md

## Outstanding (needs the owner or a later task)

- [ ] Owner sign-off on the derived on-dark logo, or an official on-dark/horizontal lockup, plus an icon (see `MEDIA_TODO.md`)
- [ ] Authentic salon, team, training and product photography with consent
- [ ] Optional higher-resolution or additional campaign images (`MEDIA_TODO.md` briefs)
- [ ] Deploy as a new Vercel project; then measure field Web Vitals on the real URL
- [ ] Test on Safari/iOS, Firefox and real Android/iOS devices; screen-reader pass
- [ ] Remove `noindex` once the owner approves public indexing
