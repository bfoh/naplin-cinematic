import Link from 'next/link';

import { BrandLogo } from '@/components/ui/brand-logo';
import { bookLink, business, imageryNote, navigation } from '@/content/site';
import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.identity}>
          <Link
            href="/"
            aria-label="Hair By Naplin — home"
            className={styles.brand}
          >
            <BrandLogo className={styles.label} sizes="160px" />
          </Link>
          <p className={`display ${styles.motto}`} data-reveal="lines">
            Beauty in <em>motion.</em>
          </p>
        </div>

        <nav aria-label="Footer" className={styles.col}>
          <p className="eyebrow">Explore</p>
          <ul>
            {[...navigation, bookLink].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.link}>
                  {item.label === 'Book' ? 'Book an appointment' : item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <p className="eyebrow">Visit</p>
          <address className={styles.address}>
            {business.name}
            <br />
            {business.city}, {business.country}
          </address>
          <p className={styles.hours}>
            {business.hours.days}
            <br />
            {business.hours.time}
          </p>
        </div>

        <div className={styles.col}>
          <p className="eyebrow">Call</p>
          <ul>
            {business.phones.map((phone) => (
              <li key={phone.tel}>
                <a href={`tel:${phone.tel}`} className={styles.link}>
                  {phone.display}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} {business.name}. Kumasi, Ghana.
        </p>
        <p className={styles.note}>{imageryNote}</p>
        <a href="#top" className={styles.top_link}>
          Back to top
        </a>
      </div>
    </footer>
  );
}
