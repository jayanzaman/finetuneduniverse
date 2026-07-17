'use client';

import { useState, type ReactNode } from 'react';
import { GoldilocksSlider, type GoldilocksSliderProps } from './GoldilocksSlider';
import { trackJourney } from '../../lib/analytics';

type ChapterFrameProps = {
  /** Two-digit chapter number, e.g. "01" */
  num: string;
  /** 0-based chapter index for the rail. */
  chapterIndex: number;
  /** Era / time label, e.g. "13.8 Bya · t = 10⁻³² s" */
  era: ReactNode;
  /** Hero title — may include <br /> + <em>. */
  title: ReactNode;
  /** Narration paragraph beneath the title. */
  prose: ReactNode;
  /** Props for the chapter's primary GoldilocksSlider. */
  sliderProps: GoldilocksSliderProps;
  /** Failure-mode ghost ("If you leave the band →"). */
  ghost?: { body: ReactNode };
  /** End-of-chapter transition block (dormant/earned) — rendered after the footer. */
  transition?: ReactNode;
  onPrev?: () => void;
  /** Per-chapter cinematic visualization (renders above the backdrop). */
  visualization?: ReactNode;
  /** Optional embedded interactive content (existing section widgets). */
  children?: ReactNode;
  experimentOutcome?: ReactNode;
  formula?: ReactNode;
  question?: ReactNode;
  currentAnswer?: ReactNode;
  openQuestion?: ReactNode;
  evidenceLabel?: ReactNode;
  visualState?: { intensity: number; instability: number; scale: number };
};

/**
 * The shared chapter shell. Renders the cinematic visualization, the
 * chapter header (number + era + title + narration), the primary
 * GoldilocksSlider, the failure ghost, and the continue footer.
 *
 * The backdrop, stars, grain, top nav, and chapter rail are app-level
 * (rendered once in the AppShell), so this only paints the chapter content.
 */
export function ChapterFrame({
  num,
  era,
  title,
  prose,
  sliderProps,
  ghost,
  transition,
  onPrev,
  visualization,
  children,
  experimentOutcome,
  formula,
  question,
  currentAnswer,
  openQuestion,
  evidenceLabel,
  visualState,
  chapterIndex,
}: ChapterFrameProps) {
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [labRevision, setLabRevision] = useState(0);
  return (
    <section className="hifi hifi-frame" aria-labelledby={`ch-${num}-title`}>
      {visualization && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            overflow: 'hidden',
            opacity: 0.72 + (visualState?.intensity ?? 0.5) * 0.28,
            filter: `saturate(${0.7 + (visualState?.intensity ?? 0.5) * 0.6}) contrast(${1 + (visualState?.instability ?? 0) * 0.12})`,
            transform: `scale(${visualState?.scale ?? 1})`,
            transformOrigin: 'center',
            transition: 'filter 220ms ease, opacity 220ms ease, transform 220ms ease',
          }}
        >
          {visualization}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 3, padding: '72px 64px 80px' }}>
        {/* Chapter mark line */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14 }}>
          <span className="mono-lg" style={{ color: 'var(--indigo)' }}>Chapter {num}</span>
          <span style={{ width: 1, height: 14, background: 'var(--hair-2)' }} />
          <span className="mono">{era}</span>
        </div>

        {/* Hero title */}
        <h1 id={`ch-${num}-title`} className="h-hero" style={{ maxWidth: 720 }}>
          {title}
        </h1>

        {/* Narration */}
        <p className="prose" style={{ marginTop: 28, maxWidth: 460 }}>
          {prose}
        </p>

        {question && (
          <div className="chapter-question-block">
            <span className="chapter-evidence">{evidenceLabel}</span>
            <h2>{question}</h2>
          </div>
        )}

        {/* Primary story experiment */}
        <div
          className="chapter-experiment-layout"
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 48,
            alignItems: 'end',
            maxWidth: 1280,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <GoldilocksSlider {...sliderProps} />
            {(formula || experimentOutcome) && (
              <div className="chapter-experiment-feedback" aria-live="polite">
                {formula && <div className="chapter-formula">{formula}</div>}
                {experimentOutcome && <div className="chapter-outcome">{experimentOutcome}</div>}
              </div>
            )}
          </div>
          {ghost && (
            <div className="ghost" style={{ width: 280 }}>
              <span className="ghost-label">If you leave the band →</span>
              <span className="ghost-body">{ghost.body}</span>
            </div>
          )}
        </div>

        {/* Secondary variables and lessons are intentionally opt-in. */}
        {children && (
          <div className="chapter-deep-dive">
            <div className="chapter-lab-actions">
              <button
                type="button"
                className="hifi-btn"
                aria-expanded={showDeepDive}
                onClick={() => setShowDeepDive((open) => {
                  trackJourney({ name: 'deep_lab_toggle', chapter: chapterIndex, open: !open });
                  return !open;
                })}
              >
                {showDeepDive ? 'Close deeper lab' : 'Explore the deeper lab'}
              </button>
              {showDeepDive && (
                <button type="button" className="hifi-btn" onClick={() => setLabRevision((value) => value + 1)}>
                  Restore reference values
                </button>
              )}
            </div>
            {showDeepDive && <div key={labRevision} className="hifi-section-embed">{children}</div>}
          </div>
        )}

        {/* Continue footer */}
        <div
          style={{
            marginTop: 64,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div className="scroll-cue">
            <span className="line" />
            <span>Continue when you are ready</span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {onPrev && (
              <button type="button" className="hifi-btn" onClick={onPrev}>
                ← Previous
              </button>
            )}
          </div>
        </div>

        {transition && <div style={{ marginTop: 72 }}>{transition}</div>}

        {(currentAnswer || openQuestion) && (
          <div className="chapter-knowledge-summary">
            <div><span>Current answer</span><p>{currentAnswer}</p></div>
            <div><span>What remains open</span><p>{openQuestion}</p></div>
          </div>
        )}
      </div>
    </section>
  );
}
