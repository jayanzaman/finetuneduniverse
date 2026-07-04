import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ProgressionProvider } from '../progression/ProgressionContext';
import { STORAGE_KEY } from '../progression/persistence';
import { PrologueHero } from './PrologueHero';

const wrap = (ui: ReactNode) => render(<ProgressionProvider>{ui}</ProgressionProvider>);

const SEEN = JSON.stringify({ version: 1, prologueSeen: true, components: {} });

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  );
}

afterEach(() => {
  // vitest.config.ts has no `globals: true`, so RTL auto-cleanup never
  // registers — clean up renders explicitly to avoid cross-test leakage.
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('PrologueHero', () => {
  it('reveals lines sequentially on first visit and marks prologueSeen at settle', async () => {
    stubMatchMedia(false);
    const { container } = wrap(
      <PrologueHero onBegin={() => {}} lineDelaysMs={[0, 20, 800]} settleDelayMs={900} />
    );
    const hero = () => container.querySelector('.prologue-hero')!;

    await waitFor(() => expect(hero().getAttribute('data-phase')).toBe('revealing'));
    // Line 1 visible before line 3
    await waitFor(() =>
      expect(container.querySelector('.prologue-l1')!.className).toContain('is-visible')
    );
    expect(container.querySelector('.prologue-l3')!.className).not.toContain('is-visible');

    // After settle: all visible, prologueSeen persisted
    await waitFor(() =>
      expect(container.querySelector('.prologue-l3')!.className).toContain('is-visible')
    );
    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).prologueSeen).toBe(true);
    });
  });

  it('skips to resting on keydown and marks prologueSeen', async () => {
    stubMatchMedia(false);
    const { container } = wrap(
      <PrologueHero onBegin={() => {}} lineDelaysMs={[0, 5000, 10000]} settleDelayMs={15000} />
    );
    const hero = () => container.querySelector('.prologue-hero')!;
    await waitFor(() => expect(hero().getAttribute('data-phase')).toBe('revealing'));

    fireEvent.keyDown(window, { key: 'Enter' });
    await waitFor(() => expect(hero().getAttribute('data-phase')).toBe('resting'));
    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(raw!).prologueSeen).toBe(true);
    });
    // Skip button gone in resting phase
    expect(container.querySelector('.prologue-skip')).toBeNull();
  });

  it('rests immediately for returning visitors (prologueSeen already true)', async () => {
    stubMatchMedia(false);
    window.localStorage.setItem(STORAGE_KEY, SEEN);
    const { container } = wrap(<PrologueHero onBegin={() => {}} />);
    await waitFor(() =>
      expect(container.querySelector('.prologue-hero')!.getAttribute('data-phase')).toBe('resting')
    );
    expect(container.querySelector('.prologue-skip')).toBeNull();
  });

  it('rests immediately under prefers-reduced-motion and marks prologueSeen', async () => {
    stubMatchMedia(true);
    const { container } = wrap(<PrologueHero onBegin={() => {}} />);
    await waitFor(() =>
      expect(container.querySelector('.prologue-hero')!.getAttribute('data-phase')).toBe('resting')
    );
    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).prologueSeen).toBe(true);
    });
  });

  it('fires onBegin when the begin button is clicked', async () => {
    stubMatchMedia(false);
    window.localStorage.setItem(STORAGE_KEY, SEEN);
    const onBegin = vi.fn();
    wrap(<PrologueHero onBegin={onBegin} />);
    const btn = await screen.findByRole('button', { name: /begin the descent/i });
    fireEvent.click(btn);
    expect(onBegin).toHaveBeenCalledTimes(1);
  });
});
