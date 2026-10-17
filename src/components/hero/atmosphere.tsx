'use client';

import { useEffect, useRef } from 'react';

/**
 * Hero atmosphere and animated hair. The CSS still behind this layer and the
 * portrait <img> are always present; the scene creates its own canvas, fades
 * it in after the first frame and takes over the portrait only once ready.
 * Three.js loads lazily, never on Save-Data or without WebGL2.
 */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;

    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches;
    let disposed = false;
    let dispose: (() => void) | null = null;

    let retry = 0;
    const start = () => {
      import('./atmosphere-scene')
        .then(({ createHeroScene }) => {
          const attempt = () => {
            if (disposed) return null;
            const subject = document.querySelector<HTMLImageElement>(
              '#hero [data-hero-subject] img',
            );
            try {
              return createHeroScene(layer, { animate, subject });
            } catch {
              return null; // the CSS still and the <img> remain
            }
          };
          dispose = attempt();
          // A context can come back lost while the GPU is busy (seen in
          // Safari); try once more on a fresh canvas before settling.
          if (!dispose)
            retry = window.setTimeout(() => (dispose = attempt()), 1500);
        })
        .catch(() => {});
    };

    const hasIdle = 'requestIdleCallback' in window;
    const idle = hasIdle
      ? window.requestIdleCallback(start, { timeout: 1800 })
      : window.setTimeout(start, 700);

    return () => {
      disposed = true;
      window.clearTimeout(retry);
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      dispose?.();
    };
  }, []);

  return <div ref={ref} className="hero-scene" aria-hidden="true" />;
}
