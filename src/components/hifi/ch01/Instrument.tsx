'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ParameterCard } from './ParameterCard';
import { OutcomeBanner } from './OutcomeBanner';
import { FateLadder } from './FateLadder';
import { FocusedView } from './FocusedView';
import { MobileStepper } from './MobileStepper';
import { BrokenState } from './BrokenState';
import { PARAMS, isInBand, type ParamKey } from './params';

export type InstrumentProps = {
  educatorMode?: boolean;
};

type Values = Record<ParamKey, number>;

const DEFAULT_VALUES: Values = PARAMS.reduce((acc, p) => {
  acc[p.key] = p.defaultValue;
  return acc;
}, {} as Values);

// Score a single parameter against its band. Mirrors the original Beginning
// section's scoring envelope: 1.0 at the band centre, falling off to 0 at the
// far edges of the range.
function scoreParam(key: ParamKey, value: number): number {
  switch (key) {
    case 'entropy':
      return Math.max(0, 1 - Math.abs(value - 1) / 2);
    case 'expansion':
      return Math.max(0, 1 - Math.abs(value - 0.7) / 0.5);
    case 'fluctuations':
      return Math.max(0, 1 - Math.abs(value - 0.2) / 0.3);
    default:
      return 0;
  }
}

function outcomeFromState(values: Values): string {
  const entropyScore = scoreParam('entropy', values.entropy);
  const expansionScore = scoreParam('expansion', values.expansion);
  const fluctuationScore = scoreParam('fluctuations', values.fluctuations);
  const total = entropyScore * 0.4 + expansionScore * 0.35 + fluctuationScore * 0.25;

  // Cross-parameter interactions mirror the original derivation.
  const effectiveExpansion = values.expansion * (1 + (values.entropy - 1) * 0.1);
  const effectiveFluctuations = values.fluctuations * Math.sqrt(values.entropy);

  if (total > 0.85) return 'Perfect conditions — complex structures flourish';
  if (total > 0.65) return 'Excellent — life and galaxies likely to emerge';
  if (total > 0.45) return 'Marginal — simple structures possible, life uncertain';
  if (total > 0.25) return 'Poor conditions — mostly sterile universe';
  if (values.entropy > 7) return 'Maximum entropy — complete thermal death';
  if (effectiveExpansion > 2) return 'Runaway expansion — matter tears apart instantly';
  if (effectiveExpansion < 0.1) return 'Big Crunch — universe collapses in seconds';
  if (effectiveFluctuations > 1.5) return 'Quantum chaos — black holes dominate everything';
  return 'Catastrophic failure — universe cannot form atoms';
}

export function Instrument({ educatorMode: educatorModeProp = false }: InstrumentProps) {
  const [values, setValues] = useState<Values>(DEFAULT_VALUES);
  const [focusedKey, setFocusedKey] = useState<ParamKey | null>(null);
  const [educatorModeOverride, setEducatorModeOverride] = useState<boolean | null>(null);
  const educatorMode = educatorModeOverride ?? educatorModeProp;

  // Listen for the legacy global randomize event so the chapter frame's
  // "randomize" button keeps working.
  useEffect(() => {
    const handleRandomize = () => {
      setValues((prev) => {
        const next: Values = { ...prev };
        for (const p of PARAMS) {
          const [min, max] = p.range;
          next[p.key] = min + Math.random() * (max - min);
        }
        return next;
      });
    };
    window.addEventListener('randomizeUniverse', handleRandomize);
    return () => window.removeEventListener('randomizeUniverse', handleRandomize);
  }, []);

  const setValue = useCallback((key: ParamKey, next: number) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  }, []);

  const { total, complexity, outsideBandCount, warnIndex, outcomeLabel } = useMemo(() => {
    const entropyScore = scoreParam('entropy', values.entropy);
    const expansionScore = scoreParam('expansion', values.expansion);
    const fluctuationScore = scoreParam('fluctuations', values.fluctuations);
    const t = entropyScore * 0.4 + expansionScore * 0.35 + fluctuationScore * 0.25;
    const c = entropyScore * expansionScore * fluctuationScore;
    let outIdx: number | null = null;
    let outCount = 0;
    PARAMS.forEach((p, i) => {
      if (p.scored && !isInBand(p, values[p.key])) {
        outCount += 1;
        if (outIdx === null) outIdx = i;
      }
    });
    return {
      total: t,
      complexity: c,
      outsideBandCount: outCount,
      warnIndex: outIdx,
      outcomeLabel: outcomeFromState(values),
    };
  }, [values]);

  const warn = outsideBandCount > 0;
  const inBandCount = PARAMS.length - outsideBandCount;
  const status = warn
    ? `${outsideBandCount} outside band · cascading failure`
    : `In all bands · ${inBandCount} / ${PARAMS.length}`;

  const handleRandomizeClick = useCallback(() => {
    window.dispatchEvent(new Event('randomizeUniverse'));
  }, []);

  const handleReset = useCallback(() => {
    setValues(DEFAULT_VALUES);
  }, []);

  return (
    <div className={`inst-section${warn ? ' broken' : ''}`}>
      <div className="inst-header">
        <div className="inst-eyebrow">
          <span className="inst-eyebrow-tag">The instrument · six parameters</span>
          <span className="inst-eyebrow-title">
            Six knobs. Three feed the fate. Three are open questions.
          </span>
        </div>
        <div className="inst-actions">
          <button
            type="button"
            className={`inst-action${educatorMode ? ' on' : ''}`}
            onClick={() => setEducatorModeOverride(!educatorMode)}
            aria-pressed={educatorMode}
          >
            <span className="ico" /> Educator mode · {educatorMode ? 'on' : 'off'}
          </button>
          <button type="button" className="inst-action" onClick={handleRandomizeClick}>
            ⟳ Randomize universe
          </button>
        </div>
      </div>

      <OutcomeBanner
        label={outcomeLabel}
        warn={warn}
        total={total}
        complexity={complexity}
        status={status}
      />
      <FateLadder position={total} />

      <div className="param-grid">
        {PARAMS.map((p) => (
          <ParameterCard
            key={p.key}
            p={p}
            value={values[p.key]}
            onChange={(next) => setValue(p.key, next)}
            onMaximize={() => setFocusedKey(p.key)}
            onReadLesson={() => setFocusedKey(p.key)}
          />
        ))}
      </div>

      <MobileStepper
        values={values}
        onChange={setValue}
        onMaximize={setFocusedKey}
        outcomeLabel={outcomeLabel}
        total={total}
        complexity={complexity}
        status={status}
        warn={warn}
      />

      {warn && <BrokenState values={values} onReset={handleReset} />}

      {focusedKey && (
        <FocusedView
          param={PARAMS.find((p) => p.key === focusedKey)!}
          value={values[focusedKey]}
          educatorMode={educatorMode}
          onChange={(next) => setValue(focusedKey, next)}
          onClose={() => setFocusedKey(null)}
        />
      )}

      {warnIndex !== null && <span hidden data-warn-index={warnIndex} />}
    </div>
  );
}
