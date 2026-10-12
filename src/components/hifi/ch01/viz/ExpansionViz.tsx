'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

export type ExpansionVizProps = {
  value?: number;
  direction?: 'in' | 'out';
  className?: string;
};

// Deterministic Pseudo-Random Generator (LCG)
let seed = 1337;
function lcgRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// 4 Gravitational cluster attractors for the Big Crunch clumping regime
const CLUSTER_ATTRACTORS = [
  { x: 0.0, y: 0.0, z: 0.0, name: 'Core Singularity' },
  { x: -0.38, y: 0.22, z: -0.18, name: 'Cluster Alpha' },
  { x: 0.35, y: -0.22, z: 0.22, name: 'Cluster Beta' },
  { x: 0.18, y: 0.36, z: -0.25, name: 'Cluster Gamma' },
];

// Pre-generate 52 deterministic particles distributed uniformly inside unit sphere
interface ParticleSeed {
  x0: number;
  y0: number;
  z0: number;
  r0: number;
  clusterId: number;
  baseSize: number;
  colorType: 'cyan' | 'mint' | 'gold' | 'white';
}

function generateDeterministicParticles(): ParticleSeed[] {
  seed = 42; // Fixed seed for reproducible universe
  const list: ParticleSeed[] = [];
  const colorTypes: Array<'cyan' | 'mint' | 'gold' | 'white'> = ['cyan', 'mint', 'gold', 'white'];

  for (let i = 0; i < 52; i++) {
    const u = lcgRandom();
    const v = lcgRandom();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    // Radial distribution within r <= 0.82 so particles are safely inside the sphere
    const r = Math.cbrt(lcgRandom()) * 0.82;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    // Assign to closest cluster center
    let closestCluster = 0;
    let minDist = Infinity;
    for (let c = 0; c < CLUSTER_ATTRACTORS.length; c++) {
      const dx = x - CLUSTER_ATTRACTORS[c].x;
      const dy = y - CLUSTER_ATTRACTORS[c].y;
      const dz = z - CLUSTER_ATTRACTORS[c].z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < minDist) {
        minDist = dist;
        closestCluster = c;
      }
    }

    list.push({
      x0: x,
      y0: y,
      z0: z,
      r0: r,
      clusterId: closestCluster,
      baseSize: 1.8 + lcgRandom() * 1.6,
      colorType: colorTypes[i % colorTypes.length],
    });
  }
  return list;
}

const STATIC_PARTICLES = generateDeterministicParticles();

// Pre-calculate filament connections between nearby particles in each cluster
interface FilamentConnection {
  p1: number;
  p2: number;
  clusterId: number;
}

function generateFilaments(particles: ParticleSeed[]): FilamentConnection[] {
  const filaments: FilamentConnection[] = [];
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      if (particles[i].clusterId === particles[j].clusterId) {
        const dx = particles[i].x0 - particles[j].x0;
        const dy = particles[i].y0 - particles[j].y0;
        const dz = particles[i].z0 - particles[j].z0;
        if (Math.hypot(dx, dy, dz) < 0.38) {
          filaments.push({ p1: i, p2: j, clusterId: particles[i].clusterId });
        }
      }
    }
  }
  return filaments;
}

const STATIC_FILAMENTS = generateFilaments(STATIC_PARTICLES);

export function ExpansionViz({
  value = 0.7,
  className = '',
}: ExpansionVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation & simulation state refs (no react re-render churn during 60fps loop)
  const animFrameRef = useRef<number | null>(null);
  const valueRef = useRef<number>(value);
  const isPlayingRef = useRef<boolean>(true);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const manualTimeOffsetRef = useRef<number>(0);

  // 3D Camera rotation state (allows interactive drag to rotate)
  const yawRef = useRef<number>(0.4);
  const pitchRef = useRef<number>(0.32);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({
    x: 0,
    y: 0,
    yaw: 0.4,
    pitch: 0.32,
  });

  // UI state for reactive HUD badges
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<{
    escapedCount: number;
    speedRatio: number;
    statusText: string;
  }>({
    escapedCount: 0,
    speedRatio: 1.0,
    statusText: 'In Sync',
  });

  // Keep value ref synchronized with incoming prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Keep playing ref synchronized
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Regimes analysis based on real-world Goldilocks slider values [0.1 .. 2.0]
  const isCrunch = value < 0.5;
  const isGoldilocks = value >= 0.5 && value <= 0.9;
  const isRunaway = value > 0.9;

  // Runaway factor [0 .. 1]
  const runawayIntensity = Math.max(0, Math.min(1, (value - 0.9) / 1.1));

  // Dynamic Theme Colors
  const theme = useMemo(() => {
    if (isCrunch) {
      return {
        badge: 'GRAVITATIONAL CLUMPING · SLOW / BIG CRUNCH',
        badgeColor: '#F87171',
        title: 'Matter Clumping (Gravity Overcomes Expansion)',
        subhead: 'Expansion rate is too low. Gravity pulls galaxies into dense gravitational knots.',
        rimColor: 'rgba(248, 113, 113, 0.55)',
        haloGlow: 'rgba(239, 68, 68, 0.35)',
        bgInner: 'rgba(40, 15, 25, 0.45)',
        dotAccent: '#FCA5A5',
        speedTag: '< 0.35× (Collapse)',
      };
    }
    if (isRunaway) {
      return {
        badge: 'RUNAWAY EXPANSION · TEARS APART',
        badgeColor: '#F43F5E',
        title: 'The Big Rip (Matter Outpaces Space)',
        subhead: 'Expansion accelerates wildly. Matter exceeds cosmic horizon speed and escapes the frame.',
        rimColor: 'rgba(244, 63, 94, 0.65)',
        haloGlow: 'rgba(244, 63, 94, 0.45)',
        bgInner: 'rgba(38, 14, 52, 0.45)',
        dotAccent: '#FDA4AF',
        speedTag: `${(1 + runawayIntensity * 3.5).toFixed(1)}× (Escaping)`,
      };
    }
    return {
      badge: 'STABLE EXPANSION · GOLDILOCKS BAND',
      badgeColor: '#6FE4B1',
      title: 'Uniform Hubble Flow (v = H₀ · d)',
      subhead: 'Space expands steadily. Galaxies drift apart while remaining bound inside the cosmic volume.',
      rimColor: 'rgba(111, 228, 177, 0.55)',
      haloGlow: 'rgba(111, 228, 177, 0.32)',
      bgInner: 'rgba(12, 24, 42, 0.45)',
      dotAccent: '#6FE4B1',
      speedTag: '1.00× (In Sync)',
    };
  }, [isCrunch, isRunaway, runawayIntensity]);

  // Main Canvas 3D Rendering & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Safe fallback for non-canvas or JSDOM environments

    // Handle high-DPI (Retina) scaling and responsive resizing
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w <= 0 || h <= 0) continue;
        width = w;
        height = h;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        setIsCompact(height < 210 || width < 320);
      }
    });

    resizeObserver.observe(container);

    // Initial sizing
    const rect = container.getBoundingClientRect();
    width = rect.width || 400;
    height = rect.height || 400;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    setIsCompact(height < 210 || width < 320);

    // Cycle duration in seconds
    const CYCLE_DURATION = 5.6;
    startTimeRef.current = performance.now();

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
      // Rotation around Y (yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotation around X (pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      // Perspective scale factor
      const depthFactor = camDist / Math.max(0.2, camDist + z2);
      const sx = cx + x1 * depthFactor * scale;
      const sy = cy + y2 * depthFactor * scale;

      return {
        sx,
        sy,
        zDepth: z2,
        depthFactor,
        x1,
        y2,
      };
    }

    let lastTelemetryUpdate = 0;

    // Render loop
    const render = (now: number) => {
      // Calculate simulation time & cycle progress tau in [0, 1]
      if (isPlayingRef.current) {
        pausedTimeRef.current = now;
      }
      const effectiveTime = (pausedTimeRef.current - startTimeRef.current) * 0.001 + manualTimeOffsetRef.current;
      const cycleProgress = (effectiveTime % CYCLE_DURATION + CYCLE_DURATION) % CYCLE_DURATION / CYCLE_DURATION;

      // Subtle auto-rotation when user is not actively dragging
      if (!isDraggingRef.current) {
        yawRef.current += 0.0035;
      }

      const curVal = valueRef.current;
      const curClump = Math.max(0, Math.min(1, (0.5 - curVal) / 0.4));
      const curRunaway = Math.max(0, Math.min(1, (curVal - 0.9) / 1.1));

      // Reset canvas context
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.38;

      // Smooth cycle fade in / fade out at boundary transitions
      let cycleAlpha = 1.0;
      if (cycleProgress < 0.06) {
        cycleAlpha = cycleProgress / 0.06;
      } else if (cycleProgress > 0.92) {
        cycleAlpha = (1.0 - cycleProgress) / 0.08;
      }

      // Ball Radius R_ball(tau) based on regime
      let rBallNormalized: number;
      if (curClump > 0) {
        // Slow / Big Crunch: initial brief expansion, then gravity stops it and it collapses
        const expandPhase = Math.sin(cycleProgress * Math.PI);
        const normExp = 0.35 + 0.65 * Math.sin((cycleProgress * Math.PI) / 2);
        const crunchExp = 0.32 + 0.22 * expandPhase - 0.24 * cycleProgress;
        rBallNormalized = (1 - curClump) * normExp + curClump * Math.max(0.12, crunchExp);
      } else if (curRunaway > 0) {
        // Runaway: ball expands fast
        rBallNormalized = 0.35 + 0.65 * Math.pow(cycleProgress, 0.72);
      } else {
        // Default Goldilocks: smooth steady cosmological expansion
        rBallNormalized = 0.35 + 0.65 * Math.sin((cycleProgress * Math.PI) / 2);
      }

      const sphereRadius = maxRadius * rBallNormalized;

      // 1. DRAW 3D BALL (SPHERE OF EXPANDING SPACE)
      ctx.save();

      // Ambient radial gradient for sphere volume
      const sphereGrad = ctx.createRadialGradient(
        cx - sphereRadius * 0.2,
        cy - sphereRadius * 0.2,
        0,
        cx,
        cy,
        sphereRadius
      );

      if (curClump > 0.2) {
        sphereGrad.addColorStop(0, 'rgba(60, 20, 30, 0.28)');
        sphereGrad.addColorStop(0.7, 'rgba(45, 12, 22, 0.45)');
        sphereGrad.addColorStop(1, `rgba(248, 113, 113, ${0.15 + curClump * 0.2})`);
      } else if (curRunaway > 0.2) {
        sphereGrad.addColorStop(0, 'rgba(50, 15, 60, 0.28)');
        sphereGrad.addColorStop(0.7, 'rgba(40, 10, 48, 0.45)');
        sphereGrad.addColorStop(1, `rgba(244, 63, 94, ${0.15 + curRunaway * 0.25})`);
      } else {
        sphereGrad.addColorStop(0, 'rgba(14, 28, 48, 0.25)');
        sphereGrad.addColorStop(0.7, 'rgba(10, 20, 38, 0.42)');
        sphereGrad.addColorStop(1, 'rgba(111, 228, 177, 0.22)');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(2, sphereRadius), 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Latitude Parallels (3D wireframe rings)
      const latAngles = [-60, -30, 0, 30, 60];
      const yaw = yawRef.current;
      const pitch = pitchRef.current;

      const ringBaseColor = curClump > 0
        ? `rgba(248, 113, 113, ${0.35 + curClump * 0.3})`
        : curRunaway > 0
        ? `rgba(244, 63, 94, ${0.35 + curRunaway * 0.35})`
        : 'rgba(111, 228, 177, 0.45)';

      const ringBackColor = curClump > 0
        ? 'rgba(248, 113, 113, 0.12)'
        : curRunaway > 0
        ? 'rgba(244, 63, 94, 0.12)'
        : 'rgba(111, 228, 177, 0.12)';

      for (const latDeg of latAngles) {
        const beta = (latDeg * Math.PI) / 180;
        const rLat = Math.cos(beta);
        const yLat = Math.sin(beta);
        const segments = 36;

        // Draw back half (dashed) and front half (solid)
        for (let i = 0; i < segments; i++) {
          const a1 = (i / segments) * Math.PI * 2;
          const a2 = ((i + 1) / segments) * Math.PI * 2;

          const p1 = project3D(
            rLat * Math.cos(a1),
            yLat,
            rLat * Math.sin(a1),
            yaw,
            pitch,
            cx,
            cy,
            sphereRadius
          );
          const p2 = project3D(
            rLat * Math.cos(a2),
            yLat,
            rLat * Math.sin(a2),
            yaw,
            pitch,
            cx,
            cy,
            sphereRadius
          );

          const midZ = (p1.zDepth + p2.zDepth) / 2;
          const isFront = midZ > 0;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);

          if (isFront) {
            ctx.setLineDash([]);
            ctx.strokeStyle = ringBaseColor;
            ctx.lineWidth = latDeg === 0 ? 1.5 : 0.8;
          } else {
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = ringBackColor;
            ctx.lineWidth = 0.5;
          }
          ctx.stroke();
        }
      }

      // Longitude Meridians (3D wireframe great circles)
      const lonAngles = [0, 45, 90, 135];
      for (const lonDeg of lonAngles) {
        const thetaM = (lonDeg * Math.PI) / 180;
        const segments = 36;

        for (let i = 0; i < segments; i++) {
          const a1 = (i / segments) * Math.PI * 2;
          const a2 = ((i + 1) / segments) * Math.PI * 2;

          const p1 = project3D(
            Math.cos(a1) * Math.cos(thetaM),
            Math.sin(a1),
            Math.cos(a1) * Math.sin(thetaM),
            yaw,
            pitch,
            cx,
            cy,
            sphereRadius
          );
          const p2 = project3D(
            Math.cos(a2) * Math.cos(thetaM),
            Math.sin(a2),
            Math.cos(a2) * Math.sin(thetaM),
            yaw,
            pitch,
            cx,
            cy,
            sphereRadius
          );

          const midZ = (p1.zDepth + p2.zDepth) / 2;
          const isFront = midZ > 0;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);

          if (isFront) {
            ctx.setLineDash([]);
            ctx.strokeStyle = ringBaseColor;
            ctx.lineWidth = 0.8;
          } else {
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = ringBackColor;
            ctx.lineWidth = 0.5;
          }
          ctx.stroke();
        }
      }

      ctx.setLineDash([]);

      // Outer Glowing Sphere Boundary
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(2, sphereRadius), 0, Math.PI * 2);
      ctx.strokeStyle = curClump > 0
        ? 'rgba(248, 113, 113, 0.7)'
        : curRunaway > 0
        ? 'rgba(244, 63, 94, 0.8)'
        : 'rgba(111, 228, 177, 0.75)';
      ctx.lineWidth = curRunaway > 0 ? 1.8 : 1.2;
      ctx.stroke();

      ctx.restore();

      // 2. SIMULATE PARTICLES (GALAXIES / MATTER DOTS)
      // Compute 3D positions for all particles
      interface RenderedParticle {
        index: number;
        sx: number;
        sy: number;
        zDepth: number;
        depthFactor: number;
        radius: number;
        color: string;
        isEscaped: boolean;
        isBreachedSphere: boolean;
        trailStartX?: number;
        trailStartY?: number;
        clusterId: number;
      }

      const renderedParticles: RenderedParticle[] = [];
      let escapedCount = 0;

      // Multiplier determining particle speed relative to the expanding ball
      let dotExpansionMultiplier = 1.0;
      if (curRunaway > 0) {
        // Runaway tears apart: dots accelerate faster than the ball (M_dot > 1)
        dotExpansionMultiplier = 1.0 + curRunaway * 3.8 * Math.pow(cycleProgress, 1.35);
      }

      for (let i = 0; i < STATIC_PARTICLES.length; i++) {
        const p = STATIC_PARTICLES[i];

        let curX = p.x0;
        let curY = p.y0;
        let curZ = p.z0;

        // REGIME 1 & 2: Big Crunch clumping pull towards cluster attractors
        if (curClump > 0) {
          const attractor = CLUSTER_ATTRACTORS[p.clusterId];
          // Gravitational clumping increases over time and as slider moves left
          const pullStrength = curClump * (0.35 + 0.65 * cycleProgress);
          // Attract towards cluster center and core
          const clumpTargetX = attractor.x * (1 - 0.25 * curClump) + 0.08 * (p.x0 - attractor.x);
          const clumpTargetY = attractor.y * (1 - 0.25 * curClump) + 0.08 * (p.y0 - attractor.y);
          const clumpTargetZ = attractor.z * (1 - 0.25 * curClump) + 0.08 * (p.z0 - attractor.z);

          curX = (1 - pullStrength) * p.x0 + pullStrength * clumpTargetX;
          curY = (1 - pullStrength) * p.y0 + pullStrength * clumpTargetY;
          curZ = (1 - pullStrength) * p.z0 + pullStrength * clumpTargetZ;
        }

        // Apply ball scale and runaway multiplier
        const effectiveParticleRadius = sphereRadius * dotExpansionMultiplier;
        const proj = project3D(
          curX,
          curY,
          curZ,
          yaw,
          pitch,
          cx,
          cy,
          effectiveParticleRadius
        );

        // Check if dot has breached sphere or escaped visual frame
        const current3DRadius = Math.hypot(curX, curY, curZ) * dotExpansionMultiplier;
        const isBreachedSphere = current3DRadius > 1.0;

        const isEscaped =
          proj.sx < -15 ||
          proj.sx > width + 15 ||
          proj.sy < -15 ||
          proj.sy > height + 15;

        if (isEscaped) {
          escapedCount++;
        }

        // Particle color & glow
        let color = '#E0F2FE';
        if (curClump > 0.3) {
          color = p.clusterId === 0 ? '#FCA5A5' : p.clusterId === 1 ? '#FDE047' : '#FB923C';
        } else if (curRunaway > 0.2) {
          color = isBreachedSphere ? '#F43F5E' : '#FDA4AF';
        } else {
          color = p.colorType === 'cyan' ? '#38BDF8' : p.colorType === 'mint' ? '#6FE4B1' : p.colorType === 'gold' ? '#FCD34D' : '#FFFFFF';
        }

        // Motion trail coordinates for runaway particles
        let trailStartX: number | undefined;
        let trailStartY: number | undefined;
        if (curRunaway > 0.05 && dotExpansionMultiplier > 1.05) {
          const trailLength = (dotExpansionMultiplier - 1.0) * 28 * proj.depthFactor;
          const dirX = proj.sx - cx;
          const dirY = proj.sy - cy;
          const distFromCenter = Math.hypot(dirX, dirY) || 1;
          trailStartX = proj.sx - (dirX / distFromCenter) * trailLength;
          trailStartY = proj.sy - (dirY / distFromCenter) * trailLength;
        }

        renderedParticles.push({
          index: i,
          sx: proj.sx,
          sy: proj.sy,
          zDepth: proj.zDepth,
          depthFactor: proj.depthFactor,
          radius: p.baseSize * proj.depthFactor,
          color,
          isEscaped,
          isBreachedSphere,
          trailStartX,
          trailStartY,
          clusterId: p.clusterId,
        });
      }

      // Sort by depth (Painter's algorithm: far to near)
      renderedParticles.sort((a, b) => a.zDepth - b.zDepth);

      // Draw Filaments between clumping particles in the same cluster (Big Crunch)
      if (curClump > 0.15) {
        ctx.save();
        ctx.lineWidth = 0.9 * (curClump * cycleAlpha);
        for (const f of STATIC_FILAMENTS) {
          const p1 = renderedParticles.find((rp) => rp.index === f.p1);
          const p2 = renderedParticles.find((rp) => rp.index === f.p2);
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.strokeStyle = `rgba(251, 146, 60, ${0.15 + curClump * 0.45})`;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Draw Particles & Runaway Motion Trails
      for (const p of renderedParticles) {
        // Skip rendering if far outside visual frame
        if (p.sx < -80 || p.sx > width + 80 || p.sy < -80 || p.sy > height + 80) {
          continue;
        }

        // Draw runaway motion streak trail
        if (p.trailStartX !== undefined && p.trailStartY !== undefined) {
          ctx.save();
          const trailGrad = ctx.createLinearGradient(p.trailStartX, p.trailStartY, p.sx, p.sy);
          trailGrad.addColorStop(0, 'rgba(244, 63, 94, 0)');
          trailGrad.addColorStop(0.6, 'rgba(244, 63, 94, 0.4)');
          trailGrad.addColorStop(1, 'rgba(253, 164, 175, 0.95)');

          ctx.beginPath();
          ctx.moveTo(p.trailStartX, p.trailStartY);
          ctx.lineTo(p.sx, p.sy);
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = Math.max(1, p.radius * 0.75);
          ctx.stroke();
          ctx.restore();
        }

        // Dot Glow Halo
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.radius * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = p.isBreachedSphere
          ? 'rgba(244, 63, 94, 0.25)'
          : curClump > 0.3
          ? 'rgba(251, 146, 60, 0.22)'
          : 'rgba(111, 228, 177, 0.18)';
        ctx.fill();

        // Dot Core
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = cycleAlpha;
        ctx.fill();
        ctx.restore();
      }

      // 3. Central Anchor Core / Coordinate Axis
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = curClump > 0 ? '#F87171' : curRunaway > 0 ? '#F43F5E' : '#7A7BFF';
      ctx.fill();
      ctx.restore();

      // Periodically update telemetry state for React HUD
      if (now - lastTelemetryUpdate > 100) {
        lastTelemetryUpdate = now;
        setTelemetry({
          escapedCount,
          speedRatio: dotExpansionMultiplier,
          statusText: curClump > 0.3 ? 'Gravitational Clumping' : curRunaway > 0.2 ? 'Escaping Visual Frame' : 'In Sync (Hubble Flow)',
        });
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

  // Pointer Drag-to-Rotate handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: yawRef.current,
      pitch: pitchRef.current,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    yawRef.current = dragStartRef.current.yaw + dx * 0.008;
    pitchRef.current = Math.max(-1.1, Math.min(1.1, dragStartRef.current.pitch + dy * 0.008));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already lost
    }
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Reset cycle
  const resetCycle = useCallback(() => {
    startTimeRef.current = performance.now();
    manualTimeOffsetRef.current = 0;
  }, []);

  return (
    <div
      ref={containerRef}
      className={`expansion-viz-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, rgba(12, 14, 32, 0.7) 0%, rgba(3, 4, 10, 0.95) 100%)',
        borderRadius: 10,
        userSelect: 'none',
      }}
      aria-label={`3D Universe Expansion Simulation: ${theme.title}. ${theme.subhead}`}
    >
      {/* 3D Canvas Visual Canvas */}
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
          cursor: 'grab',
          touchAction: 'none',
        }}
      />

      {/* TOP HUD OVERLAY */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: isCompact ? '8px 12px' : '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {/* Top-Left: Mode & Physics */}
        <div style={{ maxWidth: isCompact ? '70%' : '58%' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: isCompact ? 9 : 11,
              fontFamily: 'var(--f-mono)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: theme.badgeColor,
              marginBottom: 3,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: theme.badgeColor,
                boxShadow: `0 0 8px ${theme.badgeColor}`,
              }}
            />
            {theme.badge}
          </div>

          {!isCompact && (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontFamily: 'var(--f-serif)',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  letterSpacing: '0.01em',
                  lineHeight: 1.25,
                }}
              >
                {theme.title}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontFamily: 'var(--f-body)',
                  color: 'var(--ink-soft)',
                  marginTop: 3,
                  lineHeight: 1.35,
                }}
              >
                {theme.subhead}
              </div>
            </>
          )}
        </div>

        {/* Top-Right: Telemetry Metrics */}
        <div
          style={{
            textAlign: 'right',
            fontFamily: 'var(--f-mono)',
            fontSize: isCompact ? 10 : 11,
            color: 'var(--ink-soft)',
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: isCompact ? 13 : 15, fontWeight: 700, color: theme.badgeColor }}>
            {value.toFixed(2)} H₀
          </div>

          {!isCompact && (
            <>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 2 }}>
                Speed: <span style={{ color: '#FFFFFF' }}>{theme.speedTag}</span>
              </div>

              {isRunaway && (
                <div style={{ fontSize: 10, color: '#FDA4AF', marginTop: 1 }}>
                  Escaped frame: <span style={{ fontWeight: 'bold' }}>{telemetry.escapedCount} / 52</span>
                </div>
              )}

              {isCrunch && (
                <div style={{ fontSize: 10, color: '#FDE047', marginTop: 1 }}>
                  Knots: <span style={{ fontWeight: 'bold' }}>4 Gravitational Clumps</span>
                </div>
              )}

              {isGoldilocks && (
                <div style={{ fontSize: 10, color: '#6FE4B1', marginTop: 1 }}>
                  Dots inside ball: <span style={{ fontWeight: 'bold' }}>100% Bound</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* INTERACTIVE CONTROLS (Top-Right under telemetry, visible on hover/focus) */}
      {!isCompact && (
        <div
          style={{
            position: 'absolute',
            right: 18,
            top: 104,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            zIndex: 3,
          }}
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            style={{
              background: 'rgba(13, 14, 32, 0.75)',
              border: '1px solid var(--hair-2)',
              borderRadius: 6,
              color: 'var(--ink-soft)',
              padding: '4px 8px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            type="button"
            onClick={resetCycle}
            aria-label="Replay cycle from origin"
            title="Replay cycle from origin"
            style={{
              background: 'rgba(13, 14, 32, 0.75)',
              border: '1px solid var(--hair-2)',
              borderRadius: 6,
              color: 'var(--ink-soft)',
              padding: '4px 8px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              cursor: 'pointer',
            }}
          >
            ↺ Replay
          </button>
        </div>
      )}

      {/* 3D DRAG HINT PILL */}
      {!isCompact && (
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(13, 14, 32, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(6px)',
            borderRadius: 999,
            padding: '3px 12px',
            fontSize: 9.5,
            fontFamily: 'var(--f-mono)',
            color: 'var(--ink-faint)',
            letterSpacing: '0.04em',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          ⟳ Drag to rotate 3D view · Cosmic space expands uniformly
        </div>
      )}

      {/* BOTTOM REFERENCE ZONE TRACK (Matching ShapeViz aesthetic) */}
      {!isCompact && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 20,
            right: 20,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* Base rail line */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 2,
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 1,
            }}
          >
            {/* Habitable Goldilocks middle band indicator */}
            <div
              style={{
                position: 'absolute',
                left: `${((0.5 - 0.1) / (2.0 - 0.1)) * 100}%`,
                width: `${((0.9 - 0.5) / (2.0 - 0.1)) * 100}%`,
                height: 2,
                background: '#6FE4B1',
                boxShadow: '0 0 6px rgba(111, 228, 177, 0.4)',
              }}
            />

            {/* Current Position Marker Pip */}
            <div
              style={{
                position: 'absolute',
                left: `${Math.max(0, Math.min(100, ((value - 0.1) / (2.0 - 0.1)) * 100))}%`,
                top: -4,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: theme.badgeColor,
                border: '1.5px solid #FFFFFF',
                boxShadow: `0 0 10px ${theme.badgeColor}`,
                transform: 'translateX(-50%)',
                transition: 'left 0.1s ease-out',
              }}
            />
          </div>

          {/* 3 Zone Labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--f-mono)',
              fontSize: 9.5,
              marginTop: 6,
            }}
          >
            <span
              style={{
                color: isCrunch ? '#F87171' : 'var(--ink-faint)',
                fontWeight: isCrunch ? 600 : 400,
              }}
            >
              0.1 H₀ Big Crunch (Clumping)
            </span>
            <span
              style={{
                color: isGoldilocks ? '#6FE4B1' : 'var(--ink-faint)',
                fontWeight: isGoldilocks ? 600 : 400,
              }}
            >
              0.7 H₀ Goldilocks (In Sync)
            </span>
            <span
              style={{
                color: isRunaway ? '#F43F5E' : 'var(--ink-faint)',
                fontWeight: isRunaway ? 600 : 400,
              }}
            >
              2.0 H₀ Runaway (Escapes Frame)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
