'use client';

import { useEffect, useRef } from 'react';

import { CURTAIN_EVENT } from '@/lib/events';
import { gsap, registerGsap } from '@/lib/gsap';
import styles from './curtain.module.css';

const WORD = 'Hair By Naplin';
const MAX_WAIT_MS = 1800;

function heroImageReady() {
  const img = document.querySelector<HTMLImageElement>('#hero img');
  if (!img) return Promise.resolve();
  if (img.complete) return img.decode().catch(() => undefined);
  return new Promise<void>((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
}

/**
 * First-visit curtain on the homepage. The boot script decides whether it
 * shows; its rule tracks real readiness (fonts, hero image) and it lifts as
 * soon as both are ready, or after 1.8s at most. A CSS failsafe hides it even
 * if this script never runs.
 */
export function Curtain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = ref.current;
    if (!el || html.getAttribute('data-curtain') !== 'on') return;
    registerGsap();

    const rule = el.querySelector('[data-rule]');
    const letters = el.querySelectorAll('[data-letter]');
    const progress = { value: 0 };
    const draw = () => gsap.set(rule, { scaleX: progress.value });
    let lifted = false;

    const intro = gsap.from(letters, {
      yPercent: 110,
      duration: 1.1,
      stagger: 0.035,
      delay: 0.1,
    });

    const steps = [document.fonts.ready, heroImageReady()];
    let settled = 0;
    steps.forEach((step) =>
      step.then(() => {
        settled += 1;
        gsap.to(progress, {
          value: settled / steps.length,
          duration: 0.5,
          onUpdate: draw,
        });
      }),
    );

    const lift = () => {
      if (lifted) return;
      lifted = true;
      try {
        sessionStorage.setItem('naplin-curtain', '1');
      } catch {}
      gsap
        .timeline({ onComplete: () => html.removeAttribute('data-curtain') })
        .to(progress, { value: 1, duration: 0.3, onUpdate: draw })
        .add(() => window.dispatchEvent(new Event(CURTAIN_EVENT)))
        .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=0.05');
    };

    const cap = window.setTimeout(lift, MAX_WAIT_MS);
    Promise.all(steps).then(lift);

    return () => {
      window.clearTimeout(cap);
      intro.kill();
    };
  }, []);

  return (
    <div ref={ref} className={styles.curtain} aria-hidden="true">
      <p className={`display ${styles.word}`}>
        {[...WORD].map((char, index) => (
          <span key={index} className={styles.mask}>
            <span data-letter className={styles.letter}>
              {char === ' ' ? ' ' : char}
            </span>
          </span>
        ))}
      </p>
      <span className={styles.rule}>
        <span data-rule />
      </span>
    </div>
  );
}
