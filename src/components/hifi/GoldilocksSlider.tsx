'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

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
  /** When true, the slider responds to pointer drag and keyboard. */
  interactive?: boolean;
  /** Called with the new 0..1 position when interactive. */
  onPositionChange?: (next: number) => void;
  /** Optional aria label when used as a control. */
  ariaLabel?: string;
  style?: CSSProperties;
  className?: string;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

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
  interactive = false,
  onPositionChange,
  ariaLabel,
  style,
  className,
}: GoldilocksSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const cssVars: CSSProperties = {
    ['--gs-fill' as string]: `${position * 100}%`,
    ['--gs-zone-l' as string]: `${zone[0] * 100}%`,
    ['--gs-zone-r' as string]: `${zone[1] * 100}%`,
  };

  const emit = useCallback(
    (next: number) => {
      onPositionChange?.(clamp01(next));
    },
    [onPositionChange],
  );

  const positionFromClientX = useCallback((clientX: number): number => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return clamp01((clientX - rect.left) / rect.width);
  }, []);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      e.preventDefault();
      draggingRef.current = true;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      emit(positionFromClientX(e.clientX));
    },
    [interactive, emit, positionFromClientX],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!interactive || !draggingRef.current) return;
      emit(positionFromClientX(e.clientX));
    },
    [interactive, emit, positionFromClientX],
  );

  const handlePointerEnd = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      draggingRef.current = false;
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    },
    [interactive],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const step = e.shiftKey ? 0.05 : 0.01;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          emit(position - step);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          emit(position + step);
          break;
        case 'Home':
          e.preventDefault();
          emit(0);
          break;
        case 'End':
          e.preventDefault();
          emit(1);
          break;
        case 'PageDown':
          e.preventDefault();
          emit(position - 0.1);
          break;
        case 'PageUp':
          e.preventDefault();
          emit(position + 0.1);
          break;
      }
    },
    [interactive, position, emit],
  );

  // Stop dragging if pointer leaves window unexpectedly.
  useEffect(() => {
    if (!interactive) return;
    const cancel = () => {
      draggingRef.current = false;
    };
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, [interactive]);

  const sliderRole = interactive
    ? {
        role: 'slider' as const,
        tabIndex: 0,
        'aria-valuemin': 0,
        'aria-valuemax': 1,
        'aria-valuenow': Number(position.toFixed(3)),
        'aria-label': ariaLabel ?? (typeof label === 'string' ? label : undefined),
      }
    : {};

  return (
    <div
      className={`gs${interactive ? ' gs--interactive' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...cssVars, ...style }}
    >
      <div className="gs-head">
        <span className="gs-label">{label}</span>
        <span className="gs-value">
          {value}
          {unit && <span style={{ color: 'var(--ink-soft)', marginLeft: 8 }}>{unit}</span>}
        </span>
      </div>
      <div
        ref={trackRef}
        className="gs-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onKeyDown={handleKeyDown}
        {...sliderRole}
      >
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
