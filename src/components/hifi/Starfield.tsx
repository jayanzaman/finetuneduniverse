'use client';

import { useMemo } from 'react';

const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

type StarfieldProps = {
  seed?: number;
  density?: number;
  color?: string;
  className?: string;
};

export function Starfield({
  seed = 1,
  density = 1,
  color = '#ffffff',
  className,
}: StarfieldProps) {
  const stars = useMemo(() => {
    const layers = [
      { count: 80 * density, r: 0.45, opacity: 0.45 },
      { count: 50 * density, r: 0.75, opacity: 0.7 },
      { count: 16 * density, r: 1.2,  opacity: 0.92 },
      { count: 4  * density, r: 1.8,  opacity: 1 },
    ];
    const out: { cx: number; cy: number; r: number; o: number }[] = [];
    layers.forEach((layer, li) => {
      const rand = seededRandom(seed + li * 137);
      for (let i = 0; i < layer.count; i++) {
        out.push({
          cx: rand() * 100,
          cy: rand() * 100,
          r: layer.r,
          o: layer.opacity * (0.6 + rand() * 0.4),
        });
      }
    });
    return out;
  }, [seed, density]);

  return (
    <svg
      className={className ?? 'hifi-stars'}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r * 0.06} fill={color} opacity={s.o} />
      ))}
    </svg>
  );
}
