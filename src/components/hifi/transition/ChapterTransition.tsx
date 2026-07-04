'use client';

import { useEffect, useRef } from 'react';
import { CHAPTERS } from '../chapters';
import { CHAPTER_COMPONENTS } from '../progression/registry';
import { useProgression } from '../progression/ProgressionContext';
import { cue } from '../audio/cues';

export type ChapterTransitionProps = {
  chapterIndex: number;
  /** Starts the handoff sequence toward chapterIndex + 1. */
  onDescend: () => void;
};

function scrollToComponent(componentId: string) {
  document
    .getElementById(`comp-${componentId}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * End-of-chapter transition block (spec §6). Dormant while components remain,
 * earned once the chapter is complete. The final chapter renders a closing
 * block instead (placeholder until C7 defines its content).
 */
export function ChapterTransition({ chapterIndex, onDescend }: ChapterTransitionProps) {
  const { hydrated, chapterProgress, componentState } = useProgression();
  const isLast = chapterIndex === CHAPTERS.length - 1;
  const progress = chapterProgress(chapterIndex);
  const earned = hydrated && progress.complete;

  // Fire the completion cue only on a live false→true flip after hydration —
  // never for a returning visitor whose chapter is already complete on mount.
  const prevComplete = useRef<boolean | null>(null);
  useEffect(() => {
    if (isLast || !hydrated) return;
    if (prevComplete.current === false && progress.complete) cue('chapter-complete');
    prevComplete.current = progress.complete;
  }, [isLast, hydrated, progress.complete]);

  if (isLast) {
    return (
      <div className="transition-closing">
        <div className="transition-eyebrow">End of the descent</div>
        <div className="transition-next">You are here.</div>
        <p className="transition-closing-body">
          Seven thresholds, crossed. The full closing sequence arrives with the final
          chapter&apos;s rebuild.
        </p>
      </div>
    );
  }

  const next = CHAPTERS[chapterIndex + 1];
  const current = CHAPTERS[chapterIndex];
  const remaining = progress.total - progress.done;

  if (earned) {
    return (
      <div className="transition-block is-earned">
        <span className="transition-complete-tag">✓ chapter complete</span>
        <div className="transition-eyebrow">Threshold crossed</div>
        <div className="transition-next">{next.long}</div>
        <div className="transition-era">
          CH {next.n} · <span className="transition-roll">{current.era} → {next.era}</span>
        </div>
        <button type="button" className="transition-descend" onClick={onDescend}>
          Descend <span className="transition-descend-arrow">↓</span>
        </button>
      </div>
    );
  }

  const components = CHAPTER_COMPONENTS[chapterIndex].components;

  return (
    <div className="transition-block is-dormant">
      <div className="transition-veil" aria-hidden />
      <div className="transition-eyebrow">Next phase · locked behind understanding</div>
      <div className="transition-next">{next.long}</div>
      <div className="transition-era">CH {next.n} · {next.era}</div>
      <div className="transition-checklist">
        {components.map((c) => {
          const s = componentState(c.id);
          const done = s.interacted && s.lessonOpened;
          return done ? (
            <span key={c.id} className="transition-check is-done">{c.name}</span>
          ) : (
            <button
              key={c.id}
              type="button"
              className="transition-check is-todo"
              onClick={() => scrollToComponent(c.id)}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      <div className="transition-remain">
        {remaining} component{remaining === 1 ? '' : 's'} remain{remaining === 1 ? 's' : ''} — tap
        one above to jump to it
      </div>
    </div>
  );
}
