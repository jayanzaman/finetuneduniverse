'use client';

/**
 * The cinematic visualizations that sit behind each chapter. Pure
 * presentational SVG / CSS — adapted from hifi-chapters-*.jsx.
 */

const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

// CH 01 — Primordial bubble
export function PrimordialBubble() {
  return (
    <div
      style={{
        position: 'absolute',
        right: -260,
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    >
      <div style={{ position: 'relative', width: 980, height: 980 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 40% 35%, rgba(170,180,255,0.4) 0%, rgba(80,90,220,0.25) 25%, rgba(20,20,60,0.4) 55%, transparent 80%)',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '8%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.6) 0%, rgba(140,150,255,0.4) 12%, rgba(50,55,180,0.45) 38%, rgba(8,8,28,0.85) 70%)',
            boxShadow:
              'inset 0 0 200px rgba(0,0,0,0.6), 0 0 180px rgba(79,80,232,0.35)',
          }}
        />
        {[0.18, 0.32, 0.46, 0.6, 0.74].map((inset, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: `${inset * 50}%`,
              borderRadius: '50%',
              border: '1px solid rgba(180,190,255,0.10)',
              opacity: 0.7 - i * 0.1,
            }}
          />
        ))}
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: 40 }).map((_, i) => {
            const a = (i / 40) * Math.PI * 2 + (i % 3) * 0.2;
            const r = 22 + (i % 7) * 4;
            const x = 50 + Math.cos(a) * r;
            const y = 50 + Math.sin(a) * r;
            return (
              <circle key={i} cx={x} cy={y} r="0.15" fill="#a8b3ff" opacity={0.5 + (i % 5) * 0.1} />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// CH 02 — Proton (three quarks bound by gluon strands)
export function ProtonViz() {
  const quarks = [
    { x: '50%', y: '25%', label: 'u', color: '#A8B3FF' },
    { x: '25%', y: '70%', label: 'u', color: '#A8B3FF' },
    { x: '75%', y: '70%', label: 'd', color: '#E78C5A' },
  ];

  return (
    <div style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)' }}>
      <div style={{ position: 'relative', width: 760, height: 760 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, rgba(122,123,255,0.20) 0%, rgba(79,80,232,0.10) 40%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '8%',
            borderRadius: '50%',
            border: '1px dashed rgba(180,190,255,0.25)',
          }}
        />
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
          <defs>
            <linearGradient id="ftu-gluon1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7A7BFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#7A7BFF" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path d="M 50 25 Q 35 50 25 70" stroke="url(#ftu-gluon1)" strokeWidth="0.5" fill="none" opacity="0.7" />
          <path d="M 50 25 Q 65 50 75 70" stroke="url(#ftu-gluon1)" strokeWidth="0.5" fill="none" opacity="0.7" />
          <path d="M 25 70 Q 50 78 75 70" stroke="url(#ftu-gluon1)" strokeWidth="0.5" fill="none" opacity="0.7" />
          <path d="M 50 25 Q 35 50 25 70" stroke="#ffffff" strokeWidth="0.2" fill="none" strokeDasharray="0.5 1.2" opacity="0.8" />
          <path d="M 50 25 Q 65 50 75 70" stroke="#ffffff" strokeWidth="0.2" fill="none" strokeDasharray="0.5 1.2" opacity="0.8" />
          <path d="M 25 70 Q 50 78 75 70" stroke="#ffffff" strokeWidth="0.2" fill="none" strokeDasharray="0.5 1.2" opacity="0.8" />
        </svg>

        {quarks.map((q, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: q.x,
              top: q.y,
              transform: 'translate(-50%, -50%)',
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${q.color} 35%, rgba(20,20,60,0.7) 80%)`,
              boxShadow: `0 0 50px ${q.color}80, inset 0 0 18px rgba(0,0,0,0.4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--f-display)',
              fontSize: 28,
              fontWeight: 300,
              color: 'var(--ink)',
            }}
          >
            {q.label}
          </div>
        ))}

        <div
          className="mono"
          style={{
            position: 'absolute',
            left: '50%',
            top: '54%',
            transform: 'translateX(-50%)',
            color: 'var(--ink-soft)',
            fontSize: 10,
            letterSpacing: '0.4em',
          }}
        >
          P R O T O N
        </div>
      </div>
    </div>
  );
}

// CH 03 — First star
export function FirstStarViz() {
  return (
    <div style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)' }}>
      <div style={{ position: 'relative', width: 820, height: 820 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,240,200,0.20) 0%, rgba(231,140,90,0.18) 18%, rgba(122,123,255,0.10) 45%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const x1 = 50 + Math.cos(a) * 48;
            const y1 = 50 + Math.sin(a) * 48;
            const cx = 50 + Math.cos(a + 0.6) * 28;
            const cy = 50 + Math.sin(a + 0.6) * 28;
            const x2 = 50 + Math.cos(a) * 15;
            const y2 = 50 + Math.sin(a) * 15;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                stroke="rgba(255,240,200,0.30)"
                strokeWidth="0.25"
                fill="none"
              />
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 38% 30%, #ffffff 0%, #fff6e0 20%, #ffd09a 45%, #d97742 75%, rgba(80,30,10,0.9) 95%)',
            boxShadow:
              '0 0 120px 30px rgba(255,210,140,0.55), 0 0 250px 60px rgba(231,140,90,0.35), inset 0 0 30px rgba(80,30,10,0.4)',
          }}
        />
      </div>
    </div>
  );
}

// CH 04 — Spiral galaxy with Sgr A*
export function GalaxyViz() {
  const dust = (() => {
    const rand = seededRandom(404);
    const out: { x: number; y: number; size: number; op: number }[] = [];
    for (let i = 0; i < 320; i++) {
      const t = rand() * Math.PI * 8;
      const r = 6 + (i / 320) * 38 + rand() * 4;
      const arm = Math.floor(rand() * 2);
      const a = t * 0.6 + arm * Math.PI + rand() * 0.5;
      out.push({
        x: 50 + Math.cos(a) * r,
        y: 50 + Math.sin(a) * r,
        size: 0.15 + rand() * 0.35,
        op: 0.4 + rand() * 0.5,
      });
    }
    return out;
  })();

  return (
    <div style={{ position: 'absolute', right: -160, top: '50%', transform: 'translateY(-50%)' }}>
      <div style={{ position: 'relative', width: 1000, height: 1000 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(122,123,255,0.22) 0%, rgba(79,80,232,0.10) 35%, transparent 60%)',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '12%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(170,180,255,0.28) 0%, rgba(80,90,220,0.18) 25%, rgba(20,20,60,0.4) 55%, transparent 80%)',
            filter: 'blur(1px)',
          }}
        />

        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
          {dust.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.size * 0.12} fill="#cdd4ff" opacity={d.op} />
          ))}
          {[0, 1, 2, 3].map((arm) => {
            const pts: string[] = [];
            for (let t = 0; t < 4; t += 0.05) {
              const r = 4 + t * 9;
              const a = t * 1.2 + arm * (Math.PI / 2);
              pts.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`);
            }
            return (
              <polyline key={arm} points={pts.join(' ')} fill="none" stroke="#7A7BFF" strokeWidth="0.15" opacity="0.35" />
            );
          })}
        </svg>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, rgba(231,140,90,0.6), rgba(122,123,255,0.45), rgba(231,140,90,0.6), rgba(122,123,255,0.45), rgba(231,140,90,0.6))',
            filter: 'blur(8px)',
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 110,
            height: 110,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, #000 60%, rgba(231,140,90,0.6) 78%, rgba(122,123,255,0.3) 90%, transparent 100%)',
            boxShadow: '0 0 70px 20px rgba(231,140,90,0.35)',
          }}
        />
      </div>
    </div>
  );
}

// CH 05 — Goldilocks band: star with green habitable annulus
export function GoldilocksViz() {
  return (
    <div style={{ position: 'absolute', right: -160, top: '50%', transform: 'translateY(-50%)' }}>
      <div style={{ position: 'relative', width: 1100, height: 1100 }}>
        <div
          style={{
            position: 'absolute',
            inset: '24%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, transparent 60%, rgba(111,228,177,0.16) 68%, rgba(111,228,177,0.06) 82%, transparent 92%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '24%',
            borderRadius: '50%',
            border: '1px dashed rgba(111,228,177,0.45)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '36%',
            borderRadius: '50%',
            border: '1px dashed rgba(111,228,177,0.45)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 38% 30%, #ffffff 0%, #fff6e0 18%, #ffd09a 45%, #e78c5a 75%, rgba(80,30,10,0.9) 95%)',
            boxShadow:
              '0 0 100px 25px rgba(255,210,140,0.5), 0 0 200px 50px rgba(231,140,90,0.3)',
          }}
        />
        {/* Earth in band */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% + 280px)',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 90,
            height: 90,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 35% 30%, rgba(220,235,255,1) 0%, rgba(120,180,220,1) 25%, rgba(40,80,140,1) 70%, rgba(8,20,50,1) 100%)',
            boxShadow: '0 0 30px rgba(120,180,220,0.5), inset -8px -10px 18px rgba(0,0,0,0.5)',
            border: '1px solid rgba(180,210,235,0.4)',
          }}
        />
      </div>
    </div>
  );
}

// CH 06 — Primordial Earth: lightning + drifting molecules
export function PrimordialEarthViz() {
  const molecules = [
    { x: 16, y: 48, t: 'CH₄', s: 22 },
    { x: 24, y: 62, t: 'NH₃', s: 18 },
    { x: 62, y: 50, t: 'H₂O', s: 24 },
    { x: 72, y: 38, t: 'CO₂', s: 20 },
    { x: 80, y: 56, t: 'HCN', s: 18 },
    { x: 56, y: 65, t: 'Gly', s: 18 },
    { x: 86, y: 68, t: 'Ala', s: 16 },
    { x: 18, y: 36, t: 'H₂',  s: 16 },
  ];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(8,8,28,0) 0%, rgba(40,30,80,0.45) 40%, rgba(120,60,80,0.5) 65%, rgba(231,140,90,0.55) 82%, rgba(255,180,120,0.4) 92%, rgba(20,10,30,0.95) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '24%',
          height: 200,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255,180,120,0.45) 0%, transparent 60%)',
          filter: 'blur(10px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '26%',
          background: 'linear-gradient(180deg, rgba(20,10,30,0.95) 0%, #03030a 70%)',
        }}
      />
      <svg
        style={{ position: 'absolute', left: '34%', top: '8%', width: 240, height: 480 }}
        viewBox="0 0 240 480"
      >
        <defs>
          <filter id="ftu-glow6">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polyline
          points="160,0 130,80 180,120 100,200 160,240 90,330 150,360 80,440"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          filter="url(#ftu-glow6)"
          opacity="0.95"
        />
        <polyline
          points="160,0 130,80 180,120 100,200 160,240 90,330 150,360 80,440"
          fill="none"
          stroke="rgba(170,180,255,0.7)"
          strokeWidth="6"
          filter="url(#ftu-glow6)"
          opacity="0.5"
        />
      </svg>
      {molecules.map((m, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${m.x}%`,
            top: `${m.y}%`,
            fontFamily: 'var(--f-mono)',
            fontSize: m.s,
            color: 'var(--ink)',
            opacity: 0.55,
            letterSpacing: '0.04em',
            textShadow: '0 0 12px rgba(122,123,255,0.6)',
          }}
        >
          {m.t}
        </div>
      ))}
    </>
  );
}

// CH 07 — Curved earth limb (the column lives in the chapter body)
export function EarthLimbViz() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '58%',
        right: -480,
        top: -200,
        bottom: -200,
        zIndex: 2,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 35%, rgba(220,235,255,0.65) 0%, rgba(120,180,220,0.85) 8%, rgba(60,130,170,0.85) 28%, rgba(40,80,120,0.85) 55%, rgba(20,40,80,0.9) 80%)',
          boxShadow: '0 0 120px 20px rgba(120,180,220,0.4), inset 30px 40px 200px rgba(0,0,0,0.7)',
          border: '1px solid rgba(180,210,235,0.4)',
        }}
      />
      <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
        <defs>
          <clipPath id="ftu-earthclip">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>
        <g clipPath="url(#ftu-earthclip)" opacity="0.7">
          <path d="M 18 30 Q 28 22 38 28 Q 42 38 32 44 Q 22 42 18 30 Z" fill="rgba(80,110,70,0.7)" />
          <path d="M 42 50 Q 52 45 58 52 Q 62 64 54 70 Q 44 68 42 50 Z" fill="rgba(80,110,70,0.7)" />
          <path d="M 22 60 Q 32 58 34 66 Q 30 76 22 70 Z" fill="rgba(80,110,70,0.7)" />
          <path d="M 68 24 Q 78 22 82 32 Q 76 40 70 36 Q 66 30 68 24 Z" fill="rgba(80,110,70,0.7)" />
          <path d="M 30 18 Q 50 14 70 20 Q 80 30 70 32 Q 50 28 30 24 Z" fill="rgba(255,255,255,0.25)" />
          <path d="M 20 75 Q 40 72 60 80 Q 70 86 50 88 Q 30 86 20 75 Z" fill="rgba(255,255,255,0.2)" />
        </g>
      </svg>
    </div>
  );
}
