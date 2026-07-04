'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from '../chapters';
import { prefersReducedMotion } from '../motion';

export type HandoffOverlayProps = {
  fromIndex: number;
  toIndex: number;
  /** Navigate to toIndex — called exactly once, mid-sequence (or immediately on skip / reduced motion). */
  onArrive: () => void;
  /** Sequence finished — parent unmounts the overlay. */
  onDone: () => void;
  /** Test seam — [collapse, roll, bloom] durations. Beat 3 doubles as the reduced-motion fade time. */
  beatDurationsMs?: [number, number, number];
};

type Beat = 'collapse' | 'roll' | 'bloom' | 'cut';

const DEFAULT_BEATS: [number, number, number] = [800, 900, 800];

/**
 * Full-screen handoff between chapters (spec §6): collapse → time roll → bloom,
 * ~2.5s, skippable by any click or key. Reduced motion: a plain fade cut with a
 * static "from → to" era line.
 */
export function HandoffOverlay({
  fromIndex,
  toIndex,
  onArrive,
  onDone,
  beatDurationsMs = DEFAULT_BEATS,
}: HandoffOverlayProps) {
  const [beat, setBeat] = useState<Beat>(() => (prefersReducedMotion() ? 'cut' : 'collapse'));
  const arrivedRef = useRef(false);
  const callbacksRef = useRef({ onArrive, onDone });
  callbacksRef.current = { onArrive, onDone };

  const [d1, d2, d3] = beatDurationsMs;

  useEffect(() => {
    const arrive = () => {
      if (arrivedRef.current) return;
      arrivedRef.current = true;
      callbacksRef.current.onArrive();
    };
    const skip = () => {
      arrive();
      callbacksRef.current.onDone();
    };

    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (beat === 'cut') {
      arrive();
      timers.push(setTimeout(() => callbacksRef.current.onDone(), d3));
    } else {
      timers.push(
        setTimeout(() => {
          arrive();
          setBeat('roll');
        }, d1),
        setTimeout(() => setBeat('bloom'), d1 + d2),
        setTimeout(() => callbacksRef.current.onDone(), d1 + d2 + d3)
      );
    }

    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      timers.forEach(clearTimeout);
    };
    // Runs once per mount — beat transitions are driven by the timers above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const from = CHAPTERS[fromIndex];
  const to = CHAPTERS[toIndex];

  return (
    <div className="handoff" data-beat={beat} role="presentation">
      {beat === 'collapse' && <div className="handoff-dot handoff-dot--collapse" aria-hidden />}
      {beat === 'roll' && (
        <div className="handoff-roll">
          <span className="handoff-roll-val">{from.era} … {to.era}</span>
          <span className="handoff-roll-sub">cosmic time fast-forwards</span>
        </div>
      )}
      {beat === 'bloom' && <div className="handoff-dot handoff-dot--bloom" aria-hidden />}
      {beat === 'cut' && (
        <div className="handoff-roll">
          <span className="handoff-roll-val">{from.era} → {to.era}</span>
        </div>
      )}
      {beat !== 'cut' && <span className="handoff-skiphint">click / key = skip</span>}
    </div>
  );
}
