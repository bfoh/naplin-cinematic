import Image from 'next/image';
import Link from 'next/link';

import { Arrow } from '@/components/ui/arrow';
import { Cta } from '@/components/ui/cta';
import { media } from '@/content/media';
import { collection } from '@/content/site';
import styles from './hair-edit.module.css';

const images = {
  'frontal-wigs': media.wig,
  'closure-wigs': media.straight,
  'hair-bundles': media.bundles,
} as const;

export function HairEdit() {
  return (
    <section
      className={styles.edit}
      id="the-hair-edit"
      aria-labelledby="edit-title"
    >
      <div className={styles.head}>
        <p className="eyebrow" data-reveal="fade">
          Our collections
        </p>
        <h2
          id="edit-title"
          className={`display ${styles.title}`}
          data-reveal="lines"
        >
          The Hair <em>Edit.</em>
        </h2>
        <div className={styles.intro}>
          <p data-reveal="fade" data-delay="0.15">
            Ready-to-wear frontal and closure wigs and luxury hair bundles. A
            first look at the edit while the full catalogue is prepared.
          </p>
          <Cta href="/shop" variant="text">
            View the edit
          </Cta>
        </div>
      </div>

      <ul className={styles.rail} aria-label="Collections">
        {collection.map((item, index) => {
          const asset = images[item.id];
          return (
            <li key={item.id} className={styles.item} data-index={index}>
              <Link href={`/shop#${item.id}`} className={styles.card}>
                <div
                  className={`frame ${styles.frame}`}
                  data-reveal="clip"
                  data-delay={index * 0.12}
                >
                  <Image
                    src={asset.image}
                    alt={asset.alt}
                    sizes="(min-width: 1024px) 30vw, 78vw"
                    placeholder="blur"
                    className={styles.image}
                  />
                </div>
                <div className={styles.meta}>
                  <h3 className={styles.name}>{item.name}</h3>
                  <p className={styles.line}>{item.line}</p>
                  <span className={styles.more}>
                    Discover <Arrow />
                  </span>
                </div>
              </Link>
              <p className={`caption ${styles.disclosure}`}>
                {asset.disclosure}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
