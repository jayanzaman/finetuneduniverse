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

/** Fixed-precision SVG coordinate. Math.cos/sin can differ by ±1 ulp between
 *  the Node SSR engine and the browser engine, which triggers React hydration
 *  mismatches on chapter visuals. Rounding keeps server and client HTML identical. */
const svg = (n: number) => Number(n.toFixed(4));

/** Planet surface state as a function of orbital distance (AU). */
export function planetState(distance: number): 'hot' | 'habitable' | 'frozen' {
  if (distance < 0.95) return 'hot';
  if (distance > 1.37) return 'frozen';
  return 'habitable';
}

// CH 01 — Primordial bubble
export function PrimordialBubble({ entropy = 1 }: { entropy?: number }) {
  // Low entropy → orderly clustering; high entropy → chaotic dispersal.
  const cluster = Math.sqrt(Math.max(0.1, Math.min(10, entropy)));
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
              'radial-gradient(circle at 40% 35%, var(--indigo) 0%, rgba(80,90,220,0.25) 25%, rgba(20,20,60,0.4) 55%, transparent 80%)',
            filter: 'blur(2px)',
            opacity: 0.4,
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
              'inset 0 0 200px rgba(0,0,0,0.6), 0 0 180px var(--indigo-glow)',
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
            className="chapter-viz-ring"
          />
        ))}
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: 40 }).map((_, i) => {
            const a = (i / 40) * Math.PI * 2 + (i % 3) * 0.2;
            const r = Math.min(47, (22 + (i % 7) * 4) * cluster);
            const x = svg(50 + Math.cos(a) * r);
            const y = svg(50 + Math.sin(a) * r);
            return (
              <circle key={i} cx={x} cy={y} r="0.15" fill="var(--indigo)" opacity={0.5 + (i % 5) * 0.1} />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// CH 02 — Proton (three quarks bound by gluon strands)
export function ProtonViz({ coupling = 1 }: { coupling?: number }) {
  // Strong-coupling ratio drives how tightly the quarks are bound: below band
  // they drift apart, above band they over-bind.
  const t = Math.max(0, Math.min(1, (coupling - 0.8) / 0.4));
  const spread = 1.3 - 0.6 * t;
  const tubeOpacity = 0.4 + 0.6 * t;
  const quarks = [
    { ox: 0, oy: -25, label: 'u', color: '#A8B3FF' },
    { ox: -25, oy: 20, label: 'u', color: '#A8B3FF' },
    { ox: 25, oy: 20, label: 'd', color: '#E78C5A' },
  ];
  const pts = quarks.map((q) => ({
    x: svg(50 + q.ox * spread),
    y: svg(50 + q.oy * spread),
  }));
  const edges: Array<[number, number]> = [[0, 1], [0, 2], [1, 2]];

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
          {edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={pts[a].x}
              y1={pts[a].y}
              x2={pts[b].x}
              y2={pts[b].y}
              stroke="url(#ftu-gluon1)"
              strokeWidth="0.5"
              opacity={tubeOpacity}
            />
          ))}
        </svg>

        {quarks.map((q, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${pts[i].x}%`,
              top: `${pts[i].y}%`,
              transform: 'translate(-50%, -50%)',
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${q.color} 35%, rgba(20,20,60,0.7) 80%)`,
              boxShadow: `0 0 ${30 + t * 30}px ${q.color}80, inset 0 0 18px rgba(0,0,0,0.4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--f-display)',
              fontSize: 28,
              fontWeight: 300,
              color: 'var(--ink)',
              transition: 'left 300ms ease, top 300ms ease, box-shadow 300ms ease',
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
export function FirstStarViz({ mass = 1 }: { mass?: number }) {
  // Stellar mass drives the star's size/energy: red dwarf < main sequence < supergiant.
  const size = Math.min(420, Math.max(150, 260 * Math.pow(mass, 0.18)));
  const glow = Math.max(0.5, Math.min(2, Math.pow(mass, 0.35)));
  const hot = Math.max(0, Math.min(1, (Math.log10(mass) + 1.1) / 2.7));
  const glowColor =
    hot < 0.4 ? 'rgba(255,150,90,' : hot > 0.6 ? 'rgba(170,200,255,' : 'rgba(255,210,140,';
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
            const x1 = svg(50 + Math.cos(a) * 48);
            const y1 = svg(50 + Math.sin(a) * 48);
            const cx = svg(50 + Math.cos(a + 0.6) * 28);
            const cy = svg(50 + Math.sin(a + 0.6) * 28);
            const x2 = svg(50 + Math.cos(a) * 15);
            const y2 = svg(50 + Math.sin(a) * 15);
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
            width: size,
            height: size,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 38% 30%, #ffffff 0%, #fff6e0 20%, #ffd09a 45%, #d97742 75%, rgba(80,30,10,0.9) 95%)',
            boxShadow:
              `0 0 ${Math.round(120 * glow)}px ${Math.round(30 * glow)}px ${glowColor}${(0.55 * glow).toFixed(3)}), 0 0 ${Math.round(250 * glow)}px ${Math.round(60 * glow)}px rgba(231,140,90,${(0.35 * glow).toFixed(3)}), inset 0 0 30px rgba(80,30,10,0.4)`,
            transition: 'width 300ms ease, height 300ms ease, box-shadow 300ms ease',
          }}
        />
      </div>
    </div>
  );
}

// CH 04 — Spiral galaxy with Sgr A*
export function GalaxyViz({ blackHoleMass = 6.61 }: { blackHoleMass?: number }) {
  // Central black-hole mass (log10 Msun) drives the core's glow and reach.
  const t = Math.max(0, Math.min(1, (blackHoleMass - 5) / 4));
  const glowSize = 160 + t * 200;
  const coreSize = 80 + t * 80;
  const coreGlow = Math.round(40 + t * 80);
  const coreOpacity = 0.5 + t * 0.3;
  const dust = (() => {
    const rand = seededRandom(404);
    const out: { x: number; y: number; size: number; op: number }[] = [];
    for (let i = 0; i < 320; i++) {
      const t = rand() * Math.PI * 8;
      const r = 6 + (i / 320) * 38 + rand() * 4;
      const arm = Math.floor(rand() * 2);
      const a = t * 0.6 + arm * Math.PI + rand() * 0.5;
      out.push({
        x: svg(50 + Math.cos(a) * r),
        y: svg(50 + Math.sin(a) * r),
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
            <circle key={i} cx={d.x} cy={d.y} r={d.size * 0.12} fill="var(--indigo)" opacity={d.op} />
          ))}
          {[0, 1, 2, 3].map((arm) => {
            const pts: string[] = [];
            for (let t = 0; t < 4; t += 0.05) {
              const r = 4 + t * 9;
              const a = t * 1.2 + arm * (Math.PI / 2);
              pts.push(`${svg(50 + Math.cos(a) * r)},${svg(50 + Math.sin(a) * r)}`);
            }
            return (
              <polyline key={arm} points={pts.join(' ')} fill="none" stroke="var(--indigo)" strokeWidth="0.15" opacity="0.35" />
            );
          })}
        </svg>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: glowSize,
            height: glowSize,
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, rgba(231,140,90,0.6), rgba(122,123,255,0.45), rgba(231,140,90,0.6), rgba(122,123,255,0.45), rgba(231,140,90,0.6))',
            filter: 'blur(8px)',
            opacity: coreOpacity,
            transition: 'width 300ms ease, height 300ms ease, opacity 300ms ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: coreSize,
            height: coreSize,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, #000 60%, rgba(231,140,90,0.6) 78%, rgba(122,123,255,0.3) 90%, transparent 100%)',
            boxShadow: `0 0 ${coreGlow}px 20px rgba(231,140,90,0.35)`,
            transition: 'width 300ms ease, height 300ms ease, box-shadow 300ms ease',
          }}
        />
      </div>
    </div>
  );
}

// CH 05 — Goldilocks band: star with green habitable annulus
export function GoldilocksViz({ orbitalDistance = 1 }: { orbitalDistance?: number }) {
  // Orbital distance drives the planet's orbit radius and the sun's illumination
  // via the inverse-square law.
  const distance = Math.max(0.5, Math.min(2, orbitalDistance));
  const pxPerAU = 260;
  const orbitRadius = Math.max(130, distance * pxPerAU);
  const heat = Math.min(2, Math.max(0.35, 1 / (distance * distance)));

  // Planet appearance reflects its surface state against the 0.95-1.37 AU band.
  const state = planetState(distance);
  const EARTH = {
    hot: {
      size: 82,
      bg: 'radial-gradient(circle at 35% 30%, rgba(255,240,208,1) 0%, rgba(216,148,88,1) 25%, rgba(146,76,38,1) 70%, rgba(58,22,10,1) 100%)',
      glow: '0 0 36px rgba(255,175,90,0.65), inset -8px -10px 18px rgba(40,8,0,0.55)',
      border: '1px solid rgba(255,205,150,0.55)',
    },
    habitable: {
      size: 90,
      bg: 'radial-gradient(circle at 35% 30%, rgba(220,235,255,1) 0%, rgba(120,180,220,1) 25%, rgba(40,80,140,1) 70%, rgba(8,20,50,1) 100%)',
      glow: '0 0 30px rgba(120,180,220,0.5), inset -8px -10px 18px rgba(0,0,0,0.5)',
      border: '1px solid rgba(180,210,235,0.4)',
    },
    frozen: {
      size: 96,
      bg: 'radial-gradient(circle at 35% 30%, rgba(245,252,255,1) 0%, rgba(200,230,248,1) 25%, rgba(130,195,238,1) 70%, rgba(15,55,105,1) 100%)',
      glow: '0 0 26px rgba(170,215,245,0.6), inset -8px -10px 20px rgba(5,35,80,0.65)',
      border: '1px solid rgba(215,238,255,0.65)',
    },
  } as const;
  const earth = EARTH[state];

  // The habitable annulus is sized from the same band as the state mapping so
  // the planet visually crosses the dashed edges exactly at 0.95 and 1.37 AU.
  const innerPx = 0.95 * pxPerAU;
  const outerPx = 1.37 * pxPerAU;

  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
      {/* Habitable zone tint */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          width: outerPx * 2,
          height: outerPx * 2,
          borderRadius: '50%',
          background:
            `radial-gradient(circle, transparent ${((innerPx / outerPx) * 100).toFixed(1)}%, rgba(111,228,177,0.14) ${((innerPx / outerPx) * 100).toFixed(1)}%, rgba(111,228,177,0.05) 88%, transparent 100%)`,
        }}
      />
      {/* Inner (0.95 AU) dashed edge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          width: innerPx * 2,
          height: innerPx * 2,
          borderRadius: '50%',
          border: '1px dashed rgba(111,228,177,0.5)',
        }}
      />
      {/* Outer (1.37 AU) dashed edge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          width: outerPx * 2,
          height: outerPx * 2,
          borderRadius: '50%',
          border: '1px dashed rgba(111,228,177,0.5)',
        }}
      />
      {/* Sun */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 38% 30%, #ffffff 0%, #fff6e0 18%, #ffd09a 45%, #e78c5a 75%, rgba(80,30,10,0.9) 95%)',
          boxShadow:
            `0 0 ${Math.round(100 * heat)}px ${Math.round(25 * heat)}px rgba(255,210,140,${(0.5 * heat).toFixed(3)}), 0 0 ${Math.round(200 * heat)}px ${Math.round(50 * heat)}px rgba(231,140,90,${(0.3 * heat).toFixed(3)})`,
        }}
      />
      {/* Earth — surface state follows the band, position follows the orbit */}
      <div
        style={{
          position: 'absolute',
          left: orbitRadius,
          top: 0,
          transform: 'translate(-50%, -50%)',
          width: earth.size,
          height: earth.size,
          borderRadius: '50%',
          background: earth.bg,
          boxShadow: earth.glow,
          border: earth.border,
          transition: 'left 300ms ease, width 400ms ease, height 400ms ease, box-shadow 400ms ease, border-color 400ms ease',
        }}
      />
    </div>
  );
}

// CH 06 — Primordial Earth: lightning + drifting molecules
export function PrimordialEarthViz({ flux = 13.5 }: { flux?: number }) {
  // UV flux drives lightning intensity (low = inert, high = sterilizing) and
  // molecule visibility (productive only inside the 8-28 band).
  const inBand = flux >= 8 && flux <= 28;
  const boltFactor = Math.max(0.35, Math.min(2, flux / 13.5));
  const molOpacity = inBand ? 0.55 : 0.3;
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
          opacity={0.95 * boltFactor}
        />
        <polyline
          points="160,0 130,80 180,120 100,200 160,240 90,330 150,360 80,440"
          fill="none"
          stroke="rgba(170,180,255,0.7)"
          strokeWidth="6"
          filter="url(#ftu-glow6)"
          opacity={0.5 * boltFactor}
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
            opacity: molOpacity,
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
export function EarthLimbViz({ oxygenTiming = 2.4 }: { oxygenTiming?: number }) {
  // Oxygenation timing drives the atmosphere/land palette: hazy before the
  // oxygenation window, blue-green inside it, icy after it.
  const state = oxygenTiming < 1.8 ? 'early' : oxygenTiming > 3 ? 'late' : 'oxygen';
  const ATM = {
    early: 'radial-gradient(circle at 30% 35%, rgba(240,210,170,0.6) 0%, rgba(180,140,110,0.8) 8%, rgba(120,90,70,0.8) 28%, rgba(70,50,40,0.85) 55%, rgba(30,20,25,0.9) 80%)',
    oxygen: 'radial-gradient(circle at 30% 35%, rgba(220,235,255,0.65) 0%, rgba(120,180,220,0.85) 8%, rgba(60,130,170,0.85) 28%, rgba(40,80,120,0.85) 55%, rgba(20,40,80,0.9) 80%)',
    late: 'radial-gradient(circle at 30% 35%, rgba(235,248,255,0.7) 0%, rgba(190,225,245,0.85) 8%, rgba(140,190,225,0.85) 28%, rgba(90,140,190,0.85) 55%, rgba(40,80,130,0.9) 80%)',
  } as const;
  const LAND = { early: 'rgba(120,105,88,0.75)', oxygen: 'rgba(80,110,70,0.7)', late: 'rgba(235,245,250,0.85)' } as const;
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
            ATM[state],
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
          <path d="M 18 30 Q 28 22 38 28 Q 42 38 32 44 Q 22 42 18 30 Z" fill={LAND[state]} />
          <path d="M 42 50 Q 52 45 58 52 Q 62 64 54 70 Q 44 68 42 50 Z" fill={LAND[state]} />
          <path d="M 22 60 Q 32 58 34 66 Q 30 76 22 70 Z" fill={LAND[state]} />
          <path d="M 68 24 Q 78 22 82 32 Q 76 40 70 36 Q 66 30 68 24 Z" fill={LAND[state]} />
          <path d="M 30 18 Q 50 14 70 20 Q 80 30 70 32 Q 50 28 30 24 Z" fill="rgba(255,255,255,0.25)" />
          <path d="M 20 75 Q 40 72 60 80 Q 70 86 50 88 Q 30 86 20 75 Z" fill="rgba(255,255,255,0.2)" />
        </g>
      </svg>
    </div>
  );
}
