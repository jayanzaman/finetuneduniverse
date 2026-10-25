'use client';

import { useState, useSyncExternalStore } from 'react';
import { prefersReducedMotion } from '../../motion';
import { FACTS } from '../facts';
import {
  mulberry32,
  shuffleCodonTable,
  simulateMutations,
  type MutationCounts,
} from '../lib/codonTable';
import { citeLine, liveResult, useMarkInteracted, widgetCard } from './shared';

const TRIALS = 20_000;

const noopSubscribe = () => () => {};

type Run = { seed: number; realPct: number; shuffledPct: number };

const catastrophicPct = (counts: MutationCounts): number =>
  ((counts.radical + counts['stop-gain']) / TRIALS) * 100;

function runShuffle(seed: number): Run {
  const table = shuffleCodonTable(mulberry32(seed));
  // Independent stream for the mutation draws so the table shuffle and the
  // mutation sequence don't correlate.
  const { real, alternative } = simulateMutations(table, TRIALS, mulberry32(seed ^ 0x9e3779b9));
  return { seed, realPct: catastrophicPct(real), shuffledPct: catastrophicPct(alternative) };
}

export function ShuffleTheCode() {
  const markOnce = useMarkInteracted('ch08:shuffle');
  const [runs, setRuns] = useState<Run[]>([]);
  const latest = runs[runs.length - 1] ?? null;
  const worseCount = runs.filter((r) => r.shuffledPct > r.realPct).length;
  const reduced = useSyncExternalStore(noopSubscribe, prefersReducedMotion, () => false);

  const shuffle = () => {
    markOnce();
    setRuns((prev) => [...prev, runShuffle(Math.floor(Math.random() * 2 ** 31))]);
  };

  const barMax = latest ? Math.max(latest.realPct, latest.shuffledPct, 1) : 1;
  const bar = (pct: number, color: string) => (
    <div style={{ flex: 1, height: 12, background: 'var(--hair)', borderRadius: 6 }}>
      <div
        style={{
          width: `${(pct / barMax) * 100}%`,
          height: '100%',
          borderRadius: 6,
          background: color,
          transition: reduced ? 'none' : 'width 400ms ease',
        }}
      />
    </div>
  );

  return (
    <section aria-label="Shuffle the code" style={widgetCard}>
      <p className="mono" style={{ margin: 0 }}>
        A code that absorbs its own typos
      </p>
      <h3 style={{ margin: 0 }}>Shuffle the code</h3>
      <p className="prose-sm" style={{ margin: 0 }}>
        Randomly reassign all 64 codons, then fire {TRIALS.toLocaleString('en-US')} single-letter
        mutations at both codes and count the catastrophic ones (a radical chemical swap or a
        premature stop).
      </p>

      <div>
        <button type="button" className="hifi-btn primary" onClick={shuffle}>
          Shuffle the code
        </button>
      </div>

      <div role="status" aria-live="polite" style={liveResult}>
        {latest ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <p className="mono" style={{ margin: 0 }}>
              shuffle #{runs.length} · seed {latest.seed}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ width: 96, flexShrink: 0 }}>
                Real code
              </span>
              {bar(latest.realPct, 'var(--goldilocks)')}
              <span className="mono" style={{ width: 64, textAlign: 'right' }}>
                {latest.realPct.toFixed(1)}%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ width: 96, flexShrink: 0 }}>
                Shuffled
              </span>
              {bar(latest.shuffledPct, 'var(--warm)')}
              <span className="mono" style={{ width: 64, textAlign: 'right' }}>
                {latest.shuffledPct.toFixed(1)}%
              </span>
            </div>
            <p className="prose-sm" style={{ margin: 0 }}>
              {latest.shuffledPct > latest.realPct
                ? 'This shuffle did worse — the standard code softened more of the same typos.'
                : 'A rare shuffle that matched or beat the real code.'}
            </p>
          </div>
        ) : (
          <p className="prose-sm" style={{ margin: 0, color: 'var(--ink-soft)' }}>
            Press the button to deal a random genetic code.
          </p>
        )}
      </div>

      <p className="mono" style={{ margin: 0 }}>
        {runs.length === 0
          ? 'No shuffles yet'
          : `${worseCount} of ${runs.length} shuffled ${runs.length === 1 ? 'code was' : 'codes were'} worse than the real code`}
      </p>

      <p style={citeLine}>
        The real code {FACTS.codeErrorMinimization.display} — {FACTS.codeErrorMinimization.cite}
      </p>
    </section>
  );
}
