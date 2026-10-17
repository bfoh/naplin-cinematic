import type { Metadata } from 'next';

import { ContactBlock } from '@/components/pages/contact-block';
import styles from '@/components/pages/editorial.module.css';
import { PageHero } from '@/components/pages/page-hero';
import { Cta } from '@/components/ui/cta';
import { MediaFigure } from '@/components/ui/media-figure';
import { media } from '@/content/media';
import { collection } from '@/content/site';

export const metadata: Metadata = {
  title: 'The Hair Edit',
  description:
    'Ready-to-wear frontal and closure wigs and luxury hair bundles from Hair By Naplin in Kumasi.',
};

const details = {
  'frontal-wigs': {
    asset: media.wig,
    text: 'Ready-to-wear frontal wigs, styled to move with you. Ask the shop about the textures, lengths and units available now.',
  },
  'closure-wigs': {
    asset: media.straight,
    text: 'Ready-to-wear closure wigs for everyday elegance. The image is a styling illustration; current options are confirmed by the shop.',
  },
  'hair-bundles': {
    asset: media.bundles,
    text: 'Luxury hair bundles, the foundation of the look you have in mind. Ask the shop which textures and lengths are available now.',
  },
} as const;

export default function ShopPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Shop · Hair By Naplin"
        title={
          <>
            The Hair <em>Edit.</em>
          </>
        }
        lead="Ready-to-wear frontal and closure wigs and luxury hair bundles, from our shop in Kumasi."
        asset={media.wig}
        position="50% 34%"
      >
        <Cta href="#frontal-wigs">See the edit</Cta>
        <Cta href="/book" variant="line">
          Book an appointment
        </Cta>
      </PageHero>

      <section className={styles.section} aria-labelledby="edit-list-title">
        <div className={styles.sectionHead}>
          <p className="eyebrow">Collections</p>
          <h2 id="edit-list-title" className="sr-only">
            Collections
          </h2>
        </div>
        <div className={styles.features}>
          {collection.map((item) => {
            const detail = details[item.id];
            return (
              <article
                key={item.id}
                id={item.id}
                className={styles.feature}
                aria-labelledby={`${item.id}-title`}
              >
                <MediaFigure
                  asset={detail.asset}
                  className={styles.featureFigure}
                  ratio="4 / 5"
                  sizes="(min-width: 900px) 34vw, 100vw"
                  position="50% 35%"
                  reveal="clip"
                />
                <div className={styles.featureCopy}>
                  <h3
                    id={`${item.id}-title`}
                    className={`display ${styles.featureTitle}`}
                    data-reveal="lines"
                  >
                    {item.name}
                  </h3>
                  <p className={styles.featureText} data-reveal="fade">
                    {detail.text}
                  </p>
                  <Cta href="#enquire" variant="text">
                    Enquire
                  </Cta>
                </div>
              </article>
            );
          })}
        </div>
        <div className={styles.note}>
          <p className="eyebrow">About this edit</p>
          <p>
            The online catalogue is being prepared, so nothing here can be
            bought online yet. Prices, textures, lengths and availability are
            confirmed directly by the shop. Photographs are generated concepts,
            not specific products.
          </p>
        </div>
      </section>

      <ContactBlock
        id="enquire"
        title="Ask about the hair."
        intro="Call the shop in Kumasi to ask about wigs and bundles available now, or to plan a visit."
      />
    </main>
  );
}
