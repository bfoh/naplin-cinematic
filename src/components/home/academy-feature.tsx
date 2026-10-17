import { Cta } from '@/components/ui/cta';
import { MediaFigure } from '@/components/ui/media-figure';
import { media } from '@/content/media';
import { academyDisciplines } from '@/content/site';
import styles from './academy-feature.module.css';

export function AcademyFeature() {
  return (
    <section
      className={styles.academy}
      id="academy"
      aria-labelledby="academy-title"
    >
      <div className={styles.copy}>
        <p className="eyebrow" data-reveal="fade">
          Hair By Naplin Academy
        </p>
        <h2
          id="academy-title"
          className={`display ${styles.title}`}
          data-reveal="lines"
        >
          The art is <em>in the hands.</em>
        </h2>
        <p className={styles.lead} data-reveal="fade" data-delay="0.1">
          Practical training in wig work, extensions, braiding and hairstyling
          in Kumasi.
        </p>
        <ul
          className={styles.disciplines}
          aria-label="Training areas"
          data-reveal="fade"
          data-delay="0.2"
        >
          {academyDisciplines.map((discipline) => (
            <li key={discipline.id}>{discipline.name}</li>
          ))}
        </ul>
        <div className={styles.actions} data-reveal="fade" data-delay="0.25">
          <Cta href="/academy">Explore the Academy</Cta>
          <p className={styles.note}>
            Programme dates, fees and intakes are not published online. Enquire
            directly.
          </p>
        </div>
      </div>
      <MediaFigure
        asset={media.braiding}
        className={styles.figure}
        ratio="4 / 5"
        sizes="(min-width: 1024px) 46vw, 100vw"
        position="62% 60%"
        reveal="clip"
        parallax={5}
      />
    </section>
  );
}
