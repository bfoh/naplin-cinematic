import { TelLink } from '@/components/ui/cta';
import { business } from '@/content/site';
import styles from './contact-block.module.css';

type Props = { title: string; intro: string; id?: string };

/** Hours and the owner-approved public numbers. */
export function ContactBlock({ title, intro, id }: Props) {
  return (
    <section
      className={styles.block}
      id={id}
      aria-labelledby={`${id ?? 'contact'}-title`}
    >
      <div className={styles.copy}>
        <h2
          id={`${id ?? 'contact'}-title`}
          className={`display ${styles.title}`}
          data-reveal="lines"
        >
          {title}
        </h2>
        <p className={styles.intro} data-reveal="fade">
          {intro}
        </p>
      </div>
      <div className={styles.details} data-reveal="fade" data-delay="0.15">
        <div>
          <p className="eyebrow">Call</p>
          <ul className={styles.phones}>
            {business.phones.map((phone) => (
              <li key={phone.tel}>
                <TelLink
                  tel={phone.tel}
                  display={phone.display}
                  className={styles.tel}
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Hours</p>
          <p className={styles.fact}>
            {business.hours.days}
            <br />
            {business.hours.time}
          </p>
        </div>
        <div>
          <p className="eyebrow">Where</p>
          <p className={styles.fact}>
            {business.city}, {business.country}
          </p>
        </div>
      </div>
    </section>
  );
}
