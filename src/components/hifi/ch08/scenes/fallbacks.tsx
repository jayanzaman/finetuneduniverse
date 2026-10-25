'use client';

import type { ReactNode } from 'react';
import type { SceneId } from './sceneUtils';

const n = (v: number) => Number(v.toFixed(2));

const INK = 'var(--ink, #ECECF5)';
const INK_MID = 'var(--ink-mid, #B9B9CC)';
const INK_SOFT = 'var(--ink-soft, #7B7B92)';
const INK_FAINT = 'var(--ink-faint, #4A4A60)';
const INDIGO = 'var(--indigo, #7A7BFF)';
const MINT = 'var(--goldilocks, #6FE4B1)';
const WARM = 'var(--warm, #E78C5A)';

type FrameProps = {
  label: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

function Frame({ label, title, subtitle, children }: FrameProps) {
  return (
    <svg
      viewBox="0 0 360 220"
      role="img"
      aria-label={label}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      {children}
      <text x={180} y={196} textAnchor="middle" fontSize={14} fill={INK}>
        {title}
      </text>
      <text x={180} y={212} textAnchor="middle" fontSize={10.5} fill={INK_MID}>
        {subtitle}
      </text>
    </svg>
  );
}

export function ServerToCellFallback() {
  const racks = [0, 1, 2, 3];
  const dots = [0, 1, 2, 3, 4, 5];
  return (
    <Frame
      label="Server racks dissolving into a cell nucleus. DNA stores 215 petabytes per gram; every byte humanity has made would fit in a shoebox."
      title="215 PB/g — DNA storage density"
      subtitle="every byte humanity has made would fit in a shoebox"
    >
      {racks.map((i) => (
        <g key={i}>
          <rect
            x={30 + i * 34}
            y={40}
            width={26}
            height={110}
            fill="none"
            stroke={INK_FAINT}
            strokeWidth={1}
          />
          {dots.map((j) => (
            <circle
              key={j}
              cx={n(36 + i * 34 + (j % 2) * 10)}
              cy={n(52 + j * 16)}
              r={1.4}
              fill={j % 3 === 0 ? WARM : j % 2 === 0 ? MINT : INDIGO}
              opacity={0.8}
            />
          ))}
        </g>
      ))}
      <line x1={175} y1={95} x2={215} y2={95} stroke={INK_SOFT} strokeWidth={1} />
      <path d="M 212 91 L 218 95 L 212 99" fill="none" stroke={INK_SOFT} strokeWidth={1} />
      <circle cx={270} cy={95} r={52} fill={INDIGO} opacity={0.08} />
      <circle cx={270} cy={95} r={38} fill="none" stroke={INDIGO} strokeWidth={1} opacity={0.7} />
      <circle cx={270} cy={95} r={22} fill={INDIGO} opacity={0.25} />
    </Frame>
  );
}

export function NucleusZoomFallback() {
  const chromosomes = [
    [238, 78],
    [262, 66],
    [284, 84],
    [244, 110],
    [272, 108],
    [296, 104],
  ];
  return (
    <Frame
      label="Concentric zoom from cell to nucleus to chromosomes. About 2 metres of DNA fit inside a 6 micrometre nucleus, like packing 40 kilometres of thread into a tennis ball."
      title="~2 m of DNA · ~6 µm nucleus"
      subtitle="like packing 40 km of thread into a tennis ball"
    >
      <circle cx={270} cy={90} r={70} fill="none" stroke={INK_FAINT} strokeWidth={1} />
      <circle cx={270} cy={90} r={46} fill="none" stroke={INDIGO} strokeWidth={1} opacity={0.6} />
      <circle cx={270} cy={90} r={34} fill={INDIGO} opacity={0.12} />
      {chromosomes.map(([x, y]) => (
        <g key={`${x}-${y}`} stroke={INK_MID} strokeWidth={1}>
          <line x1={x - 4} y1={y - 5} x2={x + 4} y2={y + 5} />
          <line x1={x - 4} y1={y + 5} x2={x + 4} y2={y - 5} />
        </g>
      ))}
      <g stroke={INK_SOFT} strokeWidth={1} fill="none" opacity={0.9}>
        <line x1={52} y1={60} x2={52} y2={130} />
        <circle cx={52} cy={50} r={7} />
        <line x1={52} y1={60} x2={40} y2={88} />
        <line x1={52} y1={60} x2={64} y2={88} />
        <line x1={52} y1={130} x2={42} y2={168} />
        <line x1={52} y1={130} x2={62} y2={168} />
      </g>
      <line x1={90} y1={95} x2={150} y2={95} stroke={INK_FAINT} strokeWidth={1} />
      <path d="M 147 91 L 153 95 L 147 99" fill="none" stroke={INK_FAINT} strokeWidth={1} />
    </Frame>
  );
}

export function HelixFallback() {
  const strand = (phase: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 32; i++) {
      const x = 40 + (i / 32) * 280;
      const y = 92 + Math.sin((i / 32) * Math.PI * 4 + phase) * 34;
      pts.push(`${i === 0 ? 'M' : 'L'} ${n(x)} ${n(y)}`);
    }
    return pts.join(' ');
  };
  const rungs = Array.from({ length: 14 }, (_, i) => {
    const x = 40 + ((i + 0.5) / 14) * 280;
    const y1 = 92 + Math.sin(((i + 0.5) / 14) * Math.PI * 4) * 34;
    const y2 = 92 + Math.sin(((i + 0.5) / 14) * Math.PI * 4 + Math.PI) * 34;
    return { x: n(x), y1: n(y1), y2: n(y2), at: i % 2 === 0 };
  });
  return (
    <Frame
      label="A DNA double helix. About 2 metres of DNA and 6.2 billion base pairs sit in every cell."
      title="~2 m of DNA · ~6.2 billion base pairs"
      subtitle="a four-letter script, copied three billion letters deep, per strand"
    >
      {rungs.map((r, i) => (
        <line
          key={i}
          x1={r.x}
          y1={r.y1}
          x2={r.x}
          y2={r.y2}
          stroke={r.at ? WARM : MINT}
          strokeWidth={1}
          opacity={0.75}
        />
      ))}
      <path d={strand(0)} fill="none" stroke={INDIGO} strokeWidth={1.4} />
      <path d={strand(Math.PI)} fill="none" stroke={INK_MID} strokeWidth={1.4} />
    </Frame>
  );
}

export function PlutoUnspoolFallback() {
  const dots = [
    { x: 118, y: 112, r: 1.6, c: INK_SOFT },
    { x: 140, y: 104, r: 1.8, c: INK_MID },
    { x: 156, y: 99, r: 1.9, c: MINT },
    { x: 172, y: 94, r: 1.7, c: WARM },
    { x: 208, y: 84, r: 3, c: INK_MID },
    { x: 240, y: 76, r: 2.6, c: INK_MID },
    { x: 272, y: 70, r: 2.2, c: INDIGO },
    { x: 298, y: 66, r: 2.2, c: INDIGO },
  ];
  return (
    <Frame
      label="A strand of DNA unspooling past the planets to Pluto. The DNA in your body, end to end, spans about 6 billion kilometres, about the average distance to Pluto."
      title="~6 billion km — about the distance to Pluto"
      subtitle="~3 trillion nucleated cells × ~2 m of DNA each"
    >
      <g stroke={INK_SOFT} strokeWidth={1} fill="none">
        <line x1={52} y1={100} x2={52} y2={138} />
        <circle cx={52} cy={93} r={5.5} />
        <line x1={52} y1={138} x2={45} y2={162} />
        <line x1={52} y1={138} x2={59} y2={162} />
      </g>
      <path
        d="M 58 118 C 90 128 110 118 140 108 C 190 92 250 74 318 60"
        fill="none"
        stroke={MINT}
        strokeWidth={1.2}
        opacity={0.85}
      />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} />
      ))}
      <circle cx={330} cy={57} r={5} fill={WARM} />
      <circle cx={330} cy={57} r={9} fill="none" stroke={WARM} strokeWidth={1} opacity={0.4} />
    </Frame>
  );
}

export function FoldingFallback() {
  const colors = [INDIGO, MINT, WARM, INK_MID];
  const coil = Array.from({ length: 20 }, (_, i) => ({
    x: n(34 + i * 6.4),
    y: n(70 + Math.sin(i * 0.9) * 10),
    c: colors[i % 4],
  }));
  const blob = Array.from({ length: 20 }, (_, i) => {
    const a = i * 2.4;
    const r = 8 + ((i * 37) % 19);
    return { x: n(272 + Math.cos(a) * r), y: n(84 + Math.sin(a) * r * 0.8), c: colors[i % 4] };
  });
  return (
    <Frame
      label="A chain of twenty kinds of amino acids folding into a compact protein. Only about 1 to 2 percent of the genome codes for protein."
      title="20 amino acids fold every protein"
      subtitle="64 codons · 3 stops · only ~1–2% of the genome codes for protein"
    >
      <polyline
        points={coil.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={INK_FAINT}
        strokeWidth={1}
      />
      {coil.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={p.c} opacity={0.9} />
      ))}
      <line x1={172} y1={80} x2={210} y2={82} stroke={INK_SOFT} strokeWidth={1} />
      <path d="M 207 78 L 213 82 L 207 86" fill="none" stroke={INK_SOFT} strokeWidth={1} />
      {blob.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.4} fill={p.c} opacity={0.85} />
      ))}
    </Frame>
  );
}

export function SceneFallback({ scene }: { scene: SceneId }) {
  switch (scene) {
    case 'server-to-cell':
      return <ServerToCellFallback />;
    case 'nucleus-zoom':
      return <NucleusZoomFallback />;
    case 'helix':
      return <HelixFallback />;
    case 'pluto-unspool':
      return <PlutoUnspoolFallback />;
    case 'folding':
      return <FoldingFallback />;
  }
}
