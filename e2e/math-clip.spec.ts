import { test, expect } from '@playwright/test';

const CH01_CLIP_PAGE = '/questions/why-did-the-universe-begin-ordered/lab/dark-energy';

test.describe('MathClip (Manim pilot 1.2)', () => {
  test('clip attributes: muted, playsInline, preload="none", poster set, equation as text', async ({
    page,
  }) => {
    await page.goto(CH01_CLIP_PAGE, { waitUntil: 'networkidle' });
    const video = page.locator('[data-math-clip="1.2"] video').first();
    await expect(video).toBeAttached();
    await expect(video).toHaveAttribute('muted', /.*/);
    await expect(video).toHaveAttribute('playsinline', /.*/);
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('poster', /\/math\/1\.2\/poster\./);
    const equation = page.locator('[data-math-clip="1.2"] [data-equation]').first();
    await expect(equation).toContainText('ρ');
  });

  test('plays when scrolled into view, pauses when scrolled out', async ({ page }) => {
    await page.goto(CH01_CLIP_PAGE, { waitUntil: 'networkidle' });
    // the last beat sits deepest in the card, so scroll-top is reliably out of view
    const video = page.locator('[data-math-clip="1.2"] video').last();
    await video.scrollIntoViewIfNeeded();
    await expect
      .poll(async () => video.evaluate((v: HTMLVideoElement) => v.paused), { timeout: 10_000 })
      .toBe(false);
    // the shell scrolls an inner container, not the window
    await video.evaluate((v) => {
      let p = v.parentElement;
      while (p) {
        const s = getComputedStyle(p);
        if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight) {
          p.scrollTop = 0;
          return;
        }
        p = p.parentElement;
      }
      window.scrollTo(0, 0);
    });
    await expect
      .poll(async () => video.evaluate((v: HTMLVideoElement) => v.paused), { timeout: 10_000 })
      .toBe(true);
  });

  test('reduced motion shows only the poster', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(CH01_CLIP_PAGE, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-math-clip="1.2"] video')).toHaveCount(0);
    const img = page.locator('[data-math-clip="1.2"] img').first();
    await expect(img).toBeAttached();
    await expect(img).toHaveAttribute('src', /\/math\/1\.2\/poster\./);
    await context.close();
  });

  test('390 px viewport loads the portrait asset', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(CH01_CLIP_PAGE, { waitUntil: 'networkidle' });
    const video = page.locator('[data-math-clip="1.2"] video').first();
    await expect(video).toHaveAttribute('src', /\.portrait\.mp4$/);
    await expect(video).toHaveAttribute('poster', /\.portrait\.png$/);
    await context.close();
  });

  test('desktop viewport loads the landscape asset', async ({ page }) => {
    await page.goto(CH01_CLIP_PAGE, { waitUntil: 'networkidle' });
    const video = page.locator('[data-math-clip="1.2"] video').first();
    await expect(video).toHaveAttribute('src', /\.landscape\.mp4$/);
  });

  test('every beat is its own clip in scroll order', async ({ page }) => {
    await page.goto(CH01_CLIP_PAGE, { waitUntil: 'networkidle' });
    const beats = await page
      .locator('[data-math-clip="1.2"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-beat')));
    expect(beats).toEqual(['b1_cube', 'b2_light', 'b3_slopes', 'b4_markers', 'close']);
  });
});
