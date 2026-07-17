import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { HandoffOverlay } from './HandoffOverlay';

function stubMatchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function renderOverlay(beats: [number, number, number] = [120, 120, 120]) {
  const onArrive = vi.fn();
  const onDone = vi.fn();
  render(
    <HandoffOverlay
      fromIndex={0}
      toIndex={1}
      onArrive={onArrive}
      onDone={onDone}
      beatDurationsMs={beats}
    />
  );
  return { onArrive, onDone };
}

beforeEach(() => stubMatchMedia(false));
afterEach(() => cleanup());

describe('HandoffOverlay — beats', () => {
  it('runs collapse → roll → bloom, arriving after beat 1 and finishing after beat 3', async () => {
    const { onArrive, onDone } = renderOverlay();
    const overlay = document.querySelector('.handoff')!;
    expect(overlay.getAttribute('data-beat')).toBe('collapse');
    expect(onArrive).not.toHaveBeenCalled();

    await waitFor(() => expect(overlay.getAttribute('data-beat')).toBe('roll'));
    expect(onArrive).toHaveBeenCalledTimes(1);
    // era roll text shows the two chapters' cosmic times
    expect(overlay.textContent).toContain('13.8 Bya');
    expect(overlay.textContent).toContain('t + 1μs');

    await waitFor(() => expect(overlay.getAttribute('data-beat')).toBe('bloom'));
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(onArrive).toHaveBeenCalledTimes(1);
  });
});

describe('HandoffOverlay — skip', () => {
  it('any key skips: arrives once and finishes immediately', async () => {
    const { onArrive, onDone } = renderOverlay([5000, 5000, 5000]);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('a click skips too', async () => {
    const { onArrive, onDone } = renderOverlay([5000, 5000, 5000]);
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerdown'));
    });
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('skipping after arrival does not call onArrive twice', async () => {
    const { onArrive, onDone } = renderOverlay([20, 5000, 5000]);
    await waitFor(() => expect(onArrive).toHaveBeenCalledTimes(1));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('HandoffOverlay — reduced motion', () => {
  it('arrives immediately, shows a static from → to line, and fades out', async () => {
    stubMatchMedia(true);
    const { onArrive, onDone } = renderOverlay([5000, 5000, 60]);
    const overlay = document.querySelector('.handoff')!;
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(overlay.getAttribute('data-beat')).toBe('cut');
    expect(overlay.textContent).toContain('13.8 Bya → t + 1μs');
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });
});
