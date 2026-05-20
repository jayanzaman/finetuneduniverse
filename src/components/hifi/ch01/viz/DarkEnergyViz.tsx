'use client';

type BarProps = { y: number; label: string; w: number; color: string };

function Bar({ y, label, w, color }: BarProps) {
  return (
    <g>
      <line
        x1="10"
        y1={y}
        x2="90"
        y2={y}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.25"
        strokeDasharray="0.6 0.8"
      />
      <line x1="10" y1={y} x2={10 + w * 80} y2={y} stroke={color} strokeWidth="1.4" />
      {[0.1, 0.35, 0.6, 0.85].map((p, i) => (
        <circle key={i} cx={10 + p * w * 80} cy={y} r="1.3" fill={color} />
      ))}
      <polygon
        points={`${10 + w * 80 - 1.5},${y - 1.5} ${10 + w * 80 + 2.5},${y} ${10 + w * 80 - 1.5},${y + 1.5}`}
        fill={color}
      />
      <text
        x="10"
        y={y - 4}
        fill="rgba(255,255,255,0.6)"
        fontFamily="var(--f-mono)"
        fontSize="3.6"
        letterSpacing="0.04em"
      >
        {label}
      </text>
    </g>
  );
}

export function DarkEnergyViz({ value = 1 }: { value?: number }) {
  const realW = 0.62;
  const userW = Math.max(0.1, Math.min(0.95, value * 0.5 + 0.12));
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <Bar y={38} label="REAL Λ" w={realW} color="#6FE4B1" />
      <Bar y={68} label="YOUR Λ" w={userW} color="#7A7BFF" />
      <line x1="10" y1="88" x2="90" y2="88" stroke="rgba(255,255,255,0.25)" strokeWidth="0.25" />
      <polygon points="90,86 93,88 90,90" fill="rgba(255,255,255,0.4)" />
      <text
        x="50"
        y="94"
        textAnchor="middle"
        fill="rgba(255,255,255,0.45)"
        fontFamily="var(--f-mono)"
        fontSize="3.4"
        letterSpacing="0.08em"
      >
        COSMIC TIME →
      </text>
    </svg>
  );
}
