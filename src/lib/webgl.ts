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
 * Steps a scene's quality down when the device struggles. Feed it each
 * frame's delta while the scene animates; after a warm-up it averages ~1.5 s
 * windows, and when frames run slower than ~42 fps it calls `apply` with the
 * next level (1…levels). Old integrated GPUs then degrade gracefully instead
 * of stuttering.
 */
export function createQualityGovernor(
  levels: number,
  apply: (level: number) => void,
) {
  let level = 0;
  let warmup = 45; // skip shader compilation and texture upload spikes
  let total = 0;
  let samples = 0;
  return (deltaMs: number) => {
    if (level >= levels) return;
    if (warmup > 0) {
      warmup -= 1;
      return;
    }
    total += deltaMs;
    samples += 1;
    if (samples < 90) return;
    const average = total / samples;
    total = 0;
    samples = 0;
    if (average > 24) {
      level += 1;
      warmup = 30;
      apply(level);
    }
  };
}
