import { expect, test } from '@playwright/test';

import { scrollThrough, skipCurtain } from './helpers';

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('no pins, no smooth scroll, no curtain, all content visible', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-curtain',
      'on',
    );
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await scrollThrough(page);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    // No hair animation: the portrait <img> is never swapped out.
    await expect(page.locator('#hero [data-hero-subject]')).not.toHaveAttribute(
      'data-gl',
      'on',
    );

    const hidden = await page.$$eval(
      '[data-reveal], [data-hero-item]',
      (elements) =>
        elements
          .filter((el) => {
            const style = getComputedStyle(el);
            return (
              style.visibility === 'hidden' ||
              Number(style.opacity) < 0.99 ||
              style.clipPath.includes('inset(100%')
            );
          })
          .map((el) => el.textContent?.trim().slice(0, 40) || el.tagName),
    );
    expect(hidden).toEqual([]);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the story is readable and navigable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/no-js/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const heading of [
      'Let it',
      'The Hair',
      'Wear your',
      'From hair to',
      'The art is',
      'Your hair.',
    ]) {
      await expect(
        page.getByRole('heading', { name: new RegExp(heading) }).first(),
      ).toBeVisible();
    }
    await expect(
      page.locator('#hero').getByRole('link', { name: 'Book an appointment' }),
    ).toBeVisible();
  });
});

test.describe('pinned chapter', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('pins on desktop and releases into the next chapter', async ({
    page,
  }) => {
    await skipCurtain(page);
    await page.goto('/');
    await page.waitForTimeout(600);
    await expect(page.locator('#artistry')).toHaveClass(/isPinned/);
    await expect(page.locator('.pin-spacer')).not.toHaveCount(0);
    await scrollThrough(page, 0.5);
    // The page still reaches the footer: nothing traps scrolling.
    await expect(page.locator('footer')).toBeInViewport();
  });
});

test('phones play the artistry and confidence stages with the scroll, without pinning', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'mobile only');
  await skipCurtain(page);
  await page.goto('/');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);

  const artistry = page.locator('#artistry');
  await expect(artistry).toHaveAttribute('data-staged', '', { timeout: 8000 });
  const stage = artistry.locator('[data-stage]');
  await expect(stage).toHaveCSS('position', 'sticky');
  const movement = artistry.locator('[data-figure]').nth(1);
  expect(
    await movement.evaluate((el) => getComputedStyle(el).clipPath),
  ).toMatch(/inset\(100%/);

  // Halfway through the section: the stage holds the screen and the second
  // tier has taken over.
  const scrollInto = (selector: string, progress: number) =>
    page.evaluate(
      ([sel, at]) => {
        const el = document.querySelector<HTMLElement>(sel)!;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + (el.offsetHeight - window.innerHeight) * at);
      },
      [selector, progress] as const,
    );
  await scrollInto('#artistry', 0.5);
  await page.waitForTimeout(1600);
  expect(await stage.evaluate((el) => el.getBoundingClientRect().top)).toBe(0);
  expect(await movement.evaluate((el) => getComputedStyle(el).clipPath)).toBe(
    'inset(0%)',
  );
  await expect(artistry.locator('[data-word]').nth(1)).toHaveCSS(
    'color',
    'rgb(240, 234, 225)',
  );

  // The confidence aperture opens across its own stage.
  const confidence = page.locator(
    'section[aria-labelledby="confidence-title"]',
  );
  await expect(confidence).toHaveAttribute('data-staged', '');
  await scrollInto('section[aria-labelledby="confidence-title"]', 1);
  await page.waitForTimeout(1600);
  expect(
    await confidence
      .locator('[data-aperture]')
      .evaluate((el) => getComputedStyle(el).clipPath),
  ).toBe('inset(0%)');
  await expect(confidence.locator('[data-after]')).toBeVisible();
});

test('without WebGL the atmosphere stays still and the hair still answers the scroll', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await skipCurtain(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error -- simulate a device without WebGL
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...rest: unknown[]
    ) {
      if (type.startsWith('webgl') || type === 'experimental-webgl')
        return null;
      return original.call(this, type, ...rest);
    };
  });
  await page.goto('/');
  // The atmosphere stays the CSS still after the attempt and its retry...
  const subject = page.locator('#hero [data-hero-subject]');
  await expect(subject).toHaveAttribute('data-gl', 'on', { timeout: 15000 });
  await expect(page.locator('#hero .hero-scene canvas')).toHaveCount(0);
  const background = await page
    .locator('#hero .hero-scene')
    .evaluate((el) => getComputedStyle(el.parentElement!).backgroundImage);
  expect(background).toContain('radial-gradient');
  // ...while a 2D canvas takes over the portrait, which keeps its alt text.
  await expect(
    page.locator('#hero [data-hero-subject-inner] canvas'),
  ).toHaveCount(1);
  await expect(subject.locator('img')).toHaveCSS('opacity', '0');
  await expect(subject.locator('img')).toHaveAttribute('alt', /.+/);

  // Vertical offset of the hair tips against the unmoved photograph, as a
  // fraction of the portrait height (negative = lifted).
  const tipOffset = () =>
    page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        '#hero [data-hero-subject-inner] canvas',
      )!;
      const img = document.querySelector<HTMLImageElement>(
        '#hero [data-hero-subject] img',
      )!;
      const { width, height } = canvas;
      const x = Math.round(width * 0.15);
      const live = canvas.getContext('2d')!.getImageData(x, 0, 1, height).data;
      const still = document.createElement('canvas');
      still.width = width;
      still.height = height;
      const ctx = still.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      const ref = ctx.getImageData(x, 0, 1, height).data;
      let best = { error: Infinity, dy: 0 };
      const range = Math.round(height * 0.15);
      for (let dy = -range; dy <= range / 3; dy += 1) {
        let error = 0;
        let count = 0;
        for (let y = Math.round(height * 0.3); y < height * 0.75; y += 2) {
          const yy = y - dy;
          for (let c = 0; c < 3; c += 1)
            error += Math.abs(live[y * 4 + c]! - ref[yy * 4 + c]!);
          count += 1;
        }
        if (error / count < best.error) best = { error: error / count, dy };
      }
      return best.dy / height;
    });

  await page.waitForTimeout(500);
  const atRest = await tipOffset();
  expect(Math.abs(atRest)).toBeLessThan(0.025); // idle swing only
  await page.evaluate(() => {
    const hero = document.getElementById('hero')!;
    window.scrollTo(0, hero.offsetHeight * 0.55);
  });
  await page.waitForTimeout(2500); // let the toss settle
  // Lifted by the scroll (polled: frames can be slow on a loaded machine).
  await expect.poll(tipOffset, { timeout: 8000 }).toBeLessThan(-0.04);
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
});

test('WebGL renders the atmosphere and takes over the portrait for the hair motion', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium');
  const consoleErrors: string[] = [];
  page.on(
    'console',
    (m) => m.type() === 'error' && consoleErrors.push(m.text()),
  );
  await skipCurtain(page);
  await page.goto('/');
  await expect(page.locator('#hero canvas')).toHaveCount(1, { timeout: 8000 });
  await expect(page.locator('#hero canvas')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const subject = page.locator('#hero [data-hero-subject]');
  await expect(subject).toHaveAttribute('data-gl', 'on', { timeout: 15000 });
  await expect(subject.locator('img')).toHaveCSS('opacity', '0');
  // The <img> keeps its alt text for assistive technology.
  await expect(subject.locator('img')).toHaveAttribute('alt', /.+/);
  expect(consoleErrors).toEqual([]);
});

test('if the app script never loads, the curtain and staged content fail safe', async ({
  page,
}) => {
  await page.route('**/_next/static/chunks/*.js', (route) => route.abort());
  await page.goto('/');
  await page.waitForTimeout(5200);
  const curtainVisible = await page.$eval('[class*="curtain"]', (el) => {
    const style = getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity) > 0
    );
  });
  expect(curtainVisible).toBe(false);
  await expect(page.locator('html')).toHaveClass(/reveal-failsafe/);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('heading', { name: /The Hair/ })).toBeVisible();
  // The phone stages fall back to the natural sequence, every tier shown.
  await expect(page.locator('#artistry [data-stage]')).not.toHaveCSS(
    'position',
    'sticky',
  );
  const clips = await page.$$eval('#artistry [data-figure]', (figures) =>
    figures.map((el) => getComputedStyle(el).clipPath),
  );
  expect(clips).toEqual(['none', 'none', 'none']);
});

test('first visit shows the curtain once per session', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'the curtain is desktop-only');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-curtain', 'on');
  await expect(page.locator('html')).not.toHaveAttribute('data-curtain', 'on', {
    timeout: 6000,
  });
  await page.goto('/shop');
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-curtain', 'on');
});

test.describe('closing hair field', () => {
  const closing = 'section[aria-labelledby="closing-title"]';

  test('animates with the scroll when WebGL is available', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium');
    const consoleErrors: string[] = [];
    page.on(
      'console',
      (m) => m.type() === 'error' && consoleErrors.push(m.text()),
    );
    await skipCurtain(page);
    await page.goto('/');
    // Nothing is created until the section approaches.
    await expect(page.locator(`${closing} canvas`)).toHaveCount(0);
    await page.locator(closing).scrollIntoViewIfNeeded();
    await expect(page.locator(`${closing} canvas`)).toHaveAttribute(
      'data-ready',
      'true',
      { timeout: 15000 },
    );
    // The static image stays underneath as the fallback.
    await expect(page.locator(`${closing} img`)).toHaveCount(1);
    expect(consoleErrors).toEqual([]);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('stays a still photograph', async ({ page }) => {
      await page.goto('/');
      await page.locator(closing).scrollIntoViewIfNeeded();
      await page.waitForTimeout(2500);
      await expect(page.locator(`${closing} canvas`)).toHaveCount(0);
      await expect(page.locator(`${closing} img`)).toBeVisible();
    });
  });
});

test.describe('phones', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone behaviour');

  test('no curtain, and nothing on screen is hidden while scripts load', async ({
    page,
  }) => {
    for (const route of ['/', '/shop', '/academy']) {
      await page.goto(route);
      await expect(page.locator('html')).not.toHaveAttribute(
        'data-curtain',
        'on',
      );
      await page.waitForTimeout(1500);
      const hidden = await page.$$eval(
        '[data-reveal], [data-hero-item]',
        (elements) =>
          elements
            .filter((el) => el.getBoundingClientRect().top < window.innerHeight)
            .filter((el) => {
              const style = getComputedStyle(el);
              return (
                style.visibility === 'hidden' || Number(style.opacity) < 0.99
              );
            })
            .map((el) => el.textContent?.trim().slice(0, 40) || el.tagName),
      );
      expect(hidden, route).toEqual([]);
    }
  });

  test('desktop-only libraries are not downloaded', async ({ page }) => {
    const scripts: string[] = [];
    page.on('response', async (response) => {
      if (response.request().resourceType() !== 'script') return;
      const body = await response.text().catch(() => '');
      if (/lenis-smooth|lenis-stopped/.test(body)) scripts.push('lenis');
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    expect(scripts).toEqual([]);
  });

  test('content below the fold reveals as it scrolls in', async ({ page }) => {
    for (const route of ['/', '/academy']) {
      await page.goto(route);
      await scrollThrough(page);
      await page.waitForTimeout(2200); // let the last reveals finish
      const hidden = await page.$$eval('[data-reveal]', (elements) =>
        elements
          .filter((el) => {
            const style = getComputedStyle(el);
            return (
              Number(style.opacity) < 0.99 ||
              style.visibility === 'hidden' ||
              style.clipPath.startsWith('inset(100%')
            );
          })
          .map((el) => el.textContent?.trim().slice(0, 40) || el.tagName),
      );
      expect(hidden, route).toEqual([]);
    }
  });
});
