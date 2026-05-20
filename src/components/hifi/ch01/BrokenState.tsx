'use client';

import { PARAMS, isInBand, type ParamKey } from './params';

export type BrokenStateProps = {
  values: Record<ParamKey, number>;
  onReset: () => void;
};

const WHAT_IF_CARDS = [
  {
    icon: '🌀',
    title: 'Thermal death',
    body: 'entropy > 7 — uniform heat, no structure, no time-arrow.',
  },
  {
    icon: '🕳️',
    title: 'Black holes dominate',
    body: 'fluctuations > 1.5 — every overdensity collapses on itself.',
  },
  {
    icon: '💥',
    title: 'Big Crunch',
    body: 'expansion < 0.1 H₀ — gravity wins, the universe re-collapses.',
  },
  {
    icon: '∞',
    title: 'Runaway expansion',
    body: 'expansion > 1.5 H₀ — matter tears apart before it can clump.',
  },
];

export function BrokenState({ values, onReset }: BrokenStateProps) {
  const offending = PARAMS.filter((p) => p.scored && !isInBand(p, values[p.key]));

  return (
    <div style={{ marginTop: 22 }}>
      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          padding: '18px 22px',
          border: '1px solid var(--warm-soft)',
          background: 'linear-gradient(180deg, rgba(231,140,90,0.10), rgba(231,140,90,0.02))',
        }}
      >
        <div className="broken-orb" />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
            }}
          >
            Catastrophic state · {offending.length} parameter
            {offending.length === 1 ? '' : 's'} outside band
          </div>
          <div
            style={{
              fontFamily: 'var(--f-display)',
              fontSize: 22,
              fontWeight: 300,
              color: 'var(--warm)',
              marginTop: 6,
            }}
          >
            {offending.length > 0
              ? `${offending[0].name} pulled outside the goldilocks band — cascading failure.`
              : 'Cascading failure across multiple parameters.'}
          </div>
        </div>
        <button type="button" className="hifi-btn primary" onClick={onReset}>
          ⟳ Reset
        </button>
      </div>

      <div
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
          marginTop: 18,
          marginBottom: 6,
        }}
      >
        Other catastrophic states you could trigger
      </div>
      <div className="what-if-grid">
        {WHAT_IF_CARDS.map((c) => (
          <div key={c.title} className="what-if-card">
            <div className="label">
              {c.icon} {c.title}
            </div>
            <div className="body">{c.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
