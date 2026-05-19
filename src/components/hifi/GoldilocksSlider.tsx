'use client';

import type { CSSProperties, ReactNode } from 'react';

export type GoldilocksSliderProps = {
  label: ReactNode;
  /** Display value, e.g. "1.0 M☉" */
  value: ReactNode;
  /** Optional small unit/note appended to the value */
  unit?: ReactNode;
  /** Knob position 0..1 */
  position?: number;
  /** Safe zone [left, right] in 0..1 */
  zone?: [number, number];
  leftCap?: ReactNode;
  rightCap?: ReactNode;
  /** Failure mode beneath the left/right caps */
  failLeft?: ReactNode;
  failRight?: ReactNode;
  style?: CSSProperties;
  className?: string;
};

/**
 * The signature control of the hi-fi system: a horizontal slider with
 * the survival range highlighted as a glowing green band. The knob is a
 * radial-gradient indigo bead.
 *
 * Static visual by default (matches the design intent: hi-fi mock).
 * Pass a controlled `position` to reflect external state.
 */
export function GoldilocksSlider({
  label,
  value,
  unit,
  position = 0.5,
  zone = [0.42, 0.58],
  leftCap = '←',
  rightCap = '→',
  failLeft,
  failRight,
  style,
  className,
}: GoldilocksSliderProps) {
  const cssVars: CSSProperties = {
    ['--gs-fill' as string]: `${position * 100}%`,
    ['--gs-zone-l' as string]: `${zone[0] * 100}%`,
    ['--gs-zone-r' as string]: `${zone[1] * 100}%`,
  };

  return (
    <div className={`gs ${className ?? ''}`} style={{ ...cssVars, ...style }}>
      <div className="gs-head">
        <span className="gs-label">{label}</span>
        <span className="gs-value">
          {value}
          {unit && (
            <span style={{ color: 'var(--ink-soft)', marginLeft: 8 }}>{unit}</span>
          )}
        </span>
      </div>
      <div className="gs-track" role="presentation">
        <div className="gs-rail" />
        <div className="gs-zone" />
        <div className="gs-knob" />
      </div>
      <div className="gs-caps">
        <span className={failLeft ? 'gs-cap-warn' : ''}>{leftCap}</span>
        <span style={{ color: 'var(--goldilocks)' }}>● in band</span>
        <span className={failRight ? 'gs-cap-warn' : ''}>{rightCap}</span>
      </div>
      {(failLeft || failRight) && (
        <div className="gs-band-note">
          <span className="fail">{failLeft ?? '\u00A0'}</span>
          <span className="fail">{failRight ?? '\u00A0'}</span>
        </div>
      )}
    </div>
  );
}
