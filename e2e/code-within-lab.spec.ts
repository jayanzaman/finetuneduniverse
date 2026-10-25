import { test, expect, type Page } from '@playwright/test';

const CH08 = '/questions/how-do-four-letters-write-a-person';

function captureErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    errors.push(`console.error: ${msg.text().slice(0, 200)}`);
  });
  return errors;
}

test.describe('chapter 08 deeper lab', () => {
  test('chapter page links to the dedicated lab page', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto(CH08, { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /explore the deeper lab/i }).click();
    await page.waitForURL(`${CH08}/lab`);
    await expect(page.getByRole('heading', { name: /the best data center/i })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('lab page renders the scrolly module without errors', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto(`${CH08}/lab`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /the best data center/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /dna storage comparator/i })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect.soft(overflow, 'ch08 lab overflows horizontally').toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('renders WebGL scenes without R3F reconciliation errors', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto(`${CH08}/lab`, { waitUntil: 'networkidle' });

    const canvas = page.locator('.lab-workspace canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    await page.getByRole('heading', { name: /four letters, sixty-four words/i }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.getByRole('heading', { name: /twenty building blocks/i }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: /the best data center/i })).toBeAttached();
    expect(errors).toEqual([]);
  });
});
