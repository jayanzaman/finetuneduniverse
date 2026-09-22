import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ProgressionProvider } from './progression/ProgressionContext';
import { PrologueLanding } from './prologue/PrologueLanding';
import { ChapterFrame } from './ChapterFrame';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

function stubMatchMedia() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
}

describe('core-view accessibility', () => {
  it('landing: exposes a document heading and seven named chapter rows', () => {
    stubMatchMedia();
    render(
      <ProgressionProvider>
        <PrologueLanding onBegin={() => {}} onSelectChapter={() => {}} />
      </ProgressionProvider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.getByRole('button', { name: /begin the descent/i })).toBeTruthy();

    const rows = screen.getAllByRole('button').filter((b) => b.className.includes('prologue-row'));
    expect(rows).toHaveLength(7);
    for (const row of rows) {
      expect((row.textContent || '').trim().length).toBeGreaterThan(0);
    }
  });

  it('chapter: labels the slider and keeps actions discoverable by accessible name', () => {
    render(
      <ChapterFrame
        num="03"
        chapterIndex={2}
        era="200 Myr"
        title={<span>First light</span>}
        prose="Stellar ignition."
        sliderProps={{
          label: 'Stellar mass',
          value: '1.0',
          unit: 'M☉',
          position: 0.42,
          interactive: true,
          ariaLabel: 'Stellar mass control',
        }}
        experimentOutcome={<>outcome</>}
        formula={<>formula</>}
        question={<>A motivating question</>}
        currentAnswer={<>answer</>}
        openQuestion={<>open</>}
        evidenceLabel="Observation + model"
      >
        <div>lab</div>
      </ChapterFrame>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();

    const slider = screen.getByRole('slider', { name: /stellar mass control/i });
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('1');
    expect(slider.getAttribute('aria-valuenow')).toBeTruthy();

    expect(screen.getByRole('button', { name: /explore the deeper lab/i })).toBeTruthy();
  });
});