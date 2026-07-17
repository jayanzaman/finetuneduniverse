'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CHAPTERS } from '../chapters';
import { useProgression } from '../progression/ProgressionContext';
import { indexStatus } from './indexStatus';

export type ChapterIndexProps = {
  onSelectChapter: (index: number) => void;
};

export function ChapterIndex({ onSelectChapter }: ChapterIndexProps) {
  const { hydrated, chapterProgress, frontierChapter } = useProgression();
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // jsdom (and very old browsers) lack IntersectionObserver — reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const frontier = hydrated ? frontierChapter() : null;

  return (
    <div ref={rootRef} className={`prologue-index${inView ? ' is-inview' : ''}`}>
      {CHAPTERS.map((ch, i) => {
        const status = hydrated ? indexStatus(chapterProgress(i), frontier === i) : null;
        return (
          <button
            key={ch.n}
            type="button"
            className={`prologue-row${frontier === i ? ' is-frontier' : ''}${
              status?.kind === 'complete' ? ' is-complete' : ''
            }`}
            style={{ '--row': i } as CSSProperties}
            onClick={() => onSelectChapter(i)}
          >
            <span className="prologue-row-n mono">{ch.n}</span>
            <span className="prologue-row-title">{ch.long}</span>
            <span className="prologue-row-d">{ch.question}</span>
            <span className="prologue-row-era mono">{ch.era}</span>
            <span className={`prologue-row-status mono status-${status?.kind ?? 'pending'}`}>
              {status?.label ?? ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
