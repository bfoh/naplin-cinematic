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

test('phones never pin', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await skipCurtain(page);
  await page.goto('/');
  await scrollThrough(page);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('#artistry')).not.toHaveClass(/isPinned/);
});

test('WebGL failure keeps the still atmosphere and raises no errors', async ({
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
  // Allow for the initial attempt and the single retry.
  await page.waitForTimeout(4500);
  await expect(page.locator('#hero canvas')).toHaveCount(0);
  const background = await page
    .locator('#hero .hero-scene')
    .evaluate((el) => getComputedStyle(el.parentElement!).backgroundImage);
  expect(background).toContain('radial-gradient');
  // The portrait <img> stays in charge and visible.
  const subject = page.locator('#hero [data-hero-subject]');
  await expect(subject).not.toHaveAttribute('data-gl', 'on');
  await expect(subject.locator('img')).toHaveCSS('opacity', '1');
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
});

test('first visit shows the curtain once per session', async ({ page }) => {
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
