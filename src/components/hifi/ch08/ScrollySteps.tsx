'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { prefersReducedMotion } from '../motion';

export type ScrollyPanel = { id: string; content: ReactNode };

export type ScrollyStepsProps = {
  panels: ScrollyPanel[];
  renderVisual: (activeIndex: number, progress: number, active: boolean) => ReactNode;
};

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

const noopSubscribe = () => () => {};

/**
 * Generic scrollytelling shell. Plain document flow — no scroll-jacking.
 * Desktop: sticky full-height visual pane left, scrolling panels right.
 * Mobile: the visual pins to the top ~40vh while panels scroll over it.
 *
 * The visual pane is decorative (aria-hidden): every number it carries is
 * duplicated in the panel copy, stats, and scene fallbacks.
 */
export function ScrollySteps({ panels, renderVisual }: ScrollyStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  // SSR snapshot assumes motion; the client snapshot reads the real media query.
  const reducedMotion = useSyncExternalStore(noopSubscribe, prefersReducedMotion, () => false);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const rafRef = useRef(0);

  // Active step = the panel crossing the viewport center band.
  useEffect(() => {
    // jsdom (and very old browsers) lack IntersectionObserver — first panel stays active.
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.panelIndex);
          if (Number.isFinite(idx)) setActiveIndex(idx);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    panelRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [panels.length]);

  // Scene progress: 0 when the active panel's top hits the sticky zone,
  // 1 when its bottom leaves. rAF-throttled scroll listener; skipped under
  // reduced motion (scenes render static fallbacks anyway).
  useEffect(() => {
    if (reducedMotion) return;
    const measure = () => {
      rafRef.current = 0;
      const el = panelRefs.current[activeIndex];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setProgress(clamp01(-rect.top / Math.max(1, rect.height)));
    };
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(measure);
    };
    rafRef.current = requestAnimationFrame(measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex, reducedMotion]);

  const shownProgress = reducedMotion ? (activeIndex >= 0 ? 1 : 0) : progress;

  return (
    <div className="relative md:grid md:grid-cols-2 md:gap-8">
      <div aria-hidden className="sticky top-0 z-0 h-[40vh] overflow-hidden md:h-screen">
        {renderVisual(activeIndex, shownProgress, true)}
      </div>
      <div className="relative z-10">
        {panels.map((panel, i) => (
          <section
            key={panel.id}
            data-panel-index={i}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className="flex min-h-[100vh] items-center px-5 py-24 md:px-8"
          >
            <div className="w-full max-w-xl max-md:rounded-xl max-md:border max-md:border-[var(--hair-2)] max-md:bg-[rgba(3,3,8,0.78)] max-md:p-6 max-md:backdrop-blur-sm">
              {panel.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
