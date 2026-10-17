'use client';

import { useEffect, useRef } from 'react';

import {
  afterLoadAndIdle,
  canUseHeavyGraphics,
  prepareCanvas,
  releaseCanvas,
} from '@/lib/webgl';

// Must suit createHeroScene: opaque canvas, premultiplied portrait blending.
const HERO_CONTEXT: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: true,
  powerPreference: 'default',
};

/**
 * Hero atmosphere and animated hair. The CSS still behind this layer and the
 * portrait <img> are always present. Only once the page has loaded and a
 * WebGL2 context is verified does three.js download; devices without WebGL,
 * on Save-Data or with little memory never fetch it.
 */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer || !canUseHeavyGraphics()) return;
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches;
    let disposed = false;
    let dispose: (() => void) | null = null;
    let retry = 0;

    const attempt = () => {
      if (disposed) return true;
      const prepared = prepareCanvas(layer, HERO_CONTEXT);
      if (!prepared) return false;
      import('./atmosphere-scene')
        .then(({ createHeroScene }) => {
          if (disposed) return releaseCanvas(prepared);
          const subject = document.querySelector<HTMLImageElement>(
            '#hero [data-hero-subject] img',
          );
          try {
            dispose = createHeroScene(prepared, { animate, subject });
          } catch {
            dispose = null;
          }
          if (!dispose) releaseCanvas(prepared); // the CSS still remains
        })
        .catch(() => releaseCanvas(prepared));
      return true;
    };

    const cancelSchedule = afterLoadAndIdle(() => {
      // A context can come back lost while the GPU is busy (seen in Safari);
      // try once more on a fresh canvas before settling on the still.
      if (!attempt()) retry = window.setTimeout(attempt, 1500);
    });

    return () => {
      disposed = true;
      cancelSchedule();
      window.clearTimeout(retry);
      dispose?.();
    };
  }, []);

  return <div ref={ref} className="hero-scene" aria-hidden="true" />;
}
