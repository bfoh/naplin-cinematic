import {
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  WebGLRenderer,
} from 'three';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import {
  createQualityGovernor,
  decodeChosenImage,
  type PreparedCanvas,
} from '@/lib/webgl';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// The macro hair photograph, drawn like object-fit: cover. Scroll pushes slow
// waves along the strands and a soft shine across them; faster scrolling stirs
// them a little more.
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uCover;
  uniform float uPhase;
  uniform float uStir;
  uniform float uAmp;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    // 3% inset keeps displaced samples inside the photograph's edges.
    vec2 uv = (vUv - 0.5) * uCover * 0.97 + 0.5;
    float p = uPhase;
    float n = noise(uv * 3.0 + vec2(p * 0.15, -p * 0.1));

    vec2 d = vec2(sin(uv.y * 8.0 + p * 1.2 + n * 2.0),
                  cos(uv.x * 6.0 - p * 0.9 + n * 1.5));
    d *= (0.006 + 0.007 * uStir) * uAmp;
    vec3 col = texture2D(uMap, uv + d).rgb;

    // Shine travelling across the strands; it brightens existing highlights.
    float lane = dot(uv, vec2(0.8, 0.6)) * 1.6 - p * 0.22 + n * 0.15;
    float sheen = pow(1.0 - abs(2.0 * fract(lane) - 1.0), 6.0);
    col += col * sheen * 0.35 * uAmp;

    gl_FragColor = vec4(col, 1.0);
  }
`;

type Options = { image: HTMLImageElement; section: HTMLElement };

/**
 * Scroll-driven hair movement for the closing chapter, drawn over the static
 * <img> on a prepared canvas whose WebGL2 context is already verified.
 * Returns a disposer, or null if three.js cannot start.
 */
export function createHairField(
  { canvas, gl }: PreparedCanvas,
  { image, section }: Options,
) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, context: gl });
  } catch {
    return null; // the caller releases the canvas
  }

  const compact = window.matchMedia(
    '(pointer: coarse), (max-width: 767px)',
  ).matches;
  // The field sits behind a veil, so it never needs full resolution.
  const baseRatio = compact ? 1 : Math.min(window.devicePixelRatio, 1.5) * 0.8;
  renderer.setPixelRatio(baseRatio);

  const uniforms = {
    uMap: { value: null as Texture | null },
    uCover: { value: new Vector2(1, 1) },
    uPhase: { value: 0 },
    uStir: { value: 0 },
    uAmp: { value: 0 },
  };
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let texture: Texture | null = null;
  let disposed = false;
  const render = () => {
    if (texture) renderer.render(scene, camera);
  };

  // Matches the <img>'s object-fit: cover, centred.
  const fit = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const source = texture?.image as HTMLImageElement | undefined;
    if (source?.naturalWidth) {
      const box = width / height;
      const art = source.naturalWidth / source.naturalHeight;
      uniforms.uCover.value.set(
        box > art ? 1 : box / art,
        box > art ? art / box : 1,
      );
    }
    render();
  };
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(canvas);

  decodeChosenImage(image)
    .then((source) => {
      if (disposed || !source) return;
      texture = new Texture(source);
      texture.colorSpace = NoColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.needsUpdate = true;
      uniforms.uMap.value = texture;
      fit();
      canvas.dataset.ready = 'true';
      // Grow the movement from stillness so the hand-over is invisible.
      gsap.to(uniforms.uAmp, {
        value: 1,
        duration: 1.8,
        delay: 0.9,
        ease: 'power2.inOut',
      });
    })
    .catch(() => {});

  // Scroll drives the phase; the shader eases toward it, so the hair keeps
  // drifting briefly after scrolling stops, then settles.
  let targetPhase = 0;
  let targetStir = 0;
  let lastScroll = 0;
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      targetPhase = self.progress * 6;
      targetStir = Math.min(Math.abs(self.getVelocity()) / 2500, 1);
      lastScroll = performance.now();
    },
  });
  targetPhase = trigger.progress * 6;
  uniforms.uPhase.value = targetPhase;

  let inView = false;
  let pending = 0;
  let drift = 0;
  let frameInterval = compact ? 1000 / 30 : 0;
  // Older GPUs: lower resolution, then 30 fps, then hold a still frame.
  const govern = createQualityGovernor(3, (level) => {
    if (level === 1) {
      renderer.setPixelRatio(baseRatio * 0.65);
      fit();
    } else if (level === 2) {
      frameInterval = Math.max(frameInterval, 1000 / 30);
    } else {
      gsap.ticker.remove(tick);
    }
  });
  const tick = (_time: number, deltaMs: number) => {
    if (!inView || !texture) return;
    // Phones render only while something moves; idle frames cost nothing.
    const settling =
      Math.abs(targetPhase + drift - uniforms.uPhase.value) > 0.0005 ||
      uniforms.uStir.value > 0.002 ||
      gsap.isTweening(uniforms.uAmp);
    if (compact && !settling) return;
    govern(deltaMs);
    pending += deltaMs;
    if (pending < frameInterval) return;
    const seconds = Math.min(pending, 64) / 1000;
    pending = 0;
    if (performance.now() - lastScroll > 160) targetStir = 0;
    if (!compact) drift += seconds * 0.05; // barely-there breathing when idle
    const ease = 1 - Math.pow(0.04, seconds); // frame-rate independent
    uniforms.uPhase.value +=
      (targetPhase + drift - uniforms.uPhase.value) * ease;
    uniforms.uStir.value += (targetStir - uniforms.uStir.value) * ease;
    render();
  };
  gsap.ticker.add(tick);

  const intersection = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting);
  });
  intersection.observe(canvas);
  const onContextLost = (event: Event) => {
    event.preventDefault();
    canvas.dataset.ready = 'false';
    gsap.ticker.remove(tick);
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  return () => {
    disposed = true;
    gsap.ticker.remove(tick);
    gsap.killTweensOf(uniforms.uAmp);
    trigger.kill();
    intersection.disconnect();
    resizeObserver.disconnect();
    canvas.removeEventListener('webglcontextlost', onContextLost);
    texture?.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
