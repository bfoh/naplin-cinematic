import Image from 'next/image';

import { media } from '@/content/media';
import styles from './flow.module.css';

export function Flow() {
  return (
    <section className={styles.flow} aria-labelledby="flow-title">
      <h2 id="flow-title" className={`display ${styles.title}`}>
        <span className={styles.let} data-reveal="lines">
          Let it
        </span>
        <span className={styles.flowWord} data-reveal="lines" data-delay="0.15">
          <em>flow.</em>
        </span>
      </h2>
      <div className={styles.media}>
        <div className="parallax" data-parallax="6">
          <Image
            src={media.flow.image}
            alt={media.flow.alt}
            sizes="(min-width: 900px) 74vw, 100vw"
            placeholder="blur"
            quality={80}
            className={styles.image}
          />
        </div>
        <span className={styles.veil} aria-hidden="true" />
      </div>

      <p className={styles.mood} data-reveal="fade" data-delay="0.3">
        The movement
        <br />
        is the mood.
      </p>
    </section>
  );
}
