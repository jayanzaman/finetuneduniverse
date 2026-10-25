'use client';

import { useCallback, useRef, type CSSProperties } from 'react';
import { useProgression } from '../../progression/ProgressionContext';

/** Returns a callback that calls markInteracted(id) at most once per mounted widget. */
export function useMarkInteracted(id: string): () => void {
  const { markInteracted } = useProgression();
  const done = useRef(false);
  return useCallback(() => {
    if (done.current) return;
    done.current = true;
    markInteracted(id);
  }, [id, markInteracted]);
}

export const widgetCard: CSSProperties = {
  border: '1px solid var(--hair-2)',
  borderRadius: 12,
  padding: '20px 20px 24px',
  background: 'linear-gradient(180deg, rgba(122,123,255,0.06), rgba(122,123,255,0.01))',
  display: 'grid',
  gap: 14,
  maxWidth: 640,
};

export const optionRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

export const citeLine: CSSProperties = {
  color: 'var(--ink-faint)',
  fontFamily: 'var(--f-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
};

export const liveResult: CSSProperties = {
  borderTop: '1px solid var(--hair)',
  paddingTop: 12,
  minHeight: 24,
};

/** 2 significant digits without trailing zeros. */
export const trimNum = (n: number): string => String(Number(n.toPrecision(2)));
