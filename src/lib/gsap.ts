import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;

/** Registers plugins once, in the browser only. Call from effects. */
export function registerGsap() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // One weighted easing language for the whole site.
  gsap.defaults({ ease: 'expo.out', duration: 1.2 });
  // Mobile URL-bar resizes should not re-measure every trigger.
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const TABLET_UP_MOTION =
  '(min-width: 768px) and (prefers-reduced-motion: no-preference)';
export const PHONE_MOTION =
  '(max-width: 767px) and (prefers-reduced-motion: no-preference)';
export const DESKTOP_MOTION =
  '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger, SplitText };
