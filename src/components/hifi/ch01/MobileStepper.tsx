'use client';

import { useState } from 'react';
import { ParameterCard } from './ParameterCard';
import { OutcomeBanner } from './OutcomeBanner';
import { PARAMS, type ParamKey } from './params';

export type MobileStepperProps = {
  values: Record<ParamKey, number>;
  onChange: (key: ParamKey, next: number) => void;
  onMaximize: (key: ParamKey) => void;
  outcomeLabel: string;
  total: number;
  complexity: number;
  status: string;
  warn: boolean;
};

export function MobileStepper({
  values,
  onChange,
  onMaximize,
  outcomeLabel,
  total,
  complexity,
  status,
  warn,
}: MobileStepperProps) {
  const [index, setIndex] = useState(0);
  const param = PARAMS[index];
  const progress = ((index + 1) / PARAMS.length) * 100;

  return (
    <div className="inst-mobile">
      <div className="inst-mobile-progress">
        <span>
          {index + 1} / {PARAMS.length}
        </span>
        <div className="inst-mobile-progress-bar">
          <div className="inst-mobile-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span>{param.name}</span>
      </div>

      <ParameterCard
        p={param}
        value={values[param.key]}
        onChange={(next) => onChange(param.key, next)}
        onMaximize={() => onMaximize(param.key)}
        onReadLesson={() => onMaximize(param.key)}
      />

      <div style={{ marginTop: 16 }}>
        <OutcomeBanner
          label={outcomeLabel}
          warn={warn}
          total={total}
          complexity={complexity}
          status={status}
        />
      </div>

      <div className="inst-mobile-nav" aria-label="Parameter navigation">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Previous parameter"
        >
          ← Param
        </button>
        <span className="inst-mobile-nav-counter mono" aria-hidden>
          Parameter {index + 1} of {PARAMS.length}
        </span>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(PARAMS.length - 1, i + 1))}
          disabled={index === PARAMS.length - 1}
          aria-label="Next parameter"
        >
          Param →
        </button>
      </div>
    </div>
  );
}
