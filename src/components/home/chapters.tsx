'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { media } from '@/content/media';
import { chapters } from '@/content/site';
import { gsap, registerGsap, type ScrollTrigger } from '@/lib/gsap';
import { whenIdle } from '@/lib/idle';
import styles from './chapters.module.css';

const images = [media.texture, media.movement, media.finish] as const;
const PINNED = styles.isPinned ?? 'is-pinned';

/**
 * TEXTURE / MOVEMENT / FINISH.
 * With motion, one stage holds the screen while each tier enters as the
 * previous one recedes: pinned by ScrollTrigger on desktop, and held by CSS
 * `position: sticky` on phones and portrait tablets (smooth under touch
 * scrolling, no pin spacer; the CSS lays it out from first paint). Short
 * landscape phones, and phones whose scripts arrived after the boot
 * failsafe had already restored the natural layout, get a reveal per tier.
 * Reduced motion and no-JS get the natural vertical sequence.
 */
export function Chapters() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const section = root.current;
    if (!section) return;
    const q = gsap.utils.selector(section);
    const mm = gsap.matchMedia();

    // The scrubbed sequence shared by the pinned and sticky stages.
    const sequence = (
      scrollTrigger: ScrollTrigger.Vars,
      dim: string,
    ): gsap.core.Timeline => {
      const words = q('[data-word]');
      const lines = q('[data-line]');
      const figures = q('[data-figure]');
      const shades = q('[data-shade]');
      const imgs = figures.map((figure) => figure.querySelector('img'));

      gsap.set(words.slice(1), { color: dim });
      gsap.set(lines.slice(1), { yPercent: 115 });
      gsap.set(figures.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(imgs.slice(1), { scale: 1.22 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 1 },
        scrollTrigger,
      });

      tl.to({}, { duration: 0.35 });
      for (let i = 0; i < figures.length - 1; i += 1) {
        const at = `step${i}`;
        tl.addLabel(at)
          .to(words[i] ?? [], { color: dim, duration: 0.6 }, at)
          .to(
            words[i + 1] ?? [],
            { color: 'rgba(240, 234, 225, 1)', duration: 0.6 },
            at,
          )
          .to(lines[i] ?? [], { yPercent: -115, duration: 0.6 }, at)
          .to(lines[i + 1] ?? [], { yPercent: 0, duration: 0.7 }, `${at}+=0.3`)
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
      return tl;
    };

    mm.add(
      '(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)',
      () => {
        section.classList.add(PINNED);
        sequence(
          {
            trigger: q('[data-stage]')[0],
            start: 'top top',
            end: () => `+=${window.innerHeight * 2.6}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            refreshPriority: 2,
            invalidateOnRefresh: true,
          },
          'rgba(240, 234, 225, 0.16)',
        );
        return () => section.classList.remove(PINNED);
      },
    );

    // Phones and portrait tablets: the section supplies the scroll and the
    // stage sticks (both CSS, which also shows the opening frame until the
    // sequence is ready) while the same sequence plays across it. Set up when
    // idle: it is below the fold. Words sit over the photograph here, so the
    // resting ones stay brighter.
    const late = document.documentElement.classList.contains('reveal-failsafe');
    mm.add(
      {
        stage: '(min-height: 560px)',
        compact:
          '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
      },
      (context) => {
        const { stage, compact } = context.conditions ?? {};
        if (!compact) return;
        if (stage && !late) {
          const cancel = whenIdle(() =>
            context.add(() => {
              sequence(
                {
                  trigger: section,
                  start: 'top top',
                  end: 'bottom bottom',
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
                'rgba(240, 234, 225, 0.3)',
              );
              section.dataset.staged = '';
            }),
          );
          return () => {
            cancel();
            delete section.dataset.staged;
          };
        }

        // No stage: each tier unveils as it arrives.
        q('[data-tier]').forEach((tier) => {
          const figure = tier.querySelector('[data-figure]');
          const img = figure?.querySelector('img');
          const word = tier.querySelector('[data-word]');
          const line = tier.querySelector('[data-line]');
          const tl = gsap.timeline({
            scrollTrigger: { trigger: tier, start: 'top 82%', once: true },
          });
          if (figure)
            tl.fromTo(
              figure,
              { autoAlpha: 0, y: 36 },
              { autoAlpha: 1, y: 0, duration: 1.2 },
            );
          if (img)
            tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.8 }, 0.1);
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
