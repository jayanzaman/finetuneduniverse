'use client';

import { useState } from 'react';
import { FACTS } from '../facts';
import { citeLine, liveResult, optionRow, trimNum, useMarkInteracted, widgetCard } from './shared';

type StorageOption = { id: string; label: string; detail: string; bytes: number };

const OPTIONS: StorageOption[] = [
  { id: 'datacenter', label: 'A large data center', detail: '~1 EB — estimate', bytes: 1e18 },
  { id: 'phone', label: 'A modern smartphone', detail: '256 GB', bytes: 256e9 },
  {
    id: 'books',
    label: 'All books ever printed',
    detail: '~130 million books ≈ 130 TB of text — estimate',
    bytes: 130e12,
  },
];

const BYTES_PER_GRAM = FACTS.dnaStorageDensity.value * 1e15;

export function dnaGrams(bytes: number): number {
  return bytes / BYTES_PER_GRAM;
}

export function formatMass(grams: number): string {
  // Prefer the unit that keeps the number in a readable ~0.1–1000 range.
  if (grams >= 0.1) return `${trimNum(grams)} g`;
  if (grams >= 1e-4) return `${trimNum(grams * 1e3)} mg`;
  if (grams >= 1e-7) return `${trimNum(grams * 1e6)} µg`;
  return `${trimNum(grams * 1e9)} ng`;
}

// Log scale from 1 GB (10⁹ B) to 1 EB (10¹⁸ B).
const LOG_MIN = 9;
const LOG_MAX = 18;
const logPct = (bytes: number): number =>
  Math.max(2, ((Math.log10(bytes) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100);

export function StorageComparator() {
  const markOnce = useMarkInteracted('ch08:storage');
  const [selectedId, setSelectedId] = useState<string>('datacenter');
  const selected = OPTIONS.find((o) => o.id === selectedId) ?? OPTIONS[0];
  const grams = dnaGrams(selected.bytes);

  return (
    <section aria-label="DNA storage comparator" style={widgetCard}>
      <p className="mono" style={{ margin: 0 }}>
        Data, weighed in grams
      </p>
      <h3 style={{ margin: 0 }}>How much DNA holds that?</h3>

      <div role="group" aria-label="Choose what to store" style={optionRow}>
        {OPTIONS.map((o) => (
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

      <div role="status" aria-live="polite" style={liveResult}>
        <p className="prose-sm" style={{ margin: 0 }}>
          <strong style={{ color: 'var(--goldilocks)' }}>≈ {formatMass(grams)} of DNA</strong>
          {' — '}
          {selected.label.toLowerCase()} ({selected.detail}) at {FACTS.dnaStorageDensity.display}.
        </p>
      </div>

      <div aria-hidden="true" style={{ display: 'grid', gap: 6 }}>
        {OPTIONS.map((o) => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ width: 110, flexShrink: 0 }}>
              {o.id === 'datacenter' ? 'Data center' : o.id === 'phone' ? 'Phone' : 'All books'}
            </span>
            <div style={{ flex: 1, height: 8, background: 'var(--hair)', borderRadius: 4 }}>
              <div
                style={{
                  width: `${logPct(o.bytes)}%`,
                  height: '100%',
                  borderRadius: 4,
                  background:
                    o.id === selectedId ? 'var(--goldilocks)' : 'var(--indigo)',
                  opacity: o.id === selectedId ? 1 : 0.55,
                }}
              />
            </div>
            <span className="mono" style={{ width: 90, textAlign: 'right' }}>
              {formatMass(dnaGrams(o.bytes))}
            </span>
          </div>
        ))}
        <p className="mono" style={{ margin: 0, color: 'var(--ink-faint)' }}>
          log scale · 1 GB → 1 EB
        </p>
      </div>

      <p style={citeLine}>
        DNA stores {FACTS.dnaStorageDensity.display} — {FACTS.dnaStorageDensity.cite}
      </p>
    </section>
  );
}
