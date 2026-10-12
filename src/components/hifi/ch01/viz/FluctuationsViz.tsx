'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

export type FluctuationsVizProps = {
  value?: number;
  className?: string;
};

// -------------------------------------------------------------
// COSMIC WEB SEED NODES & FILAMENTS (Option A)
// -------------------------------------------------------------
export interface CosmicNode {
  id: number;
  x: number;
  y: number;
  z: number;
  mass: number;
  name: string;
}

export const COSMIC_NODES: CosmicNode[] = [
  { id: 0, x: 0.0, y: 0.1, z: 0.05, mass: 1.8, name: 'Great Attractor / Laniakea Supercluster' },
  { id: 1, x: -0.48, y: 0.35, z: -0.25, mass: 1.4, name: 'Perseus-Pisces Supercluster' },
  { id: 2, x: 0.52, y: -0.28, z: 0.32, mass: 1.3, name: 'Shapley Concentration' },
  { id: 3, x: -0.38, y: -0.42, z: 0.18, mass: 1.2, name: 'Coma Filament Core' },
  { id: 4, x: 0.42, y: 0.45, z: -0.35, mass: 1.1, name: 'Hercules Supercluster Node' },
  { id: 5, x: 0.12, y: -0.58, z: -0.28, mass: 0.9, name: 'Centaurus Node' },
  { id: 6, x: -0.62, y: -0.15, z: -0.42, mass: 0.9, name: 'Hydra Void Boundary' },
  { id: 7, x: 0.65, y: 0.18, z: 0.45, mass: 0.85, name: 'Vela Supercluster Outpost' },
];

export const FILAMENT_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 7],
  [3, 6],
  [4, 7],
  [5, 6],
];

// Deterministic particles generated along nodes, filaments, and random void volumes
export interface WebParticle {
  id: number;
  initialX: number;
  initialY: number;
  initialZ: number;
  nodeIndex: number;
  edgeIndex: number;
  edgeT: number;
  jitterX: number;
  jitterY: number;
  jitterZ: number;
  phase: number;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
}

function generateDeterministicWebParticles(count = 280): WebParticle[] {
  const list: WebParticle[] = [];
  for (let i = 0; i < count; i++) {
    // Distribute 45% along filaments, 35% around cluster nodes, 20% in voids
    const category = i % 10;
    const nodeIndex = i % COSMIC_NODES.length;
    const edgeIndex = i % FILAMENT_EDGES.length;
    const edgeT = ((i * 17) % 100) / 100;

    const angle = i * 2.39996;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const rVoid = 0.35 + ((i * 13) % 45) * 0.012;

    const initialX = rVoid * Math.sin(phi) * Math.cos(angle);
    const initialY = rVoid * Math.sin(phi) * Math.sin(angle);
    const initialZ = rVoid * Math.cos(phi);

    const jitterX = (((i * 29) % 50) - 25) * 0.003;
    const jitterY = (((i * 43) % 50) - 25) * 0.003;
    const jitterZ = (((i * 61) % 50) - 25) * 0.003;

    list.push({
      id: i,
      initialX,
      initialY,
      initialZ,
      nodeIndex,
      edgeIndex,
      edgeT,
      jitterX,
      jitterY,
      jitterZ,
      phase: i * 0.13,
      orbitRadius: 0.05 + ((i * 7) % 25) * 0.004,
      orbitSpeed: 0.8 + ((i * 11) % 15) * 0.1,
      size: category < 2 ? 2.4 : 1.4 + ((i * 3) % 10) * 0.1,
    });
  }
  return list;
}

const STATIC_WEB_PARTICLES = generateDeterministicWebParticles();

// -------------------------------------------------------------
// COSMIC EPOCHS
// -------------------------------------------------------------
export interface CosmicEpoch {
  id: number;
  label: string;
  redshift: string;
  age: string;
  description: string;
}

export const COSMIC_EPOCHS: CosmicEpoch[] = [
  {
    id: 0,
    label: 'Big Bang CMB (z ≈ 1100)',
    redshift: 'z ≈ 1100',
    age: '380,000 yrs',
    description: 'Quantum vacuum ripples stretched by inflation imprint tiny temperature fluctuations (ΔT/T ≈ 10⁻⁵) on the primordial plasma.',
  },
  {
    id: 1,
    label: 'Cosmic Dark Ages (z ≈ 30)',
    redshift: 'z ≈ 30',
    age: '100 Myr',
    description: 'Overdensities begin gravitational decoupling from cosmic expansion. Gas starts flowing along emerging dark matter valleys.',
  },
  {
    id: 2,
    label: 'Cosmic Dawn & Reionization (z ≈ 6)',
    redshift: 'z ≈ 6',
    age: '900 Myr',
    description: 'First generation (Population III) stars ignite. Ionizing UV radiation clears neutral hydrogen; glowing filaments light up.',
  },
  {
    id: 3,
    label: 'Modern Cosmic Web (Today, z = 0)',
    redshift: 'z = 0',
    age: '13.8 Gyr',
    description: 'Grand filamentary architecture: sprawling galaxy clusters connected by bridges of warm-hot gas, separated by immense cosmic voids.',
  },
];

// -------------------------------------------------------------
// GRAVITATIONAL WELL TEST PARTICLES (Option C)
// -------------------------------------------------------------
interface WellTestParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  history: [number, number][];
  active: boolean;
  color: string;
}

function createWellTestParticle(index: number): WellTestParticle {
  const angle = (index / 16) * Math.PI * 2;
  const dist = 0.75 + (index % 4) * 0.08;
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;
  const speed = 0.35 + (index % 3) * 0.08;
  // Perpendicular velocity for orbital motion
  const vx = -Math.sin(angle) * speed;
  const vy = Math.cos(angle) * speed;

  const colors = ['#6FE4B1', '#38BDF8', '#FDE047', '#A78BFA'];
  return {
    x,
    y,
    vx,
    vy,
    history: [],
    active: true,
    color: colors[index % colors.length],
  };
}

export function FluctuationsViz({
  value = 0.2,
  className = '',
}: FluctuationsVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tab View Mode: 'web' (Option A: Matter Cosmic Web) vs 'wells' (Option C: Spacetime Gravity Wells)
  const [viewMode, setViewMode] = useState<'web' | 'wells'>('web');
  const [selectedEpochIndex, setSelectedEpochIndex] = useState<number>(3); // Default to Present Day (z = 0)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Refs for animation loop
  const animFrameRef = useRef<number | null>(null);
  const valueRef = useRef<number>(value);
  const isPlayingRef = useRef<boolean>(true);
  const lastTimeRef = useRef<number>(0);
  const viewModeRef = useRef<'web' | 'wells'>('web');
  const epochProgressRef = useRef<number>(1.0); // 0.0 (Big Bang) -> 1.0 (Today)
  const targetEpochProgressRef = useRef<number>(1.0);

  // 3D Camera rotation
  const yawRef = useRef<number>(0.42);
  const pitchRef = useRef<number>(0.32);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({
    x: 0,
    y: 0,
    yaw: 0.42,
    pitch: 0.32,
  });

  // Potential Well Particles
  const wellParticlesRef = useRef<WellTestParticle[]>(
    Array.from({ length: 16 }, (_, i) => createWellTestParticle(i))
  );

  // Sync state to refs
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    targetEpochProgressRef.current = selectedEpochIndex / (COSMIC_EPOCHS.length - 1);
  }, [selectedEpochIndex]);

  // Regimes analysis:
  // value in [0.0, 1.0], Goldilocks band is [0.1, 0.3], defaultValue = 0.2
  const isSmooth = value < 0.1;
  const isGoldilocks = value >= 0.1 && value <= 0.3;
  const isTurbulent = value > 0.3;

  // Dynamic Theme Colors & Copy
  const theme = useMemo(() => {
    if (isSmooth) {
      return {
        badge: 'TOO SMOOTH · ZERO STRUCTURE',
        badgeColor: '#38BDF8',
        title: 'Inert Cold Gas (Gravity Defeated)',
        subhead:
          'Quantum ripples are too shallow (δρ/ρ < 10⁻⁵). Gravitational attraction never overcomes cosmic expansion. The universe remains a lifeless, featureless hydrogen cloud forever.',
        jeansStatus: 'Infinite (No Collapse Possible)',
        starFormation: '0% (Eternal Darkness)',
      };
    }
    if (isTurbulent) {
      return {
        badge: 'TOO TURBULENT · BLACK HOLE SOUP',
        badgeColor: '#EF4444',
        title: 'Runaway Collapse (Direct Singularity)',
        subhead:
          'Quantum ripples are excessively dense (δρ/ρ > 3×10⁻⁵). Gas clouds collapse violently before stars can form stable disks, plunging directly into supermassive black holes.',
        jeansStatus: 'Sub-Solar (Hyper-Collapse)',
        starFormation: 'Sterilized by Quasars & Singularities',
      };
    }
    return {
      badge: 'GOLDILOCKS RIPPLES · COSMIC WEB',
      badgeColor: '#6FE4B1',
      title: 'Luminous Filaments & Star Nurseries',
      subhead:
        'Pristine quantum ripples (δρ/ρ ≈ 2×10⁻⁵). Matter gravitationally condenses along filamentary bridges, sparking long-lived galaxy clusters, solar systems, and stable chemistry.',
      jeansStatus: '10⁵ M☉ (Optimal Stellar Clusters)',
      starFormation: '100% (Balanced Galaxies & Life)',
    };
  }, [isSmooth, isTurbulent]);

  // Pointer Drag Handlers for 3D Camera
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: yawRef.current,
      pitch: pitchRef.current,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    yawRef.current = dragStartRef.current.yaw + dx * 0.007;
    pitchRef.current = Math.max(-1.1, Math.min(1.1, dragStartRef.current.pitch + dy * 0.007));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  }, []);

  // Controls Handlers
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleNextEpoch = useCallback(() => {
    setSelectedEpochIndex((prev) => (prev + 1) % COSMIC_EPOCHS.length);
  }, []);

  const handlePrevEpoch = useCallback(() => {
    setSelectedEpochIndex((prev) => (prev - 1 + COSMIC_EPOCHS.length) % COSMIC_EPOCHS.length);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedEpochIndex(0);
    epochProgressRef.current = 0.0;
    wellParticlesRef.current = Array.from({ length: 16 }, (_, i) => createWellTestParticle(i));
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      setIsCompact(height < 210 || width < 320);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);

    lastTimeRef.current = performance.now();

    // 3D Perspective Projection
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

    const render = (now: number) => {
      const dt = Math.min(0.06, (now - lastTimeRef.current) * 0.001);
      lastTimeRef.current = now;

      // Auto gentle camera rotation when idle
      if (!isDraggingRef.current) {
        yawRef.current += 0.0018;
      }

      // Smooth epoch progress animation towards target
      if (Math.abs(epochProgressRef.current - targetEpochProgressRef.current) > 0.002) {
        epochProgressRef.current += (targetEpochProgressRef.current - epochProgressRef.current) * Math.min(1, dt * 4.5);
      } else {
        epochProgressRef.current = targetEpochProgressRef.current;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.42;
      const yaw = yawRef.current;
      const pitch = pitchRef.current;
      const curQ = valueRef.current;
      const mode = viewModeRef.current;
      const ep = epochProgressRef.current;

      // ==============================================================
      // TAB 1: OPTION A — 3D COSMIC WEB PARTICLE SIMULATION
      // ==============================================================
      if (mode === 'web') {
        ctx.save();

        // Project Cosmic Nodes
        const projectedNodes = COSMIC_NODES.map((node) => {
          const p = project3D(node.x, node.y, node.z, yaw, pitch, cx, cy, scale);
          return { ...node, ...p };
        });

        // 1. Draw Filament Lines (only in Goldilocks and transitioning from smooth)
        if (curQ > 0.06) {
          const filamentAlpha = Math.min(0.7, (curQ - 0.06) * 4.0) * (0.2 + ep * 0.8);
          ctx.lineWidth = 1.2;

          FILAMENT_EDGES.forEach(([iA, iB]) => {
            const pA = projectedNodes[iA];
            const pB = projectedNodes[iB];
            if (!pA || !pB) return;

            // If Turbulent, filaments are snapped and torn toward black holes
            if (curQ > 0.3) {
              const tearAlpha = Math.max(0, 0.6 - (curQ - 0.3) * 1.5);
              if (tearAlpha > 0.05) {
                ctx.beginPath();
                ctx.moveTo(pA.sx, pA.sy);
                ctx.lineTo(pB.sx, pB.sy);
                ctx.strokeStyle = `rgba(239, 68, 68, ${tearAlpha * 0.4})`;
                ctx.stroke();
              }
            } else {
              // Goldilocks luminous bridges
              const grad = ctx.createLinearGradient(pA.sx, pA.sy, pB.sx, pB.sy);
              grad.addColorStop(0, `rgba(111, 228, 177, ${filamentAlpha * 0.7})`);
              grad.addColorStop(0.5, `rgba(56, 189, 248, ${filamentAlpha * 0.9})`);
              grad.addColorStop(1, `rgba(111, 228, 177, ${filamentAlpha * 0.7})`);

              ctx.beginPath();
              ctx.moveTo(pA.sx, pA.sy);
              ctx.lineTo(pB.sx, pB.sy);
              ctx.strokeStyle = grad;
              ctx.stroke();
            }
          });
        }

        // 2. Project and Render Web Particles
        STATIC_WEB_PARTICLES.forEach((pt) => {
          let px = pt.initialX;
          let py = pt.initialY;
          let pz = pt.initialZ;

          if (curQ < 0.1) {
            // SMOOTH REGIME: Free uniform expansion outwards, zero condensation
            const expandFactor = 1.0 + ep * 0.65;
            px = pt.initialX * expandFactor + pt.jitterX * 2;
            py = pt.initialY * expandFactor + pt.jitterY * 2;
            pz = pt.initialZ * expandFactor + pt.jitterZ * 2;
          } else if (curQ <= 0.3) {
            // GOLDILOCKS REGIME: Gravitational streaming along filaments into nodes
            const node = COSMIC_NODES[pt.nodeIndex];
            const edge = FILAMENT_EDGES[pt.edgeIndex];
            const nodeA = COSMIC_NODES[edge[0]];
            const nodeB = COSMIC_NODES[edge[1]];

            // Position along filament bridge
            const bridgeX = nodeA.x + (nodeB.x - nodeA.x) * pt.edgeT;
            const bridgeY = nodeA.y + (nodeB.y - nodeA.y) * pt.edgeT;
            const bridgeZ = nodeA.z + (nodeB.z - nodeA.z) * pt.edgeT;

            // Clumping factor increases with epoch and Q
            const clumpT = ep * Math.min(1.0, curQ * 4.5);
            const targetX = pt.id % 2 === 0 ? bridgeX : node.x;
            const targetY = pt.id % 2 === 0 ? bridgeY : node.y;
            const targetZ = pt.id % 2 === 0 ? bridgeZ : node.z;

            // Orbiting swirl around clusters
            const orbitAng = now * 0.0008 * pt.orbitSpeed + pt.phase;
            const orbX = Math.cos(orbitAng) * pt.orbitRadius * (1 - clumpT * 0.5);
            const orbY = Math.sin(orbitAng) * pt.orbitRadius * (1 - clumpT * 0.5);

            px = pt.initialX * (1 - clumpT) + (targetX + orbX) * clumpT + pt.jitterX;
            py = pt.initialY * (1 - clumpT) + (targetY + orbY) * clumpT + pt.jitterY;
            pz = pt.initialZ * (1 - clumpT) + (targetZ) * clumpT + pt.jitterZ;
          } else {
            // TURBULENT REGIME: Violent collapse into 4 major black holes
            const bhIndex = pt.nodeIndex % 4;
            const bh = COSMIC_NODES[bhIndex];
            const collapseStrength = Math.min(1.0, (curQ - 0.3) * 1.8 + ep * 0.6);

            // Spiral vortex into singularity
            const vortexAng = now * 0.003 * pt.orbitSpeed + pt.phase * 4;
            const vortexR = (1 - collapseStrength * 0.88) * pt.orbitRadius * 2.2;
            const vx = Math.cos(vortexAng) * vortexR;
            const vy = Math.sin(vortexAng) * vortexR;

            px = pt.initialX * (1 - collapseStrength) + (bh.x + vx) * collapseStrength;
            py = pt.initialY * (1 - collapseStrength) + (bh.y + vy) * collapseStrength;
            pz = pt.initialZ * (1 - collapseStrength) + (bh.z) * collapseStrength;
          }

          const proj = project3D(px, py, pz, yaw, pitch, cx, cy, scale);
          const pSize = Math.max(0.8, pt.size * proj.depthFactor);

          // Particle Coloring by Regime
          let pColor = 'rgba(56, 189, 248, 0.45)';
          if (curQ < 0.1) {
            pColor = 'rgba(147, 197, 253, 0.35)'; // Cold featureless haze
          } else if (curQ <= 0.3) {
            // Warm stellar clusters and cool gas bridges
            pColor = pt.id % 3 === 0 ? '#FDE047' : pt.id % 2 === 0 ? '#6FE4B1' : '#38BDF8';
          } else {
            // Heated relativistic accretion matter
            pColor = pt.id % 2 === 0 ? '#EF4444' : '#F97316';
          }

          ctx.beginPath();
          ctx.arc(proj.sx, proj.sy, pSize, 0, Math.PI * 2);
          ctx.fillStyle = pColor;
          ctx.fill();
        });

        // 3. Render Major Cluster Nodes / Black Holes
        projectedNodes.forEach((node, idx) => {
          if (curQ > 0.3 && idx < 4) {
            // RENDER SUPERMASSIVE BLACK HOLE MONOLITHS
            const bhRadius = (10 + (curQ - 0.3) * 18) * node.depthFactor;

            // Relativistic Accretion Glow
            const glowGrad = ctx.createRadialGradient(node.sx, node.sy, bhRadius * 0.7, node.sx, node.sy, bhRadius * 2.8);
            glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
            glowGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.45)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.beginPath();
            ctx.arc(node.sx, node.sy, bhRadius * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();

            // Singularity Void
            ctx.beginPath();
            ctx.arc(node.sx, node.sy, bhRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#020308';
            ctx.fill();

            // Luminous Event Horizon Ring
            ctx.beginPath();
            ctx.arc(node.sx, node.sy, bhRadius, 0, Math.PI * 2);
            ctx.strokeStyle = '#FCA5A5';
            ctx.lineWidth = 1.8;
            ctx.stroke();
          } else if (curQ >= 0.1 && curQ <= 0.3) {
            // RENDER LUMINOUS GALAXY CLUSTERS
            const clusterR = (6 + node.mass * 3) * node.depthFactor * (0.4 + ep * 0.6);

            const cGrad = ctx.createRadialGradient(node.sx, node.sy, 0, node.sx, node.sy, clusterR * 2.4);
            cGrad.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
            cGrad.addColorStop(0.5, 'rgba(111, 228, 177, 0.3)');
            cGrad.addColorStop(1, 'rgba(111, 228, 177, 0)');

            ctx.beginPath();
            ctx.arc(node.sx, node.sy, clusterR * 2.4, 0, Math.PI * 2);
            ctx.fillStyle = cGrad;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(node.sx, node.sy, clusterR * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
          }
        });

        ctx.restore();
      }

      // ==============================================================
      // TAB 2: OPTION C — 3D SPACETIME POTENTIAL WELL LANDSCAPE
      // ==============================================================
      else {
        ctx.save();

        const gridRes = 21;
        const gridSpan = 1.35;
        const gridStep = (gridSpan * 2) / (gridRes - 1);

        // 3 Attractor Wells on Spacetime Sheet
        const wells = [
          { x: -0.35, y: -0.25, mass: 1.4 },
          { x: 0.42, y: 0.32, mass: 1.2 },
          { x: -0.15, y: 0.48, mass: 0.9 },
        ];

        // Gravitational Potential Function V(x, y) modulated by Q
        function getPotential(x: number, y: number): number {
          let v = 0;
          wells.forEach((w) => {
            const dx = x - w.x;
            const dy = y - w.y;
            const dist = Math.sqrt(dx * dx + dy * dy + 0.08);
            // Depth scales with Q
            const depthFactor = curQ * 1.6;
            v -= (w.mass * depthFactor) / (dist * 1.8);
          });
          return v;
        }

        // Project Grid Vertices
        const gridPoints: { sx: number; sy: number; depthFactor: number; zDepth: number; pot: number }[][] = [];

        for (let ix = 0; ix < gridRes; ix++) {
          gridPoints[ix] = [];
          const gx = -gridSpan + ix * gridStep;
          for (let iy = 0; iy < gridRes; iy++) {
            const gy = -gridSpan + iy * gridStep;
            const pot = getPotential(gx, gy);
            // Z in 3D represents vertical depth of spacetime curvature
            const gz = pot * 0.45;
            const proj = project3D(gx, gy, gz, yaw, pitch, cx, cy, scale);
            gridPoints[ix][iy] = { ...proj, pot };
          }
        }

        // Render Spacetime Mesh Lines (X and Y directions)
        ctx.lineWidth = 1.0;
        for (let ix = 0; ix < gridRes; ix++) {
          for (let iy = 0; iy < gridRes; iy++) {
            const p = gridPoints[ix][iy];

            // Color based on potential depth: cyan (flat) -> green (stable well) -> red/violet (deep singularity)
            const potNorm = Math.min(1.0, Math.abs(p.pot) / 1.8);
            let strokeColor = 'rgba(56, 189, 248, 0.22)';
            if (curQ > 0.3) {
              strokeColor = potNorm > 0.5 ? 'rgba(239, 68, 68, 0.55)' : 'rgba(249, 115, 22, 0.3)';
            } else if (curQ >= 0.1) {
              strokeColor = potNorm > 0.4 ? 'rgba(111, 228, 177, 0.45)' : 'rgba(56, 189, 248, 0.25)';
            }

            ctx.strokeStyle = strokeColor;

            // Line along X
            if (ix < gridRes - 1) {
              const pNextX = gridPoints[ix + 1][iy];
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(pNextX.sx, pNextX.sy);
              ctx.stroke();
            }

            // Line along Y
            if (iy < gridRes - 1) {
              const pNextY = gridPoints[ix][iy + 1];
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(pNextY.sx, pNextY.sy);
              ctx.stroke();
            }
          }
        }

        // Update and Render Test Particles Rolling in Spacetime
        if (isPlayingRef.current) {
          wellParticlesRef.current.forEach((tp, pIdx) => {
            if (!tp.active) return;

            // Gravitational Acceleration from Wells
            let ax = 0;
            let ay = 0;

            wells.forEach((w) => {
              const dx = w.x - tp.x;
              const dy = w.y - tp.y;
              const distSq = dx * dx + dy * dy + 0.04;
              const dist = Math.sqrt(distSq);
              const force = (w.mass * curQ * 1.8) / (distSq * dist);
              ax += dx * force;
              ay += dy * force;
            });

            // If smooth (Q < 0.1), cosmic expansion pushes particles outward
            if (curQ < 0.1) {
              ax += tp.x * 0.15;
              ay += tp.y * 0.15;
            }

            // Damping / friction for stable orbits in Goldilocks
            const damping = curQ > 0.3 ? 0.995 : 0.998;
            tp.vx = (tp.vx + ax * dt) * damping;
            tp.vy = (tp.vy + ay * dt) * damping;

            tp.x += tp.vx * dt;
            tp.y += tp.vy * dt;

            // Boundary wrap or respawn
            if (Math.abs(tp.x) > 1.25 || Math.abs(tp.y) > 1.25) {
              const respawn = createWellTestParticle(pIdx);
              tp.x = respawn.x;
              tp.y = respawn.y;
              tp.vx = respawn.vx;
              tp.vy = respawn.vy;
              tp.history = [];
            }

            // Record trajectory trail
            tp.history.push([tp.x, tp.y]);
            if (tp.history.length > 22) tp.history.shift();

            // Project particle onto spacetime sheet
            const pot = getPotential(tp.x, tp.y);
            const pproj = project3D(tp.x, tp.y, pot * 0.45, yaw, pitch, cx, cy, scale);

            // Render Trajectory Ribbon
            if (tp.history.length > 2) {
              ctx.beginPath();
              tp.history.forEach(([hx, hy], hIdx) => {
                const hpot = getPotential(hx, hy);
                const hproj = project3D(hx, hy, hpot * 0.45, yaw, pitch, cx, cy, scale);
                if (hIdx === 0) ctx.moveTo(hproj.sx, hproj.sy);
                else ctx.lineTo(hproj.sx, hproj.sy);
              });
              ctx.strokeStyle = tp.color;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            }

            // Draw Test Particle
            ctx.beginPath();
            ctx.arc(pproj.sx, pproj.sy, 3.2 * pproj.depthFactor, 0, Math.PI * 2);
            ctx.fillStyle = tp.color;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          });
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    animFrameRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  const activeEpoch = COSMIC_EPOCHS[selectedEpochIndex];

  return (
    <div
      ref={containerRef}
      className={`fluctuations-viz-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, rgba(14, 18, 36, 0.75) 0%, rgba(3, 4, 12, 0.96) 100%)',
        borderRadius: 10,
        userSelect: 'none',
      }}
      aria-label={
        viewMode === 'web'
          ? `3D Cosmic Web: ${theme.title}. ${theme.subhead}`
          : `Spacetime Gravity Wells: ${theme.title}. Gravitational curvature depth.`
      }
    >
      {/* Keyframe animation for active pulse */}
      <style>{`
        @keyframes pulseGlow {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>

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
      {!isCompact && (
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
            onClick={() => setViewMode('web')}
            aria-label="Switch to Cosmic Web matter view"
            style={{
              background: viewMode === 'web' ? 'rgba(111, 228, 177, 0.18)' : 'transparent',
              border: viewMode === 'web' ? '1px solid #6FE4B1' : '1px solid transparent',
              color: viewMode === 'web' ? '#6FE4B1' : 'var(--ink-soft)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              fontWeight: viewMode === 'web' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🕸 Cosmic Web (Matter)
          </button>

          <button
            type="button"
            onClick={() => setViewMode('wells')}
            aria-label="Switch to Spacetime Gravity Wells view"
            style={{
              background: viewMode === 'wells' ? 'rgba(56, 189, 248, 0.22)' : 'transparent',
              border: viewMode === 'wells' ? '1px solid #38BDF8' : '1px solid transparent',
              color: viewMode === 'wells' ? '#38BDF8' : 'var(--ink-soft)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              fontWeight: viewMode === 'wells' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ☵ Gravity Wells (Curvature)
          </button>
        </div>
      )}

      {/* TOP TELEMETRY HUD */}
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
        {/* Left Headline */}
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

        {/* Right Telemetry Readouts */}
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
            {value.toFixed(2)} δρ/ρ
          </div>

          {!isCompact && (
            <>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 3 }}>
                Jeans Mass: <span style={{ color: '#FFFFFF' }}>{theme.jeansStatus}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 1 }}>
                Star Yield: <span style={{ color: '#FFFFFF' }}>{theme.starFormation}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TOP-RIGHT INTERACTIVE CONTROLS */}
      {!isCompact && (
        <div
          style={{
            position: 'absolute',
            right: 18,
            top: 112,
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {viewMode === 'web' && (
            <>
              <button
                type="button"
                onClick={handlePrevEpoch}
                aria-label="Previous cosmic epoch"
                title="Rewind cosmic time (◀)"
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

              <button
                type="button"
                onClick={handleNextEpoch}
                aria-label="Next cosmic epoch"
                title="Advance cosmic time (▶)"
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
            </>
          )}

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
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
              gap: 4,
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset simulation"
            title="Reset cosmic epoch & test particles"
            style={{
              background: 'rgba(13, 14, 32, 0.85)',
              border: '1px solid var(--hair-2)',
              borderRadius: 6,
              color: 'var(--ink-soft)',
              padding: '5px 8px',
              fontSize: 10.5,
              fontFamily: 'var(--f-mono)',
              cursor: 'pointer',
            }}
          >
            ↺
          </button>
        </div>
      )}

      {/* EPOCH SCRUBBER / HUD BAR FOR OPTION A (COSMIC WEB) */}
      {viewMode === 'web' && !isCompact && (
        <div
          style={{
            position: 'absolute',
            bottom: 42,
            left: 18,
            right: 18,
            background: 'rgba(10, 12, 28, 0.82)',
            border: '1px solid var(--hair-2)',
            borderRadius: 8,
            padding: '6px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 3,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--ink-faint)' }}>
              Cosmic Epoch:
            </span>
            <span style={{ fontSize: 11, fontFamily: 'var(--f-mono)', fontWeight: 600, color: '#FFFFFF' }}>
              {activeEpoch.label}
            </span>
            <span style={{ fontSize: 9.5, fontFamily: 'var(--f-mono)', color: theme.badgeColor }}>
              (T = {activeEpoch.age})
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {COSMIC_EPOCHS.map((epoch, idx) => {
              const isSelected = selectedEpochIndex === idx;
              return (
                <button
                  key={epoch.id}
                  type="button"
                  onClick={() => setSelectedEpochIndex(idx)}
                  aria-label={`Select epoch: ${epoch.label}`}
                  style={{
                    background: isSelected ? 'rgba(111, 228, 177, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected ? '1px solid #6FE4B1' : '1px solid transparent',
                    color: isSelected ? '#6FE4B1' : 'var(--ink-soft)',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 9.5,
                    fontFamily: 'var(--f-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {epoch.redshift}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GRAVITY WELL CALLOUT FOR OPTION C */}
      {viewMode === 'wells' && !isCompact && (
        <div
          style={{
            position: 'absolute',
            bottom: 42,
            left: 18,
            maxWidth: 340,
            background: 'rgba(10, 12, 28, 0.82)',
            border: '1px solid var(--hair-2)',
            borderRadius: 8,
            padding: '6px 12px',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: theme.badgeColor, fontWeight: 600 }}>
            SPACETIME TOPOGRAPHY: {isSmooth ? 'FLAT SHEET' : isGoldilocks ? 'KEPLERIAN VALLEYS' : 'SINGULARITY FUNNELS'}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 2, lineHeight: 1.3 }}>
            {isSmooth
              ? 'Zero curvature. Test particles drift straight across the sheet with Hubble expansion.'
              : isGoldilocks
              ? 'Stable parabolic potential wells trap gas into long-lived Keplerian orbits (galaxies & planets).'
              : 'Extreme curvature punctures the spacetime metric into bottomless black hole funnels.'}
          </div>
        </div>
      )}

      {/* BOTTOM REFERENCE TRACK */}
      {!isCompact && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 18,
            right: 18,
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: 'relative',
              height: 3,
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
            }}
          >
            {/* Goldilocks Band [0.1 .. 0.3] */}
            <div
              style={{
                position: 'absolute',
                left: `${(0.1 / 1.0) * 100}%`,
                width: `${((0.3 - 0.1) / 1.0) * 100}%`,
                height: '100%',
                background: 'rgba(111, 228, 177, 0.45)',
                boxShadow: '0 0 8px rgba(111, 228, 177, 0.4)',
              }}
            />

            {/* Current Value Indicator Marker */}
            <div
              style={{
                position: 'absolute',
                left: `${Math.max(0, Math.min(100, (value / 1.0) * 100))}%`,
                top: -3.5,
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
              marginTop: 4,
            }}
          >
            <span style={{ color: isSmooth ? '#38BDF8' : 'var(--ink-faint)', fontWeight: isSmooth ? 600 : 400 }}>
              0.00 δρ/ρ Smooth (No Structure)
            </span>
            <span style={{ color: isGoldilocks ? '#6FE4B1' : 'var(--ink-faint)', fontWeight: isGoldilocks ? 600 : 400 }}>
              0.20 δρ/ρ Goldilocks Cosmic Web
            </span>
            <span style={{ color: isTurbulent ? '#EF4444' : 'var(--ink-faint)', fontWeight: isTurbulent ? 600 : 400 }}>
              1.00 δρ/ρ Black Hole Soup
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
