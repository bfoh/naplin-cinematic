import Image from 'next/image';
import Link from 'next/link';

import { Arrow } from '@/components/ui/arrow';
import { media } from '@/content/media';
import styles from './pillars.module.css';

const pillars = [
  {
    name: 'Hair',
    line: 'Luxury hair and ready-to-wear wigs.',
    action: 'Explore the hair',
    href: '/shop',
    asset: media.waves,
    position: '50% 30%',
  },
  {
    name: 'Salon',
    line: 'Styling and care, by appointment.',
    action: 'See the services',
    href: '/services',
    asset: media.curls,
    position: '50% 28%',
  },
  {
    name: 'Academy',
    line: 'Practical training in the craft.',
    action: 'Learn the craft',
    href: '/academy',
    asset: media.braiding,
    position: '58% 55%',
  },
] as const;

export function Pillars() {
  return (
    <section className={styles.pillars} aria-labelledby="pillars-title">
      <h2 id="pillars-title" className={`eyebrow ${styles.heading}`}>
        Discover Hair By Naplin
      </h2>
      <ul className={styles.list}>
        {pillars.map((pillar) => (
          <li key={pillar.name} className={styles.item}>
            <Link href={pillar.href} className={styles.panel}>
              <Image
                src={pillar.asset.image}
                alt=""
                fill
                sizes="(min-width: 900px) 40vw, 100vw"
                placeholder="blur"
                className={styles.image}
                style={{ objectPosition: pillar.position }}
              />
              <span className={styles.shade} aria-hidden="true" />
              <span className={styles.content}>
                <span className={`display ${styles.name}`}>{pillar.name}</span>
                <span className={styles.line}>{pillar.line}</span>
                <span className={styles.action}>
                  {pillar.action}
                  <Arrow />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className={`caption ${styles.disclosure}`}>
        Generated campaign concepts
      </p>
    </section>
  );
}
