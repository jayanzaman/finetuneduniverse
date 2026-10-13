'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Camera,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';

export interface GalaxyPhaseData {
  id: number;
  name: string;
  age: string;
  gya: number; // Billions of years ago
  redshift: string;
  sfr: number; // M☉ / yr
  gasFraction: number; // percentage
  metallicity: string;
  image: string | null;
  shortDesc: string;
  detailedAstrophysics: string;
  fineTuningRelevance: string;
}

export const GALAXY_PHASES: GalaxyPhaseData[] = [
  {
    id: 0,
    name: 'Pre-Galactic Era',
    age: '13.8–13.6 Gya',
    gya: 13.7,
    redshift: 'z > 15',
    sfr: 0.1,
    gasFraction: 99,
    metallicity: '[Fe/H] < -5.0 (Pristine)',
    image: null,
    shortDesc: 'Cosmic web filaments collapse; dark matter halos channel primordial gas',
    detailedAstrophysics:
      'Dark matter filaments form the gravitational scaffolding of the cosmos. Pristine hydrogen and helium gas streams funnel into early virialized mini-halos (~10⁶–10⁸ M☉), triggering the first Population III star formation seeds.',
    fineTuningRelevance:
      'Governed by the primordial density perturbation amplitude Q ≈ 10⁻⁵. If Q were marginally larger, gas would have collapsed directly into supermassive black holes; if smaller, structure formation would have stalled indefinitely.',
  },
  {
    id: 1,
    name: 'Proto-Galaxy Formation',
    age: '13.6–12.0 Gya',
    gya: 12.8,
    redshift: 'z ≈ 15–4',
    sfr: 8.0,
    gasFraction: 85,
    metallicity: '[Fe/H] ≈ -3.0 (Pop II)',
    image: '/1. Proto-Galaxy Formation.png',
    shortDesc: 'Hierarchical clumping of the "Poor Old Heart" and proto-cluster mergers',
    detailedAstrophysics:
      'Dozens of primordial dwarf sub-halos and globular cluster progenitors (the ancient Gaia-Enceladus, Kraken, and Pontus precursors) collide chaotically under gravity, coalescing into the unorganized central bulge.',
    fineTuningRelevance:
      'Hierarchical merger rates must strike a fine equilibrium between gravitational accretion and turbulent dispersion, gathering sufficient mass without ejecting gas clouds into deep intergalactic voids.',
  },
  {
    id: 2,
    name: 'Starburst Phase',
    age: '12.0–10.0 Gya',
    gya: 11.0,
    redshift: 'z ≈ 4–1.5',
    sfr: 32.0,
    gasFraction: 65,
    metallicity: '[Fe/H] ≈ -1.5 (Enriching)',
    image: '/2. Starburst Phase.png',
    shortDesc: 'Cosmic Noon peak; massive starbursts forge heavy elements and thick disk',
    detailedAstrophysics:
      'Major merger with the Gaia-Sausage-Enceladus system unleashes a galaxy-wide starburst. Star formation peaks at ~30 M☉/yr. Violent core-collapse supernovae enrich the interstellar medium with carbon, oxygen, and iron, forming the kinematically hot Thick Disk.',
    fineTuningRelevance:
      'The star formation rate had to be self-limiting. If all gas had converted into stars during this burst, none would remain to settle into the stable, low-eccentricity thin disk required for long-lived planetary systems.',
  },
  {
    id: 3,
    name: 'Quasar Phase',
    age: '10.0–7.0 Gya',
    gya: 8.5,
    redshift: 'z ≈ 1.5–0.8',
    sfr: 14.0,
    gasFraction: 40,
    metallicity: '[Fe/H] ≈ -0.8 (Intermediate)',
    image: '/3. Quasar Phase.png',
    shortDesc: 'Sgr A* quasar feedback: relativistic jets regulate star formation and blow out excess gas',
    detailedAstrophysics:
      'The central supermassive black hole accretes at near-Eddington rates, driving collimated relativistic plasma jets and supersonic galactic winds (~1,000 km/s). This AGN feedback clears central gas cavities and prevents runaway cooling.',
    fineTuningRelevance:
      'The M_BH–σ relation: If Sgr A* had been 10× smaller, it could not have halted runaway starburst (leaving an over-dense, hostile core); if 10× larger, its jets would have permanently stripped all gas, creating a dead elliptical galaxy.',
  },
  {
    id: 4,
    name: 'Early Spiral Formation',
    age: '7.0–4.0 Gya',
    gya: 5.5,
    redshift: 'z ≈ 0.8–0.3',
    sfr: 4.5,
    gasFraction: 22,
    metallicity: '[Fe/H] ≈ -0.2 (Sub-solar)',
    image: '/4. Early Spiral Formation.png',
    shortDesc: 'Cooling gas settles into a conservation-of-angular-momentum thin disk with density waves',
    detailedAstrophysics:
      'Enriched gas cools and collapses into a rotating thin disk. Lin-Shu density waves compress gas clouds, igniting new generations of stars along sweeping logarithmic spiral arms, while a central bar instability starts to channel orbital resonances.',
    fineTuningRelevance:
      'Disk stability depends on the dark matter halo: without a massive, quasi-spherical dark matter halo, spiral disks undergo violent bar-buckling instabilities that rip delicate circular orbits apart into chaotic eccentric trajectories.',
  },
  {
    id: 5,
    name: 'Modern Milky Way',
    age: 'Present day (4.0–0 Gya)',
    gya: 0.0,
    redshift: 'z = 0',
    sfr: 1.6,
    gasFraction: 10,
    metallicity: '[Fe/H] ≈ 0.0 (Solar Standard)',
    image: '/5. Modern Milky Way.png',
    shortDesc: 'Mature barred spiral with quiescent Sgr A* and a stable Galactic Habitable Zone',
    detailedAstrophysics:
      'A mature SBbc barred spiral galaxy of ~200 billion stars. Sagittarius A* is quiet (quiescent). The Solar System orbits peacefully at 8.2 kpc near the corotation resonance, where spiral arm crossings are rare and circular orbits prevail.',
    fineTuningRelevance:
      'The Galactic Habitable Zone (7–9 kpc): Safely buffered from inner-galaxy supernova cascades and central black hole flaring, yet enriched with enough heavy elements to forge rocky terrestrial mantles and liquid-water oceans.',
  },
];

interface MilkyWayChronologyVisualProps {
  currentAge: number; // 0 to 13.8 (Gya)
  onAgeChange: (age: number | ((prevAge: number) => number)) => void;
  educatorMode: boolean;
}

export function MilkyWayChronologyVisual({
  currentAge,
  onAgeChange,
  educatorMode,
}: MilkyWayChronologyVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Display Mode: 'simulation' (60fps dynamic physics canvas) vs 'artwork' (scientific astrophotography)
  const [displayMode, setDisplayMode] = useState<'simulation' | 'artwork'>('simulation');

  // Camera Tilt: 'face-on' vs 'tilted' (oblique 3D disk view)
  const [cameraTilt, setCameraTilt] = useState<'face-on' | 'tilted'>('face-on');

  // Layer Toggles
  const [showGas, setShowGas] = useState(true);
  const [showStars, setShowStars] = useState(true);
  const [showHabitableZone, setShowHabitableZone] = useState(true);

  // Time-lapse auto-play state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);

  // Calculate current phase index
  const currentPhaseIndex = useMemo(() => {
    if (currentAge > 13.6) return 0;
    if (currentAge > 12.0) return 1;
    if (currentAge > 10.0) return 2;
    if (currentAge > 7.0) return 3;
    if (currentAge > 4.0) return 4;
    return 5;
  }, [currentAge]);

  const currentPhase = GALAXY_PHASES[currentPhaseIndex];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onAgeChange((prevAge: number) => {
        const nextAge = prevAge - 0.25 * playSpeed;
        if (nextAge <= 0) {
          setIsPlaying(false);
          return 0;
        }
        return Math.max(0, Number(nextAge.toFixed(2)));
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, onAgeChange]);

  // Phase navigation handlers
  const handleNextPhase = () => {
    const nextIdx = Math.min(GALAXY_PHASES.length - 1, currentPhaseIndex + 1);
    onAgeChange(GALAXY_PHASES[nextIdx].gya);
  };

  const handlePrevPhase = () => {
    const prevIdx = Math.max(0, currentPhaseIndex - 1);
    onAgeChange(GALAXY_PHASES[prevIdx].gya);
  };

  const handleJumpToPhase = (idx: number) => {
    onAgeChange(GALAXY_PHASES[idx].gya);
  };

  // Canvas Simulation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayMode !== 'simulation') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    // Pre-generate stable pseudo-random particles
    const particleCount = 650;
    const particles = Array.from({ length: particleCount }).map((_, i) => ({
      angle: (i / particleCount) * Math.PI * 4 + (i % 7) * 0.4,
      radiusRatio: Math.pow((i + 1) / particleCount, 0.7),
      armOffset: (i % 4) * (Math.PI / 2),
      speedMult: 0.6 + ((i * 13) % 10) * 0.08,
      size: 0.7 + ((i * 17) % 15) * 0.12,
      opacity: 0.35 + ((i * 23) % 10) * 0.06,
      colorVariant: i % 5,
    }));

    // Shockwave particles for starburst phase
    const shockwaves = Array.from({ length: 8 }).map((_, i) => ({
      phase: (i / 8) * Math.PI * 2,
      r: 25 + (i * 14) % 90,
      angle: (i * 1.618) * Math.PI * 2,
    }));

    const render = () => {
      time += 0.02;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 640;
      const height = canvas.clientHeight || 460;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const cx = width / 2;
      const cy = height / 2;

      // Clear with dark space backdrop
      ctx.fillStyle = '#03030b';
      ctx.fillRect(0, 0, width, height);

      // Camera Tilt Matrix Transform
      ctx.save();
      ctx.translate(cx, cy);
      if (cameraTilt === 'tilted') {
        ctx.scale(1.0, 0.42); // Oblique tilt
      }

      // --- PHASE 0: Pre-Galactic Cosmic Web Filaments ---
      if (currentPhaseIndex === 0) {
        // Render cosmic web filaments
        ctx.lineWidth = 1.2;
        const nodes = [
          { x: -140, y: -90 },
          { x: 130, y: -110 },
          { x: 160, y: 80 },
          { x: -110, y: 120 },
          { x: 0, y: 0 },
          { x: -50, y: -30 },
          { x: 70, y: 40 },
        ];

        // Draw glowing filament connections
        ctx.strokeStyle = 'rgba(122, 123, 255, 0.22)';
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            const midX = (nodes[i].x + nodes[j].x) / 2 + Math.sin(time + i) * 12;
            const midY = (nodes[i].y + nodes[j].y) / 2 + Math.cos(time + j) * 12;
            ctx.quadraticCurveTo(midX, midY, nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Filament streaming particles
        particles.slice(0, 180).forEach((p, idx) => {
          const targetNode = nodes[idx % nodes.length];
          const streamT = (time * 0.3 * p.speedMult + idx * 0.1) % 1;
          const px = targetNode.x * streamT;
          const py = targetNode.y * streamT;

          ctx.fillStyle = idx % 2 === 0 ? 'rgba(180, 200, 255, 0.65)' : 'rgba(231, 140, 90, 0.55)';
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
        });

        // Pop III proto-star sparkles
        nodes.forEach((node, i) => {
          const glow = ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, 28);
          glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          glow.addColorStop(0.3, 'rgba(122, 140, 255, 0.45)');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // --- PHASE 1: Proto-Galaxy Assembly (Chaotic Multi-Nucleus Clumping) ---
      else if (currentPhaseIndex === 1) {
        const clumps = [
          { ox: -65, oy: -45, r: 42, color: 'rgba(231, 140, 90, 0.4)' },
          { ox: 50, oy: -35, r: 38, color: 'rgba(122, 123, 255, 0.4)' },
          { ox: 30, oy: 60, r: 45, color: 'rgba(200, 100, 150, 0.35)' },
          { ox: -40, oy: 40, r: 35, color: 'rgba(100, 180, 255, 0.35)' },
        ];

        // Draw chaotic gravitational clumps
        clumps.forEach((clump, idx) => {
          const driftX = clump.ox + Math.sin(time * 0.8 + idx) * 8;
          const driftY = clump.oy + Math.cos(time * 0.7 + idx) * 8;
          const g = ctx.createRadialGradient(driftX, driftY, 4, driftX, driftY, clump.r);
          g.addColorStop(0, clump.color);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(driftX, driftY, clump.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Chaotic tidal streams
        particles.slice(0, 320).forEach((p, idx) => {
          const clump = clumps[idx % clumps.length];
          const a = p.angle + time * p.speedMult * 0.5;
          const r = p.radiusRatio * 60;
          const px = clump.ox + Math.cos(a) * r;
          const py = clump.oy + Math.sin(a) * r;

          ctx.fillStyle = 'rgba(240, 220, 180, 0.6)';
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Coalescing core glow
        const coreGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 55);
        coreGlow.addColorStop(0, 'rgba(255, 230, 160, 0.8)');
        coreGlow.addColorStop(0.5, 'rgba(231, 140, 90, 0.3)');
        coreGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 55, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- PHASE 2: Starburst Phase (Cosmic Noon Peak & Supernova Rings) ---
      else if (currentPhaseIndex === 2) {
        // High density starburst glow
        const diskGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 160);
        diskGlow.addColorStop(0, 'rgba(160, 190, 255, 0.7)');
        diskGlow.addColorStop(0.4, 'rgba(231, 140, 90, 0.35)');
        diskGlow.addColorStop(0.8, 'rgba(122, 123, 255, 0.15)');
        diskGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = diskGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 2);
        ctx.fill();

        // Expanding Supernova Shockwave Rings
        shockwaves.forEach((sw, i) => {
          const waveRadius = ((time * 30 + sw.r) % 140);
          const waveAlpha = Math.max(0, 1 - waveRadius / 140) * 0.5;
          const wx = Math.cos(sw.angle) * (sw.r * 0.6);
          const wy = Math.sin(sw.angle) * (sw.r * 0.6);

          ctx.strokeStyle = `rgba(255, 120, 100, ${waveAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(wx, wy, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Blinding young starburst particle clusters
        particles.slice(0, 480).forEach((p) => {
          const a = p.angle + time * p.speedMult * 0.9;
          const r = p.radiusRatio * 150;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;

          ctx.fillStyle = p.colorVariant === 0 ? '#ffffff' : p.colorVariant === 1 ? '#a0c4ff' : '#ffc6ff';
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // --- PHASE 3: Quasar Era (Sgr A* Relativistic Bipolar Jets) ---
      else if (currentPhaseIndex === 3) {
        // Galactic disk background
        const diskGlow = ctx.createRadialGradient(0, 0, 8, 0, 0, 150);
        diskGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        diskGlow.addColorStop(0.2, 'rgba(231, 140, 90, 0.5)');
        diskGlow.addColorStop(0.7, 'rgba(90, 70, 180, 0.2)');
        diskGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = diskGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 150, 0, Math.PI * 2);
        ctx.fill();

        // Relativistic Bipolar Jets shooting perpendicular to disk
        ctx.save();
        // If face-on, jets shoot toward/away with circular outflow halos; if tilted, jets shoot up and down!
        if (cameraTilt === 'tilted') {
          // Upward Jet
          const jetUp = ctx.createLinearGradient(0, 0, 0, -210);
          jetUp.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          jetUp.addColorStop(0.3, 'rgba(122, 190, 255, 0.85)');
          jetUp.addColorStop(0.7, 'rgba(160, 80, 255, 0.4)');
          jetUp.addColorStop(1, 'transparent');

          ctx.fillStyle = jetUp;
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.lineTo(10, 0);
          ctx.lineTo(40 + Math.sin(time * 6) * 4, -210);
          ctx.lineTo(-40 - Math.sin(time * 6) * 4, -210);
          ctx.closePath();
          ctx.fill();

          // Downward Jet
          const jetDown = ctx.createLinearGradient(0, 0, 0, 210);
          jetDown.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          jetDown.addColorStop(0.3, 'rgba(122, 190, 255, 0.85)');
          jetDown.addColorStop(0.7, 'rgba(160, 80, 255, 0.4)');
          jetDown.addColorStop(1, 'transparent');

          ctx.fillStyle = jetDown;
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.lineTo(10, 0);
          ctx.lineTo(40 - Math.sin(time * 6) * 4, 210);
          ctx.lineTo(-40 + Math.sin(time * 6) * 4, 210);
          ctx.closePath();
          ctx.fill();

          // Fermi-bubble progenitor lobes
          ctx.strokeStyle = 'rgba(180, 120, 255, 0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, -110, 55, 80, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(0, 110, 55, 80, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Face-on jet view: central blinding core + supersonic outflow ring
          const ringRad = 45 + ((time * 25) % 90);
          const ringAlpha = Math.max(0, 1 - ringRad / 135) * 0.6;
          ctx.strokeStyle = `rgba(160, 210, 255, ${ringAlpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, ringRad, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();

        // Disk stars being blown outwards
        particles.slice(0, 420).forEach((p) => {
          const a = p.angle + time * p.speedMult * 0.6;
          const r = 35 + p.radiusRatio * 135;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;

          ctx.fillStyle = 'rgba(220, 230, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // --- PHASE 4: Early Spiral Formation (Settling Thin Disk) ---
      else if (currentPhaseIndex === 4) {
        // Rotating logarithmic spiral arms
        const armCount = 2;
        const ptsPerArm = 180;

        for (let arm = 0; arm < armCount; arm++) {
          const armAngleOffset = arm * Math.PI;

          // Gas / dust trailing lanes
          if (showGas) {
            ctx.strokeStyle = 'rgba(231, 140, 90, 0.25)';
            ctx.lineWidth = 14;
            ctx.beginPath();
            for (let i = 0; i < ptsPerArm; i++) {
              const r = 18 + (i / ptsPerArm) * 160;
              const theta = armAngleOffset + Math.log(r / 18) * 2.1 + time * 0.45;
              const x = Math.cos(theta) * r;
              const y = Math.sin(theta) * r;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          // Star forming arms
          if (showStars) {
            ctx.strokeStyle = 'rgba(160, 190, 255, 0.55)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            for (let i = 0; i < ptsPerArm; i++) {
              const r = 20 + (i / ptsPerArm) * 160;
              const theta = armAngleOffset + Math.log(r / 20) * 2.1 + time * 0.45;
              const x = Math.cos(theta) * r;
              const y = Math.sin(theta) * r;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }

        // Emerging central bar
        ctx.save();
        ctx.rotate(time * 0.45);
        const barGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, 48);
        barGlow.addColorStop(0, 'rgba(255, 230, 180, 0.9)');
        barGlow.addColorStop(0.6, 'rgba(231, 140, 90, 0.45)');
        barGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = barGlow;
        ctx.beginPath();
        ctx.ellipse(0, 0, 48, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Disk stars
        particles.slice(0, 520).forEach((p) => {
          const arm = p.armOffset;
          const r = 20 + p.radiusRatio * 155;
          const theta = arm + Math.log(r / 20) * 2.1 + time * 0.45 + (Math.sin(p.angle) * 0.25);
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;

          ctx.fillStyle = p.colorVariant % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(160, 210, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // --- PHASE 5: Modern Barred Spiral & Galactic Habitable Zone ---
      else if (currentPhaseIndex === 5) {
        // Central Barred Core (SBbc)
        ctx.save();
        ctx.rotate(time * 0.35); // Bar pattern speed
        const barGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 55);
        barGlow.addColorStop(0, 'rgba(255, 240, 200, 0.95)');
        barGlow.addColorStop(0.4, 'rgba(255, 180, 100, 0.6)');
        barGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = barGlow;
        ctx.beginPath();
        ctx.ellipse(0, 0, 56, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4 Grand-Design Spiral Arms
        const arms = 4;
        const ptsPerArm = 200;

        for (let a = 0; a < arms; a++) {
          const armOffset = a * (Math.PI / 2);

          // Gas / Dust Lanes
          if (showGas) {
            ctx.strokeStyle = 'rgba(180, 100, 50, 0.22)';
            ctx.lineWidth = 12;
            ctx.beginPath();
            for (let i = 0; i < ptsPerArm; i++) {
              const r = 22 + (i / ptsPerArm) * 165;
              const theta = armOffset + Math.log(r / 22) * 1.85 + time * 0.35;
              const x = Math.cos(theta) * r;
              const y = Math.sin(theta) * r;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          // Brilliant Stellar Arms
          if (showStars) {
            ctx.strokeStyle = 'rgba(180, 200, 255, 0.5)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            for (let i = 0; i < ptsPerArm; i++) {
              const r = 25 + (i / ptsPerArm) * 165;
              const theta = armOffset + Math.log(r / 25) * 1.85 + time * 0.35;
              const x = Math.cos(theta) * r;
              const y = Math.sin(theta) * r;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }

        // Disk Stars
        particles.forEach((p) => {
          const arm = p.armOffset;
          const r = 25 + p.radiusRatio * 160;
          const theta = arm + Math.log(r / 25) * 1.85 + time * 0.35 + Math.sin(p.angle) * 0.3;
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;

          ctx.fillStyle = p.colorVariant === 0 ? '#ffeedd' : p.colorVariant === 1 ? '#a0c4ff' : 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Galactic Habitable Zone (GHZ Golden Ring) at R ≈ 7–9 kpc
        // In canvas coords, R ≈ 95 to 125
        if (showHabitableZone) {
          const ghzInner = 95;
          const ghzOuter = 125;

          // Glowing annulus
          ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
          ctx.beginPath();
          ctx.arc(0, 0, ghzOuter, 0, Math.PI * 2);
          ctx.arc(0, 0, ghzInner, 0, Math.PI * 2, true);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, ghzInner, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, ghzOuter, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Solar System Pinpoint (8.2 kpc -> r ≈ 110)
          const sunAngle = time * 0.35 + 1.2; // Near corotation
          const sunR = 110;
          const sunX = Math.cos(sunAngle) * sunR;
          const sunY = Math.sin(sunAngle) * sunR;

          // Pulsing marker
          const sunPulse = 4 + Math.sin(time * 4) * 1.5;
          ctx.fillStyle = '#ffdd44';
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunPulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunPulse + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore(); // Restore camera tilt
      ctx.restore(); // Restore dpr scale

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentPhaseIndex, displayMode, cameraTilt, showGas, showStars, showHabitableZone]);

  return (
    <div className="relative w-full rounded-xl border border-[var(--hair)] bg-[var(--void)] overflow-hidden shadow-2xl flex flex-col">
      {/* Top Instrument Stage Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--hair)] bg-[var(--void-2)] px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--indigo)] animate-pulse" />
          <span className="mono text-xs uppercase tracking-wider text-[var(--indigo)]">
            Instrument A · Milky Way Morphogenesis
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[var(--void-3)] p-1 rounded-lg border border-[var(--hair-2)]">
          <button
            type="button"
            onClick={() => setDisplayMode('simulation')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              displayMode === 'simulation'
                ? 'bg-[var(--indigo)] text-white shadow'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              60fps Simulation
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('artwork')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              displayMode === 'artwork'
                ? 'bg-[var(--indigo)] text-white shadow'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Astrophysical Imagery
            </span>
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[380px] bg-[var(--void-2)] flex items-center justify-center overflow-hidden">
        {displayMode === 'simulation' ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-crosshair"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-[var(--void-3)]">
            {currentPhase.image ? (
              <img
                src={currentPhase.image}
                alt={`${currentPhase.name} - ${currentPhase.shortDesc}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-[var(--void-2)] border border-[var(--hair-2)] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[var(--indigo)]" />
                </div>
                <h4 className="text-[var(--ink)] font-semibold text-lg">{`Phase ${currentPhase.id}: ${currentPhase.name}`}</h4>
                <p className="text-xs text-[var(--ink-soft)] max-w-sm">
                  Dark matter filaments and primordial H/He gas before stellar clustering.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stage On-Screen HUD Overlay: Live Astrophysical Telemetry */}
        <div className="absolute top-3 left-3 bg-[var(--void)]/85 backdrop-blur-md border border-[var(--hair)] rounded-lg p-2.5 pointer-events-none text-xs space-y-1 shadow-lg max-w-[240px]">
          <div className="text-[var(--ink)] font-bold text-sm leading-tight">{`Phase ${currentPhase.id}: ${currentPhase.name}`}</div>
          <div className="text-[var(--goldilocks)] font-mono text-[11px]">{currentPhase.age} · {currentPhase.redshift}</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[11px] text-[var(--ink-soft)] border-t border-[var(--hair)]">
            <span>SFR:</span>
            <span className="font-mono text-[var(--ink)] text-right">{currentPhase.sfr} M☉/yr</span>
            <span>Gas Fraction:</span>
            <span className="font-mono text-[var(--ink)] text-right">{currentPhase.gasFraction}%</span>
            <span>Metallicity:</span>
            <span className="font-mono text-[var(--ink)] text-right truncate">{currentPhase.metallicity}</span>
          </div>
        </div>

        {/* Stage Floating Controls: Camera Angle & Layers (Only in Simulation Mode) */}
        {displayMode === 'simulation' && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-[var(--void)]/85 backdrop-blur-md border border-[var(--hair)] rounded-lg p-1.5 shadow-lg">
            <button
              type="button"
              onClick={() => setCameraTilt((t) => (t === 'face-on' ? 'tilted' : 'face-on'))}
              className="px-2 py-1 text-[11px] rounded bg-[var(--void-2)] hover:bg-[var(--void-3)] text-[var(--ink)] border border-[var(--hair-2)] transition-colors flex items-center gap-1.5"
              title="Toggle Camera View Angle (Face-on / Oblique Tilt)"
            >
              <Layers className="w-3.5 h-3.5 text-[var(--indigo)]" />
              <span>{cameraTilt === 'face-on' ? 'Face-on View' : 'Oblique 3D Tilt'}</span>
            </button>

            {currentPhaseIndex === 5 && (
              <button
                type="button"
                onClick={() => setShowHabitableZone((v) => !v)}
                className={`px-2 py-1 text-[11px] rounded border transition-colors flex items-center gap-1.5 ${
                  showHabitableZone
                    ? 'bg-[var(--goldilocks)]/15 border-[var(--goldilocks)] text-[var(--goldilocks)]'
                    : 'bg-[var(--void-2)] border-[var(--hair-2)] text-[var(--ink-soft)]'
                }`}
                title="Toggle Galactic Habitable Zone (GHZ) Ring"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--goldilocks)]" />
                <span>GHZ Ring: {showHabitableZone ? 'On' : 'Off'}</span>
              </button>
            )}
          </div>
        )}

        {/* Stage Bottom Scrubber Controls & Transport Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[var(--void)] via-[var(--void)]/90 to-transparent p-3 pt-6 flex flex-col gap-2">
          {/* Progress Timeline Indicator */}
          <div className="relative w-full h-1.5 bg-[var(--void-3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--indigo)] transition-all duration-300"
              style={{
                width: `${((currentPhaseIndex + 1) / GALAXY_PHASES.length) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Playback Transport Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="p-1.5 rounded-md bg-[var(--indigo)] hover:opacity-90 text-white transition-opacity"
                aria-label={isPlaying ? 'Pause time-lapse' : 'Play 13.8 Gyr time-lapse'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  onAgeChange(13.7);
                }}
                className="p-1.5 rounded-md bg-[var(--void-2)] hover:bg-[var(--void-3)] text-[var(--ink)] border border-[var(--hair-2)] transition-colors"
                title="Reset to 13.8 Gya (Big Bang)"
                aria-label="Reset to Big Bang"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 ml-1">
                {[1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaySpeed(speed)}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                      playSpeed === speed
                        ? 'bg-[var(--indigo)] text-white border-[var(--indigo)]'
                        : 'bg-[var(--void-2)] text-[var(--ink-soft)] border-[var(--hair-2)]'
                    }`}
                  >
                    {speed}×
                  </button>
                ))}
              </div>
            </div>

            {/* Phase Selector Dots with Labels */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handlePrevPhase}
                disabled={currentPhaseIndex === 0}
                className="p-1 rounded bg-[var(--void-2)] hover:bg-[var(--void-3)] text-[var(--ink)] disabled:opacity-30 border border-[var(--hair-2)]"
                aria-label="Previous galaxy phase"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {GALAXY_PHASES.map((phase, idx) => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => handleJumpToPhase(idx)}
                    className={`h-6 px-2 text-[11px] rounded transition-all font-mono flex items-center gap-1 ${
                      idx === currentPhaseIndex
                        ? 'bg-[var(--indigo)] text-white shadow'
                        : 'bg-[var(--void-2)] text-[var(--ink-soft)] hover:text-[var(--ink)] border border-[var(--hair-2)]'
                    }`}
                    aria-label={`Go to phase: ${phase.name}`}
                  >
                    <span>{idx}</span>
                    <span className="hidden md:inline text-[10px] opacity-80">{phase.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextPhase}
                disabled={currentPhaseIndex === GALAXY_PHASES.length - 1}
                className="p-1 rounded bg-[var(--void-2)] hover:bg-[var(--void-3)] text-[var(--ink)] disabled:opacity-30 border border-[var(--hair-2)]"
                aria-label="Next galaxy phase"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Scientific Breakdown & Fine-Tuning Callout */}
      <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)] space-y-3">
        <div>
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-[var(--ink)]">{currentPhase.name}</h3>
            <span className="text-xs font-mono text-[var(--goldilocks)] font-medium">({currentPhase.age} · {currentPhase.redshift})</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-mid)] leading-relaxed">{currentPhase.shortDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[var(--void)] border border-[var(--hair-2)]">
            <span className="font-semibold text-[var(--indigo)] block mb-1">Astrophysical Mechanism:</span>
            <p className="text-[var(--ink-soft)] leading-relaxed">{currentPhase.detailedAstrophysics}</p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--warm-soft)]/20 border border-[var(--warm)]/40">
            <span className="font-semibold text-[var(--warm)] block mb-1">Fine-Tuning Relevance:</span>
            <p className="text-[var(--ink)] leading-relaxed">{currentPhase.fineTuningRelevance}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
