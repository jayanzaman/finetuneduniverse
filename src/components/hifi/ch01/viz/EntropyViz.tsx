'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

export type EntropyVizProps = {
  value?: number;
  className?: string;
};

// Hourglass 3D radius contour as function of normalized vertical height y in [-0.85, 0.85]
function getHourglassRadius(y: number): number {
  const u = Math.min(1, Math.abs(y) / 0.85);
  // Narrow neck at y=0 (r=0.14), wide bulb at y=±0.45 (r=0.48), end rims at y=±0.85 (r=0.28)
  return 0.14 + 0.34 * Math.sin(Math.pow(u, 0.78) * Math.PI);
}

// 72 Deterministic Thermodynamic Particles
interface ThermodynamicParticle {
  id: number;
  departureThreshold: number; // 0..1 (when in the battery cycle it leaves the top bulb)
  topY: number;
  topRadiusRatio: number;
  topAngle: number;
  botY: number;
  botRadiusRatio: number;
  botAngle: number;
  size: number;
}

function generateDeterministicParticles(): ThermodynamicParticle[] {
  const list: ThermodynamicParticle[] = [];
  const count = 72;

  for (let i = 0; i < count; i++) {
    // Departure threshold evenly staggered across the battery discharge cycle
    const departureThreshold = (i / count);

    // Initial position inside top chamber (y in [+0.25, +0.78])
    const topY = 0.28 + ((i * 13) % 45) * 0.011;
    const topRadiusRatio = 0.18 + ((i * 29) % 65) * 0.01;
    const topAngle = (i * 2.39996); // Golden angle distribution

    // Resting position inside bottom sink (y in [-0.78, -0.28])
    const botY = -0.28 - ((i * 17) % 45) * 0.011;
    const botRadiusRatio = 0.22 + ((i * 37) % 65) * 0.01;
    const botAngle = (i * 1.61803);

    list.push({
      id: i,
      departureThreshold,
      topY,
      topRadiusRatio,
      topAngle,
      botY,
      botRadiusRatio,
      botAngle,
      size: 1.6 + ((i * 7) % 15) * 0.1,
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

  // Battery charge level: 1.0 (100% full) -> 0.0 (0% depleted)
  const batteryLevelRef = useRef<number>(1.0);
  const rechargeAnimRef = useRef<number>(0); // 1.0 -> 0.0 during animated recharge surge
  const rechargePulseRef = useRef<number>(0);

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

  // UI state for reactive display
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [batteryDisplay, setBatteryDisplay] = useState<number>(100);
  const [isRecharging, setIsRecharging] = useState<boolean>(false);

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

  // Dynamic Theme Colors & Copy
  const theme = useMemo(() => {
    if (isFreeze) {
      return {
        badge: 'FROZEN ORDER · ZERO PERTURBATIONS',
        badgeColor: '#A855F7',
        title: 'Over-Constrained Grid (No Free Energy Flow)',
        subhead: 'Entropy is pathologically low. Spacetime is frozen in a static lattice without perturbations to seed stars.',
        engineStatus: 'Arrested (Zero Perturbations)',
        lifespan: 'Static / Inert',
      };
    }
    if (isChaos) {
      return {
        badge: 'THERMAL DEATH · NO USABLE GRADIENTS',
        badgeColor: '#EF4444',
        title: 'Depleted Battery (Born at Maximum Entropy)',
        subhead: 'Initial entropy is so high that matter starts already collapsed into black holes. No free energy exists to power stars or life.',
        engineStatus: 'Extinguished (Dead on Arrival)',
        lifespan: '0 Years (Thermal Equilibrium)',
      };
    }
    return {
      badge: 'THERMODYNAMIC BATTERY · 100% CHARGED',
      badgeColor: '#6FE4B1',
      title: 'Cosmic Arrow of Time (ΔS > 0)',
      subhead: 'Pristine gravitational potential cascades downward: powering galaxies, stellar fusion, and planetary metabolic chemistry.',
      engineStatus: batteryDisplay > 5 ? 'Active (Optimal Fusion & Life)' : 'Exhausted (All Free Energy Spent)',
      lifespan: batteryDisplay > 5 ? `~${Math.round(batteryDisplay)} Trillion Years Remaining` : 'Cosmic Heat Death',
    };
  }, [isFreeze, isChaos, batteryDisplay]);

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

      // Auto-rotation when not dragging
      if (!isDraggingRef.current) {
        yawRef.current += 0.003;
      }

      const curVal = valueRef.current;
      const curFreeze = Math.max(0, Math.min(1, (0.5 - curVal) / 0.4));
      const curChaos = Math.max(0, Math.min(1, (curVal - 1.5) / 8.5));

      // Handle animated recharge surge decay
      if (rechargeAnimRef.current > 0) {
        rechargeAnimRef.current = Math.max(0, rechargeAnimRef.current - dt * 1.5);
        if (rechargeAnimRef.current === 0) {
          setIsRecharging(false);
        }
      }

      // Handle recharge glow pulse decay
      if (rechargePulseRef.current > 0) {
        rechargePulseRef.current = Math.max(0, rechargePulseRef.current - dt * 1.8);
      }

      // BATTERY DISCHARGE LOGIC
      if (isPlayingRef.current && rechargeAnimRef.current === 0) {
        if (curFreeze > 0) {
          // Frozen order: battery locked at 100%, zero discharge rate
          batteryLevelRef.current = 1.0;
        } else if (curChaos > 0.4) {
          // Chaos / Thermal death: battery is born depleted (0%)
          batteryLevelRef.current = 0.0;
        } else {
          // Normal Goldilocks: discharges smoothly over ~22 seconds
          const dischargeSpeed = 1.0 / 22.0;
          batteryLevelRef.current = Math.max(0.0, batteryLevelRef.current - dt * dischargeSpeed);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.44;

      const yaw = yawRef.current;
      const pitch = pitchRef.current;

      const batteryLvl = curChaos > 0.4
        ? 0.0
        : curFreeze > 0
        ? 1.0
        : batteryLevelRef.current;

      // 1. DRAW 3D GLASS HOURGLASS VESSEL
      ctx.save();

      // Top Chamber Recharge Flash Glow
      if (rechargePulseRef.current > 0) {
        const topCenter = project3D(0, 0.48, 0, yaw, pitch, cx, cy, scale);
        const pulseGrad = ctx.createRadialGradient(
          topCenter.sx,
          topCenter.sy,
          0,
          topCenter.sx,
          topCenter.sy,
          scale * 0.52
        );
        pulseGrad.addColorStop(0, `rgba(111, 228, 177, ${0.55 * rechargePulseRef.current})`);
        pulseGrad.addColorStop(0.6, `rgba(56, 189, 248, ${0.25 * rechargePulseRef.current})`);
        pulseGrad.addColorStop(1, 'rgba(111, 228, 177, 0)');

        ctx.beginPath();
        ctx.arc(topCenter.sx, topCenter.sy, scale * 0.52, 0, Math.PI * 2);
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
            strokeColor = curChaos > 0.3
              ? 'rgba(239, 68, 68, 0.7)'
              : batteryLvl > 0.02
              ? 'rgba(252, 211, 77, 0.85)'
              : 'rgba(255, 255, 255, 0.25)';
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
      if (curChaos < 0.6 && curFreeze < 0.7 && batteryLvl > 0.02) {
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
      if (curChaos < 0.4 && curFreeze < 0.5 && (batteryLvl > 0.02 || rechargeAnimRef.current > 0)) {
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
        // Extinguished / Dead Ember when battery is depleted or universe is chaotic
        ctx.beginPath();
        ctx.arc(neckProj.sx, neckProj.sy, 4 * neckProj.depthFactor, 0, Math.PI * 2);
        ctx.fillStyle = curChaos > 0.4 ? '#7F1D1D' : '#334155';
        ctx.fill();
      }
      ctx.restore();

      // Tier 3: Planetary Biosphere & Chemistry Loop (y = -0.18)
      const tier3Proj = project3D(0, -0.18, 0, yaw, pitch, cx, cy, scale);
      if (curChaos < 0.3 && curFreeze < 0.4 && batteryLvl > 0.02) {
        ctx.save();
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
      // Black hole horizon swells as entropy increases or battery empties
      const spentFactor = 1.0 - batteryLvl;
      const bhRadius = (10 + curChaos * 16 + spentFactor * 5) * sinkProj.depthFactor;
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
      const dischargeProgress = 1.0 - batteryLvl; // 0.0 (full battery) -> 1.0 (empty battery)
      const rechargeSurge = rechargeAnimRef.current; // 1.0 -> 0.0 when user hits recharge

      for (let i = 0; i < STATIC_PARTICLES.length; i++) {
        const p = STATIC_PARTICLES[i];

        let curX = 0;
        let curY = 0;
        let curZ = 0;
        let pColor = '#38BDF8';
        let pGlow = 'rgba(56, 189, 248, 0.35)';

        if (curChaos > 0.4) {
          // Chaos / Maximum Entropy: All particles trapped in bottom black hole sink
          const rSink = getHourglassRadius(p.botY) * p.botRadiusRatio;
          const aSink = p.botAngle + now * 0.002;
          curX = rSink * Math.cos(aSink);
          curY = p.botY;
          curZ = rSink * Math.sin(aSink);
          pColor = '#F87171';
          pGlow = 'rgba(239, 68, 68, 0.4)';
        } else if (rechargeSurge > 0) {
          // RECHARGE ANIMATION: Particles stream rapidly upward back to top chamber
          const surgeT = 1.0 - rechargeSurge; // 0 -> 1 during surge
          // Phase shift per particle
          const pSurge = Math.max(0, Math.min(1, surgeT * 1.5 - (p.id / 72) * 0.4));
          const y = p.botY + (p.topY - p.botY) * pSurge;
          const rChamber = getHourglassRadius(y) * (0.3 + 0.5 * Math.sin(pSurge * Math.PI));
          const a = p.topAngle + (1 - pSurge) * 4.0;
          curX = rChamber * Math.cos(a);
          curY = y;
          curZ = rChamber * Math.sin(a);
          pColor = '#6FE4B1';
          pGlow = 'rgba(111, 228, 177, 0.6)';
        } else if (dischargeProgress < p.departureThreshold) {
          // WAITING IN TOP RESERVOIR (Unspent Gravitational Potential)
          const rTop = getHourglassRadius(p.topY) * p.topRadiusRatio;
          const aTop = p.topAngle + now * 0.0008;
          curX = rTop * Math.cos(aTop);
          curY = p.topY;
          curZ = rTop * Math.sin(aTop);
          pColor = '#38BDF8';
          pGlow = 'rgba(56, 189, 248, 0.35)';
        } else {
          // HAS DEPARTED TOP RESERVOIR
          // Transit down to bottom sink
          const transitProgress = Math.min(1.0, (dischargeProgress - p.departureThreshold) / 0.18);

          if (transitProgress < 1.0) {
            // In transit through neck (powers stars and biosphere)
            const y = p.topY + (p.botY - p.topY) * transitProgress;
            const rChamber = getHourglassRadius(y) * (0.2 + 0.6 * (1.0 - Math.sin(transitProgress * Math.PI) * 0.6));
            const a = p.topAngle + transitProgress * 3.0 + now * 0.001;
            curX = rChamber * Math.cos(a);
            curY = y;
            curZ = rChamber * Math.sin(a);

            if (Math.abs(y) < 0.12) {
              pColor = '#FDE047'; // Stellar fusion
              pGlow = 'rgba(253, 224, 71, 0.6)';
            } else {
              pColor = '#6FE4B1';
              pGlow = 'rgba(111, 228, 177, 0.4)';
            }
          } else {
            // Has settled in bottom sink (swirling in black hole accretion disk)
            const rSink = getHourglassRadius(p.botY) * p.botRadiusRatio;
            const aSink = p.botAngle + now * 0.0015;
            curX = rSink * Math.cos(aSink);
            curY = p.botY;
            curZ = rSink * Math.sin(aSink);
            pColor = '#818CF8';
            pGlow = 'rgba(129, 140, 248, 0.3)';
          }
        }

        const proj = project3D(curX, curY, curZ, yaw, pitch, cx, cy, scale);

        projectedParticles.push({
          sx: proj.sx,
          sy: proj.sy,
          zDepth: proj.zDepth,
          depthFactor: proj.depthFactor,
          radius: p.size * proj.depthFactor,
          color: pColor,
          glow: pGlow,
        });
      }

      // Painter's algorithm (depth sort back to front)
      projectedParticles.sort((a, b) => a.zDepth - b.zDepth);

      // Draw Particles
      for (const p of projectedParticles) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Periodically update charge gauge display
      if (now - lastBatteryUpdate > 80) {
        lastBatteryUpdate = now;
        const currentPercent = curChaos > 0.4
          ? 0
          : curFreeze > 0
          ? 100
          : Math.round(batteryLevelRef.current * 100);
        setBatteryDisplay(currentPercent);
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

  // RECHARGE ACTION: Rewinds cosmic clock & triggers upward particle surge
  const handleRecharge = useCallback(() => {
    batteryLevelRef.current = 1.0;
    rechargeAnimRef.current = 1.0;
    rechargePulseRef.current = 1.0;
    setIsRecharging(true);
    setBatteryDisplay(100);
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

        {/* Top-Right: Telemetry Metrics with Live Battery Meter */}
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
              {/* Animated Live Battery Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--ink-faint)' }}>Battery:</span>
                <div
                  style={{
                    width: 50,
                    height: 8,
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${batteryDisplay}%`,
                      background: batteryDisplay > 35 ? '#6FE4B1' : batteryDisplay > 15 ? '#FDE047' : '#EF4444',
                      boxShadow: `0 0 6px ${batteryDisplay > 35 ? '#6FE4B1' : '#EF4444'}`,
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>
                <span style={{ fontSize: 10, color: theme.badgeColor, fontWeight: 'bold' }}>
                  {batteryDisplay}% Charged
                </span>
              </div>

              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 2 }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isChaos || isFreeze || batteryDisplay === 0 ? 0.35 : 1.0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FDE047', boxShadow: '0 0 6px #FDE047' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: '#FDE047', fontWeight: 600 }}>
              Tier 2: Stellar Fusion Engine
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isChaos || isFreeze || batteryDisplay === 0 ? 0.35 : 0.9 }}>
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
            gap: 8,
            zIndex: 3,
          }}
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
            title={isPlaying ? 'Pause thermodynamic flow' : 'Resume thermodynamic flow'}
            style={{
              background: 'rgba(13, 14, 32, 0.85)',
              border: '1px solid var(--hair-2)',
              borderRadius: 6,
              color: 'var(--ink-soft)',
              padding: '5px 10px',
              fontSize: 10.5,
              fontFamily: 'var(--f-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            type="button"
            onClick={handleRecharge}
            aria-label="Recharge battery"
            title="Rewind cosmic clock / Recharge primordial reservoir"
            style={{
              background: batteryDisplay === 0 || isRecharging ? 'rgba(111, 228, 177, 0.22)' : 'rgba(13, 14, 32, 0.85)',
              border: batteryDisplay === 0 ? '1.5px solid #6FE4B1' : '1px solid var(--hair-2)',
              borderRadius: 6,
              color: batteryDisplay === 0 ? '#6FE4B1' : 'var(--ink-soft)',
              padding: '5px 10px',
              fontSize: 10.5,
              fontFamily: 'var(--f-mono)',
              fontWeight: batteryDisplay === 0 ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: batteryDisplay === 0 ? '0 0 12px rgba(111, 228, 177, 0.4)' : 'none',
              transition: 'all 0.2s ease',
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
