import Image from 'next/image';

import { Cta } from '@/components/ui/cta';
import { media } from '@/content/media';
import { Atmosphere } from './atmosphere';
import { HeroMotion } from './hero-motion';
import styles from './hero.module.css';

export function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.atmosphere} aria-hidden="true">
        <Atmosphere />
      </div>

      <div className={styles.subject} data-hero-subject>
        {/* Inner layer: takes the scroll-out movement, so the 2D hair canvas
            (no-WebGL fallback) placed beside the <img> moves with it. */}
        <div className={styles.subjectInner} data-hero-subject-inner>
          <Image
            src={media.hero.image}
            alt={media.hero.alt}
            loading="eager"
            fetchPriority="high"
            quality={80}
            sizes="(min-width: 1024px) 58vw, (min-width: 768px) 76vh, 106vw"
            className={styles.subjectImage}
          />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.copy} data-hero-copy>
          <p className="eyebrow" data-hero-item>
            Hair By Naplin · Kumasi
          </p>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            <span className={styles.line}>
              <span data-hero-item data-hero-line>
                Hair is
              </span>
            </span>
            <span className={styles.line}>
              <span data-hero-item data-hero-line>
                a <em>feeling.</em>
              </span>
            </span>
          </h1>
          <p className={`lead ${styles.lead}`} data-hero-item>
            Luxury hair. Expert styling. Practical training. One world of
            beauty, rooted in Kumasi.
          </p>
        </div>
        <div className={styles.actions} data-hero-item>
          <Cta href="/shop" magnetic>
            Explore the hair
          </Cta>
          <Cta href="/book" variant="line" magnetic>
            Book an appointment
          </Cta>
        </div>
      </div>

      <a href="#artistry" className={styles.scroll} data-hero-item>
        <span>Scroll</span>
        <span className={styles.scrollRule} aria-hidden="true" />
      </a>
      <HeroMotion />
    </section>
  );
}
