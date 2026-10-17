import { expect, test } from '@playwright/test';

import { skipCurtain } from './helpers';

test.beforeEach(async ({ page }) => skipCurtain(page));

test.describe('desktop header', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop navigation only');

  test('primary navigation reaches every destination', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const [label, path] of [
      ['Shop', '/shop'],
      ['Services', '/services'],
      ['Academy', '/academy'],
      ['Our Story', '/story'],
    ] as const) {
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect(nav.getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
    await page.getByRole('banner').getByRole('link', { name: /book/i }).click();
    await expect(page).toHaveURL('/book');
  });

  test('hero calls to action lead to shop and booking', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('#hero');
    await expect(
      hero.getByRole('link', { name: 'Explore the hair' }),
    ).toHaveAttribute('href', '/shop');
    await expect(
      hero.getByRole('link', { name: 'Book an appointment' }),
    ).toHaveAttribute('href', '/book');
  });
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile menu only');

  test('opens as a modal, traps focus, closes on Escape and restores focus', async ({
    page,
  }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();

    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await expect(dialog).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

    // Focus stays inside the dialog while tabbing.
    for (let i = 0; i < 14; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('dialog[open]')),
      );
      expect(inside).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('navigates and closes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await dialog.getByRole('link', { name: 'Academy' }).click();
    await expect(page).toHaveURL('/academy');
    await expect(dialog).toBeHidden();
    await expect(page.locator('h1')).toContainText('The art is');
  });
});

test('skip link moves focus to main content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard path checked on desktop');
  await page.goto('/services');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});
