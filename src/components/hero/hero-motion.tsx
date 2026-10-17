'use client';

import { useEffect } from 'react';

import { CURTAIN_EVENT } from '@/lib/events';
import {
  DESKTOP_MOTION,
  gsap,
  prefersReducedMotion,
  registerGsap,
} from '@/lib/gsap';

/** Hero entrance (after the curtain, if any) and a restrained scroll-out. */
export function HeroMotion() {
  useEffect(() => {
    registerGsap();
    const hero = document.getElementById('hero');
    if (!hero) return;
    const items = hero.querySelectorAll<HTMLElement>('[data-hero-item]');

    if (prefersReducedMotion()) {
      gsap.set(items, { visibility: 'visible' });
      return;
    }
    // Phones: the entrance runs in CSS from first paint (hero.module.css).
    if (window.matchMedia('(max-width: 767px)').matches) return;

    const ctx = gsap.context(() => {}, hero);
    let started = false;

    const play = () => {
      if (started) return;
      started = true;
      ctx.add(() => {
        const lines = hero.querySelectorAll('[data-hero-line]');
        const rest = [...items].filter(
          (el) => !el.hasAttribute('data-hero-line'),
        );
        const tl = gsap.timeline();
        tl.set(items, { visibility: 'visible' })
          .from(
            '[data-hero-subject]',
            {
              scale: 1.06,
              yPercent: 2.5,
              duration: 2.4,
              transformOrigin: '70% 100%',
            },
            0,
          )
          .from(lines, { yPercent: 112, duration: 1.5, stagger: 0.12 }, 0.12)
          .from(
            rest,
            { autoAlpha: 0, y: 22, duration: 1.2, stagger: 0.1 },
            0.5,
          );
      });
    };

    const curtainActive =
      document.documentElement.getAttribute('data-curtain') === 'on';
    const fallback = window.setTimeout(play, curtainActive ? 2600 : 0);
    window.addEventListener(CURTAIN_EVENT, play, { once: true });

    // Desktop scroll-out: copy lifts away while the subject holds, like a cut.
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_MOTION, () => {
      gsap.to('[data-hero-copy]', {
        yPercent: -18,
        autoAlpha: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom 20%',
          scrub: true,
        },
      });
      gsap.to('[data-hero-subject] img', {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener(CURTAIN_EVENT, play);
      mm.revert();
      ctx.revert();
    };
  }, []);

  return null;
}
