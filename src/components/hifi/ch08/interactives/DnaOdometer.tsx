'use client';

import { useState } from 'react';
import { FACTS } from '../facts';
import { citeLine, liveResult, optionRow, trimNum, useMarkInteracted, widgetCard } from './shared';

type Organ = { id: string; label: string; cells: number; note: string };

const ORGANS: Organ[] = [
  { id: 'liver', label: 'Liver', cells: 2.4e11, note: '~2.4 × 10¹¹ cells — rough estimate' },
  { id: 'brain', label: 'Brain', cells: 1.7e11, note: '~1.7 × 10¹¹ cells incl. glia — rough estimate' },
  { id: 'skin', label: 'Skin', cells: 2e10, note: '~2 × 10¹⁰ nucleated cells — rough estimate' },
  { id: 'heart', label: 'Heart', cells: 3e9, note: '~3 × 10⁹ cells — rough estimate' },
  { id: 'body', label: 'Whole body', cells: FACTS.nucleatedCells.value, note: '~3 × 10¹² nucleated cells' },
];

const KM_PER_CELL = FACTS.dnaLengthPerCell.value / 1000; // ~2 m of DNA per cell
const MILES_PER_KM = 0.621371;
const PLUTO_KM = FACTS.totalDnaKm.value; // ~6 billion km ≈ average Earth–Pluto distance

export function organDnaKm(cells: number): number {
  return cells * KM_PER_CELL;
}

function formatDistance(km: number): string {
  if (km >= 1e9) return `${trimNum(km / 1e9)} billion km`;
  if (km >= 1e6) return `${trimNum(km / 1e6)} million km`;
  if (km >= 1e3) return `${trimNum(km / 1e3)} thousand km`;
  return `${trimNum(km)} km`;
}

function formatPlutoProgress(km: number): string {
  const pct = (km / PLUTO_KM) * 100;
  if (pct >= 99.5) return '100% — the whole way to Pluto';
  if (pct >= 1) return `${pct.toFixed(1)}% of the way to Pluto`;
  return `${pct.toFixed(2)}% of the way to Pluto`;
}

const REFERENCES = [
  { name: 'the Moon', km: 384_400 },
  { name: 'the Sun', km: 1.5e8 },
  { name: 'Pluto', km: 5.9e9 },
];

export function nearestComparison(km: number): string {
  const ref = REFERENCES.reduce((best, r) =>
    Math.abs(Math.log10(km) - Math.log10(r.km)) < Math.abs(Math.log10(km) - Math.log10(best.km))
      ? r
      : best,
  );
  const ratio = km / ref.km;
  if (ratio >= 0.9 && ratio <= 1.1) return `about the distance to ${ref.name}`;
  if (ratio >= 1) {
    const r = ratio >= 10 ? String(Math.round(ratio)) : ratio.toFixed(1);
    return `≈ ${r}× the distance to ${ref.name}`;
  }
  const pct = ratio * 100;
  return `≈ ${pct >= 10 ? pct.toFixed(0) : pct.toFixed(1)}% of the way to ${ref.name}`;
}

// Log meter from 10⁵ km to 10¹⁰ km.
const LOG_MIN = 5;
const LOG_MAX = 10;
const logPct = (km: number): number =>
  Math.max(0, Math.min(100, ((Math.log10(km) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100));

export function DnaOdometer() {
  const markOnce = useMarkInteracted('ch08:odometer');
  const [selectedId, setSelectedId] = useState<string>('body');
  const selected = ORGANS.find((o) => o.id === selectedId) ?? ORGANS[ORGANS.length - 1];
  const km = organDnaKm(selected.cells);
  const miles = km * MILES_PER_KM;

  return (
    <section aria-label="Your DNA odometer" style={widgetCard}>
      <p className="mono" style={{ margin: 0 }}>
        Adding you up
      </p>
      <h3 style={{ margin: 0 }}>Your DNA odometer</h3>

      <div role="group" aria-label="Choose an organ" style={optionRow}>
        {ORGANS.map((o) => (
          <button
            key={o.id}
            type="button"
            className="hifi-btn"
            aria-pressed={o.id === selectedId}
            onClick={() => {
              markOnce();
              setSelectedId(o.id);
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mono" style={{ margin: 0 }}>
        {selected.label}: {selected.note}
      </p>

      <div role="status" aria-live="polite" style={liveResult}>
        <p className="prose-sm" style={{ margin: 0 }}>
          <strong style={{ color: 'var(--goldilocks)' }}>{formatDistance(km)}</strong>
          {' ('}
          {formatDistance(miles).replace('km', 'miles')}
          {') of DNA — '}
          {formatPlutoProgress(km)}. That is {nearestComparison(km)}.
        </p>
      </div>

      <div aria-hidden="true" style={{ position: 'relative', height: 44, marginTop: 4 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 18,
            height: 2,
            background: 'var(--hair-2)',
          }}
        />
        {REFERENCES.map((r) => (
          <div key={r.name} style={{ position: 'absolute', left: `${logPct(r.km)}%`, top: 0 }}>
            <div style={{ width: 1, height: 36, background: 'var(--ink-faint)' }} />
            <span className="mono" style={{ position: 'absolute', top: 38, transform: 'translateX(-50%)' }}>
              {r.name}
            </span>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: `${logPct(km)}%`,
            top: 12,
            width: 14,
            height: 14,
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle at 30% 30%, #fff, var(--indigo) 65%)',
            boxShadow: '0 0 14px var(--indigo-glow)',
          }}
        />
      </div>
      <p className="mono" style={{ margin: 0, color: 'var(--ink-faint)' }}>
        log scale · the dot is your pick
      </p>

      <p style={citeLine}>
        {FACTS.dnaLengthPerCell.display} — {FACTS.dnaLengthPerCell.cite} · {FACTS.totalDnaKm.display}{' '}
        — {FACTS.totalDnaKm.cite}
      </p>
    </section>
  );
}
