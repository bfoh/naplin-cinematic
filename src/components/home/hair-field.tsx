'use client';

import { useEffect, useRef } from 'react';

import { registerGsap } from '@/lib/gsap';

/**
 * Animates the closing chapter's hair texture with the scroll. Sits beside
 * the static <img> inside the parallax layer; loads only as the section
 * approaches and never with reduced motion or Save-Data.
 */
export function HairField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const section = layer?.closest('section');
    const image = layer?.parentElement?.querySelector('img');
    if (!layer || !section || !image) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (
      connection?.saveData ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

    let disposed = false;
    let dispose: (() => void) | null = null;
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        approach.disconnect();
        import('./hair-field-scene')
          .then(({ createHairField }) => {
            if (disposed) return;
            registerGsap();
            try {
              dispose = createHairField(layer, { image, section });
            } catch {
              // The static image remains.
            }
          })
          .catch(() => {});
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
