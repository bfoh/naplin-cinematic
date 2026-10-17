'use client';

import { useEffect, useRef } from 'react';

import { gsap, registerGsap } from '@/lib/gsap';
import styles from './chrome.module.css';

const FINE_POINTER =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const INTERACTIVE = 'a, button, [role="button"], input, label';
const MAGNET_STRENGTH = 0.22;
const MAGNET_MAX = 10;

/**
 * Desktop-only refinements: a thin ring that follows the native cursor (which
 * stays visible) and a gentle magnetic pull on [data-magnetic] actions.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ref.current;
    if (!ring || !window.matchMedia(FINE_POINTER).matches) return;
    registerGsap();

    const xTo = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    let magnet: HTMLElement | null = null;

    const release = () => {
      if (magnet)
        gsap.to(magnet, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
        });
      magnet = null;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      xTo(event.clientX);
      yTo(event.clientY);
      ring.dataset.visible = 'true';
      const target = event.target instanceof Element ? event.target : null;
      ring.dataset.active = target?.closest(INTERACTIVE) ? 'true' : 'false';

      const next = target?.closest<HTMLElement>('[data-magnetic]') ?? null;
      if (next !== magnet) release();
      magnet = next;
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        const dx = gsap.utils.clamp(
          -MAGNET_MAX,
          MAGNET_MAX,
          (event.clientX - (box.left + box.width / 2)) * MAGNET_STRENGTH,
        );
        const dy = gsap.utils.clamp(
          -MAGNET_MAX,
          MAGNET_MAX,
          (event.clientY - (box.top + box.height / 2)) * MAGNET_STRENGTH,
        );
        gsap.to(magnet, { x: dx, y: dy, duration: 0.5, ease: 'power3' });
      }
    };
    const onLeave = () => {
      ring.dataset.visible = 'false';
      release();
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      release();
    };
  }, []);

  return <div ref={ref} className={styles.cursor} aria-hidden="true" />;
}
