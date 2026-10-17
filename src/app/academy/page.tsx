import type { Metadata } from 'next';

import { ContactBlock } from '@/components/pages/contact-block';
import styles from '@/components/pages/editorial.module.css';
import { PageHero } from '@/components/pages/page-hero';
import { Cta } from '@/components/ui/cta';
import { media } from '@/content/media';
import { academyDisciplines } from '@/content/site';

export const metadata: Metadata = {
  title: 'Academy',
  description:
    'Hair By Naplin Academy, Kumasi: practical training in wig work, extensions, braiding and hairstyling.',
};

export default function AcademyPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Hair By Naplin Academy"
        title={
          <>
            The art is <em>in the hands.</em>
          </>
        }
        lead="Practical training and apprenticeship in wig work, extensions, braiding and hairstyling, in Kumasi."
        asset={media.braiding}
        position="62% 60%"
      >
        <Cta href="#enquire">Enquire about training</Cta>
      </PageHero>

      <section className={styles.section} aria-labelledby="disciplines-title">
        <div className={styles.sectionHead}>
          <p className="eyebrow">What you can learn</p>
          <h2
            id="disciplines-title"
            className={`display ${styles.h2}`}
            data-reveal="lines"
          >
            Learn the <em>craft.</em>
          </h2>
        </div>
        <ul className={styles.list}>
          {academyDisciplines.map((discipline) => (
            <li key={discipline.id} className={styles.listItem}>
              <h3 className={`display ${styles.listName}`} data-reveal="lines">
                {discipline.name}
              </h3>
              <p className={styles.listText} data-reveal="fade">
                {discipline.line}
              </p>
            </li>
          ))}
        </ul>
        <div className={styles.note}>
          <p className="eyebrow">Before you enquire</p>
          <p>
            Programme formats, fees, durations, schedules and intake dates are
            not published online. Ask the Academy directly for current details.
            Training enquiries are separate from salon appointments and shop
            orders.
          </p>
          <p>
            The photograph is a generated craft concept, not an actual Naplin
            class, student or training space.
          </p>
        </div>
      </section>

      <ContactBlock
        id="enquire"
        title="Training enquiries."
        intro="Call to ask about training in wig work, extensions, braiding and hairstyling."
      />
    </main>
  );
}
