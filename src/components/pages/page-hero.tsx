import type { ReactNode } from 'react';

import { MediaFigure } from '@/components/ui/media-figure';
import type { MediaAsset } from '@/content/media';
import styles from './page-hero.module.css';

type Props = {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  asset?: MediaAsset;
  position?: string;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  lead,
  asset,
  position,
  children,
}: Props) {
  return (
    <section
      className={`${styles.hero} ${asset ? styles.withMedia : ''}`}
      aria-labelledby="page-title"
    >
      <div className={styles.copy}>
        <p className="eyebrow" data-reveal="fade">
          {eyebrow}
        </p>
        <h1
          id="page-title"
          className={`display ${styles.title}`}
          data-reveal="lines"
        >
          {title}
        </h1>
        <p
          className={`lead ${styles.lead}`}
          data-reveal="fade"
          data-delay="0.15"
        >
          {lead}
        </p>
        {children ? (
          <div className={styles.actions} data-reveal="fade" data-delay="0.25">
            {children}
          </div>
        ) : null}
      </div>
      {asset ? (
        <MediaFigure
          asset={asset}
          className={styles.figure}
          ratio="4 / 5"
          position={position}
          sizes="(min-width: 1024px) 38vw, 100vw"
          priority
          reveal="clip"
          delay={0.1}
          quality={88}
        />
      ) : null}
    </section>
  );
}
