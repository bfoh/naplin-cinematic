import Link from 'next/link';

import { Arrow } from '@/components/ui/arrow';
import { Cta } from '@/components/ui/cta';
import { MediaFigure } from '@/components/ui/media-figure';
import { media } from '@/content/media';
import { services } from '@/content/site';
import styles from './salon.module.css';

export function Salon() {
  return (
    <section className={styles.salon} id="salon" aria-labelledby="salon-title">
      <div className={styles.intro}>
        <p className={`eyebrow ${styles.eyebrow}`} data-reveal="fade">
          Salon services
        </p>
        <h2
          id="salon-title"
          className={`display ${styles.title}`}
          data-reveal="lines"
        >
          From hair to <em>artistry.</em>
        </h2>
        <p className={styles.copy} data-reveal="fade" data-delay="0.1">
          Explore hairstyling, retouching, pony styles and pedicure at Hair By
          Naplin in Kumasi.
        </p>
        <div className={styles.actions} data-reveal="fade" data-delay="0.2">
          <Cta href="/book" variant="ink">
            Book an appointment
          </Cta>
          <p className={styles.note}>
            Online booking is being prepared. Appointments are arranged by phone
            with the salon.
          </p>
        </div>
      </div>

      <ul className={styles.rows} aria-label="Services">
        {services.map((service) => (
          <li key={service.id}>
            <Link href={`/services#${service.id}`} className={styles.row}>
              <span className={`display ${styles.name}`}>{service.name}</span>
              <span className={styles.line}>{service.line}</span>
              <Arrow className={styles.arrow} />
            </Link>
          </li>
        ))}
      </ul>

      <MediaFigure
        asset={media.curls}
        className={styles.figure}
        ratio="4 / 5"
        sizes="(min-width: 1024px) 26vw, 72vw"
        position="50% 30%"
        reveal="clip"
        parallax={5}
      />
    </section>
  );
}
