'use client';

import { useMemo } from 'react';
import { seededRandom } from './seededRandom';

export function FluctuationsViz({ value = 0.2 }: { value?: number }) {
  const patches = useMemo(() => {
    const rand = seededRandom(33);
    const arr: Array<{ x: number; y: number; r: number; hot: boolean; op: number }> = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        x: 10 + rand() * 80,
        y: 10 + rand() * 80,
        r: 8 + rand() * 14,
        hot: rand() > 0.5,
        op: 0.3 + value * 0.7,
      });
    }
    return arr;
  }, [value]);

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="fluc-hot">
          <stop offset="0%" stopColor="#E78C5A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E78C5A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fluc-cold">
          <stop offset="0%" stopColor="#7A7BFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7A7BFF" stopOpacity="0" />
        </radialGradient>
        <filter id="fluc-blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <rect width="100" height="100" fill="rgba(20,20,50,0.4)" />
      <g filter="url(#fluc-blur)">
        {patches.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={p.hot ? 'url(#fluc-hot)' : 'url(#fluc-cold)'}
            opacity={p.op}
          />
        ))}
      </g>
      {Array.from({ length: 60 }).map((_, i) => (
        <circle
          key={i}
          cx={(i * 13.7) % 100}
          cy={(i * 23.1) % 100}
          r="0.18"
          fill={i % 2 ? '#E78C5A' : '#7A7BFF'}
          opacity={0.4 + value * 0.4}
        />
      ))}
    </svg>
  );
}
