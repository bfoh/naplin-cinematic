// Derives the web-ready image set in src/media from the masters in
// assets/source (statically imported by src/content/media.ts). Every output is an individual file with its own provenance
// entry in src/content/media.ts; crops are recorded here so they can be
// re-run when higher-resolution or authentic replacements arrive.
//
// Usage: pnpm media   (requires the masters listed in docs/MEDIA.md)

import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const source = (name) => path.join(root, 'assets/source', name);
const output = (name) => path.join(root, 'src/media', name);

/** @type {{ out: string; from: string; extract?: sharp.Region; alpha?: boolean }[]} */
const jobs = [
  // Hero subject with genuine transparency; the WebGL atmosphere sits behind it.
  {
    out: 'hero-movement-cutout-concept.webp',
    from: 'campaign-movement-cutout-concept.png',
    alpha: true,
  },
  // Texture / Movement / Finish chapter (4:5 crops).
  {
    out: 'chapter-texture-concept.webp',
    from: 'supplied-macro-waves-concept.png',
    extract: { left: 133, top: 0, width: 1064, height: 1330 },
  },
  {
    out: 'chapter-movement-concept.webp',
    from: 'campaign-movement-concept.png',
    extract: { left: 0, top: 300, width: 688, height: 860 },
  },
  {
    out: 'chapter-finish-concept.webp',
    from: 'supplied-portrait-curls-noir-concept.png',
    extract: { left: 150, top: 0, width: 947, height: 1184 },
  },
  // Full-frame editorial and product studies.
  {
    out: 'flow-confidence-concept.webp',
    from: 'campaign-confidence-concept.png',
  },
  {
    out: 'campaign-crimson-concept.webp',
    from: 'supplied-portrait-crimson-concept.png',
  },
  { out: 'portrait-waves-concept.webp', from: 'editorial-waves-concept.png' },
  {
    out: 'portrait-straight-concept.webp',
    from: 'editorial-straight-concept.png',
  },
  { out: 'portrait-curls-concept.webp', from: 'editorial-curls-concept.png' },
  { out: 'product-wig-concept.webp', from: 'product-wig-concept.png' },
  { out: 'product-bundles-concept.webp', from: 'product-bundles-concept.png' },
  { out: 'craft-braiding-concept.webp', from: 'craft-braiding-concept.png' },
  {
    out: 'texture-waves-concept.webp',
    from: 'supplied-macro-waves-concept.png',
  },
];

await mkdir(path.join(root, 'src/media/brand'), { recursive: true });

// Official logo: crop away only the empty transparent canvas around the artwork
// (all non-zero alpha lies inside x 648–1639, y 13–701). Artwork pixels are not
// edited, recoloured or resampled.
const trimmedLogo = path.join(
  root,
  'assets/brand/hair-by-naplin-logo-trimmed.png',
);
{
  const logo = path.join(
    root,
    'assets/brand/hair-by-naplin-logo-transparent.png',
  );
  const info = await sharp(logo)
    .extract({ left: 640, top: 5, width: 1008, height: 705 })
    .png({ compressionLevel: 9 })
    .toFile(trimmedLogo);
  console.log(
    `assets/brand/hair-by-naplin-logo-trimmed.png ${info.width}×${info.height}`,
  );
}

// On-dark logo variant (owner direction, 2026-10-17: the logo should sit
// directly on the dark hero). The artwork's deepest plum tones vanish on ink,
// so only the dark end of its lightness is lifted toward a readable floor;
// hue, the crimson end, shapes and alpha are unchanged.
{
  const { data, info } = await sharp(trimmedLogo)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const FLOOR = 0.4;
  const smooth = (e0, e1, x) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const delta = max - min;
    let h = 0;
    let s = 0;
    if (delta > 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / delta + 2) / 6;
      else h = ((r - g) / delta + 4) / 6;
    }
    const lift = 1 - smooth(0.12, FLOOR, l);
    const l2 = l + (FLOOR - l) * lift;
    const s2 = s * (1 - 0.18 * lift);
    const q = l2 < 0.5 ? l2 * (1 + s2) : l2 + s2 - l2 * s2;
    const p = 2 * l2 - q;
    data[i] = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    data[i + 1] = Math.round(hue2rgb(p, q, h) * 255);
    data[i + 2] = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(output('brand/hair-by-naplin-logo-on-dark.png'));
  console.log(
    `brand/hair-by-naplin-logo-on-dark.png ${info.width}×${info.height}`,
  );
}

for (const job of jobs) {
  let pipeline = sharp(source(job.from));
  if (job.extract) pipeline = pipeline.extract(job.extract);
  pipeline = job.alpha
    ? pipeline.webp({ quality: 90, alphaQuality: 92, effort: 6 })
    : pipeline
        .removeAlpha()
        .webp({ quality: 88, effort: 6, smartSubsample: true });
  const info = await pipeline.toFile(output(job.out));
  const { size } = await stat(output(job.out));
  console.log(
    `${job.out.padEnd(36)} ${info.width}×${info.height}  ${(size / 1024).toFixed(0)} KB`,
  );
}

// Open Graph share image (1200×630): the on-dark logo, the hero subject and a
// still of the wine atmosphere. No text beyond the logo itself.
{
  const width = 1200;
  const height = 630;
  const field = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <radialGradient id="glow" cx="72%" cy="46%" r="58%">
          <stop offset="0" stop-color="#651f32" stop-opacity="0.85"/>
          <stop offset="0.55" stop-color="#491721" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#0a090b" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="#0a090b"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
    </svg>`);
  const subject = await sharp(source('campaign-movement-cutout-concept.png'))
    .resize({ height })
    .png()
    .toBuffer();
  const logoPng = await sharp(output('brand/hair-by-naplin-logo-on-dark.png'))
    .resize({ width: 220 })
    .png()
    .toBuffer();
  const subjectMeta = await sharp(subject).metadata();
  await sharp(field)
    .composite([
      { input: subject, left: width - (subjectMeta.width ?? 504), top: 0 },
      { input: logoPng, left: 72, top: 52 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(root, 'src/app/opengraph-image.jpg'));
  console.log('src/app/opengraph-image.jpg 1200×630');
}
