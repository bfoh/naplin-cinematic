'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { Cta } from '@/components/ui/cta';
import { media } from '@/content/media';
import { gsap, MOTION_OK, registerGsap } from '@/lib/gsap';
import styles from './confidence.module.css';

/**
 * Campaign reveal. The portrait opens from a narrow aperture into a crimson
 * field matched to its own backdrop, so it reads full-bleed without upscaling.
 */
export function Confidence() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const section = root.current;
    if (!section) return;
    const q = gsap.utils.selector(section);
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(min-width: 1024px) and (min-height: 620px)',
        motion: MOTION_OK,
      },
      (context) => {
        const { desktop, motion } = context.conditions ?? {};
        if (!motion) return;
        const aperture = q('[data-aperture]');
        const image = q('[data-aperture] img');

        if (desktop) {
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: q('[data-stage]')[0],
              start: 'top top',
              end: () => `+=${window.innerHeight * 1.15}`,
              pin: true,
              scrub: 0.8,
              refreshPriority: 1,
              invalidateOnRefresh: true,
            },
          });
          tl.fromTo(
            aperture,
            { clipPath: 'inset(22% 34% 22% 34%)' },
            { clipPath: 'inset(0% 0% 0% 0%)' },
            0,
          )
            .fromTo(image, { scale: 1.32 }, { scale: 1 }, 0)
            .fromTo(q('[data-wear]'), { xPercent: -5 }, { xPercent: 0 }, 0)
            .fromTo(q('[data-conf]'), { xPercent: 6 }, { xPercent: 0 }, 0)
            .fromTo(
              q('[data-after]'),
              { autoAlpha: 0, y: 24 },
              { autoAlpha: 1, y: 0, duration: 0.3 },
              0.7,
            );
        } else {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: aperture[0],
                start: 'top 80%',
                once: true,
              },
            })
            // Phones/tablets: opacity and transform only (no clip-path).
            .fromTo(
              aperture,
              { autoAlpha: 0, scale: 0.94 },
              { autoAlpha: 1, scale: 1, duration: 1.4 },
            )
            .fromTo(image, { scale: 1.12 }, { scale: 1, duration: 2 }, 0);
        }
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      className={styles.confidence}
      aria-labelledby="confidence-title"
    >
      <div className={styles.stage} data-stage>
        <h2 id="confidence-title" className={`display ${styles.title}`}>
          <span className={styles.wear} data-wear>
            Wear your
          </span>
          <span className={styles.conf} data-conf>
            <em>confidence.</em>
          </span>
        </h2>

        <figure className={styles.figure}>
          <div className={styles.aperture} data-aperture>
            <Image
              src={media.confidence.image}
              alt={media.confidence.alt}
              sizes="(min-width: 1024px) 76svh, 100vw"
              placeholder="blur"
              quality={80}
            />
          </div>
          <figcaption className={`caption ${styles.disclosure}`}>
            {media.confidence.disclosure}
          </figcaption>
        </figure>

        <div className={styles.after} data-after>
          <p>
            Luxury human hair, expert styling, and the feeling of being entirely
            you.
          </p>
          <Cta href="/shop" variant="line">
            Find your hair
          </Cta>
        </div>
      </div>
    </section>
  );
}
