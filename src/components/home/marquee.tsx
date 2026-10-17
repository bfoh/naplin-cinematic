'use client';

import { Fragment, useEffect, useRef } from 'react';

import {
  gsap,
  prefersReducedMotion,
  registerGsap,
  ScrollTrigger,
} from '@/lib/gsap';
import styles from './marquee.module.css';

const BASE_SPEED = 46; // px per second

export function Marquee({ items }: { items: readonly string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    const row = track.current;
    if (!el || !row || prefersReducedMotion()) return;

    let x = 0;
    let boost = 0;
    let direction = 1;
    let visible = false;
    const setX = gsap.quickSetter(row, 'x', 'px');

    const tick = (_time: number, deltaMs: number) => {
      if (!visible) return;
      const half = row.scrollWidth / 2;
      boost *= 0.94;
      x -= (BASE_SPEED * (1 + boost) * direction * deltaMs) / 1000;
      // Wrap within one group width so the loop is seamless.
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      setX(x);
    };

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (visible = self.isActive),
      onUpdate: (self) => {
        direction = self.direction;
        boost = Math.min(Math.abs(self.getVelocity()) / 260, 6);
      },
    });
    visible = trigger.isActive;

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
    };
  }, []);

  const sequence = items.map((item) => (
    <Fragment key={item}>
      <span className={styles.item}>{item}</span>
      <span className={styles.star}>✦</span>
    </Fragment>
  ));

  return (
    <div ref={root} className={styles.marquee}>
      <p className="sr-only">{items.join('. ')}.</p>
      <div ref={track} className={styles.track} aria-hidden="true">
        <div className={styles.group}>{sequence}</div>
        <div className={styles.group}>{sequence}</div>
      </div>
    </div>
  );
}
