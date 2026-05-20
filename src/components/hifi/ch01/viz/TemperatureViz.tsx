'use client';

import { useMemo } from 'react';
import { seededRandom } from './seededRandom';

export function TemperatureViz({ value = 0.99999 }: { value?: number }) {
  void value;
  const patches = useMemo(() => {
    const rand = seededRandom(66);
    const arr: Array<{ x: number; y: number; r: number; hot: boolean; op: number }> = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        x: 18 + rand() * 64,
        y: 28 + rand() * 44,
        r: 6 + rand() * 8,
        hot: rand() > 0.5,
        op: 0.25 + rand() * 0.35,
      });
    }
    return arr;
  }, []);

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <defs>
        <clipPath id="cmbclip">
          <ellipse cx="50" cy="50" rx="40" ry="26" />
        </clipPath>
        <radialGradient id="cmb-hot">
          <stop offset="0%" stopColor="#E78C5A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#E78C5A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cmb-cold">
          <stop offset="0%" stopColor="#7A7BFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#7A7BFF" stopOpacity="0" />
        </radialGradient>
        <filter id="cmb-blur">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <ellipse cx="50" cy="50" rx="40" ry="26" fill="rgba(15,15,40,0.95)" />
      <g clipPath="url(#cmbclip)" filter="url(#cmb-blur)">
        {patches.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={p.hot ? 'url(#cmb-hot)' : 'url(#cmb-cold)'}
            opacity={p.op}
          />
        ))}
      </g>
      <g clipPath="url(#cmbclip)">
        {Array.from({ length: 90 }).map((_, i) => (
          <circle
            key={i}
            cx={10 + ((i * 11.3) % 80)}
            cy={28 + ((i * 5.7) % 44)}
            r="0.18"
            fill={i % 2 ? '#E78C5A' : '#7A7BFF'}
            opacity="0.5"
          />
        ))}
      </g>
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="26"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.3"
      />
      <text
        x="92"
        y="32"
        textAnchor="end"
        fill="rgba(255,255,255,0.7)"
        fontFamily="var(--f-mono)"
        fontSize="3.6"
        letterSpacing="0.06em"
      >
        2.7250 K
      </text>
      <text
        x="92"
        y="36.5"
        textAnchor="end"
        fill="rgba(122,123,255,0.7)"
        fontFamily="var(--f-mono)"
        fontSize="3"
        letterSpacing="0.05em"
      >
        ΔT ±18 μK
      </text>
    </svg>
  );
}
