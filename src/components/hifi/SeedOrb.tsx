'use client';

import type { CSSProperties } from 'react';

type SeedOrbProps = {
  size?: number;
  style?: CSSProperties;
};

export function SeedOrb({ size = 460, style }: SeedOrbProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }} aria-hidden>
      {/* Outer halo */}
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.3,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(122,123,255,0.22) 0%, rgba(79,80,232,0.10) 30%, transparent 60%)',
          filter: 'blur(2px)',
        }}
      />
      {/* Mid bloom */}
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.05,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 40% 35%, rgba(220,225,255,0.75) 0%, rgba(170,180,255,0.55) 10%, rgba(80,90,220,0.4) 28%, rgba(20,20,60,0.7) 60%, rgba(0,0,0,0.85) 85%)',
          boxShadow:
            '0 0 120px 20px rgba(79,80,232,0.4), inset 0 0 80px rgba(0,0,0,0.6)',
        }}
      />
      {/* Inner core glint — soft */}
      <div
        style={{
          position: 'absolute',
          inset: '40%',
          width: '20%',
          height: '20%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(220,225,255,0.2) 30%, transparent 70%)',
          filter: 'blur(8px)',
          opacity: 0.6,
        }}
      />
      {/* Concentric orbit rings */}
      {[1.4, 1.8, 2.2].map((mul, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: size * mul,
            height: size * mul,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px solid rgba(122,123,255,0.15)',
            opacity: 0.6 - i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
