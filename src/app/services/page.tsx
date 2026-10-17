import type { Metadata } from 'next';

import { ContactBlock } from '@/components/pages/contact-block';
import styles from '@/components/pages/editorial.module.css';
import { PageHero } from '@/components/pages/page-hero';
import { Cta } from '@/components/ui/cta';
import { media } from '@/content/media';
import { services } from '@/content/site';

export const metadata: Metadata = {
  title: 'Salon services',
  description:
    'Hairstyling, retouching, pony styles and pedicure at Hair By Naplin, Kumasi.',
};

export default function ServicesPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Salon · Hair By Naplin"
        title={
          <>
            From hair to <em>artistry.</em>
          </>
        }
        lead="Hairstyling, retouching, pony styles and pedicure, at the salon in Kumasi."
        asset={media.curls}
        position="50% 26%"
      >
        <Cta href="/book">Book an appointment</Cta>
      </PageHero>

      <section className={styles.section} aria-labelledby="services-title">
        <div className={styles.sectionHead}>
          <p className="eyebrow">Services</p>
          <h2
            id="services-title"
            className={`display ${styles.h2}`}
            data-reveal="lines"
          >
            In the <em>chair.</em>
          </h2>
        </div>
        <ul className={styles.list}>
          {services.map((service) => (
            <li key={service.id} id={service.id} className={styles.listItem}>
              <h3 className={`display ${styles.listName}`} data-reveal="lines">
                {service.name}
              </h3>
              <p className={styles.listText} data-reveal="fade">
                {service.line} Details and timing are confirmed with the salon
                when you book.
              </p>
            </li>
          ))}
        </ul>
        <div className={styles.note}>
          <p className="eyebrow">Booking</p>
          <p>
            Online booking is being prepared. For now, appointments are arranged
            by phone with the salon. Prices and durations are confirmed when you
            book.
          </p>
        </div>
      </section>

      <ContactBlock
        id="book"
        title="Book your look."
        intro="Call the salon to arrange your appointment."
      />
    </main>
  );
}
