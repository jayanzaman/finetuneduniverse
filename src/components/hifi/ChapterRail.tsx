'use client';

import { CHAPTERS } from './chapters';

type ChapterRailProps = {
  /** Index of the active chapter, or -1 / null when on the landing screen. */
  active: number | null;
  onSelect?: (index: number) => void;
};

/**
 * Right-edge vertical rail showing every chapter as a dot.
 * The active one fills indigo, hover reveals the chapter title.
 */
export function ChapterRail({ active, onSelect }: ChapterRailProps) {
  return (
    <div className="chapter-rail" aria-label="Chapter index">
      {CHAPTERS.map((c, i) => {
        const cls =
          active != null && i === active
            ? 'active'
            : active != null && i < active
              ? 'passed'
              : '';
        return (
          <button
            key={c.n}
            type="button"
            className={`chapter-rail-item ${cls}`}
            onClick={() => onSelect?.(i)}
            aria-label={`Chapter ${c.n} ${c.t}`}
            aria-current={active === i ? 'page' : undefined}
          >
            <span className="label">{c.t}</span>
            <span>{c.n}</span>
            <span className="chapter-rail-dot" />
          </button>
        );
      })}
    </div>
  );
}
