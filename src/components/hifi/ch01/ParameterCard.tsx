'use client';

import { GoldilocksSlider } from '../GoldilocksSlider';
import { VIZ_BY_KEY } from './viz';
import {
  formatValue,
  isInBand,
  normalizedBand,
  toNormalized,
  type ParamDef,
} from './params';

export type ParameterCardProps = {
  p: ParamDef;
  value: number;
  onChange?: (next: number) => void;
  onMaximize?: () => void;
  onReadLesson?: () => void;
};

export function ParameterCard({
  p,
  value,
  onChange,
  onMaximize,
  onReadLesson,
}: ParameterCardProps) {
  const Viz = VIZ_BY_KEY[p.key];
  const inBand = isInBand(p, value);
  const warn = p.scored && !inBand;
  const position = toNormalized(value, p.range);
  const zone = normalizedBand(p);
  const interactive = typeof onChange === 'function';

  const handlePos = interactive
    ? (next: number) => {
        const [min, max] = p.range;
        onChange(min + next * (max - min));
      }
    : undefined;

  return (
    <div className={`param-card${warn ? ' warn' : ''}`}>
      <div className="param-card-head">
        <span className="param-card-num">{p.n} · Parameter</span>
        <span className={`param-card-badge ${p.scored ? 'scored' : 'open'}`}>
          {p.scored ? 'Scored' : 'Open question'}
        </span>
      </div>

      <div className="param-viz">
        <Viz value={value} />
      </div>

      <h3 className="param-name">{p.name}</h3>
      <p className="param-question">{p.question}</p>

      <GoldilocksSlider
        className="gs--mini"
        label={p.name}
        value={formatValue(p, value)}
        unit={p.unit}
        position={position}
        zone={zone}
        leftCap={p.leftCap}
        rightCap={p.rightCap}
        interactive={interactive}
        onPositionChange={handlePos}
      />

      <div className="param-readout">
        <span className="param-value">
          {formatValue(p, value)}
          <span className="unit">{p.unit}</span>
        </span>
        <span className={`param-status${warn ? ' warn' : ''}`}>
          {warn ? 'outside band' : 'in band'}
        </span>
      </div>

      <div className="param-foot">
        <button type="button" className="param-lesson-btn" onClick={onReadLesson}>
          Read the lesson · ↗
        </button>
        <button
          type="button"
          className="param-maximize"
          title="Focused view"
          aria-label="Focused view"
          onClick={onMaximize}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 7V3h4M13 9v4H9M13 3l-5 5M3 13l5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
