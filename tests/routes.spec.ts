import { expect, test } from '@playwright/test';

import { ROUTES, skipCurtain } from './helpers';

test.beforeEach(async ({ page }) => skipCurtain(page));

for (const route of ROUTES) {
  test(`${route} renders with landmarks, one h1 and no runtime errors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForTimeout(800);
    expect(errors).toEqual([]);
  });
}

test('every internal link on every route resolves', async ({
  page,
  request,
}) => {
  const hrefs = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route);
    const found = await page.$$eval('a[href]', (links) =>
      links.map((link) => link.getAttribute('href') ?? ''),
    );
    found
      .filter((href) => href.startsWith('/'))
      .forEach((href) => hrefs.add(href.split('#')[0] || '/'));
  }
  expect(hrefs.size).toBeGreaterThan(5);
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
});

test('in-page anchors point at existing ids', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const missing = await page.$$eval('a[href*="#"]', (links) =>
      links
        .map((link) => new URL((link as HTMLAnchorElement).href))
        .filter(
          (url) =>
            url.pathname === window.location.pathname && url.hash.length > 1,
        )
        .map((url) => url.hash.slice(1))
        .filter((id) => !document.getElementById(decodeURIComponent(id))),
    );
    expect(missing, route).toEqual([]);
  }
});

test('unknown routes show the designed 404', async ({ page }) => {
  const response = await page.goto('/not-a-real-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Lost the',
  );
  await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
});

test('phone numbers are tap-to-call links', async ({ page }) => {
  await page.goto('/book');
  await expect(page.locator('main a[href="tel:+233502115818"]')).toHaveCount(1);
  await expect(page.locator('main a[href="tel:+233549239934"]')).toHaveCount(1);
});
