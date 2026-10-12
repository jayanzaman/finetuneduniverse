'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MotionConfig } from 'framer-motion';

import { GoldilocksSlider } from '../GoldilocksSlider';
import { VIZ_BY_KEY } from './viz';
import {
  formatValue,
  isInBand,
  normalizedBand,
  paramSlug,
  PARAMS,
  toNormalized,
  toRealValue,
  type ParamDef,
} from './params';
import { EDUCATOR_CONTENT } from './EducatorContent';
import { ProgressionProvider, useProgression } from '../progression/ProgressionContext';
import { HifiBackdrop } from '../HifiBackdrop';
import { SoundToggle } from '../audio/SoundToggle';
import { STAR_PALETTE } from '../chapters';

function ParameterFocusedInner({
  param,
}: {
  param: ParamDef;
}) {
  const Viz = VIZ_BY_KEY[param.key];
  const content = EDUCATOR_CONTENT[param.key];
  const [value, setValue] = useState(param.defaultValue);
  const position = toNormalized(value, param.range);
  const zone = normalizedBand(param);
  const inBand = isInBand(param, value);

  const { markLessonOpened, markInteracted } = useProgression();

  useEffect(() => {
    markLessonOpened(`ch01:${param.key}`);
    markInteracted(`ch01:${param.key}`);
  }, [param.key, markLessonOpened, markInteracted]);

  const handlePos = (next: number) => setValue(toRealValue(next, param.range));

  const currentIndex = PARAMS.findIndex((p) => p.key === param.key);
  const prevParam = currentIndex > 0 ? PARAMS[currentIndex - 1] : null;
  const nextParam = currentIndex < PARAMS.length - 1 ? PARAMS[currentIndex + 1] : null;

  return (
    <div className="param-focused-frame">
      {/* Visual frame & Controls side-by-side body */}
      <div className="param-focused-body">
        {/* LEFT HAND SIDE: Visual frame + title/math */}
        <section
          className="param-focused-left"
          aria-label={`${param.name} visual simulation`}
        >
          {/* Compact header above visual */}
          <div className="param-focused-header">
            <div className="lab-header-meta" style={{ marginBottom: 6 }}>
              <Link
                href="/questions/why-did-the-universe-begin-ordered/lab"
                className="mono-md"
                style={{ color: 'var(--indigo)', textDecoration: 'none' }}
              >
                ← Beginning Laboratory
              </Link>
              <span style={{ width: 1, height: 12, background: 'var(--hair-2)' }} />
              <span className="mono">Parameter {param.n} of 06</span>
              <span style={{ width: 1, height: 12, background: 'var(--hair-2)' }} />
              <span className={`param-card-badge ${param.scored ? 'scored' : 'open'}`}>
                {param.scored ? 'Scored' : 'Open question'}
              </span>
            </div>

            <div className="focus-modal-eyebrow">
              Parameter {param.n} · Focused view
            </div>

            <h1 className="param-focused-title">{param.name}</h1>
          </div>

          {/* Contained Visual Canvas */}
          <div className="param-focused-canvas-wrapper">
            <div className="param-focused-canvas-aspect">
              <Viz value={value} />
            </div>
          </div>
        </section>

        {/* RIGHT HAND SIDE: Slider at the top, rich explanations right below */}
        <section
          className="param-focused-right"
          aria-label={`${param.name} controls and explanations`}
        >
          {/* Top of right side: Live Slider & Controls */}
          <div className="param-slider-card">
            <div className="param-focused-readout-row">
              <div>
                <span className="mono" style={{ color: 'var(--ink-faint)' }}>
                  Current value
                </span>
                <div className="param-value" style={{ fontSize: 26, marginTop: 2 }}>
                  {formatValue(param, value)}{' '}
                  <span className="unit" style={{ fontSize: 15 }}>
                    {param.unit}
                  </span>
                </div>
              </div>

              <span className={`param-status ${inBand ? '' : 'warn'}`} style={{ fontSize: 11 }}>
                {inBand ? 'in band' : 'outside band'}
              </span>
            </div>

            <div style={{ marginTop: 14 }}>
              <GoldilocksSlider
                label={`${param.name} · ${param.unit}`}
                value={`${formatValue(param, value)} ${param.unit}`}
                position={position}
                zone={zone}
                leftCap={param.leftCap}
                rightCap={param.rightCap}
                failLeft={param.failLeft}
                failRight={param.failRight}
                interactive
                onPositionChange={handlePos}
              />
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="hifi-btn"
                style={{ padding: '8px 16px', fontSize: 10 }}
                onClick={() => setValue(param.defaultValue)}
                title="Reset this parameter back to reference value"
              >
                ⟳ Reset to default ({formatValue(param, param.defaultValue)} {param.unit})
              </button>
            </div>
          </div>

          {/* Details & Educational Content right below the slider */}
          <div className="param-details-container">
            {/* Mathematical Formulation Section */}
            {content.mathBlocks && content.mathBlocks.length > 0 && (
              <div className="param-math-card">
                <div className="param-card-section-label">Cosmological Equations</div>
                <div className="param-math-grid">
                  {content.mathBlocks.map((block, i) => (
                    <div key={i} className="param-math-item">
                      <div className="math-expression">{block.expression}</div>
                      <div className="math-caption">{block.caption}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scientific Focus Banner */}
            <div className="param-question-banner">
              <span className="mono" style={{ color: 'var(--indigo)', display: 'block', marginBottom: 4 }}>
                Scientific Focus →
              </span>
              <p className="param-question-text">{param.question}</p>
            </div>

            {/* Educator Lesson Cards */}
            <div className="param-focused-lessons">
              {content.sections.map((s, i) => (
                <div
                  key={i}
                  className={`edu-card${s.kind === 'pullquote' ? ' pullquote' : ''}`}
                >
                  <div className="label">{s.label}</div>
                  <div className="body">{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Parameter Navigation Footer */}
      <footer className="param-focused-footer">
        {prevParam ? (
          <Link
            href={`/questions/why-did-the-universe-begin-ordered/lab/${paramSlug(prevParam.key)}`}
            className="hifi-btn"
            style={{ textDecoration: 'none' }}
          >
            ← Parameter {prevParam.n}: {prevParam.name}
          </Link>
        ) : (
          <div />
        )}

        <Link
          href="/questions/why-did-the-universe-begin-ordered/lab"
          className="hifi-btn primary"
          style={{ textDecoration: 'none' }}
        >
          Return to Beginning Laboratory
        </Link>

        {nextParam ? (
          <Link
            href={`/questions/why-did-the-universe-begin-ordered/lab/${paramSlug(nextParam.key)}`}
            className="hifi-btn"
            style={{ textDecoration: 'none' }}
          >
            Parameter {nextParam.n}: {nextParam.name} →
          </Link>
        ) : (
          <div />
        )}
      </footer>
    </div>
  );
}

export function ParameterFocusedPageShell({
  param,
}: {
  param: ParamDef;
}) {
  const [cosmicTime, setCosmicTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCosmicTime((p) => p + 0.1), 100);
    return () => clearInterval(id);
  }, []);

  const starTheme = STAR_PALETTE[0];

  return (
    <ProgressionProvider>
      <MotionConfig reducedMotion="user">
        <div className="hifi param-focused-shell" style={{ position: 'relative' }}>
          <HifiBackdrop
            seed={13}
            starColor={starTheme.color}
            starBrightness={starTheme.brightness}
            phase={cosmicTime}
          />

          {/* Top Navigation */}
          <nav className="hifi-nav param-focused-nav" aria-label="Parameter navigation">
            <div className="hifi-mark">
              <Link href="/" className="hifi-mark" style={{ textDecoration: 'none' }}>
                <div className="hifi-mark-dot" />
                <span className="hifi-mark-label">Finetuned · Universe</span>
              </Link>
            </div>
            <div className="hifi-nav-links" style={{ alignItems: 'center' }}>
              <Link
                href="/questions/why-did-the-universe-begin-ordered/lab"
                className="mono-md"
                style={{ color: 'var(--indigo)', textDecoration: 'none' }}
              >
                ← Beginning Lab
              </Link>
              <Link
                href="/questions/why-did-the-universe-begin-ordered"
                className="mono-md"
                style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}
              >
                Chapter 01 Story
              </Link>
              <SoundToggle />
            </div>
          </nav>

          <main id="main-content" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 3 }}>
            <ParameterFocusedInner param={param} />
          </main>
        </div>
      </MotionConfig>
    </ProgressionProvider>
  );
}
