import type { StaticImageData } from 'next/image';

import logoOnDark from '@/media/brand/hair-by-naplin-logo-on-dark.png';
import campaignCrimson from '@/media/campaign-crimson-concept.webp';
import chapterFinish from '@/media/chapter-finish-concept.webp';
import chapterMovement from '@/media/chapter-movement-concept.webp';
import chapterTexture from '@/media/chapter-texture-concept.webp';
import craftBraiding from '@/media/craft-braiding-concept.webp';
import flowConfidence from '@/media/flow-confidence-concept.webp';
import flowConfidenceCutout from '@/media/flow-confidence-cutout-concept.webp';
import heroCutout from '@/media/hero-movement-cutout-concept.webp';
import portraitCurls from '@/media/portrait-curls-concept.webp';
import portraitStraight from '@/media/portrait-straight-concept.webp';
import portraitWaves from '@/media/portrait-waves-concept.webp';
import productBundles from '@/media/product-bundles-concept.webp';
import productWig from '@/media/product-wig-concept.webp';
import textureWaves from '@/media/texture-waves-concept.webp';

/**
 * Every image the site renders, with provenance. See docs/MEDIA.md.
 *
 * - `owner-generated`: AI-generated for the owner (earlier Naplin sessions or
 *   supplied directly by the owner). Campaign concept, never a real client,
 *   employee, student, premises or catalogue item.
 * - `authentic`: reserved for approved, consented business photography.
 */
export type Provenance = 'owner-generated' | 'authentic';

export type MediaAsset = {
  image: StaticImageData;
  alt: string;
  /** Short provenance label (no longer shown on the image; see footer note). */
  disclosure: string;
  provenance: Provenance;
  /** Master file in assets/source and any crop applied by scripts/build-media.mjs. */
  origin: string;
};

const CONCEPT = 'Generated campaign concept';

export const logo = {
  image: logoOnDark,
  alt: 'Hair By Naplin',
  origin:
    'On-dark variant of the official owner-supplied logo (assets/brand), made at the owner’s direction: empty canvas trimmed, darkest plum tones lifted for legibility on ink; hue, shapes and alpha unchanged.',
} as const;

export const media = {
  hero: {
    image: heroCutout,
    alt: 'A Black woman turns over her shoulder, long dark body-wave hair sweeping out behind her.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin: 'campaign-movement-cutout-concept.png (alpha cutout, full frame)',
  },
  texture: {
    image: chapterTexture,
    alt: 'Close detail of glossy black hair falling in soft waves.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin:
      'supplied-macro-waves-concept.png (owner-supplied 2026-10-17), 4:5 crop',
  },
  movement: {
    image: chapterMovement,
    alt: 'Long dark waves lifting in motion, lit warm at the edges.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin: 'campaign-movement-concept.png, hair-only 4:5 crop',
  },
  finish: {
    image: chapterFinish,
    alt: 'A woman looks over her bare shoulder, her hair set in glossy sculpted curls.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin:
      'supplied-portrait-curls-noir-concept.png (owner-supplied 2026-10-17), 4:5 crop',
  },
  flow: {
    image: flowConfidence,
    alt: 'A woman in a draped burgundy gown, long black body-wave hair falling past her shoulders.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin: 'campaign-confidence-concept.png, full frame',
  },
  flowCutout: {
    image: flowConfidenceCutout,
    alt: 'A woman in a draped burgundy gown, long black body-wave hair falling past her shoulders.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin:
      'campaign-confidence-cutout-concept.png: studio backdrop removed with Apple Vision (scripts/lift-subject.swift)',
  },
  confidence: {
    image: campaignCrimson,
    alt: 'A woman with long, full kinky-straight hair and a plum lip rests her hand at her temple against deep crimson.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin:
      'supplied-portrait-crimson-concept.png (owner-supplied 2026-10-17), full frame',
  },
  waves: {
    image: portraitWaves,
    alt: 'A woman in an ivory dress with long, voluminous dark waves.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin: 'editorial-waves-concept.png, full frame',
  },
  straight: {
    image: portraitStraight,
    alt: 'A woman with sleek, centre-parted long straight hair in a sculptural ivory top.',
    disclosure: `${CONCEPT} · styling illustration`,
    provenance: 'owner-generated',
    origin: 'editorial-straight-concept.png, full frame',
  },
  curls: {
    image: portraitCurls,
    alt: 'A smiling woman with voluminous black curls in a burgundy dress.',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin: 'editorial-curls-concept.png, full frame',
  },
  wig: {
    image: productWig,
    alt: 'A long black body-wave wig on a dark display head above a stone plinth.',
    disclosure: 'Generated product concept · not a catalogue item',
    provenance: 'owner-generated',
    origin: 'product-wig-concept.png, full frame',
  },
  bundles: {
    image: productBundles,
    alt: 'Three dark body-wave hair bundles laid on ivory satin.',
    disclosure: 'Generated product concept · not a catalogue item',
    provenance: 'owner-generated',
    origin: 'product-bundles-concept.png, full frame',
  },
  braiding: {
    image: craftBraiding,
    alt: 'Hands braiding long black hair on a training mannequin head.',
    disclosure: 'Generated craft concept · not an actual Naplin class',
    provenance: 'owner-generated',
    origin: 'craft-braiding-concept.png, full frame',
  },
  textureField: {
    image: textureWaves,
    alt: '',
    disclosure: CONCEPT,
    provenance: 'owner-generated',
    origin:
      'supplied-macro-waves-concept.png (owner-supplied 2026-10-17), full frame',
  },
} satisfies Record<string, MediaAsset>;

export type MediaKey = keyof typeof media;
