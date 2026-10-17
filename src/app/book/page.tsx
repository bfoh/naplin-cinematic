import type { Metadata } from 'next';
import Link from 'next/link';

import { TelLink } from '@/components/ui/cta';
import styles from '@/components/pages/editorial.module.css';
import { PageHero } from '@/components/pages/page-hero';
import { business, services } from '@/content/site';
import book from './book.module.css';

export const metadata: Metadata = {
  title: 'Book an appointment',
  description:
    'Book hairstyling, retouching, pony styles or pedicure at Hair By Naplin, Kumasi.',
};

export default function BookPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Book an appointment"
        title={
          <>
            Book your <em>look.</em>
          </>
        }
        lead="Online booking is being prepared. Until then, appointments are arranged by phone with the salon."
      >
        {business.phones.map((phone, index) => (
          <TelLink
            key={phone.tel}
            tel={phone.tel}
            display={phone.display}
            variant={index === 0 ? 'solid' : 'line'}
          />
        ))}
      </PageHero>

      <section className={styles.section} aria-labelledby="book-details-title">
        <h2 id="book-details-title" className="sr-only">
          Booking details
        </h2>
        <div className={book.grid}>
          <div className={book.card}>
            <p className="eyebrow">Hours</p>
            <p className={book.big}>
              {business.hours.days}
              <br />
              {business.hours.time}
            </p>
          </div>
          <div className={book.card}>
            <p className="eyebrow">Where</p>
            <p className={book.big}>
              {business.city}, {business.country}
            </p>
          </div>
          <div className={book.card}>
            <p className="eyebrow">You can book</p>
            <ul className={book.services}>
              {services.map((service) => (
                <li key={service.id}>
                  <Link href={`/services#${service.id}`}>{service.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.note}>
          <p className="eyebrow">Good to know</p>
          <p>
            Prices, durations and availability are confirmed by the salon when
            you call. No details are collected or stored by this website.
          </p>
          <p>
            Interested in training rather than an appointment?{' '}
            <Link href="/academy#enquire" className={book.inline}>
              Academy enquiries
            </Link>{' '}
            are handled separately.
          </p>
        </div>
      </section>
    </main>
  );
}
