'use client';

import { useMemo } from 'react';
import { seededRandom } from './seededRandom';

export function EntropyViz({ value = 1 }: { value?: number }) {
  // Real-world entropy: 0.1 (ordered) → 10 (chaos).
  const order = Math.max(0, Math.min(1, 1 - (value - 0.5) / 4));
  const particles = useMemo(() => {
    const out: Array<{ x: number; y: number; size: number; op: number }> = [];
    const rand = seededRandom(11);
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const ringX = 50 + Math.cos(a) * 28;
      const ringY = 50 + Math.sin(a) * 24;
      const chaosX = 12 + rand() * 76;
      const chaosY = 12 + rand() * 76;
      out.push({
        x: ringX * order + chaosX * (1 - order),
        y: ringY * order + chaosY * (1 - order),
        size: 0.6 + rand() * 0.6,
        op: 0.7 + rand() * 0.3,
      });
    }
    return out;
  }, [order]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id="entropy-glow">
          <stop offset="0%" stopColor="#A8B3FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A8B3FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="50"
        cy="50"
        rx="28"
        ry="24"
        fill="none"
        stroke="rgba(122,123,255,0.18)"
        strokeWidth="0.3"
        strokeDasharray="0.5 1"
      />
      {particles.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.size * 2} fill="url(#entropy-glow)" opacity={p.op * 0.4} />
          <circle cx={p.x} cy={p.y} r={p.size * 0.9} fill="#cdd4ff" opacity={p.op} />
        </g>
      ))}
    </svg>
  );
}
