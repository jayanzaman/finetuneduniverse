'use client';

import type { ReactNode } from 'react';
import { GoldilocksSlider, type GoldilocksSliderProps } from './GoldilocksSlider';

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
  /** Title shown in the bottom-right "Next chapter" footer. */
  nextTitle?: ReactNode;
  nextLabel?: ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  /** Per-chapter cinematic visualization (renders above the backdrop). */
  visualization?: ReactNode;
  /** Optional embedded interactive content (existing section widgets). */
  children?: ReactNode;
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
  nextTitle,
  nextLabel,
  onNext,
  onPrev,
  visualization,
  children,
}: ChapterFrameProps) {
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
          }}
        >
          {visualization}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 3, padding: '120px 64px 64px' }}>
        {/* Chapter mark line */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 18 }}>
          <span className="mono-lg" style={{ color: 'var(--indigo)' }}>Chapter {num}</span>
          <span style={{ width: 1, height: 14, background: 'var(--hair-2)' }} />
          <span className="mono">{era}</span>
        </div>

        {/* Hero title */}
        <h1 id={`ch-${num}-title`} className="h-hero" style={{ maxWidth: 720 }}>
          {title}
        </h1>

        {/* Narration */}
        <p className="prose" style={{ marginTop: 48, maxWidth: 460 }}>
          {prose}
        </p>

        {/* Embedded section content (existing interactive viz / sliders) */}
        {children && (
          <div
            style={{
              position: 'relative',
              marginTop: 56,
              padding: '24px 0',
            }}
          >
            {children}
          </div>
        )}

        {/* Primary slider + ghost */}
        <div
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
          </div>
          {ghost && (
            <div className="ghost" style={{ width: 280 }}>
              <span className="ghost-label">If you leave the band →</span>
              <span className="ghost-body">{ghost.body}</span>
            </div>
          )}
        </div>

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
            <span>Scroll · time advances</span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {onPrev && (
              <button type="button" className="hifi-btn" onClick={onPrev}>
                ← Previous
              </button>
            )}
            {nextTitle && (
              <button
                type="button"
                className="hifi-btn primary"
                onClick={onNext}
                disabled={!onNext}
              >
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span className="mono" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.22em' }}>
                    Next chapter
                  </span>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 14, letterSpacing: '-0.005em', textTransform: 'none' }}>
                    {nextTitle} ↓
                  </span>
                </span>
              </button>
            )}
            {!nextTitle && (
              <span className="mono" style={{ color: 'var(--ink-faint)' }}>End of the descent · t = now</span>
            )}
          </div>
        </div>

        {nextLabel && (
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <span className="mono" style={{ color: 'var(--ink-soft)' }}>{nextLabel}</span>
          </div>
        )}
      </div>
    </section>
  );
}
