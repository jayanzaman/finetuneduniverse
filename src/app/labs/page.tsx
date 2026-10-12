import type { Metadata } from 'next';
import Link from 'next/link';

import { CHAPTERS, EVIDENCE_LABELS } from '../../components/hifi/chapters';
import { HifiBackdrop } from '../../components/hifi/HifiBackdrop';
import { SoundToggle } from '../../components/hifi/audio/SoundToggle';

export const metadata: Metadata = {
  title: 'Interactive Laboratories | Finetuned Universe',
  description: 'Explore the 7 individual scientific fine-tuning laboratories across cosmic history.',
  alternates: { canonical: '/labs' },
};

export default function LabsDirectoryPage() {
  return (
    <div className="hifi" style={{ position: 'relative', minHeight: '100vh' }}>
      <HifiBackdrop seed={42} starColor="#a8b3ff" starBrightness={1.0} phase={0} />

      {/* Top Nav */}
      <nav className="hifi-nav" aria-label="Primary navigation">
        <div className="hifi-mark">
          <Link href="/" className="hifi-mark" style={{ textDecoration: 'none' }}>
            <div className="hifi-mark-dot" />
            <span className="hifi-mark-label">Finetuned · Universe</span>
          </Link>
        </div>
        <div className="hifi-nav-links" style={{ alignItems: 'center' }}>
          <Link href="/" className="mono-md" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>
            Index
          </Link>
          <SoundToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main className="lab-content-container" style={{ paddingTop: 'clamp(80px, 12vw, 120px)' }}>
        <header style={{ marginBottom: 48, maxWidth: 840 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <span className="mono-lg" style={{ color: 'var(--indigo)' }}>
              Laboratories Directory
            </span>
            <span style={{ width: 1, height: 14, background: 'var(--hair-2)' }} />
            <span className="mono">7 Deep Simulations</span>
          </div>

          <h1 className="h-hero" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
            The Seven Laboratories
          </h1>

          <p className="prose" style={{ marginTop: 20, maxWidth: 680 }}>
            Each chapter contains an extended interactive laboratory with independent fine-tuning parameters,
            simulations, and educator analysis notes. Select any laboratory to explore or refine in isolation.
          </p>
        </header>

        {/* Grid of 7 Labs */}
        <div className="lab-directory-grid">
          {CHAPTERS.map((chapter) => (
            <article key={chapter.slug} className="lab-directory-card">
              <div className="lab-card-meta">
                <span className="mono" style={{ color: 'var(--indigo)' }}>
                  Chapter {chapter.n}
                </span>
                <span style={{ width: 1, height: 12, background: 'var(--hair-2)' }} />
                <span className="mono">{chapter.era}</span>
                <span className="chapter-evidence" style={{ marginLeft: 'auto' }}>
                  {EVIDENCE_LABELS[chapter.evidence]}
                </span>
              </div>

              <h2 className="lab-card-title">{chapter.long}</h2>
              <p className="lab-card-question">{chapter.question}</p>
              <p className="lab-card-summary">{chapter.currentAnswer}</p>

              <div className="lab-card-actions">
                <Link
                  href={`/questions/${chapter.slug}/lab`}
                  className="hifi-btn primary"
                  style={{ textDecoration: 'none' }}
                >
                  Open Laboratory →
                </Link>
                <Link
                  href={`/questions/${chapter.slug}`}
                  className="hifi-btn"
                  style={{ textDecoration: 'none' }}
                >
                  Story Chapter
                </Link>
              </div>
            </article>
          ))}
        </div>

        <footer style={{ marginTop: 80, paddingBottom: 60, borderTop: '1px solid var(--hair)' }}>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Link href="/" className="hifi-btn" style={{ textDecoration: 'none' }}>
              ← Return to Main Descent
            </Link>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>
              Finetuned Universe · Scientific Laboratory Suite
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
