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
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';

import { gsap } from '@/lib/gsap';
import {
  createQualityGovernor,
  createWebGL2Context,
  decodeChosenImage,
} from '@/lib/webgl';

const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Slow domain-warped noise in ink, oxblood and burgundy, with soft sheens like
// light moving through silk or hair. Rendered at reduced resolution.
const atmosphereFragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec2 uFocus;
  uniform float uShadeLeft;
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

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.045;

    vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p * 1.5 + 2.4 * q + vec2(1.7, 9.2) + t * 0.6),
                  fbm(p * 1.5 + 2.4 * q + vec2(8.3, 2.8) - t * 0.4));
    float f = fbm(p * 1.15 + 2.8 * r + uPointer * 0.08);

    vec2 focusDelta = (uv - uFocus - uPointer * 0.025) * vec2(aspect, 1.0);
    float glow = exp(-1.35 * length(focusDelta));

    vec3 ink = vec3(0.039, 0.035, 0.043);
    vec3 wineDeep = vec3(0.165, 0.047, 0.082);
    vec3 oxblood = vec3(0.286, 0.090, 0.129);
    vec3 burgundy = vec3(0.396, 0.122, 0.196);
    vec3 champagne = vec3(0.784, 0.659, 0.471);

    vec3 col = mix(ink, wineDeep, smoothstep(0.08, 0.62, f) * (0.55 + 0.45 * glow));
    col = mix(col, oxblood, smoothstep(0.3, 0.86, f) * (0.3 + 0.7 * glow));
    col = mix(col, burgundy, smoothstep(0.5, 0.95, f) * glow * 0.9);
    col += burgundy * glow * glow * 0.14;

    float band = 1.0 - abs(2.0 * fract(f * 2.2 + r.x - t * 0.35) - 1.0);
    float sheen = smoothstep(0.72, 1.0, band) * smoothstep(0.35, 0.8, fbm(p * 2.2 - r));
    col += champagne * sheen * glow * 0.05;

    col *= mix(1.0, 0.6, smoothstep(0.55, 0.0, uv.x) * uShadeLeft);
    vec2 v = (uv - 0.5) * vec2(1.05, 1.2);
    col *= 1.0 - 0.5 * dot(v, v);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Upscales the low-resolution atmosphere and dithers at full resolution.
const blitFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  void main() {
    vec3 col = texture2D(uMap, vUv).rgb;
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// The hero portrait, placed exactly over its <img>. The quad extends left of
// the image so moving tips can travel past the original frame.
const subjectVertex = /* glsl */ `
  uniform vec4 uRect; // image box in clip space: left, bottom, right, top
  uniform float uMarginLeft;
  varying vec2 vUv;
  void main() {
    vec2 t = position.xy * 0.5 + 0.5;
    vec2 size = uRect.zw - uRect.xy;
    vec2 lo = vec2(uRect.x - size.x * uMarginLeft, uRect.y);
    vec2 p = mix(lo, uRect.zw, t);
    vUv = (p - uRect.xy) / size;
    gl_Position = vec4(p, 0.0, 1.0);
  }
`;

// Hair movement: a slow swing travelling from the roots (behind her head) to
// the tips, a lighter ripple and fine strand drift. The weighting keeps the
// face, neck, shoulder and gown perfectly still.
const subjectFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
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
    vec2 uv = vUv;
    vec2 top = vec2(uv.x, 1.0 - uv.y); // y measured from the top

    // 0 at the roots behind the head, 1 at the far tips.
    float reach = clamp((length((top - vec2(0.62, 0.2)) * vec2(1.0, 0.9)) - 0.1) / 0.58, 0.0, 1.0);
    // Nothing right of the shoulder line moves.
    float body = smoothstep(0.6, 0.45, uv.x);
    float w = reach * reach * (3.0 - 2.0 * reach) * body;

    float t = uTime;
    float swing = sin(t * 1.5 - reach * 2.6);
    float ripple = sin(t * 2.7 - reach * 6.0 + top.y * 8.0);
    vec2 drift = vec2(noise(uv * vec2(3.0, 12.0) + t * 0.22),
                      noise(uv * vec2(3.0, 12.0) - t * 0.22 + 7.1)) - 0.5;

    vec2 d = vec2(0.38, -1.0) * swing * 0.021
           + vec2(0.0, 1.0) * ripple * 0.0045
           + drift * 0.006;

    vec2 suv = uv + d * w * uAmp;
    suv.y = max(suv.y, 0.0015); // never pull empty space in at the base
    vec4 c = texture2D(uMap, suv);
    if (suv.x < 0.0 || suv.x > 1.0 || suv.y > 1.0) c = vec4(0.0);
    // The source photo crops the hair at its left edge: feather it away.
    c *= smoothstep(0.0, 0.07, suv.x);
    gl_FragColor = c; // premultiplied
  }
`;

type Options = {
  animate: boolean;
  /** The hero portrait <img>; when present, its hair is animated in WebGL. */
  subject: HTMLImageElement | null;
};

/**
 * Builds the hero scene in a fresh canvas appended to `container`. Returns a
 * disposer, or null when WebGL2 is unavailable (the CSS still then remains).
 */
export function createHeroScene(
  container: HTMLElement,
  { animate, subject }: Options,
) {
  // A new canvas every time: a canvas whose context was lost can never
  // produce a working context again.
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  // Create and verify the context first, so an unusable one falls back
  // quietly instead of failing inside three.js.
  const gl = createWebGL2Context(canvas, {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: 'default',
  });
  if (!gl) {
    canvas.remove();
    return null;
  }

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, context: gl });
  } catch {
    canvas.remove();
    return null;
  }

  const compact = window.matchMedia(
    '(pointer: coarse), (max-width: 767px)',
  ).matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.autoClear = false;

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new PlaneGeometry(2, 2);

  // Atmosphere, rendered small and upscaled.
  const atmosphereUniforms = {
    uTime: { value: 18 },
    uResolution: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0, 0) },
    uFocus: { value: new Vector2(0.7, 0.56) },
    uShadeLeft: { value: 1 },
  };
  const atmosphereMaterial = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: atmosphereFragment,
    uniforms: atmosphereUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const atmosphereScene = new Scene();
  atmosphereScene.add(new Mesh(quad, atmosphereMaterial));
  const target = new WebGLRenderTarget(1, 1, {
    depthBuffer: false,
    stencilBuffer: false,
  });
  let targetScale = compact ? 0.35 : 0.5;

  // Main pass at full resolution: the upscaled atmosphere, then the portrait.
  const blitUniforms = { uMap: { value: target.texture }, uTime: { value: 0 } };
  const blitMaterial = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: blitFragment,
    uniforms: blitUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const mainScene = new Scene();
  mainScene.add(new Mesh(quad, blitMaterial));

  const subjectUniforms = {
    uMap: { value: null as Texture | null },
    uTime: { value: 0 },
    uAmp: { value: 0 },
    uRect: { value: new Vector4(0, 0, 0, 0) },
    uMarginLeft: { value: 0.08 },
  };
  const subjectMaterial = new ShaderMaterial({
    vertexShader: subjectVertex,
    fragmentShader: subjectFragment,
    uniforms: subjectUniforms,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
  });
  const subjectMesh = new Mesh(quad, subjectMaterial);
  subjectMesh.renderOrder = 1;
  subjectMesh.visible = false;
  subjectMesh.frustumCulled = false;
  mainScene.add(subjectMesh);

  const wrapper = subject?.closest<HTMLElement>('[data-hero-subject]') ?? null;
  let texture: Texture | null = null;

  // Follows the <img> exactly, including its entrance and scroll transforms.
  const placeSubject = () => {
    if (!subject || !subjectMesh.visible) return;
    const box = canvas.getBoundingClientRect();
    const rect = subject.getBoundingClientRect();
    if (!box.width || !box.height) return;
    subjectUniforms.uRect.value.set(
      ((rect.left - box.left) / box.width) * 2 - 1,
      1 - ((rect.bottom - box.top) / box.height) * 2,
      ((rect.right - box.left) / box.width) * 2 - 1,
      1 - ((rect.top - box.top) / box.height) * 2,
    );
  };

  const render = () => {
    renderer.setRenderTarget(target);
    renderer.render(atmosphereScene, camera);
    renderer.setRenderTarget(null);
    renderer.clear();
    placeSubject();
    renderer.render(mainScene, camera);
  };

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const buffer = renderer.getDrawingBufferSize(new Vector2());
    target.setSize(
      Math.max(1, Math.round(buffer.x * targetScale)),
      Math.max(1, Math.round(buffer.y * targetScale)),
    );
    atmosphereUniforms.uResolution.value.set(width, height);
    const portrait = width < height;
    // Glow sits behind the subject: right on desktop, lower right on phones.
    atmosphereUniforms.uFocus.value.set(
      portrait ? 0.66 : 0.74,
      portrait ? 0.36 : 0.58,
    );
    atmosphereUniforms.uShadeLeft.value = portrait ? 0.35 : 1;
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  canvas.dataset.ready = 'true';

  // Hand the portrait to WebGL only once the canvas has fully faded in; the
  // movement then grows from stillness, so the swap itself is invisible.
  let handedOver = false;
  const handOver = () => {
    if (handedOver || !texture || !wrapper) return;
    handedOver = true;
    subjectMesh.visible = true;
    render();
    wrapper.dataset.gl = 'on';
    gsap.to(subjectUniforms.uAmp, {
      value: 1,
      duration: 3,
      ease: 'power2.inOut',
      delay: 0.2,
    });
  };
  let handOverTimer = 0;
  let disposed = false;

  if (animate && subject && wrapper) {
    const prepare = async () => {
      if (texture || disposed) return;
      const source = await decodeChosenImage(subject).catch(() => null);
      if (texture || disposed || !source) return;
      texture = new Texture(source);
      texture.colorSpace = NoColorSpace;
      texture.premultiplyAlpha = true;
      texture.generateMipmaps = true;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.needsUpdate = true;
      subjectUniforms.uMap.value = texture;
      if (getComputedStyle(canvas).opacity === '1') handOver();
      else {
        canvas.addEventListener('transitionend', handOver, { once: true });
        handOverTimer = window.setTimeout(handOver, 2400);
      }
    };
    const onLoad = () => void prepare();
    if (subject.complete) subject.decode().then(onLoad, onLoad);
    else subject.addEventListener('load', onLoad, { once: true });
  }

  let inView = true;
  let pageVisible = !document.hidden;
  let elapsed = 0;
  let pending = 0;
  let frameInterval = compact ? 1000 / 30 : 0;
  const pointerTarget = new Vector2();

  // Older GPUs: lower resolution, then 30 fps, then hold a still frame.
  const govern = createQualityGovernor(3, (level) => {
    if (level === 1) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      targetScale *= 0.7;
      resize();
    } else if (level === 2) {
      frameInterval = Math.max(frameInterval, 1000 / 30);
    } else {
      gsap.ticker.remove(tick);
    }
  });

  const tick = (_time: number, deltaMs: number) => {
    if (!inView || !pageVisible) return;
    govern(deltaMs);
    pending += deltaMs;
    if (pending < frameInterval) return;
    elapsed += Math.min(pending, 64) / 1000;
    pending = 0;
    atmosphereUniforms.uTime.value = 18 + elapsed;
    atmosphereUniforms.uPointer.value.lerp(pointerTarget, 0.035);
    blitUniforms.uTime.value = elapsed;
    subjectUniforms.uTime.value = elapsed;
    render();
  };

  const intersection = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting);
  });
  intersection.observe(canvas);
  const onVisibility = () => (pageVisible = !document.hidden);
  const onPointer = (event: PointerEvent) =>
    pointerTarget.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1),
    );
  const onContextLost = (event: Event) => {
    event.preventDefault();
    canvas.dataset.ready = 'false';
    if (wrapper) delete wrapper.dataset.gl;
    gsap.ticker.remove(tick);
  };

  if (animate) {
    gsap.ticker.add(tick);
    document.addEventListener('visibilitychange', onVisibility);
    if (!compact)
      window.addEventListener('pointermove', onPointer, { passive: true });
  }
  canvas.addEventListener('webglcontextlost', onContextLost);

  return () => {
    disposed = true;
    gsap.ticker.remove(tick);
    gsap.killTweensOf(subjectUniforms.uAmp);
    window.clearTimeout(handOverTimer);
    intersection.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('transitionend', handOver);
    if (wrapper) delete wrapper.dataset.gl;
    texture?.dispose();
    target.dispose();
    quad.dispose();
    atmosphereMaterial.dispose();
    blitMaterial.dispose();
    subjectMaterial.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
