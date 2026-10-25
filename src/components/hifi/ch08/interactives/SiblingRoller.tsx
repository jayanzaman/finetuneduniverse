'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../motion';
import { FACTS } from '../facts';
import { citeLine, liveResult, useMarkInteracted, widgetCard } from './shared';

const CHROMOSOMES = 23;

/**
 * Simulated chromosome shuffle: for each of the 23 chromosomes, a sibling
 * shares 0, 1, or 2 parental copies with the reference sibling with
 * probabilities 25/50/25. Returns the genome-wide shared percentage.
 */
export function rollSiblingShare(rng: () => number): number {
  let shared = 0;
  for (let i = 0; i < CHROMOSOMES; i++) {
    const r = rng();
    shared += r < 0.25 ? 0 : r < 0.75 ? 1 : 2;
  }
  return (shared / (CHROMOSOMES * 2)) * 100;
}

// Marker scale: 30–70%, with the real ~38–62% range shaded.
const SCALE_MIN = 30;
const SCALE_MAX = 70;
const BAND: [number, number] = [38, 62];
const toPct = (v: number): number =>
  Math.max(0, Math.min(100, ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));

const FACT_LINES = [
  FACTS.chromosomeCombinationsPerParent,
  FACTS.possibleChildrenPerCouple,
  FACTS.deNovoMutations,
];

export function SiblingRoller() {
  const markOnce = useMarkInteracted('ch08:sibling');
  const [target, setTarget] = useState<number | null>(null);
  const [display, setDisplay] = useState<number | null>(null);
  const animRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const roll = () => {
    markOnce();
    const next = rollSiblingShare(Math.random);
    setTarget(next);
    if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
      setDisplay(next);
      return;
    }
    const from = display ?? 50;
    const start = performance.now();
    cancelAnimationFrame(animRef.current);
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 600);
      setDisplay(from + (next - from) * k);
      if (k < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };

  return (
    <section aria-label="Roll a sibling" style={widgetCard}>
      <p className="mono" style={{ margin: 0 }}>
        The odds of you
      </p>
      <h3 style={{ margin: 0 }}>Roll a sibling</h3>
      <p className="prose-sm" style={{ margin: 0 }}>
        Each parent deals you one of two copies of all 23 chromosomes. A sibling draws again —
        per chromosome you share 0, 1, or 2 copies with odds 25/50/25, averaging ~50% genome-wide.
      </p>

      <div>
        <button type="button" className="hifi-btn primary" onClick={roll}>
          Roll a sibling
        </button>
      </div>

      <div aria-hidden="true" style={{ display: 'grid', gap: 6 }}>
        <div
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 28,
            color: 'var(--goldilocks)',
            minHeight: 34,
          }}
        >
          {display === null ? '—' : `${display.toFixed(1)}%`}
        </div>
        <div style={{ position: 'relative', height: 14, background: 'var(--hair)', borderRadius: 7 }}>
          <div
            style={{
              position: 'absolute',
              left: `${toPct(BAND[0])}%`,
              width: `${toPct(BAND[1]) - toPct(BAND[0])}%`,
              top: 0,
              bottom: 0,
              background: 'var(--indigo-band)',
              borderRadius: 7,
            }}
          />
          {display !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${toPct(display)}%`,
                top: -3,
                width: 4,
                height: 20,
                borderRadius: 2,
                transform: 'translateX(-50%)',
                background: 'var(--goldilocks)',
                boxShadow: '0 0 10px rgba(111,228,177,0.6)',
              }}
            />
          )}
        </div>
        <div className="mono" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>30%</span>
          <span style={{ color: 'var(--ink-faint)' }}>shaded band: the real ~38–62% range</span>
          <span>70%</span>
        </div>
      </div>

      <div role="status" aria-live="polite" style={liveResult}>
        {target === null ? (
          <p className="prose-sm" style={{ margin: 0, color: 'var(--ink-soft)' }}>
            Roll to meet a sibling.
          </p>
        ) : (
          <p className="prose-sm" style={{ margin: 0 }}>
            You share <strong style={{ color: 'var(--goldilocks)' }}>{target.toFixed(1)}%</strong> of
            your DNA with this sibling.
          </p>
        )}
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
        {FACT_LINES.map((f) => (
          <li key={f.cite + f.display} className="mono" style={{ color: 'var(--ink-mid)' }}>
            {f.display}
          </li>
        ))}
      </ul>

      <p style={citeLine}>
        {FACTS.siblingSharedDna.display} — {FACTS.siblingSharedDna.cite}
      </p>
    </section>
  );
}
