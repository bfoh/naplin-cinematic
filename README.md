# Hair By Naplin — Cinematic Edition

A standalone, cinematic brand experience for **Hair By Naplin**, Kumasi: luxury hair, salon and Academy. _Hair is the art. Movement is the language. Confidence is the feeling._

This is an independent project. It shares no code, config, dependencies or runtime URLs with the original Naplin site and deploys as its own Vercel project.

> **Status:** a working, production-buildable brand site. Shopping and online booking are not live, and the site says so: customers are directed to call. Photography is generated campaign concept imagery, disclosed in a site-wide note in the footer and on the Story page (see `docs/MEDIA.md`).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · CSS Modules · GSAP 3.15 (ScrollTrigger, SplitText) · Lenis 1.3 · Three.js 0.186 · Playwright + axe · pnpm.

## Commands

Requires Node 22+ and pnpm (the project pins `pnpm@12.8.1` via `packageManager`; `corepack enable` will provide it).

```bash
pnpm install          # install dependencies
pnpm dev              # local development at http://localhost:3000
pnpm lint             # ESLint, zero warnings allowed
pnpm typecheck        # route types + tsc --noEmit
pnpm build            # production build (all routes static)
pnpm start            # serve the production build
pnpm check            # lint + typecheck + build
pnpm test             # Playwright suite: builds, starts on :3200, runs desktop + mobile projects
pnpm media            # regenerate src/media from assets/source (needs the masters, see docs/MEDIA.md)
```

First Playwright run: `pnpm exec playwright install chromium`.

## Routes

| Route       | Purpose                                                                                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`         | The cinematic homepage: hero with WebGL atmosphere, marquee, pinned Texture / Movement / Finish, Let it flow, The Hair Edit, Wear your confidence, Salon, Academy, Story, Hair · Salon · Academy, closing |
| `/shop`     | The Hair Edit: frontal wigs, closure wigs, bundles; enquire by phone                                                                                                                                      |
| `/services` | Salon services: hairstyling, retouching, pony styles, pedicure                                                                                                                                            |
| `/academy`  | Training areas and Academy enquiries (separate from bookings)                                                                                                                                             |
| `/story`    | Brand story, the three pillars, visit details, imagery note                                                                                                                                               |
| `/book`     | How to book: tap-to-call numbers, hours, bookable services                                                                                                                                                |

## Structure

```
src/app/                 routes, layout, global tokens, share image
src/components/hero/     hero, entrance motion, WebGL atmosphere (lazy) + scene
src/components/home/     homepage chapters (each with a scoped CSS module)
src/components/pages/    destination page building blocks
src/components/site/     header, menu dialog, footer
src/components/chrome/   curtain, scroll progress, cursor ring
src/components/motion/   Lenis/GSAP provider and the declarative reveal controller
src/content/             business facts (site.ts) and media manifest with provenance (media.ts)
src/media/               web images derived from assets/source by scripts/build-media.mjs
assets/                  official logo master; image masters (git-ignored) + checksums
docs/                    brief, content, design, media provenance, decisions, QA, plan
tests/                   Playwright specs
```

## How the experience degrades

- **No JavaScript:** every section renders fully; navigation works.
- **Reduced motion:** no curtain, no smooth scroll, no pinning, no reveals, static marquee and grain, a single still frame of the atmosphere.
- **No WebGL / renderer failure:** the CSS still atmosphere remains, and the hero hair still moves through a 2D-canvas fallback; nothing errors.
- **Save-Data / under 4 GB of memory:** the CSS still atmosphere and the static portrait remain.
- **Closing hair field:** with WebGL and motion allowed, the closing texture moves with the scroll; otherwise it is a still photograph.
- **Slow GPUs:** both WebGL scenes lower their resolution, then their frame rate, then stop their idle motion if frames drop below ~42 fps; the hero hair still answers the scroll.
- **Hair motion:** with motion allowed, the portrait `<img>` hands over to an identical copy (WebGL, or 2D canvas without WebGL) whose hair alone moves: an idle swing, plus a lift, toss and ripples that follow the scroll (`src/components/hero/hair-motion.ts`).
- **Script failure:** a boot-script fail-safe reveals staged content, returns the phone stages to the natural sequence, and the curtain hides itself after 4 s.
- **Phones:** the same scroll choreography as desktop: line reveals, image wipes, parallax, the hero scroll-out, and the Texture / Movement / Finish and Wear your confidence sequences on CSS-sticky stages (native scrolling, no JS pinning). Also a lighter shader (lower resolution, 30 fps), static grain and no cursor effects.

## Deploying as a separate Vercel project

1. This folder lives next to the original `naplin` repository (`Desktop/naplin-cinematic`) and is fully independent of it.
2. Commit and push this directory to a **new** Git repository (this folder already has its own `.git`).
3. In Vercel: **Add New → Project**, import the new repository.
   - Framework preset: **Next.js** (auto-detected). Root directory: the repository root.
   - Install command: `pnpm install` · Build command: `pnpm build` (defaults are correct).
   - Node.js version: **22.x** or newer (Project Settings → General).
   - Environment variable: `NEXT_PUBLIC_SITE_URL` = the production URL (used for absolute share-image URLs). See `.env.example`.
   - If install fails because of the pnpm version, add `ENABLE_EXPERIMENTAL_COREPACK=1` so Vercel uses the pinned `pnpm@12.8.1`.
4. Deploy. Previews are protected by Vercel's default Deployment Protection; production gets its own domain.

CLI alternative, from this directory: `pnpm dlx vercel` (choose **create a new project**, not an existing one), then `pnpm dlx vercel --prod`.

**Before going public:** the site sets `robots: noindex` because it uses concept imagery. Remove that in `src/app/layout.tsx` once the owner approves indexing.

## Replacing content and imagery

- Business facts: `src/content/site.ts`. Do not add prices, stock, programme details or policies without owner confirmation.
- Images: follow `MEDIA_TODO.md` → masters in `assets/source/`, a job in `scripts/build-media.mjs`, an entry in `src/content/media.ts`, provenance in `docs/MEDIA.md`.

## Documentation

`docs/BRIEF.md` (master brief) · `docs/CONTENT.md` · `docs/DESIGN.md` · `docs/IMPLEMENTATION.md` · `docs/MEDIA.md` (provenance) · `docs/DECISIONS.md` · `docs/QA.md` · `docs/PLAN.md` · `MEDIA_TODO.md`.
