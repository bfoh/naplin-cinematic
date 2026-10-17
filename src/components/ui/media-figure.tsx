import Image from 'next/image';
import type { CSSProperties } from 'react';

import type { MediaAsset } from '@/content/media';
import styles from './figure.module.css';

type Props = {
  asset: MediaAsset;
  sizes: string;
  /** Aspect ratio of the frame, e.g. "4 / 5". Omit when the parent sizes it. */
  ratio?: string;
  position?: string;
  /** The page's LCP image: fetched eagerly at high priority. */
  priority?: boolean;
  reveal?: 'clip' | 'fade';
  parallax?: number;
  className?: string;
  frameClassName?: string;
  delay?: number;
  quality?: 72 | 80;
};

/**
 * A single photograph with reserved geometry. Provenance is recorded in
 * media.ts and disclosed site-wide (footer note), not captioned per image.
 */
export function MediaFigure({
  asset,
  sizes,
  ratio,
  position = '50% 50%',
  priority = false,
  reveal,
  parallax,
  className,
  frameClassName,
  delay,
  quality = 80,
}: Props) {
  const img = (
    <Image
      src={asset.image}
      alt={asset.alt}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      quality={quality}
      placeholder={priority ? 'empty' : 'blur'}
      style={{ objectPosition: position }}
    />
  );
  const frameStyle: CSSProperties | undefined = ratio
    ? { aspectRatio: ratio }
    : undefined;

  return (
    <figure className={[styles.figure, className].filter(Boolean).join(' ')}>
      <div
        className={['frame', frameClassName].filter(Boolean).join(' ')}
        style={frameStyle}
        data-reveal={reveal}
        data-delay={delay}
      >
        {parallax ? (
          <div className="parallax" data-parallax={parallax}>
            {img}
          </div>
        ) : (
          img
        )}
      </div>
    </figure>
  );
}
