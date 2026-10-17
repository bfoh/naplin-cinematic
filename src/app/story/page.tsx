import type { Metadata } from 'next';

import { ContactBlock } from '@/components/pages/contact-block';
import styles from '@/components/pages/editorial.module.css';
import { PageHero } from '@/components/pages/page-hero';
import { Cta } from '@/components/ui/cta';
import { imageryNote } from '@/content/site';

export const metadata: Metadata = {
  title: 'Our story',
  description:
    'Hair By Naplin: hair, salon and Academy, rooted in Kumasi, Ghana.',
};

const pillars = [
  {
    name: 'Hair',
    text: 'Ready-to-wear frontal and closure wigs and luxury hair bundles.',
    href: '/shop',
    action: 'Explore the hair',
  },
  {
    name: 'Salon',
    text: 'Hairstyling, retouching, pony styles and pedicure.',
    href: '/services',
    action: 'See the services',
  },
  {
    name: 'Academy',
    text: 'Practical training in wig work, extensions, braiding and hairstyling.',
    href: '/academy',
    action: 'Learn the craft',
  },
] as const;

export default function StoryPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Our story"
        title={
          <>
            Rooted in Kumasi. Made for your <em>confidence.</em>
          </>
        }
        lead="Hair By Naplin is a hair, salon and training house in Kumasi, Ghana."
      />

      <section className={styles.section} aria-labelledby="belief-title">
        <div className={styles.split}>
          <h2
            id="belief-title"
            className={`display ${styles.quote}`}
            data-reveal="lines"
          >
            Hair is the art. Movement is the language.{' '}
            <em>Confidence is the feeling.</em>
          </h2>
          <div className={styles.prose}>
            <p data-reveal="fade">
              Under one name, Hair By Naplin brings together luxury hair, a
              salon for styling and care, and an Academy for aspiring
              beauticians.
            </p>
            <p data-reveal="fade">
              Every part of the house begins with the same thing: hair, worn
              with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="house-title">
        <div className={styles.sectionHead}>
          <p className="eyebrow">One house</p>
          <h2
            id="house-title"
            className={`display ${styles.h2}`}
            data-reveal="lines"
          >
            Hair. Salon. <em>Academy.</em>
          </h2>
        </div>
        <ul className={styles.list}>
          {pillars.map((pillar) => (
            <li key={pillar.name} className={styles.listItem}>
              <h3 className={`display ${styles.listName}`} data-reveal="lines">
                {pillar.name}
              </h3>
              <div className={styles.listText} data-reveal="fade">
                <p>{pillar.text}</p>
                <Cta href={pillar.href} variant="text">
                  {pillar.action}
                </Cta>
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.note}>
          <p className="eyebrow">About the imagery</p>
          <p>{imageryNote}</p>
        </div>
      </section>

      <ContactBlock
        id="visit"
        title="Visit us in Kumasi."
        intro="Call ahead to plan your visit to the shop, the salon or the Academy."
      />
    </main>
  );
}
