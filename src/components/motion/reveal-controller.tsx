'use client';

import { useEffect } from 'react';

import {
  gsap,
  MOTION_OK,
  PHONE_MOTION,
  registerGsap,
  ScrollTrigger,
  SplitText,
  TABLET_UP_MOTION,
} from '@/lib/gsap';

/**
 * Declarative scroll reveals for server-rendered markup. Remounted per route.
 *
 *   data-reveal="lines"   serif/sans text revealed line by line through masks
 *   data-reveal="fade"    short rise + fade
 *   data-reveal="clip"    image frame unmasked from below, inner image settles
 *   data-parallax="8"     inner media drifts ±8% across its frame; CSS may
 *                         narrow the range with --parallax-from/--parallax-to
 *   data-delay="0.2"      optional delay in seconds
 *
 * Content is fully visible without JS, with reduced motion, and after the
 * boot-script failsafe; CSS only stages it while this controller is active.
 *
 * Phones get the same reveals as desktop, with two differences: nothing
 * already on screen is hidden (CSS never stages content on phones), and text
 * is split into lines only as it approaches, spreading that layout work
 * across the scroll instead of one long task at load.
 */
export function RevealController() {
  useEffect(() => {
    registerGsap();
    let cancelled = false;
    const restores: (() => void)[] = [];
    const mm = gsap.matchMedia();

    const reveal = (el: HTMLElement, start: string) => {
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
          // Whole lines read naturally; no ARIA rewriting needed.
          aria: 'none',
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
          tl.fromTo(inner, { scale: 1.16 }, { scale: 1, duration: 2 }, 0.15);
      }
    };

    // Phones: stage what is below the fold straight away, then set each
    // reveal up once it is within reach.
    mm.add(PHONE_MOTION, (context) => {
      const pending = gsap.utils
        .toArray<HTMLElement>('[data-reveal]')
        .filter((el) => el.getBoundingClientRect().top > window.innerHeight);
      if (!pending.length) return;
      const clips = pending.filter((el) => el.dataset.reveal === 'clip');
      gsap.set(clips, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(
        pending.filter((el) => !clips.includes(el)),
        { autoAlpha: 0 },
      );

      // Created later, but still reverted with this context.
      const later = context.add('reveal', (el: HTMLElement) =>
        reveal(el, 'top 90%'),
      );
      const arm = context.add('arm', () => {
        if (cancelled) return;
        pending.forEach((el) =>
          ScrollTrigger.create({
            trigger: el,
            start: 'top bottom+=60%',
            once: true,
            onEnter: () => later(el),
          }),
        );
      });
      // Line breaks depend on the display face; split only once it settles.
      document.fonts.ready.then(
        () => arm(),
        () => arm(),
      );
    });

    const setup = () => {
      if (cancelled) return;
      mm.add(TABLET_UP_MOTION, () => {
        gsap.utils
          .toArray<HTMLElement>('[data-reveal]')
          .forEach((el) => reveal(el, 'top 88%'));
      });

      // Parallax wherever motion is allowed (transforms only).
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const amount = Number(el.dataset.parallax ?? 8);
          const range = (edge: 'from' | 'to') => {
            const value = getComputedStyle(el)
              .getPropertyValue(`--parallax-${edge}`)
              .trim();
            if (value) return Number.parseFloat(value);
            return edge === 'from' ? -amount : amount;
          };
          gsap.fromTo(
            el,
            { yPercent: () => range('from') },
            {
              yPercent: () => range('to'),
              ease: 'none',
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
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
