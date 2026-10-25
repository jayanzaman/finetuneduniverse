'use client';

import { useState } from 'react';
import { GoldilocksSlider } from '../../GoldilocksSlider';
import { FACTS } from '../facts';
import { compareToKnown, formatScientific, sequenceSpaceLog10, toSuperscript } from '../lib/math';
import { STEPS } from '../copy';
import { citeLine, liveResult, useMarkInteracted, widgetCard } from './shared';

const MIN_LEN = 10;
const MAX_LEN = 1000;
const DEFAULT_LEN = 150;
const DEFAULT_POSITION = (DEFAULT_LEN - MIN_LEN) / (MAX_LEN - MIN_LEN);

const HONESTY_NOTE = STEPS.find((s) => s.id === 'probability')?.subPanels?.find(
  (p) => p.id === 'b',
)?.honestyNote;

export function SequenceSpace() {
  const markOnce = useMarkInteracted('ch08:sequence');
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const length = Math.round(MIN_LEN + position * (MAX_LEN - MIN_LEN));
  const log10 = sequenceSpaceLog10(length);

  return (
    <section aria-label="Protein sequence space explorer" style={widgetCard}>
      <p className="mono" style={{ margin: 0 }}>
        A library bigger than the universe
      </p>
      <h3 style={{ margin: 0 }}>How many proteins could exist?</h3>

      <GoldilocksSlider
        label="Protein length"
        value={`${length.toLocaleString('en-US')} aa`}
        position={position}
        zone={[0, 1]}
        leftCap="10 aa"
        rightCap="1,000 aa"
        interactive
        ariaLabel="Protein length"
        onPositionChange={(next) => {
          markOnce();
          setPosition(next);
        }}
      />

      <div role="status" aria-live="polite" style={liveResult}>
        <p className="prose-sm" style={{ margin: 0 }}>
          <strong style={{ color: 'var(--goldilocks)' }}>
            20{toSuperscript(length)} ≈ {formatScientific(log10)}
          </strong>{' '}
          possible sequences
        </p>
        <ul className="prose-sm" style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 4 }}>
          {compareToKnown(log10).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {HONESTY_NOTE && (
        <div
          style={{
            border: '1px solid var(--warm-soft)',
            borderRadius: 8,
            padding: '10px 12px',
            display: 'grid',
            gap: 6,
          }}
        >
          <p className="prose-sm" style={{ margin: 0 }}>
            <em>{HONESTY_NOTE}</em>
          </p>
          <p style={{ ...citeLine, margin: 0 }}>
            {FACTS.functionalFractionRange.cite}
            {FACTS.functionalFractionRange.disputed ? ' · range disputed' : ''}
          </p>
        </div>
      )}
    </section>
  );
}
