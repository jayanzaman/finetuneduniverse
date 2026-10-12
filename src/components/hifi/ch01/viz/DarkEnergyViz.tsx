'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

export type DarkEnergyVizProps = {
  value?: number;
  className?: string;
  minimal?: boolean;
};

// -------------------------------------------------------------
// DETERMINISTIC PARTICLES & VACUUM GRID DEFINITIONS
// -------------------------------------------------------------
interface MatterParticle {
  x0: number;
  y0: number;
  z0: number;
  cluster: number;
  baseSize: number;
  color: string;
}

// 48 deterministic matter particles distributed in 3 galaxy clusters
function generateMatterParticles(): MatterParticle[] {
  let s = 137;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const clusterCenters = [
    { x: -0.28, y: -0.15, z: 0.12 },
    { x: 0.26, y: 0.22, z: -0.15 },
    { x: 0.05, y: -0.28, z: -0.22 },
  ];

  const particles: MatterParticle[] = [];
  for (let i = 0; i < 48; i++) {
    const cIdx = i % clusterCenters.length;
    const center = clusterCenters[cIdx];
    // Cluster distribution with random gaussian-like scatter
    const u = rand();
    const v = rand();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const spread = 0.14 + rand() * 0.18;

    particles.push({
      x0: center.x + Math.sin(phi) * Math.cos(theta) * spread,
      y0: center.y + Math.sin(phi) * Math.sin(theta) * spread,
      z0: center.z + Math.cos(phi) * spread,
      cluster: cIdx,
      baseSize: 1.8 + rand() * 2.2,
      color: i % 4 === 0 ? '#FFFFFF' : i % 2 === 0 ? '#FDE047' : '#F59E0B',
    });
  }
  return particles;
}

const MATTER_PARTICLES = generateMatterParticles();

// Deterministic quantum vacuum nodes for the Dark Energy matrix
interface VacuumNode {
  x: number;
  y: number;
  z: number;
  phase: number;
}

function generateVacuumGrid(gridSteps = 4): VacuumNode[] {
  const nodes: VacuumNode[] = [];
  const span = 0.84;
  const step = (span * 2) / (gridSteps - 1);

  for (let ix = 0; ix < gridSteps; ix++) {
    for (let iy = 0; iy < gridSteps; iy++) {
      for (let iz = 0; iz < gridSteps; iz++) {
        const x = -span + ix * step;
        const y = -span + iy * step;
        const z = -span + iz * step;
        nodes.push({
          x,
          y,
          z,
          phase: (ix * 1.7 + iy * 2.3 + iz * 3.1) % (Math.PI * 2),
        });
      }
    }
  }
  return nodes;
}

const VACUUM_NODES = generateVacuumGrid(4);

// Preset epochs for quick jumping
export interface EpochPreset {
  id: string;
  label: string;
  shortLabel: string;
  a: number;
  timeLabel: string;
  description: string;
}

export const EPOCH_PRESETS: EpochPreset[] = [
  {
    id: 'early',
    label: '1. Early Universe (z ≈ 1.5)',
    shortLabel: 'Early (a=0.4)',
    a: 0.4,
    timeLabel: '4.5 Gyr after Big Bang',
    description: 'Matter is dense and dominant (93%). Dark energy is negligible. Gravity forms the first galaxies.',
  },
  {
    id: 'crossover',
    label: '2. The 50/50 Crossover Era',
    shortLabel: 'Crossover (a=0.77)',
    a: 0.77,
    timeLabel: '9.8 Gyr after Big Bang',
    description: 'Matter dilutes down until its density exactly equals dark energy. Cosmic acceleration begins.',
  },
  {
    id: 'today',
    label: '3. Present Day (Our Era)',
    shortLabel: 'Today (a=1.0)',
    a: 1.0,
    timeLabel: '13.8 Gyr (Now)',
    description: 'Dark energy is roughly 70% of the entire cosmic energy budget. Matter makes up the remaining 30%.',
  },
  {
    id: 'future',
    label: '4. Deep Future (Dark Era)',
    shortLabel: 'Future (a=1.8)',
    a: 1.8,
    timeLabel: '+25 Gyr into future',
    description: 'Matter thins to near zero. Dark energy makes up over 93% of all energy. The cosmic web freezes.',
  },
];

export function DarkEnergyViz({
  value = 1.0,
  className = '',
  minimal = false,
}: DarkEnergyVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active View Mode: 'cube' (3D Spacetime Volume) vs 'curves' (Density Curves Plot)
  const [viewMode, setViewMode] = useState<'cube' | 'curves'>('cube');
  const [scaleFactor, setScaleFactor] = useState<number>(1.0); // Cosmic scale factor a in [0.35, 2.0]
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Animation & simulation refs
  const animFrameRef = useRef<number | null>(null);
  const valueRef = useRef<number>(value);
  const scaleFactorRef = useRef<number>(1.0);
  const isPlayingRef = useRef<boolean>(true);
  const minimalRef = useRef<boolean>(minimal);
  const viewModeRef = useRef<'cube' | 'curves'>('cube');
  const lastTimeRef = useRef<number>(0);

  // 3D Camera rotation
  const yawRef = useRef<number>(0.45);
  const pitchRef = useRef<number>(0.28);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({
    x: 0,
    y: 0,
    yaw: 0.45,
    pitch: 0.28,
  });

  // Keep refs synchronized
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    scaleFactorRef.current = scaleFactor;
  }, [scaleFactor]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    minimalRef.current = minimal;
  }, [minimal]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  // Derived Cosmological Energy Densities based on LambdaCDM
  // Omega_m0 ≈ 0.317 (Dark Matter ≈ 0.268, Baryons ≈ 0.049)
  // Omega_Lambda0 ≈ 0.683 * value
  const energyBudget = useMemo(() => {
    const a = Math.max(0.1, scaleFactor);
    const lambdaParam = Math.max(0, value);

    // Matter dilutes as a^-3
    const rhoMatter = 0.317 * Math.pow(a, -3);
    const rhoDarkMatter = 0.268 * Math.pow(a, -3);
    const rhoBaryons = 0.049 * Math.pow(a, -3);

    // Dark energy density is CONSTANT across all a (does not dilute)
    const rhoDarkEnergy = 0.683 * lambdaParam;

    const rhoTotal = rhoMatter + rhoDarkEnergy;

    const dePercent = rhoTotal > 0 ? (rhoDarkEnergy / rhoTotal) * 100 : 0;
    const dmPercent = rhoTotal > 0 ? (rhoDarkMatter / rhoTotal) * 100 : 0;
    const bPercent = rhoTotal > 0 ? (rhoBaryons / rhoTotal) * 100 : 0;

    return {
      a,
      lambdaParam,
      rhoMatter,
      rhoDarkEnergy,
      rhoTotal,
      dePercent: Math.min(100, Math.max(0, dePercent)),
      dmPercent: Math.min(100, Math.max(0, dmPercent)),
      bPercent: Math.min(100, Math.max(0, bPercent)),
    };
  }, [scaleFactor, value]);

  // Main Canvas 3D Rendering & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        setIsCompact(height < 240 || width < 340);
      }
    });

    resizeObserver.observe(container);

    const rect = container.getBoundingClientRect();
    width = rect.width || 400;
    height = rect.height || 400;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    setIsCompact(height < 240 || width < 340);

    lastTimeRef.current = performance.now();

    // 3D Perspective Projection Function
    function project3D(
      x: number,
      y: number,
      z: number,
      yaw: number,
      pitch: number,
      cx: number,
      cy: number,
      scale: number,
      camDist = 3.4
    ) {
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      const depthFactor = camDist / Math.max(0.2, camDist + z2);
      const sx = cx + x1 * depthFactor * scale;
      const sy = cy - y2 * depthFactor * scale;

      return {
        sx,
        sy,
        zDepth: z2,
        depthFactor,
      };
    }

    const render = (now: number) => {
      const dt = Math.min(0.06, (now - lastTimeRef.current) * 0.001);
      lastTimeRef.current = now;

      // Auto-expand scale factor if playing in cube mode
      if (isPlayingRef.current && viewModeRef.current === 'cube') {
        const expandSpeed = 0.065;
        let nextA = scaleFactorRef.current + dt * expandSpeed;
        if (nextA > 1.85) {
          nextA = 0.38; // Loop back smoothly to early cosmos
        }
        scaleFactorRef.current = nextA;
        setScaleFactor(nextA);
      }

      if (!isDraggingRef.current) {
        yawRef.current += 0.003;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const mode = viewModeRef.current;
      const isMin = minimalRef.current;
      const curA = scaleFactorRef.current;
      const curLambda = valueRef.current;

      // ==============================================================
      // MODE 1: 3D COSMIC VOLUME CUBE (NON-DILUTION OF VACUUM)
      // ==============================================================
      if (mode === 'cube') {
        const scale = Math.min(width, height) * (isMin ? 0.48 : 0.42);
        const yaw = yawRef.current;
        const pitch = pitchRef.current;

        // Cube physical boundary scale in perspective space
        // Visual cube size reflects the expanding volume: boxSpan scales from 0.72 to 1.15
        const boxSpan = 0.7 + (curA - 0.35) * 0.32;

        ctx.save();

        // 1. Draw 3D Bounding Cube (Expanding Co-moving Volume)
        const corners = [
          [-boxSpan, -boxSpan, -boxSpan],
          [boxSpan, -boxSpan, -boxSpan],
          [boxSpan, boxSpan, -boxSpan],
          [-boxSpan, boxSpan, -boxSpan],
          [-boxSpan, -boxSpan, boxSpan],
          [boxSpan, -boxSpan, boxSpan],
          [boxSpan, boxSpan, boxSpan],
          [-boxSpan, boxSpan, boxSpan],
        ];

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0], // Back square
          [4, 5], [5, 6], [6, 7], [7, 4], // Front square
          [0, 4], [1, 5], [2, 6], [3, 7], // Connectors
        ];

        const projCorners = corners.map(([x, y, z]) =>
          project3D(x, y, z, yaw, pitch, cx, cy, scale)
        );

        // Draw cube edges with depth cueing
        for (const [i1, i2] of edges) {
          const p1 = projCorners[i1];
          const p2 = projCorners[i2];
          const avgDepth = (p1.zDepth + p2.zDepth) / 2;
          const isFront = avgDepth > 0;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);

          if (isFront) {
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
            ctx.lineWidth = 1.2;
          } else {
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 0.7;
          }
          ctx.stroke();
        }

        ctx.setLineDash([]);

        // 2. Draw Dark Energy Vacuum Matrix (Energy Density of Space Itself)
        // Notice: Vacuum nodes remain in fixed lattice positions with constant brightness.
        // It does NOT dilute when volume expands!
        const vacuumGlow = Math.max(0.2, Math.min(1.4, curLambda));

        for (const vNode of VACUUM_NODES) {
          // Vacuum nodes fill the current expanded box bounds uniformly
          const vx = vNode.x * (boxSpan / 0.84);
          const vy = vNode.y * (boxSpan / 0.84);
          const vz = vNode.z * (boxSpan / 0.84);

          const proj = project3D(vx, vy, vz, yaw, pitch, cx, cy, scale);

          // Zero-point harmonic oscillation
          const osc = Math.sin(now * 0.003 + vNode.phase) * 0.5 + 0.5;
          const nodeAlpha = (0.2 + osc * 0.35) * vacuumGlow;
          const nodeSize = (1.4 + osc * 1.0) * proj.depthFactor;

          ctx.beginPath();
          ctx.arc(proj.sx, proj.sy, nodeSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 85, 247, ${nodeAlpha})`;
          ctx.fill();

          // Subtle corona glow for vacuum nodes
          if (osc > 0.6 && vacuumGlow > 0.4) {
            const glowR = nodeSize * 2.8;
            const gGrad = ctx.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, glowR);
            gGrad.addColorStop(0, `rgba(111, 228, 177, ${nodeAlpha * 0.6})`);
            gGrad.addColorStop(1, 'rgba(111, 228, 177, 0)');
            ctx.beginPath();
            ctx.arc(proj.sx, proj.sy, glowR, 0, Math.PI * 2);
            ctx.fillStyle = gGrad;
            ctx.fill();
          }
        }

        // 3. Draw Cosmic Web Filaments (Thinning with expansion)
        // Filament opacity drops by a^-2
        const filamentAlpha = Math.max(0.04, Math.min(0.55, 0.45 * Math.pow(curA, -1.8)));
        ctx.strokeStyle = `rgba(253, 224, 71, ${filamentAlpha})`;
        ctx.lineWidth = 0.8;

        for (let i = 0; i < MATTER_PARTICLES.length; i += 3) {
          const nextIdx = (i + 2) % MATTER_PARTICLES.length;
          const p1 = MATTER_PARTICLES[i];
          const p2 = MATTER_PARTICLES[nextIdx];

          const p1X = p1.x0 * curA;
          const p1Y = p1.y0 * curA;
          const p1Z = p1.z0 * curA;

          const p2X = p2.x0 * curA;
          const p2Y = p2.y0 * curA;
          const p2Z = p2.z0 * curA;

          const proj1 = project3D(p1X, p1Y, p1Z, yaw, pitch, cx, cy, scale);
          const proj2 = project3D(p2X, p2Y, p2Z, yaw, pitch, cx, cy, scale);

          ctx.beginPath();
          ctx.moveTo(proj1.sx, proj1.sy);
          ctx.lineTo(proj2.sx, proj2.sy);
          ctx.stroke();
        }

        // 4. Draw Matter Particles (Galaxies & Stars)
        // Position scales with a; density per unit volume drops by a^-3
        for (const p of MATTER_PARTICLES) {
          const mx = p.x0 * curA;
          const my = p.y0 * curA;
          const mz = p.z0 * curA;

          const proj = project3D(mx, my, mz, yaw, pitch, cx, cy, scale);
          const ptR = p.baseSize * proj.depthFactor;

          // Golden galaxy corona
          const pGrad = ctx.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, ptR * 3);
          pGrad.addColorStop(0, '#FFFFFF');
          pGrad.addColorStop(0.35, p.color);
          pGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');

          ctx.beginPath();
          ctx.arc(proj.sx, proj.sy, ptR * 3, 0, Math.PI * 2);
          ctx.fillStyle = pGrad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(proj.sx, proj.sy, ptR, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        ctx.restore();
      }

      // ==============================================================
      // MODE 2: DILUTION CURVES PLOT rho(a)
      // ==============================================================
      else {
        ctx.save();

        const compact = height < 240 || width < 340;
        const padLeft = compact ? 36 : 56;
        const padRight = compact ? 20 : 36;
        const padTop = compact ? 54 : 76;
        const padBottom = compact ? 46 : 60;

        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        // Background plot grid
        ctx.fillStyle = 'rgba(10, 12, 28, 0.55)';
        ctx.fillRect(padLeft, padTop, plotW, plotH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(padLeft, padTop, plotW, plotH);

        // Horizontal gridlines (Energy density)
        for (let g = 0; g <= 4; g++) {
          const gy = padTop + (g / 4) * plotH;
          ctx.beginPath();
          ctx.moveTo(padLeft, gy);
          ctx.lineTo(padLeft + plotW, gy);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.stroke();
        }

        // Conversion helper from (a, rho) to screen pixels
        // a ranges [0.2 .. 2.2], rho normalized [0 .. 3.5]
        const aToX = (a: number) => padLeft + ((a - 0.2) / 2.0) * plotW;
        const rhoToY = (r: number) => padTop + plotH - (Math.min(3.5, Math.max(0, r)) / 3.5) * plotH;

        // Curve 1: Matter Density rho_m = 0.317 * a^-3
        ctx.beginPath();
        for (let step = 0; step <= 60; step++) {
          const a = 0.2 + (step / 60) * 2.0;
          const rhoM = 0.317 * Math.pow(a, -3);
          const sx = aToX(a);
          const sy = rhoToY(rhoM);
          if (step === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Curve 2: Radiation Density rho_r = 0.04 * a^-4
        ctx.beginPath();
        for (let step = 0; step <= 60; step++) {
          const a = 0.2 + (step / 60) * 2.0;
          const rhoR = 0.05 * Math.pow(a, -4);
          const sx = aToX(a);
          const sy = rhoToY(rhoR);
          if (step === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.setLineDash([]);

        // Curve 3: Dark Energy Density rho_Lambda = 0.683 * value (CONSTANT HORIZONTAL LINE!)
        const rhoDE = 0.683 * curLambda;
        const deY = rhoToY(rhoDE);

        ctx.beginPath();
        ctx.moveTo(padLeft, deY);
        ctx.lineTo(padLeft + plotW, deY);
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // Shimmering horizontal glow for Dark Energy
        ctx.beginPath();
        ctx.moveTo(padLeft, deY);
        ctx.lineTo(padLeft + plotW, deY);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Vertical Indicator: Today (a = 1.0)
        const todayX = aToX(1.0);
        ctx.beginPath();
        ctx.moveTo(todayX, padTop);
        ctx.lineTo(todayX, padTop + plotH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Highlight Crossover Intersection point: rho_m = rho_DE => a = (0.317 / rhoDE)^(1/3)
        if (rhoDE > 0) {
          const crossA = Math.cbrt(0.317 / rhoDE);
          if (crossA >= 0.2 && crossA <= 2.2) {
            const crossX = aToX(crossA);
            const crossY = rhoToY(rhoDE);

            ctx.beginPath();
            ctx.arc(crossX, crossY, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#6FE4B1';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // Active scrubber cursor line
        const activeX = aToX(curA);
        ctx.beginPath();
        ctx.moveTo(activeX, padTop);
        ctx.lineTo(activeX, padTop + plotH);
        ctx.strokeStyle = '#6FE4B1';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Pointer drag event handlers for 3D Camera Orbit
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: yawRef.current,
      pitch: pitchRef.current,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    yawRef.current = dragStartRef.current.yaw + dx * 0.008;
    pitchRef.current = Math.max(-1.1, Math.min(1.1, dragStartRef.current.pitch + dy * 0.008));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore release pointer errors
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const resetToToday = useCallback(() => {
    setScaleFactor(1.0);
    setIsPlaying(false);
  }, []);

  // Theme evaluation
  const isGoldilocks = value >= 0.8 && value <= 1.2;
  const isSubCritical = value < 0.8;

  const statusTheme = useMemo(() => {
    if (isGoldilocks) {
      return {
        badge: '70% DARK ENERGY · GOLDILOCKS VACUUM BUDGET',
        color: '#6FE4B1',
        title: 'The Non-Diluting Vacuum (ρ_Λ = const)',
        subhead: 'As the universe expands, matter thins out as 1/V. But space brings its own energy, reaching ~70% today.',
      };
    }
    if (isSubCritical) {
      return {
        badge: 'SUB-CRITICAL Λ · MATTER REMAINS DOMINANT',
        color: '#FBBF24',
        title: 'Insufficient Vacuum Energy (Low Λ)',
        subhead: 'Dark energy is too weak to reach 70% of the cosmic recipe. Matter dominance slows expansion toward collapse.',
      };
    }
    return {
      badge: 'SUPER-CRITICAL Λ · RUNAWAY VACUUM DOMINANCE',
      color: '#EC4899',
      title: 'Premature Dark Energy Domination (High Λ)',
      subhead: 'Dark energy crossed 70% billions of years too early, preventing galaxies from condensing before being pushed apart.',
    };
  }, [isGoldilocks, isSubCritical]);

  return (
    <div
      ref={containerRef}
      className={`dark-energy-viz-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: minimal
          ? 'transparent'
          : 'radial-gradient(circle at center, rgba(14, 18, 36, 0.75) 0%, rgba(3, 4, 12, 0.96) 100%)',
        borderRadius: minimal ? 0 : 10,
        border: 'none',
        boxShadow: 'none',
        userSelect: 'none',
      }}
      aria-label={`Dark Energy Non-Dilution Simulation: ${statusTheme.title}. ${statusTheme.subhead}`}
    >
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: viewMode === 'cube' ? 'grab' : 'crosshair',
          touchAction: 'none',
        }}
      />

      {/* TOP VIEW MODE SWITCHER TABS */}
      {!minimal && !isCompact && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(10, 12, 28, 0.85)',
            border: '1px solid var(--hair-2)',
            borderRadius: 999,
            padding: 3,
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('cube')}
            style={{
              background: viewMode === 'cube' ? 'rgba(111, 228, 177, 0.18)' : 'transparent',
              border: viewMode === 'cube' ? '1px solid #6FE4B1' : '1px solid transparent',
              color: viewMode === 'cube' ? '#6FE4B1' : 'var(--ink-soft)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              fontWeight: viewMode === 'cube' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ⧖ Cosmic Volume (3D Space)
          </button>

          <button
            type="button"
            onClick={() => setViewMode('curves')}
            style={{
              background: viewMode === 'curves' ? 'rgba(168, 85, 247, 0.22)' : 'transparent',
              border: viewMode === 'curves' ? '1px solid #A855F7' : '1px solid transparent',
              color: viewMode === 'curves' ? '#C084FC' : 'var(--ink-soft)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              fontWeight: viewMode === 'curves' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ∿ Dilution Curves ρ(a)
          </button>
        </div>
      )}

      {/* TOP HUD: DYNAMIC COSMIC BUDGET & TELEMETRY */}
      {!minimal && (
        <div
          style={{
            position: 'absolute',
            top: isCompact ? 0 : 38,
            left: 0,
            right: 0,
            padding: isCompact ? '8px 12px' : '10px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div style={{ maxWidth: isCompact ? '65%' : '60%' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: isCompact ? 9 : 10.5,
                fontFamily: 'var(--f-mono)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: statusTheme.color,
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: statusTheme.color,
                  boxShadow: `0 0 8px ${statusTheme.color}`,
                }}
              />
              {statusTheme.badge}
            </div>

            {!isCompact && (
              <>
                <div
                  style={{
                    fontSize: 15,
                    fontFamily: 'var(--f-serif)',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    letterSpacing: '0.01em',
                    lineHeight: 1.25,
                  }}
                >
                  {statusTheme.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--f-body)',
                    color: 'var(--ink-soft)',
                    marginTop: 3,
                    lineHeight: 1.35,
                  }}
                >
                  {statusTheme.subhead}
                </div>
              </>
            )}
          </div>

          <div
            style={{
              textAlign: 'right',
              fontFamily: 'var(--f-mono)',
              fontSize: isCompact ? 10 : 11,
              color: 'var(--ink-soft)',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontSize: isCompact ? 13 : 15, fontWeight: 700, color: statusTheme.color }}>
              {value.toFixed(2)} Λ
            </div>

            {/* Live Segmented Energy Budget Bar */}
            <div style={{ marginTop: 4, width: 140 }}>
              <div
                style={{
                  height: 6,
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <div
                  title={`Dark Energy: ${energyBudget.dePercent.toFixed(1)}%`}
                  style={{
                    width: `${energyBudget.dePercent}%`,
                    background: '#A855F7',
                    boxShadow: '0 0 6px #A855F7',
                  }}
                />
                <div
                  title={`Dark Matter: ${energyBudget.dmPercent.toFixed(1)}%`}
                  style={{
                    width: `${energyBudget.dmPercent}%`,
                    background: '#F59E0B',
                  }}
                />
                <div
                  title={`Atoms: ${energyBudget.bPercent.toFixed(1)}%`}
                  style={{
                    width: `${energyBudget.bPercent}%`,
                    background: '#34D399',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 8.5,
                  fontFamily: 'var(--f-mono)',
                  color: 'var(--ink-faint)',
                  marginTop: 2,
                }}
              >
                <span style={{ color: '#C084FC' }}>Λ: {energyBudget.dePercent.toFixed(0)}%</span>
                <span style={{ color: '#FCD34D' }}>DM: {energyBudget.dmPercent.toFixed(0)}%</span>
                <span style={{ color: '#6EE7B7' }}>Atoms: {energyBudget.bPercent.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DENSITY GAUGES ON LEFT SIDE */}
      {!minimal && !isCompact && viewMode === 'cube' && (
        <div
          style={{
            position: 'absolute',
            left: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div
            style={{
              background: 'rgba(10, 12, 28, 0.75)',
              border: '1px solid var(--hair-2)',
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            <div style={{ fontSize: 9.5, fontFamily: 'var(--f-mono)', color: '#FBBF24', fontWeight: 600 }}>
              MATTER DENSITY (ρ_m ∝ a⁻³)
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: '#FFFFFF', marginTop: 2 }}>
              {(1.0 / Math.pow(scaleFactor, 3)).toFixed(2)}× <span style={{ fontSize: 9, color: 'var(--ink-faint)' }}>relative</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--ink-faint)', marginTop: 1 }}>
              Dilutes with volume
            </div>
          </div>

          <div
            style={{
              background: 'rgba(10, 12, 28, 0.75)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            <div style={{ fontSize: 9.5, fontFamily: 'var(--f-mono)', color: '#C084FC', fontWeight: 600 }}>
              DARK ENERGY DENSITY (ρ_Λ)
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: '#FFFFFF', marginTop: 2 }}>
              {value.toFixed(2)}× <span style={{ fontSize: 9, color: 'var(--ink-faint)' }}>CONSTANT</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--ink-faint)', marginTop: 1 }}>
              Does NOT dilute
            </div>
          </div>
        </div>
      )}

      {/* CURVE LEGEND (When in Curves View Mode) */}
      {!minimal && !isCompact && viewMode === 'curves' && (
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: 60,
            display: 'flex',
            gap: 16,
            pointerEvents: 'none',
            zIndex: 2,
            fontFamily: 'var(--f-mono)',
            fontSize: 9.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 2.5, background: '#A855F7' }} />
            <span style={{ color: '#C084FC', fontWeight: 600 }}>Dark Energy (Constant)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 2, background: '#FBBF24' }} />
            <span style={{ color: '#FCD34D' }}>Matter (Dilutes a⁻³)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 1.5, background: '#38BDF8', borderTop: '1px dashed #38BDF8' }} />
            <span style={{ color: '#7DD3FC' }}>Radiation (a⁻⁴)</span>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS & COSMIC EPOCHS BAR */}
      {!minimal && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            right: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 3,
          }}
        >
          {/* Timeline / Epoch Quick Selectors */}
          <div style={{ display: 'flex', gap: 5 }}>
            {EPOCH_PRESETS.map((preset) => {
              const isSelected = Math.abs(scaleFactor - preset.a) < 0.08;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setScaleFactor(preset.a);
                    setIsPlaying(false);
                  }}
                  style={{
                    flex: 1,
                    background: isSelected ? 'rgba(111, 228, 177, 0.18)' : 'rgba(10, 12, 28, 0.75)',
                    border: isSelected ? '1.5px solid #6FE4B1' : '1px solid var(--hair-2)',
                    borderRadius: 6,
                    padding: '5px 4px',
                    color: isSelected ? '#FFFFFF' : 'var(--ink-soft)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 8.5, fontFamily: 'var(--f-mono)', color: isSelected ? '#6FE4B1' : 'var(--ink-faint)', fontWeight: 600 }}>
                    {preset.shortLabel}
                  </span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--f-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {preset.id === 'early' ? 'Early' : preset.id === 'crossover' ? 'Crossover' : preset.id === 'today' ? 'Today (70%)' : 'Future'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrubber and Play/Pause Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(10, 12, 28, 0.85)',
              border: '1px solid var(--hair-2)',
              borderRadius: 8,
              padding: '5px 10px',
            }}
          >
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause cosmic expansion' : 'Play cosmic expansion'}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6FE4B1',
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 4px',
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <span style={{ width: 1, height: 12, background: 'var(--hair-2)' }} />

            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
              Scale Factor a: <strong style={{ color: '#FFFFFF' }}>{scaleFactor.toFixed(2)}</strong>
            </span>

            {/* Interactive Scale Factor Scrubber Slider */}
            <input
              type="range"
              min={0.35}
              max={1.85}
              step={0.01}
              value={scaleFactor}
              onChange={(e) => {
                setScaleFactor(parseFloat(e.target.value));
                setIsPlaying(false);
              }}
              aria-label="Cosmic scale factor scrubber"
              style={{
                flex: 1,
                accentColor: '#6FE4B1',
                cursor: 'ew-resize',
                height: 4,
              }}
            />

            <button
              type="button"
              onClick={resetToToday}
              title="Reset scale factor to today (a = 1.0)"
              style={{
                background: 'transparent',
                border: '1px solid var(--hair-2)',
                borderRadius: 4,
                color: 'var(--ink-soft)',
                fontFamily: 'var(--f-mono)',
                fontSize: 9.5,
                padding: '2px 6px',
                cursor: 'pointer',
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
