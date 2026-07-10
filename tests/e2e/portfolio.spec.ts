import { expect, test } from '@playwright/test';

test('case study leads with scope and supports Focus read', async ({
  page,
}) => {
  await page.goto('/case-study/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'ADHD Mode',
  );
  await expect(page.getByText('Independent coded concept')).toBeVisible();
  await expect(page.getByText('No participant study yet')).toBeVisible();

  const focusToggle = page.locator('#focus-toggle-sticky');
  await focusToggle.click();
  await expect(focusToggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveClass(/cs-focus/);

  const collapsed = page.locator('section[aria-labelledby="brief-heading"]');
  await expect(collapsed).not.toHaveClass(/cs-expanded/);
  await expect(collapsed.locator('.cs-tldr')).toBeVisible();
  await collapsed.getByRole('button', { name: 'Read this section' }).click();
  await expect(collapsed).toHaveClass(/cs-expanded/);
});

test('the Action Dock exposes equivalent skip and reaction paths', async ({
  page,
}) => {
  await page.goto('/prototype/demo.html');

  const postAuthor = page.locator('#post-author');
  const firstAuthor = await postAuthor.textContent();
  await page.getByRole('button', { name: 'Move on to the next post' }).click();
  await expect.poll(() => postAuthor.textContent()).not.toBe(firstAuthor);

  await page.getByRole('button', { name: 'Toggle reactions' }).click();
  await expect(
    page.getByRole('button', { name: /React with Insightful/ }),
  ).toBeVisible();

  await page.getByRole('button', { name: /React with Support/ }).click();
  await expect(page.locator('#meta-queue')).toHaveText('↻ 1');
});

test('closed dialogs stay out of the focus order', async ({ page }) => {
  await page.goto('/prototype/demo.html');

  const commentDialog = page.locator('#sheet');
  const composeDialog = page.locator('#compose-sheet');
  await expect(commentDialog).toHaveAttribute('aria-hidden', 'true');
  await expect(composeDialog).toHaveAttribute('aria-hidden', 'true');
  await expect(commentDialog).toHaveAttribute('inert', '');
  await expect(composeDialog).toHaveAttribute('inert', '');

  await page.getByRole('button', { name: 'Write a comment' }).click();
  await expect(composeDialog).toHaveAttribute('aria-hidden', 'false');
  await expect(composeDialog).not.toHaveAttribute('inert', '');
});

test('mobile case study avoids an embedded scroll trap', async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('mobile'),
    'Mobile-only behavior',
  );
  await page.goto('/case-study/#demo');

  await expect(page.locator('.cs-demo-frame iframe')).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Open full-screen prototype' }),
  ).toBeVisible();
  const canScroll = await page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  );
  expect(canScroll).toBe(true);
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
});
