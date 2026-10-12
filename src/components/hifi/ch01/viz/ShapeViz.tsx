'use client';

import { useMemo } from 'react';

type ShapeVizProps = {
  value?: number;
};

export function ShapeViz({ value = 1 }: ShapeVizProps) {
  // value range: 0.5 (hyperbolic saddle) -> 1.0 (flat euclidean) -> 1.5 (spherical 3-sphere)
  // Curvature normalized factor: c in [-1, +1]
  const c = Math.max(-1, Math.min(1, (value - 1) / 0.5));
  const isSaddle = c < -0.04;
  const isFlat = Math.abs(c) <= 0.04;
  const isSphere = c > 0.04;

  const {
    quads,
    gridH,
    gridV,
    trianglePoints,
    triangleCorners,
    angleSum,
    beam1Points,
    beam2Points,
    curvColor,
  } = useMemo(() => {
    // Camera pitch & yaw looking down at the 3D surface
    const pitch = 34 * (Math.PI / 180);
    const yaw = 26 * (Math.PI / 180);

    // Dynamic color interpolation based on curvature
    let r = 111,
      g = 228,
      b = 177; // Flat emerald mint
    if (c < 0) {
      const t = -c; // 0 -> 1 towards saddle purple
      r = Math.round(111 * (1 - t) + 168 * t);
      g = Math.round(228 * (1 - t) + 85 * t);
      b = Math.round(177 * (1 - t) + 247 * t);
    } else if (c > 0) {
      const t = c; // 0 -> 1 towards spherical cyan/blue
      r = Math.round(111 * (1 - t) + 56 * t);
      g = Math.round(228 * (1 - t) + 189 * t);
      b = Math.round(177 * (1 - t) + 248 * t);
    }
    const curvColor = { r, g, b, rgb: `rgb(${r},${g},${b})` };

    // 3D Geometry Function:
    // (u, v) in [-1, 1] parameter space
    // Elevation Z > 0 is up into sky, Z < 0 is down
    function get3D(u: number, v: number) {
      if (c >= 0) {
        // Spherical dome (S³ / S² cross-section):
        // Center bulges up like a globe, edges pull inward
        const r2 = u * u + v * v;
        const z = c * 0.95 * Math.cos(Math.min((Math.PI / 2) * 0.95, Math.sqrt(r2) * 1.08));
        const factor = 1.0 - c * 0.14 * r2;
        return { x: u * factor, y: v * factor, z };
      } else {
        // Hyperbolic saddle (H³ / H² cross-section):
        // Curves UP along v (front/back), DOWN along u (sides)
        const k = -c;
        const z = k * 0.72 * (v * v - u * u);
        const x = u * (1.0 + k * 0.16 * v * v);
        const y = v * (1.0 + k * 0.16 * u * u);
        return { x, y, z };
      }
    }

    // Perspective 3D Projection
    function project(p: { x: number; y: number; z: number }) {
      const { x, y, z } = p;
      // Yaw rotation around vertical axis Z
      const x1 = x * Math.cos(yaw) - y * Math.sin(yaw);
      const y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
      const z1 = z;

      // Line-of-sight depth
      const dist = 4.2;
      const depth = y1 * Math.cos(pitch) + z1 * Math.sin(pitch);
      const f = dist / (dist + depth);

      // Centered on SVG viewBox 100x100
      const sx = 48.0 + x1 * f * 27.0;
      const sy = 55.0 + (y1 * Math.sin(pitch) - z1 * Math.cos(pitch)) * f * 27.0;
      return { sx, sy, depth, x, y, z };
    }

    // Normal and diffuse lighting
    const lx = -0.35,
      ly = -0.45,
      lz = 0.82;
    const llen = Math.hypot(lx, ly, lz);
    const nlx = lx / llen,
      nly = ly / llen,
      nlz = lz / llen;

    // Build Mesh quads (N x N)
    const N = 12;
    type ProjectedPt = ReturnType<typeof project>;
    const gridPts: ProjectedPt[][] = [];

    for (let i = 0; i <= N; i++) {
      gridPts[i] = [];
      const u = -1.0 + (2.0 * i) / N;
      for (let j = 0; j <= N; j++) {
        const v = -1.0 + (2.0 * j) / N;
        gridPts[i][j] = project(get3D(u, v));
      }
    }

    // Create quads with depth sorting
    const quadsList: Array<{
      pts: ProjectedPt[];
      avgDepth: number;
      diffuse: number;
    }> = [];

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const p00 = gridPts[i][j];
        const p10 = gridPts[i + 1][j];
        const p11 = gridPts[i + 1][j + 1];
        const p01 = gridPts[i][j + 1];

        // Tangent vectors for normal
        const tx = p10.x - p00.x,
          ty = p10.y - p00.y,
          tz = p10.z - p00.z;
        const vx = p01.x - p00.x,
          vy = p01.y - p00.y,
          vz = p01.z - p00.z;

        // Normal vector = T x V
        let nx = ty * vz - tz * vy;
        let ny = tz * vx - tx * vz;
        let nz = tx * vy - ty * vx;
        const nlen = Math.hypot(nx, ny, nz) || 1.0;
        nx /= nlen;
        ny /= nlen;
        nz /= nlen;

        const diffuse = Math.max(0.12, Math.min(1.0, (nx * nlx + ny * nly + nz * nlz) * 0.5 + 0.5));
        const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) / 4.0;

        quadsList.push({
          pts: [p00, p10, p11, p01],
          avgDepth,
          diffuse,
        });
      }
    }

    // Painter's algorithm: sort by depth descending
    quadsList.sort((a, b) => b.avgDepth - a.avgDepth);

    // Iso-gridlines (horizontal and vertical polylines)
    const gridHList: string[] = [];
    for (let j = 0; j <= N; j += 2) {
      const linePts: string[] = [];
      for (let i = 0; i <= N; i++) {
        linePts.push(`${gridPts[i][j].sx.toFixed(2)},${gridPts[i][j].sy.toFixed(2)}`);
      }
      gridHList.push(linePts.join(' '));
    }

    const gridVList: string[] = [];
    for (let i = 0; i <= N; i += 2) {
      const linePts: string[] = [];
      for (let j = 0; j <= N; j++) {
        linePts.push(`${gridPts[i][j].sx.toFixed(2)},${gridPts[i][j].sy.toFixed(2)}`);
      }
      gridVList.push(linePts.join(' '));
    }

    // Geodesic Triangle on the surface
    // Vertices in parameter space
    const va = { u: -0.48, v: 0.42 };
    const vb = { u: 0.48, v: 0.42 };
    const vc = { u: 0.0, v: -0.52 };

    const triEdges = [
      { p1: va, p2: vb, outNorm: { u: 0.0, v: 0.22 } },
      { p1: vb, p2: vc, outNorm: { u: 0.2, v: -0.11 } },
      { p1: vc, p2: va, outNorm: { u: -0.2, v: -0.11 } },
    ];

    const triProjected: ProjectedPt[] = [];
    const stepsPerEdge = 10;
    for (const edge of triEdges) {
      for (let s = 0; s < stepsPerEdge; s++) {
        const t = s / stepsPerEdge;
        // In spherical (c > 0): geodesics bulge outward
        // In hyperbolic (c < 0): geodesics pinch inward
        const bulge = Math.sin(t * Math.PI) * c * 0.15;
        const u = edge.p1.u + (edge.p2.u - edge.p1.u) * t + edge.outNorm.u * bulge;
        const v = edge.p1.v + (edge.p2.v - edge.p1.v) * t + edge.outNorm.v * bulge;
        triProjected.push(project(get3D(u, v)));
      }
    }

    const cornerA = project(get3D(va.u, va.v));
    const cornerB = project(get3D(vb.u, vb.v));
    const cornerC = project(get3D(vc.u, vc.v));

    const triPointsStr = triProjected
      .map((p) => `${p.sx.toFixed(2)},${p.sy.toFixed(2)}`)
      .join(' ');

    // Triangle Angle Sum (180 deg in flat, > 180 in sphere, < 180 in saddle)
    const angleSum = (180 + c * 54).toFixed(1);

    // Parallel Light Rays propagating across the surface
    // Ray 1:
    const b1Pts: string[] = [];
    const b2Pts: string[] = [];
    const raySteps = 12;

    for (let s = 0; s <= raySteps; s++) {
      const t = s / raySteps;
      // In sphere (c > 0): rays converge towards each other
      // In saddle (c < 0): rays diverge away from each other
      const deflection = Math.sin(t * Math.PI * 0.85) * (-c * 0.12);

      // Ray 1
      const u1 = -0.7 + 1.05 * t + deflection * 0.6;
      const v1 = 0.4 - 0.95 * t - deflection * 0.6;
      const pt1 = project(get3D(u1, v1));
      b1Pts.push(`${pt1.sx.toFixed(2)},${pt1.sy.toFixed(2)}`);

      // Ray 2
      const u2 = -0.45 + 1.05 * t - deflection * 0.6;
      const v2 = 0.65 - 0.95 * t + deflection * 0.6;
      const pt2 = project(get3D(u2, v2));
      b2Pts.push(`${pt2.sx.toFixed(2)},${pt2.sy.toFixed(2)}`);
    }

    return {
      quads: quadsList,
      gridH: gridHList,
      gridV: gridVList,
      trianglePoints: triPointsStr,
      triangleCorners: [cornerA, cornerB, cornerC],
      angleSum,
      beam1Points: b1Pts.join(' '),
      beam2Points: b2Pts.join(' '),
      curvColor,
    };
  }, [c]);

  // Readouts for current mode
  const modeTitle = isSaddle
    ? 'HYPERBOLIC SPACE (H³)'
    : isSphere
    ? 'CLOSED 3-SPHERE (S³)'
    : 'FLAT EUCLIDEAN (ℝ³)';

  const modeBadge = isSaddle
    ? 'Negative Curvature · k = −1'
    : isSphere
    ? 'Positive Curvature · k = +1'
    : 'Zero Curvature · k = 0 (Critical)';

  const sliceNote = isSaddle
    ? '2D Slice: Saddle Surface (H²) · Open & Infinite'
    : isSphere
    ? '2D Slice: Spherical Dome (S²) · Finite Volume (No Edge)'
    : '2D Slice: Euclidean Plane (ℝ²) · Flat & Infinite';

  const rayState = isSaddle
    ? 'Rays: Divergent'
    : isSphere
    ? 'Rays: Convergent'
    : 'Rays: Parallel';

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label={`Universe Shape visual: ${modeTitle} with Ω = ${value.toFixed(3)}`}
    >
      <defs>
        {/* Glow filter for geodesics and laser beams */}
        <filter id="shape-laser-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Dynamic color glow */}
        <radialGradient id="mesh-ambient-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={curvColor.rgb} stopOpacity="0.18" />
          <stop offset="60%" stopColor={curvColor.rgb} stopOpacity="0.04" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Deep Space Background Ambient */}
      <rect width="100" height="100" fill="rgba(3, 3, 10, 0.4)" rx="8" />
      <circle cx="50" cy="52" r="42" fill="url(#mesh-ambient-glow)" />

      {/* TOP HUD: Realtime Geometry & Metric Header */}
      <g className="shape-hud-header">
        {/* Top-Left: Mode & Physics */}
        <text
          x="7"
          y="7.5"
          fill="var(--indigo)"
          fontSize="2.4"
          fontFamily="var(--f-mono)"
          letterSpacing="0.08em"
          fontWeight="600"
        >
          {modeBadge}
        </text>
        <text
          x="7"
          y="11.2"
          fill="#FFFFFF"
          fontSize="3.8"
          fontFamily="var(--f-serif)"
          letterSpacing="0.02em"
          fontWeight="500"
        >
          {modeTitle}
        </text>
        <text
          x="7"
          y="14.5"
          fill="var(--ink-faint)"
          fontSize="2.3"
          fontFamily="var(--f-mono)"
          letterSpacing="0.02em"
        >
          {sliceNote}
        </text>

        {/* Top-Right: Curvature Indicators */}
        <g transform="translate(93, 7.5)" textAnchor="end">
          <text
            x="0"
            y="0"
            fill={curvColor.rgb}
            fontSize="3.1"
            fontFamily="var(--f-mono)"
            fontWeight="bold"
          >
            Σ(θ) = {angleSum}°
          </text>
          <text
            x="0"
            y="3.8"
            fill="var(--ink-soft)"
            fontSize="2.2"
            fontFamily="var(--f-mono)"
          >
            {isSaddle ? '< 180° (Deficit)' : isSphere ? '> 180° (Excess)' : '= 180.0° (Euclidean)'}
          </text>
          <text
            x="0"
            y="7.0"
            fill={curvColor.rgb}
            fontSize="2.2"
            fontFamily="var(--f-mono)"
            fontWeight="500"
          >
            {rayState}
          </text>
        </g>
      </g>

      {/* 3D SURFACE MESH: Sorted Quads (Painter's Algorithm) */}
      <g className="shape-surface-mesh">
        {quads.map((q, idx) => {
          const polyPts = q.pts.map((p) => `${p.sx.toFixed(2)},${p.sy.toFixed(2)}`).join(' ');
          const fillAlpha = (0.05 + q.diffuse * 0.28).toFixed(3);
          const strokeAlpha = (0.12 + q.diffuse * 0.32).toFixed(3);

          return (
            <polygon
              key={`quad-${idx}`}
              points={polyPts}
              fill={`rgba(${curvColor.r}, ${curvColor.g}, ${curvColor.b}, ${fillAlpha})`}
              stroke={`rgba(${curvColor.r}, ${curvColor.g}, ${curvColor.b}, ${strokeAlpha})`}
              strokeWidth="0.18"
              strokeLinejoin="round"
            />
          );
        })}
      </g>

      {/* PRIMARY COORDINATE GRIDLINES (Geodesic Lat/Long) */}
      <g className="shape-gridlines">
        {gridH.map((pts, idx) => (
          <polyline
            key={`gh-${idx}`}
            points={pts}
            fill="none"
            stroke={`rgba(${curvColor.r}, ${curvColor.g}, ${curvColor.b}, 0.55)`}
            strokeWidth="0.32"
          />
        ))}
        {gridV.map((pts, idx) => (
          <polyline
            key={`gv-${idx}`}
            points={pts}
            fill="none"
            stroke={`rgba(${curvColor.r}, ${curvColor.g}, ${curvColor.b}, 0.55)`}
            strokeWidth="0.32"
          />
        ))}
      </g>

      {/* PARALLEL LIGHT BEAMS: Laser Rays crossing the surface */}
      <g className="shape-laser-beams" filter="url(#shape-laser-glow)">
        {/* Beam 1 */}
        <polyline
          points={beam1Points}
          fill="none"
          stroke="#FCD34D"
          strokeWidth="0.45"
          strokeDasharray="1.4 0.9"
        />
        {/* Beam 2 */}
        <polyline
          points={beam2Points}
          fill="none"
          stroke="#FCD34D"
          strokeWidth="0.45"
          strokeDasharray="1.4 0.9"
        />
      </g>

      {/* GEODESIC TRIANGLE: The definitive test of spatial curvature */}
      <g className="shape-geodesic-triangle">
        {/* Triangle illuminated fill */}
        <polygon
          points={trianglePoints}
          fill={
            isFlat
              ? 'rgba(111, 228, 177, 0.28)'
              : isSphere
              ? 'rgba(56, 189, 248, 0.28)'
              : 'rgba(168, 85, 247, 0.28)'
          }
          stroke={
            isFlat
              ? '#6FE4B1'
              : isSphere
              ? '#38BDF8'
              : '#C084FC'
          }
          strokeWidth="0.75"
          strokeLinejoin="round"
          filter="url(#shape-laser-glow)"
        />

        {/* Triangle Corner Markers (A, B, C) */}
        {triangleCorners.map((corner, i) => (
          <g key={`corner-${i}`}>
            <circle
              cx={corner.sx}
              cy={corner.sy}
              r="1.2"
              fill={curvColor.rgb}
              stroke="#FFFFFF"
              strokeWidth="0.3"
            />
            <circle
              cx={corner.sx}
              cy={corner.sy}
              r="2.2"
              fill="none"
              stroke={curvColor.rgb}
              strokeWidth="0.2"
              opacity="0.6"
            />
          </g>
        ))}

        {/* Triangle Angle Arcs */}
        <g stroke={curvColor.rgb} strokeWidth="0.3" fill="none" opacity="0.8">
          <circle cx={triangleCorners[0].sx} cy={triangleCorners[0].sy} r="3.2" strokeDasharray="1.2 1.2" />
          <circle cx={triangleCorners[1].sx} cy={triangleCorners[1].sy} r="3.2" strokeDasharray="1.2 1.2" />
          <circle cx={triangleCorners[2].sx} cy={triangleCorners[2].sy} r="3.2" strokeDasharray="1.2 1.2" />
        </g>
      </g>

      {/* BOTTOM LEGEND & 3-STATE INDICATOR */}
      <g className="shape-bottom-legend" transform="translate(0, 94)">
        {/* Connecting timeline rail */}
        <line
          x1="18"
          y1="0"
          x2="82"
          y2="0"
          stroke="var(--hair-2)"
          strokeWidth="0.4"
        />

        {/* Active slider pip tracking position */}
        <circle
          cx={18 + ((value - 0.5) / 1.0) * 64}
          cy="0"
          r="1.8"
          fill={curvColor.rgb}
          stroke="#FFFFFF"
          strokeWidth="0.4"
        />

        {/* State 1: Saddle (H3) */}
        <g
          transform="translate(18, 0)"
          textAnchor="middle"
          opacity={isSaddle ? 1.0 : 0.4}
        >
          <circle cx="0" cy="0" r="1.0" fill={isSaddle ? '#A855F7' : 'var(--ink-faint)'} />
          <text
            x="0"
            y="3.5"
            fill={isSaddle ? '#C084FC' : 'var(--ink-faint)'}
            fontSize="2.1"
            fontFamily="var(--f-mono)"
            fontWeight={isSaddle ? 'bold' : 'normal'}
          >
            Saddle (H³)
          </text>
        </g>

        {/* State 2: Flat (R3) */}
        <g
          transform="translate(50, 0)"
          textAnchor="middle"
          opacity={isFlat ? 1.0 : 0.4}
        >
          <circle cx="0" cy="0" r="1.0" fill={isFlat ? '#6FE4B1' : 'var(--ink-faint)'} />
          <text
            x="0"
            y="3.5"
            fill={isFlat ? '#6FE4B1' : 'var(--ink-faint)'}
            fontSize="2.1"
            fontFamily="var(--f-mono)"
            fontWeight={isFlat ? 'bold' : 'normal'}
          >
            Flat (ℝ³) · Ω=1
          </text>
        </g>

        {/* State 3: Sphere (S3) */}
        <g
          transform="translate(82, 0)"
          textAnchor="middle"
          opacity={isSphere ? 1.0 : 0.4}
        >
          <circle cx="0" cy="0" r="1.0" fill={isSphere ? '#38BDF8' : 'var(--ink-faint)'} />
          <text
            x="0"
            y="3.5"
            fill={isSphere ? '#38BDF8' : 'var(--ink-faint)'}
            fontSize="2.1"
            fontFamily="var(--f-mono)"
            fontWeight={isSphere ? 'bold' : 'normal'}
          >
            Sphere (S³)
          </text>
        </g>
      </g>
    </svg>
  );
}
