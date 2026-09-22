import { test, expect, type Page } from '@playwright/test';

const CHAPTERS = [
  '/questions/why-did-the-universe-begin-ordered',
  '/questions/why-did-any-matter-survive',
  '/questions/why-can-stars-make-complex-elements',
  '/questions/how-do-galaxies-become-stable',
  '/questions/how-narrow-is-planetary-habitability',
  '/questions/can-chemistry-begin-copying-itself',
  '/questions/why-did-complex-life-take-so-long',
];

const ROUTES = ['/', ...CHAPTERS];

function captureErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    errors.push(`console.error: ${msg.text().slice(0, 200)}`);
  });
  return errors;
}

test.describe('guided story visual smoke', () => {
  for (const route of ROUTES) {
    test(`${route} renders cleanly without horizontal overflow`, async ({ page }) => {
      const errors = captureErrors(page);
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForSelector('.prologue, .hifi-frame');
      await page.waitForTimeout(250);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect.soft(overflow, `${route} overflows horizontally`).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }

  test('chapter 01 exposes the primary slider and deeper-lab toggle', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto(CHAPTERS[0], { waitUntil: 'networkidle' });
    await expect(page.locator('.gs-track')).toBeVisible();
    await expect(page.getByRole('button', { name: /explore the deeper lab/i })).toBeVisible();
    expect(errors).toEqual([]);
  });
});