'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { media } from '@/content/media';
import { chapters } from '@/content/site';
import { gsap, registerGsap } from '@/lib/gsap';
import styles from './chapters.module.css';

const images = [media.texture, media.movement, media.finish] as const;
const PINNED = styles.isPinned ?? 'is-pinned';

/**
 * TEXTURE / MOVEMENT / FINISH.
 * Desktop with motion: one pinned stage; each tier enters as the previous one
 * recedes, then the pin releases. Phones, reduced motion and no-JS: a natural
 * vertical sequence with nothing pinned.
 */
export function Chapters() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const section = root.current;
    if (!section) return;
    const q = gsap.utils.selector(section);
    const mm = gsap.matchMedia();

    mm.add(
      '(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)',
      () => {
        section.classList.add(PINNED);
        const words = q('[data-word]');
        const lines = q('[data-line]');
        const figures = q('[data-figure]');
        const shades = q('[data-shade]');
        const imgs = figures.map((figure) => figure.querySelector('img'));

        gsap.set(words.slice(1), { color: 'rgba(240, 234, 225, 0.16)' });
        gsap.set(lines.slice(1), { yPercent: 115 });
        gsap.set(figures.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set(imgs.slice(1), { scale: 1.22 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          scrollTrigger: {
            trigger: q('[data-stage]')[0],
            start: 'top top',
            end: () => `+=${window.innerHeight * 2.6}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            refreshPriority: 2,
            invalidateOnRefresh: true,
          },
        });

        tl.to({}, { duration: 0.35 });
        for (let i = 0; i < figures.length - 1; i += 1) {
          const at = `step${i}`;
          tl.addLabel(at)
            .to(
              words[i] ?? [],
              { color: 'rgba(240, 234, 225, 0.16)', duration: 0.6 },
              at,
            )
            .to(
              words[i + 1] ?? [],
              { color: 'rgba(240, 234, 225, 1)', duration: 0.6 },
              at,
            )
            .to(lines[i] ?? [], { yPercent: -115, duration: 0.6 }, at)
            .to(
              lines[i + 1] ?? [],
              { yPercent: 0, duration: 0.7 },
              `${at}+=0.3`,
            )
            .to(figures[i + 1] ?? [], { clipPath: 'inset(0% 0% 0% 0%)' }, at)
            .to(imgs[i + 1] ?? [], { scale: 1 }, at)
            .to(imgs[i] ?? [], { scale: 0.94, yPercent: -4 }, at)
            .to(shades[i] ?? [], { opacity: 0.62 }, at)
            .to({}, { duration: 0.45 });
        }
        tl.to(
          '[data-progress]',
          { scaleY: 1, ease: 'none', duration: tl.duration() },
          0,
        );

        return () => section.classList.remove(PINNED);
      },
    );

    // Phones / tablets: each tier unveils as it arrives. No pin.
    mm.add(
      '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
      () => {
        q('[data-tier]').forEach((tier) => {
          const figure = tier.querySelector('[data-figure]');
          const img = figure?.querySelector('img');
          const word = tier.querySelector('[data-word]');
          const line = tier.querySelector('[data-line]');
          const tl = gsap.timeline({
            scrollTrigger: { trigger: tier, start: 'top 82%', once: true },
          });
          // Phones: opacity and transform only (no clip-path repaints).
          const phone = window.matchMedia('(max-width: 767px)').matches;
          if (figure && phone) {
            tl.fromTo(
              figure,
              { autoAlpha: 0, y: 36 },
              { autoAlpha: 1, y: 0, duration: 1.2 },
            );
          } else if (figure) {
            tl.fromTo(
              figure,
              { clipPath: 'inset(100% 0% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.4,
                ease: 'expo.inOut',
              },
            );
          }
          if (img)
            tl.fromTo(
              img,
              { scale: phone ? 1.08 : 1.18 },
              { scale: 1, duration: 1.8 },
              0.1,
            );
          if (word) tl.from(word, { yPercent: 110, duration: 1.3 }, 0.45);
          if (line) tl.from(line, { yPercent: 115, duration: 1.2 }, 0.6);
        });
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="artistry"
      className={styles.chapters}
      aria-labelledby="artistry-title"
    >
      <div className={styles.stage} data-stage>
        <div className={styles.intro}>
          <p className="eyebrow">The artistry</p>
          <h2 id="artistry-title" className="sr-only">
            Texture, movement and finish
          </h2>
          <p className={styles.summary}>
            Beautiful hair is a balance of texture, natural movement and a
            finish you can feel.
          </p>
        </div>

        {chapters.map((chapter, index) => {
          const asset = images[index]!;
          return (
            <article
              key={chapter.id}
              className={styles.tier}
              data-tier
              aria-labelledby={`tier-${chapter.id}`}
            >
              <h3
                id={`tier-${chapter.id}`}
                className={`display ${styles.word}`}
              >
                <span className={styles.mask}>
                  <span data-word className={styles.wordInner}>
                    {chapter.word}.
                  </span>
                </span>
              </h3>
              <p className={styles.line}>
                <span className={styles.mask}>
                  <span data-line className={styles.lineInner}>
                    {chapter.line}
                  </span>
                </span>
              </p>
              <figure className={styles.figure}>
                <div className={styles.frame} data-figure>
                  <Image
                    src={asset.image}
                    alt={asset.alt}
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 70vw, 100vw"
                    placeholder="blur"
                    quality={80}
                  />
                  <span
                    className={styles.shade}
                    data-shade
                    aria-hidden="true"
                  />
                </div>
              </figure>
            </article>
          );
        })}

        <div className={styles.progress} aria-hidden="true">
          <span data-progress />
        </div>
      </div>
    </section>
  );
}
