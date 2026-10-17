'use client';

import { useEffect } from 'react';

import {
  DESKTOP_MOTION,
  gsap,
  MOTION_OK,
  registerGsap,
  ScrollTrigger,
  SplitText,
} from '@/lib/gsap';

/**
 * Declarative scroll reveals for server-rendered markup. Remounted per route.
 *
 *   data-reveal="lines"   serif/sans text revealed line by line through masks
 *   data-reveal="fade"    short rise + fade
 *   data-reveal="clip"    image frame unmasked from below, inner image settles
 *   data-parallax="8"     inner media drifts ±8% across its frame (desktop)
 *   data-delay="0.2"      optional delay in seconds
 *
 * Content is fully visible without JS, with reduced motion, and after the
 * boot-script failsafe; CSS only stages it while this controller is active.
 */
export function RevealController() {
  useEffect(() => {
    registerGsap();
    let cancelled = false;
    const restores: (() => void)[] = [];
    const mm = gsap.matchMedia();

    const setup = () => {
      if (cancelled) return;
      mm.add(MOTION_OK, () => {
        const start = 'top 88%';

        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          const delay = Number(el.dataset.delay ?? 0);
          const type = el.dataset.reveal;

          if (type === 'lines') {
            gsap.set(el, { autoAlpha: 1 });
            const before = el.getBoundingClientRect().height;
            const display = el.style.display;
            const split = SplitText.create(el, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'split-line',
              aria: 'auto',
            });
            // Grid stops the masks' compensating margins from collapsing.
            el.style.display = 'grid';
            let restored = false;
            const restore = () => {
              if (restored) return;
              restored = true;
              split.revert();
              el.style.display = display;
            };

            // Splitting must never re-wrap text (e.g. a heading at its width
            // limit). If it would, reveal the block as a whole instead.
            if (Math.abs(el.getBoundingClientRect().height - before) > 1) {
              restore();
              gsap.from(el, {
                autoAlpha: 0,
                y: 30,
                duration: 1.3,
                delay,
                scrollTrigger: { trigger: el, start, once: true },
              });
              return;
            }

            restores.push(restore);
            gsap.from(split.lines, {
              yPercent: 118,
              duration: 1.3,
              stagger: 0.085,
              delay,
              scrollTrigger: { trigger: el, start, once: true },
              // Restore natural text so later resizes reflow normally.
              onComplete: restore,
            });
          } else if (type === 'fade') {
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 26 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 1.1,
                delay,
                scrollTrigger: { trigger: el, start, once: true },
              },
            );
          } else if (type === 'clip') {
            const inner = el.querySelector('img');
            const tl = gsap.timeline({
              delay,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            });
            tl.fromTo(
              el,
              { clipPath: 'inset(100% 0% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.5,
                ease: 'expo.inOut',
              },
            );
            if (inner)
              tl.fromTo(
                inner,
                { scale: 1.16 },
                { scale: 1, duration: 2 },
                0.15,
              );
          }
        });
      });

      mm.add(DESKTOP_MOTION, () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const amount = Number(el.dataset.parallax ?? 8);
          gsap.fromTo(
            el,
            { yPercent: -amount },
            {
              yPercent: amount,
              ease: 'none',
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        });
      });

      ScrollTrigger.refresh();
    };

    // Line breaks depend on the display face; split only once fonts settle.
    document.fonts.ready.then(setup, setup);

    return () => {
      cancelled = true;
      mm.revert();
      restores.forEach((restore) => restore());
    };
  }, []);

  return null;
}
