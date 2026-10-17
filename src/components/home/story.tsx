import { Cta } from '@/components/ui/cta';
import { business } from '@/content/site';
import styles from './story.module.css';

/** Typographic, place-led chapter. No premises imagery until authentic photos exist. */
export function Story() {
  return (
    <section
      className={styles.story}
      id="our-story"
      aria-labelledby="story-title"
    >
      <p className={`display ${styles.ghost}`} aria-hidden="true">
        <span data-parallax="14">Kumasi</span>
      </p>
      <div className={styles.inner}>
        <p className="eyebrow" data-reveal="fade">
          Our story
        </p>
        <h2
          id="story-title"
          className={`display ${styles.title}`}
          data-reveal="lines"
        >
          Rooted in Kumasi. Made for your <em>confidence.</em>
        </h2>
        <div className={styles.body}>
          <p data-reveal="fade" data-delay="0.1">
            Hair By Naplin brings three things together under one name in
            Kumasi: luxury hair, from ready-to-wear frontal and closure wigs to
            hair bundles; a salon for styling and care; and an Academy for
            aspiring beauticians learning the craft with their hands.
          </p>
          <Cta href="/story" variant="text">
            Our story
          </Cta>
        </div>
        <dl className={styles.facts} data-reveal="fade" data-delay="0.2">
          <div>
            <dt className="eyebrow">Where</dt>
            <dd>
              {business.city}, {business.country}
              <span className={styles.coords}>{business.coordinates}</span>
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Open</dt>
            <dd>
              {business.hours.days}
              <br />
              {business.hours.time}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">One house</dt>
            <dd>Hair · Salon · Academy</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
