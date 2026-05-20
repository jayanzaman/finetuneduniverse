'use client';

import { useEffect } from 'react';
import { GoldilocksSlider } from '../GoldilocksSlider';
import { VIZ_BY_KEY } from './viz';
import {
  formatValue,
  isInBand,
  normalizedBand,
  toNormalized,
  toRealValue,
  type ParamDef,
} from './params';
import { EDUCATOR_CONTENT } from './EducatorContent';

export type FocusedViewProps = {
  param: ParamDef;
  value: number;
  educatorMode: boolean;
  onChange: (next: number) => void;
  onClose: () => void;
};

export function FocusedView({
  param,
  value,
  educatorMode,
  onChange,
  onClose,
}: FocusedViewProps) {
  const Viz = VIZ_BY_KEY[param.key];
  const content = EDUCATOR_CONTENT[param.key];
  const position = toNormalized(value, param.range);
  const zone = normalizedBand(param);
  const inBand = isInBand(param, value);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePos = (next: number) => onChange(toRealValue(next, param.range));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${param.name} focused view`}
      className="focus-modal"
    >
      <button type="button" className="focus-modal-close" onClick={onClose}>
        [ ESC · close ]
      </button>

      {/* LEFT — large viz + math */}
      <div className="focus-modal-viz">
        <div className="focus-modal-eyebrow">
          Parameter {param.n} · Focused view
        </div>
        <h2 className="focus-modal-title">{param.name}</h2>
        <p className="prose-sm" style={{ maxWidth: 460 }}>
          {param.question}
        </p>

        {content.mathBlocks?.map((block, i) => (
          <div key={i} className="math-block">
            <span className="math" style={{ fontSize: educatorMode ? 32 : 26 }}>
              {block.expression}
            </span>
            <div className="math-caption">{block.caption}</div>
          </div>
        ))}

        <div className="focus-modal-large-viz">
          <Viz value={value} />
        </div>
      </div>

      {/* RIGHT — slider + lesson cards */}
      <div className="focus-modal-side">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
            }}
          >
            Current value
          </span>
          <span
            style={{
              fontFamily: 'var(--f-display)',
              fontSize: 36,
              fontWeight: 300,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
            }}
          >
            {formatValue(param, value)}{' '}
            <span style={{ fontSize: 13, color: inBand ? 'var(--goldilocks)' : 'var(--warm)' }}>
              ● {inBand ? 'in band' : 'outside band'}
            </span>
          </span>
        </div>

        <GoldilocksSlider
          label={`${param.name} · ${param.unit}`}
          value={`${formatValue(param, value)} ${param.unit}`}
          position={position}
          zone={zone}
          leftCap={param.leftCap}
          rightCap={param.rightCap}
          failLeft={param.failLeft}
          failRight={param.failRight}
          interactive
          onPositionChange={handlePos}
        />

        <div style={{ marginTop: 24 }}>
          {content.sections.map((s, i) => (
            <div
              key={i}
              className={`edu-card${s.kind === 'pullquote' ? ' pullquote' : ''}`}
            >
              <div className="label">{s.label}</div>
              <div className="body">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
