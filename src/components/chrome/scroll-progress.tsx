'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';
import styles from './chrome.module.css';

/** Hairline reading progress across the top edge. */
export function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    const bar = ref.current;
    if (!bar) return;
    const set = gsap.quickSetter(bar, 'scaleX');
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => set(self.progress),
    });
    set(trigger.progress);
    return () => trigger.kill();
  }, [pathname]);

  return (
    <div className={styles.progress} aria-hidden="true">
      <span ref={ref} />
    </div>
  );
}
