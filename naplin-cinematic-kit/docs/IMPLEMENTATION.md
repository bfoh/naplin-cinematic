# Implementation and acceptance criteria

Independent sibling directory `naplin-cinematic/`; no writes to existing `naplin/`; own package.json, lockfile, app, public, tests, README and Vercel project. Existing repo may be read for approved facts/reference only, never imported or referenced by filesystem paths at build/runtime. Explicitly request missing original logo and authentic assets rather than silently substituting.

Build order: initialize standalone Next.js TypeScript -> tokens/fonts/layout -> static accessible page with copy and responsive photography -> motion infrastructure -> editorial reveals -> pinned desktop hair chapter and gallery -> one WebGL atmosphere with fallback -> responsive/performance/accessibility QA -> deploy instructions.

Suggested routes: `/` cinematic landing; `/shop`, `/services`, `/academy`, `/story` can be deliberate lightweight editorial destination pages if implemented. Do not invent transactions; if destination not implemented, use honest concept messaging rather than broken links. Do not require real backend.

Technical: GSAP + ScrollTrigger + SplitText (verify current license/package); Lenis synchronized with GSAP ticker and ScrollTrigger updates if used; Three.js one scene, cap DPR, pause offscreen, dispose on unmount, static fallback; prefers-reduced-motion native scroll/no pins/no shader movement; touch devices no custom cursor. No faux 100% loader or scroll trapping. No CDN dependence in production if possible.

QA: 320×568, 375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×900, 1920×1080. Validate no horizontal overflow, no clipped italic typography, meaningful CTAs, touch targets, mobile image crops, keyboard/focus/escape, reduced motion, shader failure, slow device, Web Vitals where measurable. Run lint/typecheck/build and Playwright tests. Supply screenshots and honest results.
