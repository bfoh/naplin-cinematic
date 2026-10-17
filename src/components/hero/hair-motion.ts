import { ScrollTrigger } from '@/lib/gsap';

/**
 * One motion model for the hero hair, shared by the WebGL shader and the 2D
 * canvas fallback. Amplitudes are fractions of the portrait's height at the
 * hair tips; the roots, face, neck, shoulder and gown never move.
 */
export const HAIR = {
  /** Idle swing, always running. */
  swing: 0.016,
  /** Lift: as the visitor scrolls down through the hero, the tips rise and
      sweep outward; scrolling back up lowers them again. */
  lift: 0.075,
  /** Toss: scrolling flicks the tips up and out (down and in when scrolling
      back); when the scroll stops they swing past rest and settle. */
  toss: 0.045,
  /** Ripples that travel from roots to tips with the scroll. */
  ripple: 0.012,
  /** Ripple phase advanced over one full scroll of the hero (radians). */
  rippleTravel: 18,
} as const;

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** 0 at the roots behind the head, 1 at the far tips (portrait UV, y from top). */
export function hairReach(u: number, vTop: number) {
  const dx = u - 0.62;
  const dy = (vTop - 0.2) * 0.9;
  return Math.min(1, Math.max(0, (Math.hypot(dx, dy) - 0.1) / 0.58));
}

/** How much a point may move: 0 at the roots and right of the shoulder line. */
export function hairWeight(u: number, vTop: number) {
  const r = hairReach(u, vTop);
  return r * r * (3 - 2 * r) * smoothstep(0.6, 0.45, u);
}

export type HairScroll = {
  /** Eased values, updated by `update`. `toss` is a spring, roughly -1..1. */
  state: { lift: number; wave: number; boost: number; toss: number };
  /** Advance easing by `deltaMs`; returns true while anything still moves. */
  update: (deltaMs: number) => boolean;
  kill: () => void;
};

// Toss spring: about 1.1 swings a second, lightly damped so it overshoots.
const TOSS_OMEGA = 2 * Math.PI * 1.1;
const TOSS_DAMPING = 0.32;

/**
 * Follows the scroll through the hero section. Lift and ripples ease toward
 * their targets (~90% within 0.3 s), so the hair responds immediately but
 * never jumps; the toss is a spring driven by scroll speed, so the hair
 * visibly swings back and settles after every scroll.
 */
export function createHairScroll(section: Element): HairScroll {
  let progress = 0;
  let velocity = 0; // px/s, signed: positive while scrolling down
  let lastScroll = 0;
  let tossSpeed = 0;
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      progress = self.progress;
      velocity = self.getVelocity();
      lastScroll = performance.now();
    },
  });
  progress = trigger.progress;

  const state = {
    lift: smoothstep(0, 0.55, progress),
    wave: progress * HAIR.rippleTravel,
    boost: 0,
    toss: 0,
  };

  return {
    state,
    update(deltaMs) {
      const dt = Math.min(deltaMs, 64) / 1000;
      const k = 1 - Math.pow(0.0005, dt);
      const scrolling = performance.now() - lastScroll < 150;
      const lift = smoothstep(0, 0.55, progress);
      const wave = progress * HAIR.rippleTravel;
      const boost = scrolling ? Math.min(Math.abs(velocity) / 1800, 1) : 0;
      state.lift += (lift - state.lift) * k;
      state.wave += (wave - state.wave) * k;
      state.boost += (boost - state.boost) * k * 0.6;

      // Spring toward a target set by scroll speed (rest when idle).
      const toss = scrolling ? Math.max(-1, Math.min(1, velocity / 1600)) : 0;
      for (let step = 0; step < 2; step += 1) {
        const h = dt / 2;
        tossSpeed +=
          (TOSS_OMEGA * TOSS_OMEGA * (toss - state.toss) -
            2 * TOSS_DAMPING * TOSS_OMEGA * tossSpeed) *
          h;
        state.toss = Math.max(-1.3, Math.min(1.3, state.toss + tossSpeed * h));
      }
      return (
        Math.abs(lift - state.lift) > 1e-4 ||
        Math.abs(wave - state.wave) > 1e-3 ||
        state.boost > 1e-3 ||
        Math.abs(state.toss - toss) > 1e-3 ||
        Math.abs(tossSpeed) > 1e-3
      );
    },
    kill: () => trigger.kill(),
  };
}
