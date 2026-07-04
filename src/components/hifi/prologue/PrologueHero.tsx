'use client';

import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../motion';
import { useProgression } from '../progression/ProgressionContext';

type Phase = 'pending' | 'revealing' | 'resting';

const LINE_DELAYS_MS = [0, 2200, 4400];
const SETTLE_DELAY_MS = 6600;

export type PrologueHeroProps = {
  onBegin: () => void;
  /** Test seam — per-line reveal delays. */
  lineDelaysMs?: number[];
  /** Test seam — delay before begin-row/scroll-cue reveal + prologueSeen mark. */
  settleDelayMs?: number;
};

export function PrologueHero({
  onBegin,
  lineDelaysMs = LINE_DELAYS_MS,
  settleDelayMs = SETTLE_DELAY_MS,
}: PrologueHeroProps) {
  const { hydrated, prologueSeen, markPrologueSeen } = useProgression();
  const [phase, setPhase] = useState<Phase>('pending');
  const [visibleSteps, setVisibleSteps] = useState(0);

  // Decide the phase once hydration lands. Marks are gated on `hydrated`
  // because hydration replaces state — an earlier mark would be lost.
  useEffect(() => {
    if (!hydrated || phase !== 'pending') return;
    if (prologueSeen) {
      setPhase('resting');
    } else if (prefersReducedMotion()) {
      markPrologueSeen();
      setPhase('resting');
    } else {
      setPhase('revealing');
    }
  }, [hydrated, phase, prologueSeen, markPrologueSeen]);

  // Reveal timers + skip listeners while revealing.
  useEffect(() => {
    if (phase !== 'revealing') return;

    const timers = lineDelaysMs.map((delay, i) =>
      window.setTimeout(() => setVisibleSteps((s) => Math.max(s, i + 1)), delay)
    );
    timers.push(
      window.setTimeout(() => {
        setVisibleSteps(4);
        markPrologueSeen();
      }, settleDelayMs)
    );
    timers.push(window.setTimeout(() => setPhase('resting'), settleDelayMs + 1000));

    const skip = () => {
      markPrologueSeen();
      setPhase('resting');
    };
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
    };
  }, [phase, lineDelaysMs, settleDelayMs, markPrologueSeen]);

  const lineClass = (i: number) =>
    `prologue-line prologue-l${i + 1}${
      phase === 'revealing' && visibleSteps > i ? ' is-visible' : ''
    }`;

  // Begin row + scroll cue share one visibility condition. In `pending` nothing
  // is visible; the CSS makes `resting` opaque instantly regardless of the class.
  const settled = phase === 'resting' || (phase === 'revealing' && visibleSteps >= 4);

  return (
    <section className="prologue-hero" data-phase={phase}>
      {phase === 'revealing' && (
        <button
          type="button"
          className="prologue-skip mono"
          onClick={(e) => {
            // window pointerdown listener already handles the skip;
            // the button exists for discoverability + a11y.
            e.stopPropagation();
            markPrologueSeen();
            setPhase('resting');
          }}
        >
          skip ↦
        </button>
      )}

      <div className="prologue-lines">
        <p className={lineClass(0)}>Our universe runs on a handful of numbers.</p>
        <p className={lineClass(1)}>
          Tune any one of them slightly — and there are no stars, no chemistry, no you.
        </p>
        <p className={lineClass(2)}>
          This is the story of the <em>seven thresholds</em> everything had to cross.
        </p>
      </div>

      <div className={`prologue-begin-row${settled ? ' is-visible' : ''}`}>
        <button type="button" className="prologue-begin mono" onClick={onBegin}>
          Begin the descent
        </button>
      </div>

      <div className={`prologue-scrollcue mono${settled ? ' is-visible' : ''}`} aria-hidden="true">
        <span>the seven chapters</span>
        <span className="prologue-chevron">⌄</span>
      </div>
    </section>
  );
}
