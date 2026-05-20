'use client';

export function ExpansionViz({
  value = 0.7,
  direction = 'out',
}: {
  value?: number;
  direction?: 'in' | 'out';
}) {
  const r = 14 + value * 22;
  const dots = Array.from({ length: 10 }).map((_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r, a };
  });
  const tint = direction === 'in' ? '#A8B3FF' : '#E78C5A';

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <circle cx="50" cy="50" r="1.5" fill="rgba(122,123,255,0.5)" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="rgba(122,123,255,0.18)"
        strokeWidth="0.25"
        strokeDasharray="0.6 1"
      />
      {dots.map((d, i) => (
        <g key={i}>
          <line
            x1={d.x}
            y1={d.y}
            x2={50 + Math.cos(d.a) * (r + 6)}
            y2={50 + Math.sin(d.a) * (r + 6)}
            stroke={tint}
            strokeWidth="0.4"
            opacity="0.7"
          />
          <circle cx={d.x} cy={d.y} r="1.6" fill={tint} opacity="0.95" />
          <circle cx={d.x} cy={d.y} r="3.2" fill={tint} opacity="0.18" />
        </g>
      ))}
    </svg>
  );
}
