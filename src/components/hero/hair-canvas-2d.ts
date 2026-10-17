import { gsap } from '@/lib/gsap';
import { decodeChosenImage } from '@/lib/webgl';

import { createHairScroll, HAIR, hairReach, hairWeight } from './hair-motion';

const COLUMN = 4; // device pixels per redrawn column

/**
 * No-WebGL fallback for the hero hair (e.g. browsers with WebGL disabled).
 * Redraws the portrait over its <img> in narrow columns, each shifted
 * vertically by the shared motion model, so the hair swings, lifts and
 * ripples with the scroll while everything right of the shoulder line is
 * drawn once, untouched. The photograph is scaled once into a buffer at the
 * canvas size, so each frame is plain 1:1 copies of the hair region only.
 * If drawing still proves slow it lowers resolution, then frame rate, and
 * finally redraws only while the scroll moves the hair.
 */
export function createHairCanvas2D(subject: HTMLImageElement) {
  const inner = subject.closest<HTMLElement>('[data-hero-subject-inner]');
  const wrapper = subject.closest<HTMLElement>('[data-hero-subject]');
  const section = subject.closest('section');
  if (!inner || !wrapper || !section) return null;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  // The portrait, scaled once to the canvas size.
  const buffer = document.createElement('canvas');
  const bufferCtx = buffer.getContext('2d');
  if (!ctx || !bufferCtx) return null;
  inner.appendChild(canvas);

  const scroll = createHairScroll(section);
  let source: HTMLImageElement | null = null;
  let disposed = false;
  let ratio = Math.min(window.devicePixelRatio, 1.5);
  let fps = 30;
  let scrollOnly = false;
  let width = 0;
  let height = 0;
  let stillFrom = 0;
  let columns: { x: number; w: number; reach: number }[] = [];

  // Column weights depend only on layout, so compute them on resize; the
  // still part right of the shoulder line is drawn here, once.
  const layout = () => {
    width = Math.max(1, Math.round(subject.clientWidth * ratio));
    height = Math.max(1, Math.round(subject.clientHeight * ratio));
    canvas.width = width;
    canvas.height = height;
    columns = [];
    stillFrom = width;
    if (!source) return;
    buffer.width = width;
    buffer.height = height;
    bufferCtx.imageSmoothingQuality = 'high';
    bufferCtx.drawImage(source, 0, 0, width, height);
    for (let x = 0; x < width; x += COLUMN) {
      const u = (x + COLUMN / 2) / width;
      if (u >= 0.6) {
        stillFrom = x;
        break;
      }
      columns.push({
        x,
        w: hairWeight(u, 0.55),
        reach: hairReach(u, 0.55),
      });
    }
    if (stillFrom < width)
      ctx.drawImage(
        buffer,
        stillFrom,
        0,
        width - stillFrom,
        height,
        stillFrom,
        0,
        width - stillFrom,
        height,
      );
  };

  let elapsed = 0;
  let amp = 0;
  const draw = () => {
    if (!source || !width) return;
    const { lift, wave, boost, toss } = scroll.state;
    ctx.clearRect(0, 0, stillFrom, height);
    for (const c of columns) {
      const swing = Math.sin(elapsed * 1.5 - c.reach * 2.6) * HAIR.swing * amp;
      const ripple = Math.sin(c.reach * 9 - wave) * HAIR.ripple * (0.6 + boost);
      const dy =
        -(swing + lift * HAIR.lift + toss * HAIR.toss + ripple) * c.w * height;
      ctx.drawImage(buffer, c.x, 0, COLUMN, height, c.x, dy, COLUMN, height);
      // Lifted columns would leave a sliver at the base: extend the last rows.
      if (dy < -0.5) {
        ctx.drawImage(
          buffer,
          c.x,
          height - 2,
          COLUMN,
          2,
          c.x,
          height + dy - 0.5,
          COLUMN,
          -dy + 1,
        );
      }
    }
  };

  // Drawing-cost governor (median of 30 frames): lower resolution, then
  // 20 fps, then stop the idle swing and redraw only for the scroll.
  let costs: number[] = [];
  let level = 0;
  const govern = (ms: number) => {
    if (scrollOnly) return;
    costs.push(ms);
    if (costs.length < 30) return;
    costs.sort((a, b) => a - b);
    const median = costs[15] ?? 0;
    costs = [];
    if (median <= 10) return;
    level += 1;
    if (level === 1) {
      ratio = 1;
      layout();
    } else if (level === 2) fps = 20;
    else scrollOnly = true;
  };

  let inView = true;
  let pending = 0;
  const tick = (_time: number, deltaMs: number) => {
    if (!inView || !source) return;
    const moving = scroll.update(deltaMs);
    if (scrollOnly && !moving) return;
    pending += deltaMs;
    if (pending < 1000 / fps) return;
    const seconds = Math.min(pending, 64) / 1000;
    pending = 0;
    if (!scrollOnly) {
      elapsed += seconds;
      amp = Math.min(1, amp + seconds / 2.5); // idle swing grows from stillness
    }
    const start = performance.now();
    draw();
    govern(performance.now() - start);
  };

  const resize = new ResizeObserver(() => {
    layout();
    draw();
  });
  const intersection = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting);
  });

  decodeChosenImage(subject)
    .then((decoded) => {
      if (disposed || !decoded) return;
      source = decoded;
      layout();
      draw(); // identical to the <img> at rest, so the swap is invisible
      wrapper.dataset.gl = 'on';
      resize.observe(subject);
      intersection.observe(canvas);
      gsap.ticker.add(tick);
    })
    .catch(() => canvas.remove());

  return () => {
    disposed = true;
    gsap.ticker.remove(tick);
    resize.disconnect();
    intersection.disconnect();
    scroll.kill();
    delete wrapper.dataset.gl;
    canvas.remove();
  };
}
