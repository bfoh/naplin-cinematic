import { expect, test } from '@playwright/test';

import {
  horizontalOverflow,
  ROUTES,
  scrollThrough,
  skipCurtain,
  VIEWPORTS,
} from './helpers';

test.describe.configure({ mode: 'parallel' });
test.skip(({ isMobile }) => isMobile, 'viewports are set explicitly; run once');

for (const viewport of VIEWPORTS) {
  test(`no horizontal overflow and an unclipped hero at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await skipCurtain(page);
    await page.setViewportSize(viewport);
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForTimeout(400);

      // The H1 sits fully inside the viewport horizontally.
      const box = await page.locator('h1').boundingBox();
      expect(box, route).not.toBeNull();
      expect(box!.x, route).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, route).toBeLessThanOrEqual(
        viewport.width + 1,
      );

      await scrollThrough(page);
      expect(
        await horizontalOverflow(page),
        `${route} overflow`,
      ).toBeLessThanOrEqual(0);
    }
  });
}

test('primary actions meet the 44px touch target on phones', async ({
  page,
}) => {
  await skipCurtain(page);
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ROUTES) {
    await page.goto(route);
    const small = await page.$$eval(
      'header a, header button, .btn, .text-link, footer a, main a[href^="tel:"]',
      (elements) =>
        elements
          .filter((el) => (el as HTMLElement).offsetParent !== null)
          .map((el) => ({
            text: el.textContent?.trim().slice(0, 30),
            h: el.getBoundingClientRect().height,
          }))
          .filter((item) => item.h < 40),
    );
    expect(small, route).toEqual([]);
  }
});
