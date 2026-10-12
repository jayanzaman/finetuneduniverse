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
    <div className="lab-content-container param-focused-page">
      {/* Parameter Header */}
      <header className="lab-header">
        <div className="lab-header-meta">
          <Link
            href="/questions/why-did-the-universe-begin-ordered/lab"
            className="mono-md"
            style={{ color: 'var(--indigo)', textDecoration: 'none' }}
          >
            ← Beginning Laboratory
          </Link>
          <span style={{ width: 1, height: 14, background: 'var(--hair-2)' }} />
          <span className="mono">Parameter {param.n} of 06</span>
          <span style={{ width: 1, height: 14, background: 'var(--hair-2)' }} />
          <span className={`param-card-badge ${param.scored ? 'scored' : 'open'}`}>
            {param.scored ? 'Scored' : 'Open question'}
          </span>
        </div>

        <div className="focus-modal-eyebrow" style={{ marginTop: 8 }}>
          Parameter {param.n} · Focused view
        </div>

        <h1 className="h-hero" style={{ marginTop: 8, fontSize: 'clamp(32px, 4vw, 56px)' }}>
          {param.name}
        </h1>

        <p className="prose" style={{ marginTop: 14, maxWidth: 680 }}>
          {param.question}
        </p>
      </header>

      {/* Two-column Focused Layout */}
      <div className="param-focused-layout">
        {/* Left Column: Math + Full Canvas Visualization */}
        <div className="param-focused-viz-col">
          {content.mathBlocks?.map((block, i) => (
            <div key={i} className="math-block" style={{ marginBottom: 20 }}>
              <span className="math" style={{ fontSize: 26 }}>
                {block.expression}
              </span>
              <div className="math-caption">{block.caption}</div>
            </div>
          ))}

          <div className="param-focused-canvas-container">
            <Viz value={value} />
          </div>
        </div>

        {/* Right Column: Live Slider + Lesson Cards */}
        <div className="param-focused-side-col">
          <div className="param-focused-readout-row">
            <div>
              <span className="mono" style={{ color: 'var(--ink-faint)' }}>
                Current value
              </span>
              <div className="param-value" style={{ fontSize: 28, marginTop: 4 }}>
                {formatValue(param, value)}{' '}
                <span className="unit" style={{ fontSize: 16 }}>
                  {param.unit}
                </span>
              </div>
            </div>

            <span className={`param-status ${inBand ? '' : 'warn'}`} style={{ fontSize: 11 }}>
              {inBand ? 'in band' : 'outside band'}
            </span>
          </div>

          <div style={{ marginTop: 20 }}>
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

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="hifi-btn"
              onClick={() => setValue(param.defaultValue)}
              title="Reset this parameter back to reference value"
            >
              ⟳ Reset to default ({formatValue(param, param.defaultValue)} {param.unit})
            </button>
          </div>

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
      </div>

      {/* Parameter Navigation Footer */}
      <footer className="lab-footer" style={{ marginTop: 56 }}>
        <div className="lab-nav-footer-links">
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
        </div>
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
        <div className="hifi lab-page-shell" style={{ position: 'relative', minHeight: '100vh' }}>
          <HifiBackdrop
            seed={13}
            starColor={starTheme.color}
            starBrightness={starTheme.brightness}
            phase={cosmicTime}
          />

          {/* Top Navigation */}
          <nav className="hifi-nav" aria-label="Parameter navigation">
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

          <main id="main-content">
            <ParameterFocusedInner param={param} />
          </main>
        </div>
      </MotionConfig>
    </ProgressionProvider>
  );
}
