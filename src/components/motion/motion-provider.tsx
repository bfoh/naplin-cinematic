'use client';

import type Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';
import { RevealController } from './reveal-controller';

type MotionContextValue = {
  /** Present only on desktop fine-pointer devices without reduced motion. */
  lenis: Lenis | null;
};

const MotionContext = createContext<MotionContextValue>({ lenis: null });

export const useMotion = () => useContext(MotionContext);

// Smooth wheel scrolling is a desktop refinement only. Touch keeps native scroll.
const SMOOTH_QUERY =
  '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function MotionProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    document.documentElement.classList.add('motion-ready');

    const query = window.matchMedia(SMOOTH_QUERY);
    // Lenis is driven by the single GSAP ticker: no second RAF loop.
    const tick = (time: number) => lenisRef.current?.raf(time * 1000);

    let cancelled = false;
    let loading = false;
    // Lenis is loaded only where it is used (desktop), never on phones.
    const start = () => {
      if (lenisRef.current || loading) return;
      loading = true;
      import('lenis')
        .then(({ default: LenisClass }) => {
          loading = false;
          if (cancelled || lenisRef.current || !query.matches) return;
          const instance = new LenisClass({
            autoRaf: false,
            lerp: 0.1,
            anchors: { offset: -72 },
            stopInertiaOnNavigate: true,
          });
          instance.on('scroll', ScrollTrigger.update);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
          lenisRef.current = instance;
          setLenis(instance);
        })
        .catch(() => {
          loading = false; // native scrolling remains
        });
    };

    const stop = () => {
      if (!lenisRef.current) return;
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenisRef.current.destroy();
      lenisRef.current = null;
      setLenis(null);
    };

    const sync = () => (query.matches ? start() : stop());
    sync();
    query.addEventListener('change', sync);
    return () => {
      cancelled = true;
      query.removeEventListener('change', sync);
      stop();
    };
  }, []);

  // Each route starts at the top (unless it targets a hash) and re-measures.
  useEffect(() => {
    if (!window.location.hash)
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <MotionContext.Provider value={{ lenis }}>
      {children}
      <RevealController key={pathname} />
    </MotionContext.Provider>
  );
}
