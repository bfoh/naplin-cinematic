'use client';

import { useEffect, useRef } from 'react';

import { gsap, MOTION_OK, registerGsap } from '@/lib/gsap';
import { canUseHeavyGraphics, prepareCanvas, releaseCanvas } from '@/lib/webgl';

const FIELD_CONTEXT: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: 'low-power',
};

/**
 * Animates the closing chapter's hair texture with the scroll. A turning,
 * drifting sweep runs on every device with motion allowed; where WebGL2 is
 * available, strand waves are added on top (three.js downloads only after a
 * context is verified; never with reduced motion, Save-Data or little memory).
 */
export function HairField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const section = layer?.closest('section');
    const wrapper = layer?.parentElement;
    const image = wrapper?.querySelector('img');
    if (!layer || !section || !wrapper || !image) return;
    registerGsap();

    // Every device (no WebGL needed): the hair texture turns and drifts as
    // the section scrolls through. Scale keeps the edges covered throughout.
    const sweep = gsap.matchMedia();
    sweep.add(MOTION_OK, () => {
      gsap.fromTo(
        wrapper,
        { rotate: -3.5, scale: 1.28, xPercent: -2, yPercent: -6 },
        {
          rotate: 3.5,
          scale: 1.2,
          xPercent: 2,
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      );
    });

    if (
      !canUseHeavyGraphics() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return () => sweep.revert();

    let disposed = false;
    let dispose: (() => void) | null = null;
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        approach.disconnect();
        const prepared = prepareCanvas(layer, FIELD_CONTEXT);
        if (!prepared) return; // the static image remains
        import('./hair-field-scene')
          .then(({ createHairField }) => {
            if (disposed) return releaseCanvas(prepared);
            try {
              dispose = createHairField(prepared, { image, section });
            } catch {
              dispose = null;
            }
            if (!dispose) releaseCanvas(prepared);
          })
          .catch(() => releaseCanvas(prepared));
      },
      { rootMargin: '100% 0px' },
    );
    approach.observe(section);

    return () => {
      disposed = true;
      approach.disconnect();
      dispose?.();
      sweep.revert();
    };
  }, []);

  return <div ref={ref} className="hair-field-layer" aria-hidden="true" />;
}
