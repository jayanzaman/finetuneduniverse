'use client';

export function ShapeViz({ value = 1 }: { value?: number }) {
  // value 0.5 (sphere) → 1 (flat) → 1.5 (saddle)
  const k = (value - 1) * 2;
  const buildH = (gy: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= 100; x += 5) {
      const dx = (x - 50) / 50;
      const dy = (gy - 50) / 50;
      const lift = -k * (dx * dx - dy * dy) * 14;
      pts.push(`${x},${gy + lift}`);
    }
    return pts.join(' ');
  };
  const buildV = (gx: number) => {
    const pts: string[] = [];
    for (let y = 10; y <= 90; y += 5) {
      const dx = (gx - 50) / 50;
      const dy = (y - 50) / 50;
      const lift = -k * (dx * dx - dy * dy) * 14;
      pts.push(`${gx},${y + lift}`);
    }
    return pts.join(' ');
  };

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="shape-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A7BFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#7A7BFF" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {[20, 30, 40, 50, 60, 70, 80].map((y) => (
        <polyline
          key={`h${y}`}
          points={buildH(y)}
          fill="none"
          stroke="rgba(122,123,255,0.45)"
          strokeWidth="0.4"
        />
      ))}
      {[10, 25, 40, 50, 60, 75, 90].map((x) => (
        <polyline
          key={`v${x}`}
          points={buildV(x)}
          fill="none"
          stroke="rgba(122,123,255,0.32)"
          strokeWidth="0.3"
        />
      ))}
      <polygon
        points="38,50 62,46 50,66"
        fill="rgba(111,228,177,0.18)"
        stroke="rgba(111,228,177,0.7)"
        strokeWidth="0.4"
      />
    </svg>
  );
}
