/**
 * Creates and verifies a WebGL2 context on a fresh canvas. Returns null when
 * the context is unavailable or already lost, so callers can fall back
 * quietly instead of failing inside three.js (seen in Safari).
 */
export function createWebGL2Context(
  canvas: HTMLCanvasElement,
  attributes: WebGLContextAttributes,
) {
  const gl = canvas.getContext('webgl2', attributes);
  const usable =
    gl &&
    !gl.isContextLost() &&
    gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT) &&
    gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  return usable ? gl : null;
}

/**
 * Decodes the file an <img> actually chose. A srcset image reports a
 * density-corrected naturalWidth rather than its pixel size, which breaks
 * texture allocation; a plain Image of the same (cached) URL does not.
 */
export async function decodeChosenImage(img: HTMLImageElement) {
  const source = new Image();
  source.src = img.currentSrc || img.src;
  await source.decode();
  return source.naturalWidth ? source : null;
}

/**
 * Steps a scene's quality down when the device genuinely struggles. Feed it
 * each frame's delta while the scene animates. After a ~2 s warm-up it takes
 * the MEDIAN of ~1.5 s windows, so one-off long tasks (page start-up, text
 * splitting, shader compilation) are not mistaken for a slow GPU. Two slow
 * windows in a row step down one level: below ~42 fps for the intermediate
 * levels, below ~25 fps before the final level (a held still frame).
 */
export function createQualityGovernor(
  levels: number,
  apply: (level: number) => void,
) {
  let level = 0;
  let warmup = 120;
  let window: number[] = [];
  let slowStreak = 0;
  return (deltaMs: number) => {
    if (level >= levels) return;
    if (warmup > 0) {
      warmup -= 1;
      return;
    }
    window.push(deltaMs);
    if (window.length < 90) return;
    window.sort((a, b) => a - b);
    const median = window[window.length >> 1] ?? 0;
    window = [];
    const limit = level + 1 >= levels ? 40 : 24;
    slowStreak = median > limit ? slowStreak + 1 : 0;
    if (slowStreak >= 2) {
      slowStreak = 0;
      level += 1;
      warmup = 60;
      apply(level);
    }
  };
}

/** False on Save-Data and on devices reporting under 4 GB of memory. */
export function canUseHeavyGraphics() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4)
    return false;
  return true;
}

export type PreparedCanvas = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
};

/**
 * Appends a fresh canvas and verifies a WebGL2 context on it, before any
 * rendering library is downloaded. Returns null (and cleans up) if unusable.
 */
export function prepareCanvas(
  container: HTMLElement,
  attributes: WebGLContextAttributes,
): PreparedCanvas | null {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);
  const gl = createWebGL2Context(canvas, attributes);
  if (!gl) {
    canvas.remove();
    return null;
  }
  return { canvas, gl };
}

/** Frees a prepared canvas that will not be used. */
export function releaseCanvas({ canvas, gl }: PreparedCanvas) {
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  canvas.remove();
}

/** Runs `task` once the page has loaded and the main thread is idle. */
export function afterLoadAndIdle(task: () => void, timeout = 2500) {
  let idle = 0;
  let timer = 0;
  const hasIdle = 'requestIdleCallback' in window;
  const schedule = () => {
    if (hasIdle) idle = window.requestIdleCallback(task, { timeout });
    else timer = window.setTimeout(task, 900);
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  return () => {
    window.removeEventListener('load', schedule);
    if (hasIdle && idle) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
}
