'use client';

import { useEffect, useRef } from 'react';

import { registerGsap } from '@/lib/gsap';
import { canUseHeavyGraphics, prepareCanvas, releaseCanvas } from '@/lib/webgl';

const FIELD_CONTEXT: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: 'low-power',
};

/**
 * Animates the closing chapter's hair texture with the scroll. Sits beside
 * the static <img> inside the parallax layer. Nothing is created until the
 * section approaches, and three.js downloads only after a WebGL2 context is
 * verified; never with reduced motion, Save-Data or little memory.
 */
export function HairField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const section = layer?.closest('section');
    const image = layer?.parentElement?.querySelector('img');
    if (!layer || !section || !image) return;
    if (
      !canUseHeavyGraphics() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

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
            registerGsap();
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
    };
  }, []);

  return <div ref={ref} className="hair-field-layer" aria-hidden="true" />;
}
