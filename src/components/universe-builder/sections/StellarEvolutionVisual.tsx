'use client';

import { useEffect, useRef } from 'react';
import { ShieldCheck, AlertTriangle, Sparkles, Orbit } from 'lucide-react';

interface StellarEvolutionVisualProps {
  stellarMass: number; // 0.1 to 2.0 M☉ (optimal: 0.8 - 1.4)
  metallicity: number; // 0.00001 to 0.08
  starFormationRate: number; // 0.1 to 2.0 M☉/yr
}

export function StellarEvolutionVisual({
  stellarMass,
  metallicity,
  starFormationRate,
}: StellarEvolutionVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Regimes
  const isTooDim = stellarMass < 0.8;
  const isOptimal = stellarMass >= 0.8 && stellarMass <= 1.4;
  const isTooMassive = stellarMass > 1.4;

  // Planetary system viability
  const hasDustDisk = isOptimal && metallicity >= 0.005;
  const hasRockyPlanets = isOptimal && metallicity >= 0.015 && metallicity <= 0.04;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.025;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 460;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Cosmic Background with Deep Gradient & Ambient Starfield
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, width / 1.3);
      if (isTooDim) {
        bgGrad.addColorStop(0, 'rgba(18, 8, 12, 0.95)');
        bgGrad.addColorStop(1, 'rgba(2, 2, 8, 1)');
      } else if (isTooMassive) {
        bgGrad.addColorStop(0, 'rgba(16, 20, 48, 0.95)');
        bgGrad.addColorStop(1, 'rgba(3, 2, 10, 1)');
      } else {
        bgGrad.addColorStop(0, 'rgba(12, 14, 34, 0.95)');
        bgGrad.addColorStop(1, 'rgba(2, 3, 8, 1)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Background Field Stars (Density scaled by starFormationRate)
      const fieldCount = Math.round(30 + starFormationRate * 45);
      for (let i = 0; i < fieldCount; i++) {
        const sx = ((i * 127 + 29) % (width - 20)) + 10;
        const sy = ((i * 83 + 17) % (height - 20)) + 10;
        const flicker = Math.sin(time * 2 + i) * 0.25 + 0.75;
        const starSize = (i % 3 === 0 ? 1.5 : 1.0);

        ctx.fillStyle = `rgba(255, 255, 255, ${0.25 * flicker})`;
        ctx.beginPath();
        ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Protoplanetary Accretion Disk (When Mass is Optimal & Metals Present)
      if (hasDustDisk) {
        const diskRadiusX = 170 + metallicity * 400;
        const diskRadiusY = diskRadiusX * 0.38;

        // Dust Disk Gradient
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-0.15); // Slight tilt

        // Outer Dust Ring
        const diskGrad = ctx.createRadialGradient(0, 0, 40, 0, 0, diskRadiusX);
        diskGrad.addColorStop(0, 'transparent');
        diskGrad.addColorStop(0.3, `rgba(180, 120, 70, ${Math.min(0.4, metallicity * 12)})`);
        diskGrad.addColorStop(0.7, `rgba(120, 80, 45, ${Math.min(0.25, metallicity * 8)})`);
        diskGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = diskGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, diskRadiusX, diskRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Habitable Zone Orbit Ring (Goldilocks zone r ~ sqrt(L))
        const hzRadiusX = 110 * Math.sqrt(stellarMass);
        const hzRadiusY = hzRadiusX * 0.38;
        ctx.beginPath();
        ctx.ellipse(0, 0, hzRadiusX, hzRadiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(111, 228, 177, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbiting Rocky Terrestrial Planets
        if (hasRockyPlanets) {
          const planetCount = 2;
          for (let p = 0; p < planetCount; p++) {
            const planetAngle = time * (0.8 / (p + 1)) + p * 2.2;
            const px = Math.cos(planetAngle) * (hzRadiusX * (0.9 + p * 0.25));
            const py = Math.sin(planetAngle) * (hzRadiusY * (0.9 + p * 0.25));

            // Planet Body
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = p === 0 ? '#4fa3e3' : '#d97d54'; // Earth / Mars analogues
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Planet atmosphere glow
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fillStyle = p === 0 ? 'rgba(79, 163, 227, 0.3)' : 'rgba(217, 125, 84, 0.3)';
            ctx.fill();
          }

          // Orbiting Element Markers (C, O, Si, Fe)
          const elements = ['C', 'O', 'Si', 'Fe'];
          elements.forEach((el, eIdx) => {
            const elAngle = time * 0.4 + eIdx * 1.5;
            const elDistX = hzRadiusX * (0.6 + eIdx * 0.28);
            const elDistY = elDistX * 0.38;
            const ex = Math.cos(elAngle) * elDistX;
            const ey = Math.sin(elAngle) * elDistY;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '8px var(--font-mono, monospace)';
            ctx.fillText(el, ex + 5, ey - 5);
          });
        }

        ctx.restore();
      }

      // 3. Central Star Body & Dynamic Atmosphere
      let starRadius = 24;
      let starColor = '#fff5e0';
      let coronaGlow = 'rgba(255, 200, 100, 0.8)';
      let outerGlow = 'rgba(255, 120, 40, 0.3)';

      if (isTooDim) {
        // Brown / Red Dwarf
        if (stellarMass < 0.4) {
          // Brown dwarf
          starRadius = 16;
          starColor = '#993322';
          coronaGlow = 'rgba(160, 40, 20, 0.7)';
          outerGlow = 'rgba(80, 20, 10, 0.2)';
        } else {
          // Red dwarf
          starRadius = 19;
          starColor = '#e64a33';
          coronaGlow = 'rgba(230, 80, 50, 0.8)';
          outerGlow = 'rgba(160, 40, 20, 0.3)';
        }
      } else if (isTooMassive) {
        // Massive Blue Supergiant
        starRadius = 36 + (stellarMass - 1.4) * 35;
        starColor = stellarMass > 1.7 ? '#ffeebb' : '#d0e8ff';
        coronaGlow = stellarMass > 1.7 ? 'rgba(255, 180, 90, 0.9)' : 'rgba(140, 200, 255, 0.9)';
        outerGlow = stellarMass > 1.7 ? 'rgba(255, 90, 40, 0.5)' : 'rgba(80, 140, 255, 0.4)';
      } else {
        // Stable Sol-type
        starRadius = 24 + (stellarMass - 0.8) * 12;
        starColor = '#fff8ea';
        coronaGlow = 'rgba(255, 215, 110, 0.85)';
        outerGlow = 'rgba(255, 140, 60, 0.35)';
      }

      // Convective Pulsing / Stellar Atmosphere
      const pulseRate = isTooMassive ? 5 : isTooDim ? 1.5 : 2.5;
      const pulseAmp = isTooMassive ? 3.5 : isTooDim ? 0.8 : 1.2;
      const currentRadius = starRadius + Math.sin(time * pulseRate) * pulseAmp;

      // Outer Corona Gradient
      const corona = ctx.createRadialGradient(centerX, centerY, currentRadius * 0.5, centerX, centerY, currentRadius * 3.2);
      corona.addColorStop(0, coronaGlow);
      corona.addColorStop(0.4, outerGlow);
      corona.addColorStop(1, 'transparent');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Stellar Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = starColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Supernova Ejection Shockwave (When M > 1.7 M☉)
      if (stellarMass > 1.7) {
        const shockwavePhase = (time * 1.5) % 1;
        const shockRadius = currentRadius + shockwavePhase * 160;
        const shockAlpha = 1 - shockwavePhase;

        ctx.beginPath();
        ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 120, 60, ${shockAlpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Ejecta particle fragments
        const fragmentCount = 12;
        for (let f = 0; f < fragmentCount; f++) {
          const fAngle = (f * Math.PI * 2) / fragmentCount + time * 0.2;
          const fx = centerX + Math.cos(fAngle) * shockRadius;
          const fy = centerY + Math.sin(fAngle) * shockRadius;

          ctx.beginPath();
          ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 220, 100, ${shockAlpha})`;
          ctx.fill();
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [stellarMass, metallicity, starFormationRate, isTooDim, isOptimal, isTooMassive, hasDustDisk, hasRockyPlanets]);

  const getStatusText = () => {
    if (stellarMass < 0.4) return 'Brown Dwarf · Core Never Reaches 15M Kelvin (No Fusion)';
    if (stellarMass < 0.8) return 'Red Dwarf · Feebly Convective · Lifespan Trillions of Years';
    if (stellarMass <= 1.4) {
      if (hasRockyPlanets) return 'Stable Main Sequence · Protoplanetary Disk & Habitable Zone Active';
      if (hasDustDisk) return 'Stable Main Sequence · Metal-Poor Accretion Disk (No Rocky Planets)';
      return 'Stable Main Sequence · Primordial Hydrogen Fusion';
    }
    if (stellarMass <= 1.7) return 'Blue Supergiant · Extreme Radiation Winds · Short-Lived (~10 Myr)';
    return 'Core-Collapse Supernova Imminent · Complete Disruption of Planetary Systems';
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--void)] select-none">
      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
        <div className="flex items-center gap-3">
          <span className="mono font-semibold flex items-center gap-1.5" style={{ color: isOptimal ? 'var(--goldilocks)' : 'var(--warm)' }}>
            {isOptimal ? <ShieldCheck className="w-4 h-4 text-[var(--goldilocks)]" /> : <AlertTriangle className="w-4 h-4 text-[var(--warm)]" />}
            {isOptimal ? 'Stable Main Sequence' : isTooDim ? 'Insufficient Mass (No Core Fusion)' : 'Runaway Mass (Supernova Collapse)'}
          </span>
          <span className="hidden sm:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden sm:inline-block mono text-[var(--ink-soft)]">
            Fusion Lifespan: <strong className="text-[var(--ink)]">{isTooDim ? 'Trillions of yr' : isOptimal ? '~10 Billion yr' : '~10 Million yr'}</strong>
          </span>
          <span className="hidden md:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden md:inline-block mono text-[var(--ink-soft)]">
            Rocky Planets: <strong className="text-[var(--ink)]">{hasRockyPlanets ? 'Viable (HZ Active)' : 'Not Viable'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] mono text-[var(--ink-soft)]">
          <Orbit className="w-3.5 h-3.5 text-[var(--indigo)]" />
          <span>Accretion Physics</span>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div className="relative flex-1 min-h-[360px] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Habitable Zone Legend Overlay */}
        {hasDustDisk && (
          <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] mono text-[var(--ink-soft)] flex items-center gap-3 bg-[var(--void-2)]/85 px-3 py-1.5 rounded border border-[var(--hair)]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[var(--goldilocks)]" /> Habitable Zone Ring
            </span>
            {hasRockyPlanets && (
              <span className="flex items-center gap-1 text-[var(--goldilocks)]">
                <span className="w-2 h-2 rounded-full bg-[#4fa3e3]" /> Terrestrial Proto-Planets
              </span>
            )}
          </div>
        )}

        {/* Readout overlay */}
        <div className="absolute top-3 right-4 pointer-events-none text-right">
          <div className="text-xs mono uppercase tracking-wider text-[var(--ink-soft)]">Stellar Mass</div>
          <div className="text-xl font-bold mono text-[var(--indigo)]">{stellarMass.toFixed(1)} M☉</div>
          <div className={`text-[11px] font-medium mono ${isOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
            {isOptimal ? '✅ 0.8 – 1.4 M☉ (Optimal)' : '❌ Outside Main Sequence Window'}
          </div>
        </div>
      </div>

      {/* Physical Consequence Footer */}
      <div className="px-4 py-2 border-t border-[var(--hair)] bg-[var(--void-2)]/60 text-xs flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[var(--indigo)] shrink-0" />
        <span className="text-[var(--ink-mid)]">{getStatusText()}</span>
      </div>
    </div>
  );
}
