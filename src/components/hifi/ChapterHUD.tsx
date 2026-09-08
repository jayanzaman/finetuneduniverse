'use client';

import { CHAPTERS } from './chapters';
import { useProgression } from './progression/ProgressionContext';

type ChapterHUDProps = {
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
};

export function ChapterHUD({ activeIndex, onPrev, onNext }: ChapterHUDProps) {
  const { hydrated, chapterProgress } = useProgression();
  const total = CHAPTERS.length;
  const current = CHAPTERS[activeIndex];
  const prev = activeIndex > 0 ? CHAPTERS[activeIndex - 1] : null;
  const next = activeIndex < total - 1 ? CHAPTERS[activeIndex + 1] : null;
  const counter = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  const progress = chapterProgress(activeIndex);
  const earned = hydrated && progress.complete;

  const handleNextClick = () => {
    if (!earned) {
      document.querySelector('.transition-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      onNext();
    }
  };

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
        className={`chapter-hud-arrow ${!earned ? 'is-locked' : ''}`}
        style={{ opacity: earned ? 1 : 0.4 }}
        onClick={handleNextClick}
        disabled={!next}
        aria-label={next ? (earned ? `Next chapter: ${next.t}` : 'Complete tasks to unlock next chapter') : 'End of descent'}
        title={next ? (earned ? `${next.n} · ${next.t}` : 'Complete tasks to unlock next chapter') : 'End of descent'}
      >
        →
      </button>

      <span className="chapter-hud-hint mono" aria-hidden>
        ← → keys
      </span>
    </div>
  );
}
