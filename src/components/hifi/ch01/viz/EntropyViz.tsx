'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

export type EntropyVizProps = {
  value?: number;
  className?: string;
};

// Deterministic Pseudo-Random Generator (LCG)
let seed = 777;
function lcgRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// Hourglass 3D radius contour as function of normalized vertical height y in [-0.85, 0.85]
function getHourglassRadius(y: number): number {
  const u = Math.min(1, Math.abs(y) / 0.85);
  // Narrow neck at y=0 (r=0.14), wide bulb at y=±0.45 (r=0.48), end rims at y=±0.85 (r=0.28)
  return 0.14 + 0.34 * Math.sin(Math.pow(u, 0.78) * Math.PI);
}

// 72 Deterministic Thermodynamic Particles
interface ThermodynamicParticle {
  id: number;
  // Progress along the cascade: 0.0 (top battery) -> 1.0 (bottom black hole sink)
  cascadePos: number;
  speed: number;
  angle: number;
  radialRatio: number; // 0..0.85 relative to chamber radius
  colorType: 'order' | 'fusion' | 'dissipate' | 'sink';
  size: number;
}

function generateDeterministicParticles(): ThermodynamicParticle[] {
  seed = 108;
  const list: ThermodynamicParticle[] = [];
  for (let i = 0; i < 72; i++) {
    const cascadePos = (i / 72 + lcgRandom() * 0.08) % 1.0;
    list.push({
      id: i,
      cascadePos,
      speed: 0.045 + lcgRandom() * 0.035,
      angle: lcgRandom() * Math.PI * 2,
      radialRatio: 0.15 + lcgRandom() * 0.72,
      colorType: cascadePos < 0.35 ? 'order' : cascadePos < 0.65 ? 'fusion' : 'sink',
      size: 1.6 + lcgRandom() * 1.5,
    });
  }
  return list;
}

const STATIC_PARTICLES = generateDeterministicParticles();

export function EntropyViz({
  value = 1.0,
  className = '',
}: EntropyVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation & simulation refs
  const animFrameRef = useRef<number | null>(null);
  const valueRef = useRef<number>(value);
  const isPlayingRef = useRef<boolean>(true);
  const lastTimeRef = useRef<number>(0);

  // 3D Camera rotation
  const yawRef = useRef<number>(0.35);
  const pitchRef = useRef<number>(0.22);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({
    x: 0,
    y: 0,
    yaw: 0.35,
    pitch: 0.22,
  });

  // Particle state ref (accessible to both render loop and resetBattery)
  const particlesRef = useRef<ThermodynamicParticle[]>(
    STATIC_PARTICLES.map((p) => ({ ...p }))
  );
  const rechargePulseRef = useRef<number>(0);

  // UI state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [batteryCharge, setBatteryCharge] = useState<number>(100);

  // Keep value ref synchronized with incoming prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Keep playing ref synchronized
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Regimes analysis based on Goldilocks slider values [0.1 .. 10.0]
  // In-band: 0.5 .. 1.5 (default 1.0)
  const isFreeze = value < 0.5;
  const isGoldilocks = value >= 0.5 && value <= 1.5;
  const isChaos = value > 1.5;

  const chaosFactor = Math.max(0, Math.min(1, (value - 1.5) / 8.5));

  // Dynamic Theme Colors & Copy
  const theme = useMemo(() => {
    if (isFreeze) {
      return {
        badge: 'FROZEN ORDER · ZERO PERTURBATIONS',
        badgeColor: '#A855F7',
        title: 'Over-Constrained Grid (No Free Energy Flow)',
        subhead: 'Entropy is pathologically low. Spacetime is frozen in a static lattice without perturbations to seed stars.',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        engineStatus: 'Arrested (Zero Perturbations)',
        freeEnergyPercent: 0,
        lifespan: 'Static / Inert',
      };
    }
    if (isChaos) {
      return {
        badge: 'THERMAL DEATH · NO USABLE GRADIENTS',
        badgeColor: '#EF4444',
        title: 'Depleted Battery (Born at Maximum Entropy)',
        subhead: 'Initial entropy is so high that matter starts already collapsed into black holes. No free energy exists to power stars or life.',
        glowColor: 'rgba(239, 68, 68, 0.45)',
        engineStatus: 'Extinguished (Dead on Arrival)',
        freeEnergyPercent: Math.max(0, Math.round((1 - chaosFactor) * 15)),
        lifespan: '0 Years (Thermal Equilibrium)',
      };
    }
    return {
      badge: 'THERMODYNAMIC BATTERY · 100% CHARGED',
      badgeColor: '#6FE4B1',
      title: 'Cosmic Arrow of Time (ΔS > 0)',
      subhead: 'Pristine gravitational potential cascades downward: powering galaxies, stellar fusion, and planetary metabolic chemistry.',
      glowColor: 'rgba(111, 228, 177, 0.4)',
      engineStatus: 'Active (Optimal Fusion & Life)',
      freeEnergyPercent: 100,
      lifespan: '~100 Trillion Years',
    };
  }, [isFreeze, isChaos, chaosFactor]);

  // Main Canvas 3D Rendering & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Safe fallback for non-canvas or JSDOM environments

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

    const rect = container.getBoundingClientRect();
    width = rect.width || 400;
    height = rect.height || 400;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    setIsCompact(height < 210 || width < 320);

    // Particle state tracking
    const particles = particlesRef.current;
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
      camDist = 3.2
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

      const depthFactor = camDist / Math.max(0.2, camDist + z2);
      const sx = cx + x1 * depthFactor * scale;
      const sy = cy - y2 * depthFactor * scale; // Inverted Y so +Y is up (top reservoir)

      return {
        sx,
        sy,
        zDepth: z2,
        depthFactor,
      };
    }

    let lastBatteryUpdate = 0;

    const render = (now: number) => {
      const dt = Math.min(0.06, (now - lastTimeRef.current) * 0.001);
      lastTimeRef.current = now;

      // Subtle auto-rotation when user is not dragging
      if (!isDraggingRef.current) {
        yawRef.current += 0.003;
      }

      const curVal = valueRef.current;
      const curFreeze = Math.max(0, Math.min(1, (0.5 - curVal) / 0.4));
      const curChaos = Math.max(0, Math.min(1, (curVal - 1.5) / 8.5));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.44;

      const yaw = yawRef.current;
      const pitch = pitchRef.current;
      // Recharge pulse decay
      if (rechargePulseRef.current > 0) {
        rechargePulseRef.current = Math.max(0, rechargePulseRef.current - dt * 2.0);
      }

      // 1. DRAW 3D GLASS HOURGLASS VESSEL
      ctx.save();

      // Recharge glow aura if recharged
      if (rechargePulseRef.current > 0) {
        const topCenter = project3D(0, 0.45, 0, yaw, pitch, cx, cy, scale);
        const pulseGrad = ctx.createRadialGradient(
          topCenter.sx,
          topCenter.sy,
          0,
          topCenter.sx,
          topCenter.sy,
          scale * 0.48
        );
        pulseGrad.addColorStop(0, `rgba(111, 228, 177, ${0.5 * rechargePulseRef.current})`);
        pulseGrad.addColorStop(1, 'rgba(111, 228, 177, 0)');
        ctx.beginPath();
        ctx.arc(topCenter.sx, topCenter.sy, scale * 0.48, 0, Math.PI * 2);
        ctx.fillStyle = pulseGrad;
        ctx.fill();
      }

      // Horizontal contour rings along vertical axis
      const ringHeights = [-0.85, -0.65, -0.45, -0.22, 0.0, 0.22, 0.45, 0.65, 0.85];
      const segments = 32;

      for (const yH of ringHeights) {
        const rH = getHourglassRadius(yH);
        const isNeck = Math.abs(yH) < 0.05;
        const isTop = yH > 0;

        for (let i = 0; i < segments; i++) {
          const a1 = (i / segments) * Math.PI * 2;
          const a2 = ((i + 1) / segments) * Math.PI * 2;

          const p1 = project3D(
            rH * Math.cos(a1),
            yH,
            rH * Math.sin(a1),
            yaw,
            pitch,
            cx,
            cy,
            scale
          );
          const p2 = project3D(
            rH * Math.cos(a2),
            yH,
            rH * Math.sin(a2),
            yaw,
            pitch,
            cx,
            cy,
            scale
          );

          const midZ = (p1.zDepth + p2.zDepth) / 2;
          const isFront = midZ > 0;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);

          let strokeColor: string;
          if (curChaos > 0.4) {
            strokeColor = isFront ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.12)';
          } else if (curFreeze > 0.3) {
            strokeColor = isFront ? 'rgba(168, 85, 247, 0.45)' : 'rgba(168, 85, 247, 0.12)';
          } else {
            strokeColor = isTop
              ? isFront ? 'rgba(111, 228, 177, 0.55)' : 'rgba(111, 228, 177, 0.14)'
              : isFront ? 'rgba(129, 140, 248, 0.45)' : 'rgba(129, 140, 248, 0.12)';
          }

          if (isNeck) {
            strokeColor = curChaos > 0.3 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(252, 211, 77, 0.85)';
          }

          if (isFront) {
            ctx.setLineDash([]);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = isNeck ? 1.6 : 0.8;
          } else {
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 0.5;
          }
          ctx.stroke();
        }
      }

      // Vertical glass silhouette contour ribs
      const ribAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      const ribSteps = 24;

      for (const phi of ribAngles) {
        for (let s = 0; s < ribSteps; s++) {
          const y1 = -0.85 + (1.7 * s) / ribSteps;
          const y2 = -0.85 + (1.7 * (s + 1)) / ribSteps;
          const r1 = getHourglassRadius(y1);
          const r2 = getHourglassRadius(y2);

          const p1 = project3D(
            r1 * Math.cos(phi),
            y1,
            r1 * Math.sin(phi),
            yaw,
            pitch,
            cx,
            cy,
            scale
          );
          const p2 = project3D(
            r2 * Math.cos(phi),
            y2,
            r2 * Math.sin(phi),
            yaw,
            pitch,
            cx,
            cy,
            scale
          );

          const isFront = (p1.zDepth + p2.zDepth) / 2 > 0;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);

          if (isFront) {
            ctx.setLineDash([]);
            ctx.strokeStyle = curChaos > 0.4 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(111, 228, 177, 0.35)';
            ctx.lineWidth = 0.9;
          } else {
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 0.5;
          }
          ctx.stroke();
        }
      }

      ctx.setLineDash([]);
      ctx.restore();

      // 2. DRAW CENTRAL COMPLEXITY ENGINES (TIERS)
      // Tier 1: Inflowing Gas & Galactic Condensation (y = +0.18)
      const tier1Proj = project3D(0, 0.18, 0, yaw, pitch, cx, cy, scale);
      if (curChaos < 0.6 && curFreeze < 0.7) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(tier1Proj.sx, tier1Proj.sy, 12 * tier1Proj.depthFactor, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      // Tier 2: The Stellar Fusion Engine at the Neck (y = 0.0)
      const neckProj = project3D(0, 0, 0, yaw, pitch, cx, cy, scale);
      ctx.save();
      if (curChaos < 0.4 && curFreeze < 0.5) {
        // Active stellar burning furnace
        const coreRadius = (7.5 + Math.sin(now * 0.006) * 1.5) * neckProj.depthFactor;
        const coronaRadius = coreRadius * 2.8;

        const starGrad = ctx.createRadialGradient(
          neckProj.sx,
          neckProj.sy,
          0,
          neckProj.sx,
          neckProj.sy,
          coronaRadius
        );
        starGrad.addColorStop(0, '#FFFFFF');
        starGrad.addColorStop(0.3, '#FDE047');
        starGrad.addColorStop(0.7, 'rgba(251, 146, 60, 0.65)');
        starGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');

        ctx.beginPath();
        ctx.arc(neckProj.sx, neckProj.sy, coronaRadius, 0, Math.PI * 2);
        ctx.fillStyle = starGrad;
        ctx.fill();

        // Radiating Optical Photons
        for (let r = 0; r < 6; r++) {
          const rayAngle = (r / 6) * Math.PI * 2 + now * 0.002;
          const rayLen = (14 + (r % 2) * 8) * neckProj.depthFactor;
          ctx.beginPath();
          ctx.moveTo(neckProj.sx, neckProj.sy);
          ctx.lineTo(
            neckProj.sx + Math.cos(rayAngle) * rayLen,
            neckProj.sy + Math.sin(rayAngle) * rayLen
          );
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      } else {
        // Extinguished / Dead Ember
        ctx.beginPath();
        ctx.arc(neckProj.sx, neckProj.sy, 4 * neckProj.depthFactor, 0, Math.PI * 2);
        ctx.fillStyle = curChaos > 0.4 ? '#7F1D1D' : '#581C87';
        ctx.fill();
      }
      ctx.restore();

      // Tier 3: Planetary Biosphere & Chemistry Loop (y = -0.18)
      const tier3Proj = project3D(0, -0.18, 0, yaw, pitch, cx, cy, scale);
      if (curChaos < 0.3 && curFreeze < 0.4) {
        ctx.save();
        // Glowing biosphere ring (dissipating 1 optical photon into 20 infrared photons)
        const ringR = 14 * tier3Proj.depthFactor;
        ctx.beginPath();
        ctx.ellipse(tier3Proj.sx, tier3Proj.sy, ringR, ringR * 0.45, yaw, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(111, 228, 177, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Diffuse infrared heat emission ripples
        const rippleR = ringR * (1.2 + 0.3 * Math.sin(now * 0.004));
        ctx.beginPath();
        ctx.ellipse(tier3Proj.sx, tier3Proj.sy, rippleR, rippleR * 0.45, yaw, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)';
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 3. DRAW BOTTOM GRAVITATIONAL SINK (BLACK HOLE GRAVEYARD, y = -0.58)
      const sinkProj = project3D(0, -0.58, 0, yaw, pitch, cx, cy, scale);
      ctx.save();
      // Black hole horizon radius swells if initial entropy was high
      const bhRadius = (12 + curChaos * 16) * sinkProj.depthFactor;
      const diskRadius = bhRadius * 2.2;

      // Swirling Accretion Disk
      const diskGrad = ctx.createRadialGradient(
        sinkProj.sx,
        sinkProj.sy,
        bhRadius * 0.8,
        sinkProj.sx,
        sinkProj.sy,
        diskRadius
      );
      diskGrad.addColorStop(0, curChaos > 0.4 ? 'rgba(239, 68, 68, 0.85)' : 'rgba(129, 140, 248, 0.7)');
      diskGrad.addColorStop(0.5, curChaos > 0.4 ? 'rgba(185, 28, 28, 0.45)' : 'rgba(79, 70, 229, 0.35)');
      diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.ellipse(sinkProj.sx, sinkProj.sy, diskRadius, diskRadius * 0.4, -0.3 + yaw * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = diskGrad;
      ctx.fill();

      // Black Hole Event Horizon Void
      ctx.beginPath();
      ctx.arc(sinkProj.sx, sinkProj.sy, bhRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#03040B';
      ctx.fill();

      // Luminous Photon Sphere Rim
      ctx.beginPath();
      ctx.arc(sinkProj.sx, sinkProj.sy, bhRadius, 0, Math.PI * 2);
      ctx.strokeStyle = curChaos > 0.4 ? '#F87171' : '#A5B4FC';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // 4. SIMULATE & RENDER THERMODYNAMIC CASCADE PARTICLES
      interface ProjectedParticle {
        sx: number;
        sy: number;
        zDepth: number;
        depthFactor: number;
        radius: number;
        color: string;
        glow: string;
      }

      const projectedParticles: ProjectedParticle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update cascade position if playing
        if (isPlayingRef.current) {
          if (curFreeze > 0) {
            // Frozen in static crystal grid
            // Movement halted
          } else if (curChaos > 0.3) {
            // Chaos mode: particles pushed immediately into bottom sink
            p.cascadePos = Math.min(0.95, p.cascadePos + dt * p.speed * 0.4);
          } else {
            // Normal Goldilocks cascade: flow from top battery (y > 0) to sink (y < 0)
            p.cascadePos = (p.cascadePos + dt * p.speed) % 1.0;
          }
        }

        // Map cascadePos in [0, 1] to physical height Y in [+0.78, -0.78]
        // 0.0 is top reservoir (Big Bang battery), 1.0 is bottom black hole sink
        let y = 0.78 - p.cascadePos * 1.56;

        // If chaos, force all particles down into the lower reservoir
        if (curChaos > 0.4) {
          y = -0.35 - (p.id % 20) * 0.02 - lcgRandom() * 0.15;
        }

        // Hourglass radius at this height
        const chamberR = getHourglassRadius(y);
        const currentR = chamberR * p.radialRatio;

        // Particle orbital angle spins as it drains down
        const spinSpeed = y > 0 ? 0.8 : 2.4; // Spins faster in accretion zone
        const curAngle = p.angle + (1.0 - p.cascadePos) * spinSpeed + (now * 0.001);

        const x = currentR * Math.cos(curAngle);
        const z = currentR * Math.sin(curAngle);

        const proj = project3D(x, y, z, yaw, pitch, cx, cy, scale);

        // Particle color according to thermodynamic phase
        let color = '#6FE4B1';
        let glow = 'rgba(111, 228, 177, 0.3)';

        if (curChaos > 0.4) {
          color = '#F87171';
          glow = 'rgba(239, 68, 68, 0.4)';
        } else if (curFreeze > 0.3) {
          color = '#C084FC';
          glow = 'rgba(192, 132, 252, 0.4)';
        } else {
          if (y > 0.15) {
            // Primordial battery (High Free Energy)
            color = '#38BDF8';
            glow = 'rgba(56, 189, 248, 0.35)';
          } else if (y > -0.15) {
            // Stellar fusion & metabolic engine
            color = '#FDE047';
            glow = 'rgba(253, 224, 71, 0.5)';
          } else {
            // Degraded infrared & black hole sink
            color = '#818CF8';
            glow = 'rgba(129, 140, 248, 0.3)';
          }
        }

        projectedParticles.push({
          sx: proj.sx,
          sy: proj.sy,
          zDepth: proj.zDepth,
          depthFactor: proj.depthFactor,
          radius: p.size * proj.depthFactor,
          color,
          glow,
        });
      }

      // Painter's algorithm (depth sort back to front)
      projectedParticles.sort((a, b) => a.zDepth - b.zDepth);

      // Draw Particles
      for (const p of projectedParticles) {
        ctx.save();
        // Glow halo
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Periodically update charge gauge
      if (now - lastBatteryUpdate > 120) {
        lastBatteryUpdate = now;
        const currentCharge = curChaos > 0
          ? Math.max(0, Math.round((1 - curChaos) * 100))
          : curFreeze > 0
          ? 100
          : 100;
        setBatteryCharge(currentCharge);
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
    pitchRef.current = Math.max(-0.9, Math.min(0.9, dragStartRef.current.pitch + dy * 0.008));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const resetBattery = useCallback(() => {
    particlesRef.current.forEach((p, i) => {
      p.cascadePos = (i / 72) * 0.42; // Reset into top reservoir
    });
    rechargePulseRef.current = 1.0;
  }, []);

  return (
    <div
      ref={containerRef}
      className={`entropy-viz-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, rgba(14, 18, 36, 0.75) 0%, rgba(3, 4, 12, 0.96) 100%)',
        borderRadius: 10,
        userSelect: 'none',
      }}
      aria-label={`3D Cosmic Hourglass & Thermodynamic Battery: ${theme.title}. ${theme.subhead}`}
    >
      {/* 3D Canvas Visual */}
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
            {value.toFixed(2)} S/k
          </div>

          {!isCompact && (
            <>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 2 }}>
                Battery: <span style={{ color: theme.badgeColor, fontWeight: 'bold' }}>{batteryCharge}% Charged</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 1 }}>
                Engine: <span style={{ color: '#FFFFFF' }}>{theme.engineStatus}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 1 }}>
                Lifespan: <span style={{ color: '#FFFFFF' }}>{theme.lifespan}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3 COMPLEXITY TIER LABELS (Left Edge Callouts, visible on full view) */}
      {!isCompact && (
        <div
          style={{
            position: 'absolute',
            left: 18,
            top: '46%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isChaos ? 0.35 : 0.9 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: '#38BDF8' }}>
              Tier 1: Gravitational Reservoir
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isChaos || isFreeze ? 0.35 : 1.0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FDE047', boxShadow: '0 0 6px #FDE047' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: '#FDE047', fontWeight: 600 }}>
              Tier 2: Stellar Fusion Engine
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isChaos || isFreeze ? 0.35 : 0.9 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6FE4B1' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: '#6FE4B1' }}>
              Tier 3: Biosphere & Chemistry
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isChaos ? '#EF4444' : '#818CF8' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: isChaos ? '#F87171' : '#A5B4FC' }}>
              Sink: Black Hole Graveyard
            </span>
          </div>
        </div>
      )}

      {/* INTERACTIVE CONTROLS */}
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
            onClick={resetBattery}
            aria-label="Recharge battery"
            title="Recharge primordial battery"
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
            ↺ Recharge
          </button>
        </div>
      )}

      {/* 3D DRAG HINT */}
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
          ⟳ Drag to rotate 3D hourglass · Entropy flows downhill (ΔS &gt; 0)
        </div>
      )}

      {/* BOTTOM REFERENCE ZONE TRACK */}
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
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 2,
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 1,
            }}
          >
            {/* Habitable Goldilocks middle band indicator [0.5, 1.5] out of [0.1, 10.0] */}
            <div
              style={{
                position: 'absolute',
                left: `${((0.5 - 0.1) / (10.0 - 0.1)) * 100}%`,
                width: `${((1.5 - 0.5) / (10.0 - 0.1)) * 100}%`,
                height: 2,
                background: '#6FE4B1',
                boxShadow: '0 0 6px rgba(111, 228, 177, 0.4)',
              }}
            />

            {/* Current Position Marker Pip */}
            <div
              style={{
                position: 'absolute',
                left: `${Math.max(0, Math.min(100, ((value - 0.1) / (10.0 - 0.1)) * 100))}%`,
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
                color: isFreeze ? '#A855F7' : 'var(--ink-faint)',
                fontWeight: isFreeze ? 600 : 400,
              }}
            >
              0.1 S/k Frozen Order (No Gradients)
            </span>
            <span
              style={{
                color: isGoldilocks ? '#6FE4B1' : 'var(--ink-faint)',
                fontWeight: isGoldilocks ? 600 : 400,
              }}
            >
              1.0 S/k Goldilocks (100% Battery)
            </span>
            <span
              style={{
                color: isChaos ? '#EF4444' : 'var(--ink-faint)',
                fontWeight: isChaos ? 600 : 400,
              }}
            >
              10.0 S/k Thermal Death (Depleted)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
