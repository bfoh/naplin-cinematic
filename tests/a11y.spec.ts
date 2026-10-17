import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { ROUTES, scrollThrough, skipCurtain } from './helpers';

// Audit the settled page: reduced motion removes entrance states.
test.use({ reducedMotion: 'reduce' });

for (const route of ROUTES) {
  test(`${route} has no serious or critical axe violations`, async ({
    page,
  }) => {
    await skipCurtain(page);
    await page.goto(route);
    await scrollThrough(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations
      .filter((violation) =>
        ['serious', 'critical'].includes(violation.impact ?? ''),
      )
      .map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target.join(' ')).slice(0, 5),
      }));
    expect(serious).toEqual([]);
  });
}
