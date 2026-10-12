'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

export type EntropyVizProps = {
  value?: number;
  className?: string;
  minimal?: boolean;
};

// -------------------------------------------------------------
// SCALE LADDER DEFINITIONS (Option C: The Impossible Odds)
// -------------------------------------------------------------
export interface ScaleLadderRung {
  id: number;
  label: string;
  shortLabel: string;
  exponentStr: string;
  probabilityFraction: string;
  analogy: string;
  comparisonTitle: string;
  comparisonBody: string;
  accentColor: string;
  badge: string;
}

export const SCALE_LADDER_RUNGS: ScaleLadderRung[] = [
  {
    id: 0,
    label: '1. Human Luck: National Lottery',
    shortLabel: '10⁷ · Lottery',
    exponentStr: '10⁷',
    probabilityFraction: '1 in 10,000,000',
    analogy: 'Winning a national jackpot. Extremely rare in daily life, yet humans win it regularly across the globe.',
    comparisonTitle: '1 golden ticket in a stadium of 10 million',
    comparisonBody: 'Rare in human intuition, but virtually guaranteed compared to fundamental physics.',
    accentColor: '#38BDF8',
    badge: 'HUMAN SCALE',
  },
  {
    id: 1,
    label: '2. Cosmic Time: A Single Second',
    shortLabel: '10¹⁷ · 1 Second',
    exponentStr: '10¹⁷',
    probabilityFraction: '1 in 4.35 × 10¹⁷',
    analogy: 'The universe is 13.8 billion years old (4.35 × 10¹⁷ seconds).',
    comparisonTitle: 'Guessing the exact 1-second interval when someone blinked',
    comparisonBody: 'Every single second that has ticked since the Big Bang across 13.8 billion years.',
    accentColor: '#60A5FA',
    badge: 'CHRONOLOGICAL SCALE',
  },
  {
    id: 2,
    label: '3. Terrestrial Matter: Glass of Water',
    shortLabel: '10²³ · Molecules',
    exponentStr: '10²³',
    probabilityFraction: '1 in 6.022 × 10²³',
    analogy: "Avogadro's number: molecules in an 18 mL sip of water.",
    comparisonTitle: 'Picking one marked molecule out of a glass of water',
    comparisonBody: 'There are more molecules in a single glass of water than glasses of water in all oceans on Earth.',
    accentColor: '#34D399',
    badge: 'MOLECULAR SCALE',
  },
  {
    id: 3,
    label: '4. The Observable Cosmos: Single Proton',
    shortLabel: '10⁸⁰ · All Atoms',
    exponentStr: '10⁸⁰',
    probabilityFraction: '1 in 10⁸⁰',
    analogy: "Eddington's Number: total subatomic particles in all 2 trillion observable galaxies.",
    comparisonTitle: 'Selecting one designated proton out of the entire cosmos',
    comparisonBody: 'Blindfolded on the first try, finding one pre-marked particle across all observable space.',
    accentColor: '#FBBF24',
    badge: 'ALL MATTER IN UNIVERSE',
  },
  {
    id: 4,
    label: '5. Gravitational Horizon: Universal Black Hole',
    shortLabel: '10¹²³ · Black Holes',
    exponentStr: '10¹²³',
    probabilityFraction: '1 in 10¹²³',
    analogy: 'Maximum Bekenstein-Hawking entropy if all matter collapsed into universal black holes.',
    comparisonTitle: 'A 1 followed by 123 zeros',
    comparisonBody: 'This exponent alone (10¹²³) is 43 orders of magnitude larger than all particles in existence.',
    accentColor: '#F87171',
    badge: 'MAXIMUM GRAVITATIONAL ENTROPY',
  },
  {
    id: 5,
    label: "6. Penrose's Number: The Initial Pinpoint",
    shortLabel: '10¹⁰¹²³ · Penrose Pin',
    exponentStr: '10¹⁰¹²³',
    probabilityFraction: '1 in 10¹⁰¹²³',
    analogy: 'Penrose Phase Space Volume: P = 1 / 10¹⁰¹²³ required for our low-entropy Big Bang.',
    comparisonTitle: 'The Creator with a Pin (The Double Exponent)',
    comparisonBody: 'A 1 followed by 10¹²³ zeros. There are not enough physical particles in the entire cosmos to write down the zeros of this number.',
    accentColor: '#EC4899',
    badge: 'THE IMPOSSIBLE PINPOINT',
  },
];

// -------------------------------------------------------------
// HOURGLASS GEOMETRY & PARTICLES (Option D: Cosmic Battery)
// -------------------------------------------------------------
function getHourglassRadius(y: number): number {
  const u = Math.min(1, Math.abs(y) / 0.85);
  return 0.14 + 0.34 * Math.sin(Math.pow(u, 0.78) * Math.PI);
}

interface ThermodynamicParticle {
  id: number;
  departureThreshold: number;
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
    const departureThreshold = i / count;
    const topY = 0.28 + ((i * 13) % 45) * 0.011;
    const topRadiusRatio = 0.18 + ((i * 29) % 65) * 0.01;
    const topAngle = i * 2.39996;
    const botY = -0.28 - ((i * 17) % 45) * 0.011;
    const botRadiusRatio = 0.22 + ((i * 37) % 65) * 0.01;
    const botAngle = i * 1.61803;

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
  minimal = false,
}: EntropyVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active View Mode: 'battery' (Option D: Physics Engine) vs 'odds' (Option C: Impossible Scale Ladder)
  const [viewMode, setViewMode] = useState<'battery' | 'odds'>('battery');
  const [activeRungIndex, setActiveRungIndex] = useState<number>(5); // Default to Penrose Pin on ladder
  const [isTouring, setIsTouring] = useState<boolean>(false);

  // Animation & simulation refs
  const animFrameRef = useRef<number | null>(null);
  const valueRef = useRef<number>(value);
  const minimalRef = useRef<boolean>(minimal);
  const isPlayingRef = useRef<boolean>(true);
  const lastTimeRef = useRef<number>(0);
  const viewModeRef = useRef<'battery' | 'odds'>('battery');
  const activeRungRef = useRef<number>(5);

  // Battery charge level: 1.0 (100% full) -> 0.0 (0% depleted)
  const batteryLevelRef = useRef<number>(1.0);
  const rechargeAnimRef = useRef<number>(0);
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

  // Keep refs synchronized
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    minimalRef.current = minimal;
  }, [minimal]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    activeRungRef.current = activeRungIndex;
  }, [activeRungIndex]);

  // Auto-tour ladder effect when active (3s per rung)
  useEffect(() => {
    if (!isTouring || viewMode !== 'odds') return;
    const interval = setInterval(() => {
      setActiveRungIndex((prev) => (prev + 1) % SCALE_LADDER_RUNGS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isTouring, viewMode]);

  // Regimes analysis based on Goldilocks slider values [0.1 .. 10.0]
  const isFreeze = value < 0.5;
  const isGoldilocks = value >= 0.5 && value <= 1.5;
  const isChaos = value > 1.5;

  // Dynamic Theme Colors & Copy for Option D
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

  const activeRung = SCALE_LADDER_RUNGS[activeRungIndex];

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

    let lastBatteryUpdate = 0;

    const render = (now: number) => {
      const dt = Math.min(0.06, (now - lastTimeRef.current) * 0.001);
      lastTimeRef.current = now;

      if (!isDraggingRef.current) {
        yawRef.current += 0.003;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * (minimalRef.current ? 0.48 : 0.44);
      const yaw = yawRef.current;
      const pitch = pitchRef.current;

      const mode = viewModeRef.current;

      // ==============================================================
      // RENDER OPTION C: THE IMPOSSIBLE ODDS (SCALE LADDER)
      // ==============================================================
      if (mode === 'odds') {
        const rungIdx = activeRungRef.current;

        ctx.save();

        if (rungIdx === 0) {
          // RUNG 0: THE LOTTERY (1 in 10^7) - Matrix of cards with 1 golden ticket
          const rows = 9;
          const cols = 14;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const x = cx + (c - cols / 2 + 0.5) * 18;
              const y = cy + (r - rows / 2 + 0.5) * 18;
              const isWin = r === 4 && c === 7;

              if (isWin) {
                // Golden Ticket
                ctx.beginPath();
                ctx.roundRect(x - 9, y - 6, 18, 12, 2);
                ctx.fillStyle = '#FDE047';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // Golden Glow Corona
                const gGrad = ctx.createRadialGradient(x, y, 0, x, y, 24);
                gGrad.addColorStop(0, 'rgba(253, 224, 71, 0.6)');
                gGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
                ctx.beginPath();
                ctx.arc(x, y, 24, 0, Math.PI * 2);
                ctx.fillStyle = gGrad;
                ctx.fill();
              } else {
                ctx.beginPath();
                ctx.roundRect(x - 6, y - 4, 12, 8, 1.5);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.fill();
              }
            }
          }
        } else if (rungIdx === 1) {
          // RUNG 1: COSMIC CHRONOLOGY (1 in 10^17) - Timeline with scanning laser
          const ribbonLen = scale * 1.5;
          const ribbonY = cy;

          ctx.beginPath();
          ctx.moveTo(cx - ribbonLen / 2, ribbonY);
          ctx.lineTo(cx + ribbonLen / 2, ribbonY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Timeline ticks
          const ticks = 14;
          for (let t = 0; t <= ticks; t++) {
            const tx = cx - ribbonLen / 2 + (t / ticks) * ribbonLen;
            ctx.beginPath();
            ctx.moveTo(tx, ribbonY - 6);
            ctx.lineTo(tx, ribbonY + 6);
            ctx.strokeStyle = t === 0 || t === ticks ? '#38BDF8' : 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = t === 0 || t === ticks ? 1.5 : 0.8;
            ctx.stroke();
          }

          // Laser Needle targeting 1 second
          const targetX = cx - ribbonLen / 2 + (0.68) * ribbonLen;
          ctx.beginPath();
          ctx.moveTo(targetX, ribbonY - 32);
          ctx.lineTo(targetX, ribbonY + 32);
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(targetX, ribbonY, 5 + Math.sin(now * 0.008) * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#60A5FA';
          ctx.fill();
        } else if (rungIdx === 2) {
          // RUNG 2: AVOGADRO MOLECULAR LATTICE (1 in 10^23) - Water droplet lattice
          const molCount = 48;
          for (let i = 0; i < molCount; i++) {
            const u = (i * 2.39996);
            const r = Math.sqrt((i + 0.5) / molCount) * (scale * 0.65);
            const mx = cx + r * Math.cos(u + now * 0.0004);
            const my = cy + r * Math.sin(u + now * 0.0004);
            const isTarget = i === 18;

            if (isTarget) {
              ctx.beginPath();
              ctx.arc(mx, my, 6, 0, Math.PI * 2);
              ctx.fillStyle = '#34D399';
              ctx.fill();
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(mx, my, 16 + Math.sin(now * 0.006) * 3, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
              ctx.lineWidth = 1.0;
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
              ctx.fill();
            }
          }
        } else if (rungIdx === 3) {
          // RUNG 3: ALL ATOMS IN OBSERVABLE UNIVERSE (1 in 10^80) - Cosmic web & proton beacon
          const stars = 70;
          for (let i = 0; i < stars; i++) {
            const a = i * 1.61803;
            const dist = Math.pow(i / stars, 0.7) * (scale * 0.85);
            const sx = cx + dist * Math.cos(a + yaw);
            const sy = cy + dist * Math.sin(a * 0.8 + pitch);

            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fill();
          }

          // Single Target Proton Beacon
          ctx.beginPath();
          ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FBBF24';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Concentric Quantum Waves
          for (let w = 1; w <= 3; w++) {
            const waveR = 8 + ((now * 0.03 + w * 12) % 36);
            ctx.beginPath();
            ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0, 1 - waveR / 36) * 0.6})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        } else if (rungIdx === 4) {
          // RUNG 4: BLACK HOLE HORIZON ENTROPY (1 in 10^123)
          const bhR = scale * 0.36;
          // Accretion disk
          const diskGrad = ctx.createRadialGradient(cx, cy, bhR * 0.8, cx, cy, bhR * 2.2);
          diskGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          diskGrad.addColorStop(0.6, 'rgba(185, 28, 28, 0.35)');
          diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.ellipse(cx, cy, bhR * 2.2, bhR * 0.75, -0.25, 0, Math.PI * 2);
          ctx.fillStyle = diskGrad;
          ctx.fill();

          // Black Hole Void
          ctx.beginPath();
          ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
          ctx.fillStyle = '#03040B';
          ctx.fill();

          // Luminous Photon Sphere
          ctx.beginPath();
          ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
          ctx.strokeStyle = '#F87171';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        } else {
          // RUNG 5: PENROSE'S CREATOR PINPOINT (1 in 10^10^123)
          // 3D Phase Space Reticle & Targeting Pin
          const reticleR = scale * 0.52;

          // Crosshairs
          ctx.beginPath();
          ctx.moveTo(cx - reticleR * 1.2, cy);
          ctx.lineTo(cx + reticleR * 1.2, cy);
          ctx.moveTo(cx, cy - reticleR * 1.2);
          ctx.lineTo(cx, cy + reticleR * 1.2);
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Concentric Exponential Reticle Rings
          for (let r = 1; r <= 4; r++) {
            ctx.beginPath();
            ctx.arc(cx, cy, (reticleR * r) / 4, 0, Math.PI * 2);
            ctx.strokeStyle = r === 4 ? '#EC4899' : 'rgba(236, 72, 153, 0.2)';
            ctx.lineWidth = r === 4 ? 1.2 : 0.6;
            ctx.stroke();
          }

          // Targeting Needle / Pin
          const pinAngle = -Math.PI / 4;
          const pinLen = scale * 0.65;
          const pinEndX = cx;
          const pinEndY = cy;
          const pinStartX = cx + Math.cos(pinAngle) * pinLen;
          const pinStartY = cy + Math.sin(pinAngle) * pinLen;

          ctx.beginPath();
          ctx.moveTo(pinStartX, pinStartY);
          ctx.lineTo(pinEndX, pinEndY);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.0;
          ctx.stroke();

          // Microscopic Pinpoint Glow (1 / 10^10^123)
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          const pulseGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
          pulseGlow.addColorStop(0, 'rgba(236, 72, 153, 0.9)');
          pulseGlow.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.beginPath();
          ctx.arc(cx, cy, 18, 0, Math.PI * 2);
          ctx.fillStyle = pulseGlow;
          ctx.fill();
        }

        ctx.restore();
      }

      // ==============================================================
      // RENDER OPTION D: COSMIC BATTERY (HOURGLASS & 3 TIERS)
      // ==============================================================
      else {
        const curVal = valueRef.current;
        const curFreeze = Math.max(0, Math.min(1, (0.5 - curVal) / 0.4));
        const curChaos = Math.max(0, Math.min(1, (curVal - 1.5) / 8.5));

        if (rechargeAnimRef.current > 0) {
          rechargeAnimRef.current = Math.max(0, rechargeAnimRef.current - dt * 1.5);
          if (rechargeAnimRef.current === 0) {
            setIsRecharging(false);
          }
        }

        if (rechargePulseRef.current > 0) {
          rechargePulseRef.current = Math.max(0, rechargePulseRef.current - dt * 1.8);
        }

        if (isPlayingRef.current && rechargeAnimRef.current === 0) {
          if (curFreeze > 0) {
            batteryLevelRef.current = 1.0;
          } else if (curChaos > 0.4) {
            batteryLevelRef.current = 0.0;
          } else {
            const dischargeSpeed = 1.0 / 22.0;
            batteryLevelRef.current = Math.max(0.0, batteryLevelRef.current - dt * dischargeSpeed);
          }
        }

        const batteryLvl = curChaos > 0.4 ? 0.0 : curFreeze > 0 ? 1.0 : batteryLevelRef.current;

        ctx.save();

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

        // Contour Rings
        const ringHeights = [-0.85, -0.65, -0.45, -0.22, 0.0, 0.22, 0.45, 0.65, 0.85];
        const segments = 32;

        for (const yH of ringHeights) {
          const rH = getHourglassRadius(yH);
          const isNeck = Math.abs(yH) < 0.05;
          const isTop = yH > 0;

          for (let i = 0; i < segments; i++) {
            const a1 = (i / segments) * Math.PI * 2;
            const a2 = ((i + 1) / segments) * Math.PI * 2;

            const p1 = project3D(rH * Math.cos(a1), yH, rH * Math.sin(a1), yaw, pitch, cx, cy, scale);
            const p2 = project3D(rH * Math.cos(a2), yH, rH * Math.sin(a2), yaw, pitch, cx, cy, scale);

            const isFront = (p1.zDepth + p2.zDepth) / 2 > 0;

            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);

            let strokeColor = isTop
              ? isFront ? 'rgba(111, 228, 177, 0.55)' : 'rgba(111, 228, 177, 0.14)'
              : isFront ? 'rgba(129, 140, 248, 0.45)' : 'rgba(129, 140, 248, 0.12)';

            if (curChaos > 0.4) {
              strokeColor = isFront ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.12)';
            } else if (curFreeze > 0.3) {
              strokeColor = isFront ? 'rgba(168, 85, 247, 0.45)' : 'rgba(168, 85, 247, 0.12)';
            }

            if (isNeck) {
              strokeColor = curChaos > 0.3 ? 'rgba(239, 68, 68, 0.7)' : batteryLvl > 0.02 ? 'rgba(252, 211, 77, 0.85)' : 'rgba(255, 255, 255, 0.25)';
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

        // Vertical glass ribs
        const ribAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        for (const phi of ribAngles) {
          for (let s = 0; s < 24; s++) {
            const y1 = -0.85 + (1.7 * s) / 24;
            const y2 = -0.85 + (1.7 * (s + 1)) / 24;
            const p1 = project3D(getHourglassRadius(y1) * Math.cos(phi), y1, getHourglassRadius(y1) * Math.sin(phi), yaw, pitch, cx, cy, scale);
            const p2 = project3D(getHourglassRadius(y2) * Math.cos(phi), y2, getHourglassRadius(y2) * Math.sin(phi), yaw, pitch, cx, cy, scale);

            const isFront = (p1.zDepth + p2.zDepth) / 2 > 0;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.strokeStyle = isFront ? (curChaos > 0.4 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(111, 228, 177, 0.35)') : 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = isFront ? 0.9 : 0.5;
            ctx.stroke();
          }
        }

        ctx.setLineDash([]);
        ctx.restore();

        // Tier 1: Gas Cloud
        const tier1Proj = project3D(0, 0.18, 0, yaw, pitch, cx, cy, scale);
        if (curChaos < 0.6 && curFreeze < 0.7 && batteryLvl > 0.02) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(tier1Proj.sx, tier1Proj.sy, 12 * tier1Proj.depthFactor, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.stroke();
          ctx.restore();
        }

        // Tier 2: Stellar Furnace
        const neckProj = project3D(0, 0, 0, yaw, pitch, cx, cy, scale);
        ctx.save();
        if (curChaos < 0.4 && curFreeze < 0.5 && (batteryLvl > 0.02 || rechargeAnimRef.current > 0)) {
          const coreR = (7.5 + Math.sin(now * 0.006) * 1.5) * neckProj.depthFactor;
          const starGrad = ctx.createRadialGradient(neckProj.sx, neckProj.sy, 0, neckProj.sx, neckProj.sy, coreR * 2.8);
          starGrad.addColorStop(0, '#FFFFFF');
          starGrad.addColorStop(0.3, '#FDE047');
          starGrad.addColorStop(0.7, 'rgba(251, 146, 60, 0.65)');
          starGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.beginPath();
          ctx.arc(neckProj.sx, neckProj.sy, coreR * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = starGrad;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(neckProj.sx, neckProj.sy, 4 * neckProj.depthFactor, 0, Math.PI * 2);
          ctx.fillStyle = curChaos > 0.4 ? '#7F1D1D' : '#334155';
          ctx.fill();
        }
        ctx.restore();

        // Tier 3: Biosphere Ring
        const tier3Proj = project3D(0, -0.18, 0, yaw, pitch, cx, cy, scale);
        if (curChaos < 0.3 && curFreeze < 0.4 && batteryLvl > 0.02) {
          ctx.save();
          const ringR = 14 * tier3Proj.depthFactor;
          ctx.beginPath();
          ctx.ellipse(tier3Proj.sx, tier3Proj.sy, ringR, ringR * 0.45, yaw, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(111, 228, 177, 0.85)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        }

        // Bottom Black Hole
        const sinkProj = project3D(0, -0.58, 0, yaw, pitch, cx, cy, scale);
        ctx.save();
        const spentFactor = 1.0 - batteryLvl;
        const bhRadius = (10 + curChaos * 16 + spentFactor * 5) * sinkProj.depthFactor;
        ctx.beginPath();
        ctx.arc(sinkProj.sx, sinkProj.sy, bhRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#03040B';
        ctx.fill();
        ctx.strokeStyle = curChaos > 0.4 ? '#F87171' : '#A5B4FC';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();

        // Render Particles
        const dischargeProgress = 1.0 - batteryLvl;
        const rechargeSurge = rechargeAnimRef.current;
        const projectedParticles: Array<{ sx: number; sy: number; zDepth: number; radius: number; color: string }> = [];

        for (let i = 0; i < STATIC_PARTICLES.length; i++) {
          const p = STATIC_PARTICLES[i];
          let curX = 0, curY = 0, curZ = 0, pColor = '#38BDF8';

          if (curChaos > 0.4) {
            const rSink = getHourglassRadius(p.botY) * p.botRadiusRatio;
            curX = rSink * Math.cos(p.botAngle + now * 0.002);
            curY = p.botY;
            curZ = rSink * Math.sin(p.botAngle + now * 0.002);
            pColor = '#F87171';
          } else if (rechargeSurge > 0) {
            const surgeT = 1.0 - rechargeSurge;
            const pSurge = Math.max(0, Math.min(1, surgeT * 1.5 - (p.id / 72) * 0.4));
            const y = p.botY + (p.topY - p.botY) * pSurge;
            const rChamber = getHourglassRadius(y) * (0.3 + 0.5 * Math.sin(pSurge * Math.PI));
            curX = rChamber * Math.cos(p.topAngle + (1 - pSurge) * 4.0);
            curY = y;
            curZ = rChamber * Math.sin(p.topAngle + (1 - pSurge) * 4.0);
            pColor = '#6FE4B1';
          } else if (dischargeProgress < p.departureThreshold) {
            const rTop = getHourglassRadius(p.topY) * p.topRadiusRatio;
            curX = rTop * Math.cos(p.topAngle + now * 0.0008);
            curY = p.topY;
            curZ = rTop * Math.sin(p.topAngle + now * 0.0008);
            pColor = '#38BDF8';
          } else {
            const transitProgress = Math.min(1.0, (dischargeProgress - p.departureThreshold) / 0.18);
            if (transitProgress < 1.0) {
              const y = p.topY + (p.botY - p.topY) * transitProgress;
              const rChamber = getHourglassRadius(y) * (0.2 + 0.6 * (1.0 - Math.sin(transitProgress * Math.PI) * 0.6));
              curX = rChamber * Math.cos(p.topAngle + transitProgress * 3.0 + now * 0.001);
              curY = y;
              curZ = rChamber * Math.sin(p.topAngle + transitProgress * 3.0 + now * 0.001);
              pColor = Math.abs(y) < 0.12 ? '#FDE047' : '#6FE4B1';
            } else {
              const rSink = getHourglassRadius(p.botY) * p.botRadiusRatio;
              curX = rSink * Math.cos(p.botAngle + now * 0.0015);
              curY = p.botY;
              curZ = rSink * Math.sin(p.botAngle + now * 0.0015);
              pColor = '#818CF8';
            }
          }

          const proj = project3D(curX, curY, curZ, yaw, pitch, cx, cy, scale);
          projectedParticles.push({
            sx: proj.sx,
            sy: proj.sy,
            zDepth: proj.zDepth,
            radius: p.size * proj.depthFactor,
            color: pColor,
          });
        }

        projectedParticles.sort((a, b) => a.zDepth - b.zDepth);

        for (const p of projectedParticles) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        if (now - lastBatteryUpdate > 80) {
          lastBatteryUpdate = now;
          const currentPercent = curChaos > 0.4 ? 0 : curFreeze > 0 ? 100 : Math.round(batteryLevelRef.current * 100);
          setBatteryDisplay(currentPercent);
        }
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

  // Pointer drag to orbit 3D view
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

  const handleRecharge = useCallback(() => {
    batteryLevelRef.current = 1.0;
    rechargeAnimRef.current = 1.0;
    rechargePulseRef.current = 1.0;
    setIsRecharging(true);
    setBatteryDisplay(100);
  }, []);

  const handleToggleTour = useCallback(() => {
    setIsTouring((prev) => {
      const next = !prev;
      if (next) {
        // If at the end of the ladder (Rung 5), wrap around to 0 immediately so user doesn't wait!
        setActiveRungIndex((cur) => (cur === SCALE_LADDER_RUNGS.length - 1 ? 0 : cur));
      }
      return next;
    });
  }, []);

  const handlePrevRung = useCallback(() => {
    setIsTouring(false);
    setActiveRungIndex((cur) => (cur - 1 + SCALE_LADDER_RUNGS.length) % SCALE_LADDER_RUNGS.length);
  }, []);

  const handleNextRung = useCallback(() => {
    setIsTouring(false);
    setActiveRungIndex((cur) => (cur + 1) % SCALE_LADDER_RUNGS.length);
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
        background: minimal
          ? 'transparent'
          : 'radial-gradient(circle at center, rgba(14, 18, 36, 0.75) 0%, rgba(3, 4, 12, 0.96) 100%)',
        borderRadius: minimal ? 0 : 10,
        border: 'none',
        boxShadow: 'none',
        userSelect: 'none',
      }}
      aria-label={
        minimal
          ? 'Entropy Visual'
          : viewMode === 'battery'
            ? `3D Cosmic Hourglass & Thermodynamic Battery: ${theme.title}. ${theme.subhead}`
            : `The Impossible Odds: Scale Ladder at ${activeRung.label}. Probability ${activeRung.probabilityFraction}.`
      }
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
            onClick={() => {
              setViewMode('battery');
              setIsTouring(false);
            }}
            style={{
              background: viewMode === 'battery' ? 'rgba(111, 228, 177, 0.18)' : 'transparent',
              border: viewMode === 'battery' ? '1px solid #6FE4B1' : '1px solid transparent',
              color: viewMode === 'battery' ? '#6FE4B1' : 'var(--ink-soft)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              fontWeight: viewMode === 'battery' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ⧖ Cosmic Battery (Physics)
          </button>

          <button
            type="button"
            onClick={() => setViewMode('odds')}
            style={{
              background: viewMode === 'odds' ? 'rgba(236, 72, 153, 0.22)' : 'transparent',
              border: viewMode === 'odds' ? '1px solid #EC4899' : '1px solid transparent',
              color: viewMode === 'odds' ? '#F472B6' : 'var(--ink-soft)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              fontWeight: viewMode === 'odds' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ⇪ The Impossible Odds (Scale Ladder)
          </button>
        </div>
      )}

      {/* VIEW MODE 1: OPTION D (COSMIC BATTERY) OVERLAYS */}
      {!minimal && viewMode === 'battery' && (
        <>
          {/* Top HUD */}
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

          {/* 3 Complexity Tiers */}
          {!isCompact && (
            <div
              style={{
                position: 'absolute',
                left: 18,
                top: '52%',
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

          {/* Interactive Controls */}
          {!isCompact && (
            <div
              style={{
                position: 'absolute',
                right: 18,
                top: 130,
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

          {/* Bottom Reference Zone Track */}
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

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9.5,
                  marginTop: 6,
                }}
              >
                <span style={{ color: isFreeze ? '#A855F7' : 'var(--ink-faint)', fontWeight: isFreeze ? 600 : 400 }}>
                  0.1 S/k Frozen Order (No Gradients)
                </span>
                <span style={{ color: isGoldilocks ? '#6FE4B1' : 'var(--ink-faint)', fontWeight: isGoldilocks ? 600 : 400 }}>
                  1.0 S/k Goldilocks (100% Battery)
                </span>
                <span style={{ color: isChaos ? '#EF4444' : 'var(--ink-faint)', fontWeight: isChaos ? 600 : 400 }}>
                  10.0 S/k Thermal Death (Depleted)
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 2: OPTION C (THE IMPOSSIBLE ODDS / SCALE LADDER) OVERLAYS */}
      {!minimal && viewMode === 'odds' && (
        <>
          {/* Top Info for Active Rung */}
          <div
            style={{
              position: 'absolute',
              top: isCompact ? 0 : 44,
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
            <div style={{ maxWidth: '62%' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10,
                  fontFamily: 'var(--f-mono)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: activeRung.accentColor,
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: activeRung.accentColor,
                    boxShadow: `0 0 8px ${activeRung.accentColor}`,
                  }}
                />
                {activeRung.badge}
              </div>

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
                {activeRung.label}
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
                {activeRung.comparisonBody}
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                color: 'var(--ink-soft)',
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: activeRung.accentColor }}>
                {activeRung.probabilityFraction}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 2 }}>
                Scale Exponent: <span style={{ color: '#FFFFFF' }}>{activeRung.exponentStr}</span>
              </div>
            </div>
          </div>

          {/* Keyframe animation for tour progress bar */}
          <style>{`
            @keyframes tourProgressBar {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>

          {/* Tour Controls (Top Right under telemetry) */}
          <div
            style={{
              position: 'absolute',
              right: isCompact ? 12 : 18,
              top: isCompact ? 72 : 92,
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {/* Step Backward Button */}
            <button
              type="button"
              onClick={handlePrevRung}
              aria-label="Previous scale rung"
              title="Previous scale tier (◀)"
              style={{
                background: 'rgba(13, 14, 32, 0.85)',
                border: '1px solid var(--hair-2)',
                borderRadius: 6,
                color: 'var(--ink-soft)',
                padding: '5px 8px',
                fontSize: 10,
                fontFamily: 'var(--f-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              ◀
            </button>

            {/* Auto-Tour Toggle Button with animated progress bar */}
            <button
              type="button"
              onClick={handleToggleTour}
              aria-label={isTouring ? 'Stop ladder tour' : 'Start scale ladder auto-tour'}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: isTouring ? 'rgba(236, 72, 153, 0.22)' : 'rgba(13, 14, 32, 0.85)',
                border: isTouring ? '1.5px solid #EC4899' : '1px solid var(--hair-2)',
                borderRadius: 6,
                color: isTouring ? '#F472B6' : 'var(--ink-soft)',
                padding: '5px 10px',
                fontSize: 10.5,
                fontFamily: 'var(--f-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: isTouring ? '0 0 10px rgba(236, 72, 153, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {isTouring && (
                <span
                  key={`tour-fill-${activeRungIndex}`}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2.5,
                    background: activeRung.accentColor,
                    boxShadow: `0 0 6px ${activeRung.accentColor}`,
                    animation: 'tourProgressBar 3000ms linear forwards',
                  }}
                />
              )}
              <span>{isTouring ? '⏸ Pause' : '▶ Auto-Tour'}</span>
              <span style={{ fontSize: 9.5, opacity: isTouring ? 0.9 : 0.6, color: isTouring ? '#FFFFFF' : 'var(--ink-faint)' }}>
                {activeRungIndex + 1}/6
              </span>
            </button>

            {/* Step Forward Button */}
            <button
              type="button"
              onClick={handleNextRung}
              aria-label="Next scale rung"
              title="Next scale tier (▶)"
              style={{
                background: 'rgba(13, 14, 32, 0.85)',
                border: '1px solid var(--hair-2)',
                borderRadius: 6,
                color: 'var(--ink-soft)',
                padding: '5px 8px',
                fontSize: 10,
                fontFamily: 'var(--f-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              ▶
            </button>
          </div>

          {/* Penrose Ink Shortage Telemetry Callout (Only on Rung 5) */}
          {activeRungIndex === 5 && (
            <div
              style={{
                position: 'absolute',
                left: 18,
                bottom: 64,
                maxWidth: 320,
                background: 'rgba(13, 14, 32, 0.75)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: '#EC4899', fontWeight: 600 }}>
                MATTER BUDGET DEFICIT
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 2, lineHeight: 1.35 }}>
                Zeros required: <strong>10¹²³</strong> | Particles in entire cosmos: <strong>10⁸⁰</strong>.
                Even writing the decimal zeros requires 10⁴³× more atoms than exist.
              </div>
            </div>
          )}

          {/* BOTTOM INTERACTIVE LADDER RUNGS (6 TIERS) */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 14,
              right: 14,
              display: 'flex',
              gap: 4,
              zIndex: 3,
            }}
          >
            {SCALE_LADDER_RUNGS.map((rung, idx) => {
              const isSelected = activeRungIndex === idx;
              return (
                <button
                  key={rung.id}
                  type="button"
                  onClick={() => {
                    setActiveRungIndex(idx);
                    setIsTouring(false);
                  }}
                  aria-label={`Select scale rung: ${rung.label}`}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    flex: 1,
                    background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(10, 12, 28, 0.75)',
                    border: isSelected ? `1.5px solid ${rung.accentColor}` : '1px solid var(--hair-2)',
                    borderRadius: 6,
                    padding: '6px 4px',
                    color: isSelected ? '#FFFFFF' : 'var(--ink-soft)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    boxShadow: isSelected ? `0 0 8px ${rung.accentColor}` : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isTouring && isSelected && (
                    <span
                      key={`rung-progress-${idx}`}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: 2,
                        background: rung.accentColor,
                        boxShadow: `0 0 4px ${rung.accentColor}`,
                        animation: 'tourProgressBar 3000ms linear forwards',
                      }}
                    />
                  )}
                  <span style={{ fontSize: 8.5, fontFamily: 'var(--f-mono)', color: rung.accentColor, fontWeight: 600 }}>
                    {rung.exponentStr}
                  </span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--f-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {idx === 0 ? 'Lottery' : idx === 1 ? '1 Second' : idx === 2 ? 'Water' : idx === 3 ? '1 Proton' : idx === 4 ? 'Black Hole' : 'Penrose Pin'}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
