import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const route of ['/case-study/', '/prototype/demo.html']) {
  test(`${route} has no automated WCAG A or AA violations`, async ({
    page,
  }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  });
}

test('reduced motion preserves reaction state without ambient updates', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/prototype/demo.html');

  const commentBefore = await page.locator('#comment-text').textContent();
  await page.waitForTimeout(1_000);
  await expect(page.locator('#comment-text')).toHaveText(commentBefore || '');

  await page.getByRole('button', { name: 'Toggle reactions' }).click();
  await page.getByRole('button', { name: /React with Support/ }).click();
  await expect(page.locator('#meta-queue')).toHaveText('↻ 1');
});
