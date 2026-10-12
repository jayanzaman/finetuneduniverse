'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MotionConfig } from 'framer-motion';

import { CHAPTERS, EVIDENCE_LABELS, STAR_PALETTE } from '../../hifi/chapters';
import { CHAPTER_MODELS } from '../../hifi/chapterModels';
import { HifiBackdrop } from '../../hifi/HifiBackdrop';
import { SoundToggle } from '../../hifi/audio/SoundToggle';
import { ProgressionProvider } from '../../hifi/progression/ProgressionContext';

const labLoading = () => (
  <div className="deep-lab-loading" role="status">
    Preparing the deeper lab…
  </div>
);

const SECTION_COMPONENTS = [
  dynamic(() => import('../sections/BeginningSection'), { loading: labLoading }),
  dynamic(() => import('../sections/MatterSection'), { loading: labLoading }),
  dynamic(() => import('../sections/StarlightSection'), { loading: labLoading }),
  dynamic(() => import('../sections/GalacticHeartSection'), { loading: labLoading }),
  dynamic(() => import('../sections/PlanetsSection'), { loading: labLoading }),
  dynamic(() => import('../sections/AbiogenesisLabSection'), { loading: labLoading }),
  dynamic(() => import('../sections/LifeSection'), { loading: labLoading }),
] as const;

export function LabPageShell({ chapterIndex }: { chapterIndex: number }) {
  const chapter = CHAPTERS[chapterIndex];
  const model = CHAPTER_MODELS[chapterIndex];
  const SectionComponent = SECTION_COMPONENTS[chapterIndex];

  const [labRevision, setLabRevision] = useState(0);
  const [educatorMode, setEducatorMode] = useState(false);
  const [cosmicTime, setCosmicTime] = useState(0);

  // Cosmic time tick for internal canvas animations
  useEffect(() => {
    const id = setInterval(() => setCosmicTime((p) => p + 0.1), 100);
    return () => clearInterval(id);
  }, []);

  const starTheme = STAR_PALETTE[chapterIndex] ?? { color: '#ffffff', brightness: 1 };
  const prevChapter = chapterIndex > 0 ? CHAPTERS[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < CHAPTERS.length - 1 ? CHAPTERS[chapterIndex + 1] : null;

  return (
    <ProgressionProvider>
      <MotionConfig reducedMotion="user">
        <div className="hifi lab-page-shell" style={{ position: 'relative', minHeight: '100vh' }}>
          <HifiBackdrop
            seed={(chapterIndex + 1) * 13}
            starColor={starTheme.color}
            starBrightness={starTheme.brightness}
            phase={cosmicTime}
          />

          {/* Dedicated Lab Navigation Bar */}
          <nav className="hifi-nav lab-top-nav" aria-label="Laboratory navigation">
            <div className="hifi-mark">
              <Link href="/" className="hifi-mark" style={{ textDecoration: 'none' }}>
                <div className="hifi-mark-dot" />
                <span className="hifi-mark-label">Finetuned · Universe</span>
              </Link>
            </div>
            <div className="hifi-nav-links" style={{ alignItems: 'center' }}>
              <Link
                href={`/questions/${chapter.slug}`}
                className="mono-md"
                style={{ color: 'var(--indigo)', textDecoration: 'none' }}
              >
                ← Back to Chapter {chapter.n}
              </Link>
              <Link
                href="/labs"
                className="mono-md"
                style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}
              >
                All Labs
              </Link>
              <SoundToggle />
            </div>
          </nav>

          {/* Main Lab Container */}
          <main id="main-content" className="lab-content-container">
            {/* Lab Header */}
            <header className="lab-header">
              <div className="lab-header-meta">
                <span className="mono-lg" style={{ color: 'var(--indigo)' }}>
                  Chapter {chapter.n} · {chapter.t} Laboratory
                </span>
                <span style={{ width: 1, height: 14, background: 'var(--hair-2)' }} />
                <span className="mono">{chapter.era}</span>
                <span style={{ width: 1, height: 14, background: 'var(--hair-2)' }} />
                <span className="chapter-evidence">{EVIDENCE_LABELS[chapter.evidence]}</span>
              </div>

              <h1 className="h-2 lab-title">
                {chapter.long} <span style={{ color: 'var(--indigo)', fontWeight: 300 }}>· Deeper Lab</span>
              </h1>

              <div className="chapter-question-block" style={{ marginTop: 18 }}>
                <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}>{chapter.question}</h2>
              </div>

              <p className="prose lab-context-prose" style={{ marginTop: 16, maxWidth: 840 }}>
                {chapter.currentAnswer}
              </p>

              {chapter.openQuestion && (
                <div className="lab-open-question-callout">
                  <span className="mono" style={{ color: 'var(--warm)' }}>What remains open →</span>
                  <p>{chapter.openQuestion}</p>
                </div>
              )}

              {/* Lab Control Actions */}
              <div className="lab-toolbar">
                <button
                  type="button"
                  className="hifi-btn"
                  onClick={() => setLabRevision((r) => r + 1)}
                  title="Reset all lab sliders and variables to reference values"
                >
                  ⟳ Restore reference values
                </button>
                <button
                  type="button"
                  className={`hifi-btn ${educatorMode ? 'primary' : ''}`}
                  onClick={() => setEducatorMode((mode) => !mode)}
                  aria-pressed={educatorMode}
                  title="Toggle educator guides and fine-tuning insight callouts"
                >
                  Educator Notes: {educatorMode ? 'On' : 'Off'}
                </button>
                <Link
                  href={`/questions/${chapter.slug}`}
                  className="hifi-btn"
                  style={{ textDecoration: 'none' }}
                >
                  Return to Chapter Story →
                </Link>
              </div>
            </header>

            {/* Interactive Lab Workspace */}
            <section
              key={labRevision}
              className="lab-workspace"
              aria-label={`${chapter.t} laboratory simulation and controls`}
            >
              <SectionComponent educatorMode={educatorMode} cosmicTime={cosmicTime} />
            </section>

            {/* Lab Footer Navigation */}
            <footer className="lab-footer">
              <div className="lab-nav-footer-links">
                {prevChapter ? (
                  <Link
                    href={`/questions/${prevChapter.slug}/lab`}
                    className="hifi-btn"
                    style={{ textDecoration: 'none' }}
                  >
                    ← Previous Lab: Ch {prevChapter.n} ({prevChapter.t})
                  </Link>
                ) : (
                  <Link href="/" className="hifi-btn" style={{ textDecoration: 'none' }}>
                    ← Return to Index
                  </Link>
                )}

                <Link
                  href={`/questions/${chapter.slug}`}
                  className="hifi-btn primary"
                  style={{ textDecoration: 'none' }}
                >
                  Return to Chapter {chapter.n} Story
                </Link>

                {nextChapter ? (
                  <Link
                    href={`/questions/${nextChapter.slug}/lab`}
                    className="hifi-btn"
                    style={{ textDecoration: 'none' }}
                  >
                    Next Lab: Ch {nextChapter.n} ({nextChapter.t}) →
                  </Link>
                ) : (
                  <Link href="/" className="hifi-btn" style={{ textDecoration: 'none' }}>
                    Complete Descent →
                  </Link>
                )}
              </div>

              {model?.sources && model.sources.length > 0 && (
                <div className="chapter-knowledge-summary lab-sources-block">
                  <div className="chapter-sources">
                    <span>Scientific Sources & Models</span>
                    <ul>
                      {model.sources.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </footer>
          </main>
        </div>
      </MotionConfig>
    </ProgressionProvider>
  );
}
