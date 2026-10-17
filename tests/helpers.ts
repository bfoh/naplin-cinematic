import type { Page } from '@playwright/test';

export const ROUTES = [
  '/',
  '/shop',
  '/services',
  '/academy',
  '/story',
  '/book',
] as const;

export const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

/** Skip the first-visit curtain so tests start from the page itself. */
export async function skipCurtain(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('naplin-curtain', '1');
    } catch {}
  });
}

/** Scroll through the page in viewport steps so lazy content and reveals settle. */
export async function scrollThrough(page: Page, step = 0.8) {
  const height = await page.evaluate(() => window.innerHeight);
  let last = -1;
  for (let i = 0; i < 80; i += 1) {
    const y = await page.evaluate(
      (d) => {
        window.scrollBy(0, d);
        return window.scrollY;
      },
      Math.round(height * step),
    );
    await page.waitForTimeout(120);
    if (y === last) break;
    last = y;
  }
}

export async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
}
