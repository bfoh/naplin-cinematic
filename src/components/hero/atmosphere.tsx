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
 * portrait <img> are always present. Once the page has loaded and a WebGL2
 * context is verified, three.js renders both; without WebGL, a 2D-canvas
 * fallback still animates the hair. Nothing runs on Save-Data or with little
 * memory, and with reduced motion the portrait stays still.
 */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer || !canUseHeavyGraphics()) return;
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches;
    const subject = document.querySelector<HTMLImageElement>(
      '#hero [data-hero-subject] img',
    );
    let disposed = false;
    let dispose: (() => void) | null = null;
    let retry = 0;

    // Without WebGL the atmosphere stays the CSS still, but the hair still
    // moves: a 2D-canvas version of the same motion takes over the portrait.
    const startFallback = () => {
      if (disposed || !animate || !subject) return;
      import('./hair-canvas-2d')
        .then(({ createHairCanvas2D }) => {
          if (disposed) return;
          try {
            dispose = createHairCanvas2D(subject);
          } catch {
            dispose = null; // the static portrait remains
          }
        })
        .catch(() => {});
    };

    const attempt = () => {
      if (disposed) return true;
      const prepared = prepareCanvas(layer, HERO_CONTEXT);
      if (!prepared) return false;
      import('./atmosphere-scene')
        .then(({ createHeroScene }) => {
          if (disposed) return releaseCanvas(prepared);
          try {
            dispose = createHeroScene(prepared, { animate, subject });
          } catch {
            dispose = null;
          }
          if (!dispose) {
            releaseCanvas(prepared);
            startFallback();
          }
        })
        .catch(() => {
          releaseCanvas(prepared);
          startFallback();
        });
      return true;
    };

    const cancelSchedule = afterLoadAndIdle(() => {
      // A context can come back lost while the GPU is busy (seen in Safari):
      // try once more on a fresh canvas, then fall back to the 2D hair.
      if (attempt()) return;
      retry = window.setTimeout(() => {
        if (!attempt()) startFallback();
      }, 1500);
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
