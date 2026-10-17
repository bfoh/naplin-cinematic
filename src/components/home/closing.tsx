import Image from 'next/image';

import { Cta } from '@/components/ui/cta';
import { media } from '@/content/media';
import styles from './closing.module.css';
import { HairField } from './hair-field';

export function Closing() {
  return (
    <section className={styles.closing} aria-labelledby="closing-title">
      <div className={styles.field} aria-hidden="true">
        <div className="parallax" data-parallax="10">
          <Image
            src={media.textureField.image}
            alt=""
            fill
            sizes="100vw"
            className={styles.image}
          />
          <HairField />
        </div>
      </div>
      <div className={styles.inner}>
        <h2
          id="closing-title"
          className={`display ${styles.title}`}
          data-reveal="lines"
        >
          Your hair. <em>Your story.</em>
        </h2>
        <p className={styles.lead} data-reveal="fade" data-delay="0.15">
          Explore the hair. Book your look. Learn the craft.
        </p>
        <div className={styles.actions} data-reveal="fade" data-delay="0.25">
          <Cta href="/shop">Shop hair</Cta>
          <Cta href="/book" variant="line">
            Book an appointment
          </Cta>
          <Cta href="/academy" variant="line">
            Explore the Academy
          </Cta>
        </div>
      </div>
    </section>
  );
}
