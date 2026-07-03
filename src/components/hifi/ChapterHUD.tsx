'use client';

import { CHAPTERS } from './chapters';

type ChapterHUDProps = {
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
};

export function ChapterHUD({ activeIndex, onPrev, onNext }: ChapterHUDProps) {
  const total = CHAPTERS.length;
  const current = CHAPTERS[activeIndex];
  const prev = activeIndex > 0 ? CHAPTERS[activeIndex - 1] : null;
  const next = activeIndex < total - 1 ? CHAPTERS[activeIndex + 1] : null;
  const counter = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <div className="chapter-hud" role="navigation" aria-label="Chapter navigation">
      <button
        type="button"
        className="chapter-hud-arrow"
        onClick={onPrev}
        aria-label={prev ? `Previous chapter: ${prev.t}` : 'Back to index'}
        title={prev ? `${prev.n} · ${prev.t}` : 'Back to index'}
      >
        ←
      </button>

      <div className="chapter-hud-center">
        <span className="chapter-hud-counter">{counter}</span>
        <span className="chapter-hud-divider" aria-hidden />
        <span className="chapter-hud-title">
          <span className="chapter-hud-num">Ch {current.n}</span>
          <span className="chapter-hud-name">{current.t}</span>
        </span>
      </div>

      <button
        type="button"
        className="chapter-hud-arrow"
        onClick={onNext}
        disabled={!next}
        aria-label={next ? `Next chapter: ${next.t}` : 'End of descent'}
        title={next ? `${next.n} · ${next.t}` : 'End of descent'}
      >
        →
      </button>

      <span className="chapter-hud-hint mono" aria-hidden>
        ← → keys
      </span>
    </div>
  );
}
