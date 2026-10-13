'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Slider } from '../../ui/slider';
import { ShieldCheck, AlertTriangle, Flame, Wind, Activity } from 'lucide-react';

interface AgnFeedbackVisualProps {
  blackHoleMass: number; // log10(M_BH / M☉), range 5.0 to 9.0, reference: 6.61
  onMassChange: (mass: number) => void;
  educatorMode: boolean;
}

export function AgnFeedbackVisual({
  blackHoleMass,
  onMassChange,
  educatorMode,
}: AgnFeedbackVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Regimes
  const isWeak = blackHoleMass < 6.0;
  const isOptimal = blackHoleMass >= 6.0 && blackHoleMass <= 7.3;
  const isExcessive = blackHoleMass > 7.3;

  // Real physical quantities
  const realMass = Math.pow(10, blackHoleMass);
  const eddingtonLuminosity = (1.26e38 * realMass).toExponential(2); // erg/s
  const schwarzschildRadiusKm = (2.95 * realMass).toExponential(2); // km

  // Outflow velocity & gas retention estimates
  const outflowVelocityKmS = useMemo(() => {
    if (blackHoleMass < 6.0) return Math.round(150 + (blackHoleMass - 5.0) * 300);
    if (blackHoleMass <= 7.3) return Math.round(600 + (blackHoleMass - 6.0) * 1200);
    return Math.round(2500 + (blackHoleMass - 7.3) * 8000);
  }, [blackHoleMass]);

  const gasRetentionPercent = useMemo(() => {
    if (blackHoleMass < 6.0) return Math.round(92 + (6.0 - blackHoleMass) * 6);
    if (blackHoleMass <= 7.3) return Math.round(45 + (7.3 - blackHoleMass) * 35);
    return Math.max(3, Math.round(45 - (blackHoleMass - 7.3) * 24));
  }, [blackHoleMass]);

  // Presets
  const presets = [
    { label: 'Dwarf Core (10⁵·² M☉)', value: 5.2, desc: 'Under-mass: Runaway collapse' },
    { label: 'Sgr A* Standard (10⁶·⁶¹ M☉)', value: 6.61, desc: 'Reference: Self-regulating equilibrium' },
    { label: 'Super-Quasar (10⁸·⁴ M☉)', value: 8.4, desc: 'Over-mass: Violent disk expulsion' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    // Simulation particles for gas and outflow
    const particleCount = 280;
    const gasParticles = Array.from({ length: particleCount }).map((_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      dist: 30 + ((i * 19) % 180),
      speed: 0.8 + ((i * 7) % 10) * 0.15,
      size: 1.0 + ((i * 11) % 10) * 0.15,
      z: (i % 2 === 0 ? 1 : -1) * (15 + (i % 50)),
    }));

    const render = () => {
      time += 0.025;

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

      // Dark space background with dynamic environmental glow
      ctx.fillStyle = '#020208';
      ctx.fillRect(0, 0, width, height);

      // Jet intensity factors
      const normalizedMass = Math.max(0, Math.min(1, (blackHoleMass - 5.0) / 4.0)); // 0 to 1
      const jetLength = 50 + normalizedMass * 220;
      const jetWidth = 6 + normalizedMass * 38;
      const jetAlpha = 0.2 + normalizedMass * 0.75;

      // 1. Relativistic Bipolar Jets (Up & Down along spin axis)
      if (blackHoleMass >= 5.5) {
        ctx.save();
        ctx.translate(cx, cy);

        // Top Jet
        const topGrad = ctx.createLinearGradient(0, 0, 0, -jetLength);
        topGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        topGrad.addColorStop(0.2, `rgba(122, 190, 255, ${jetAlpha})`);
        topGrad.addColorStop(0.6, `rgba(160, 80, 255, ${jetAlpha * 0.6})`);
        topGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.moveTo(-jetWidth * 0.2, 0);
        ctx.lineTo(jetWidth * 0.2, 0);
        ctx.lineTo(jetWidth + Math.sin(time * 8) * 3, -jetLength);
        ctx.lineTo(-jetWidth - Math.sin(time * 8) * 3, -jetLength);
        ctx.closePath();
        ctx.fill();

        // Bottom Jet
        const btmGrad = ctx.createLinearGradient(0, 0, 0, jetLength);
        btmGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        btmGrad.addColorStop(0.2, `rgba(122, 190, 255, ${jetAlpha})`);
        btmGrad.addColorStop(0.6, `rgba(160, 80, 255, ${jetAlpha * 0.6})`);
        btmGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = btmGrad;
        ctx.beginPath();
        ctx.moveTo(-jetWidth * 0.2, 0);
        ctx.lineTo(jetWidth * 0.2, 0);
        ctx.lineTo(jetWidth - Math.sin(time * 8) * 3, jetLength);
        ctx.lineTo(-jetWidth + Math.sin(time * 8) * 3, jetLength);
        ctx.closePath();
        ctx.fill();

        // Shock knots along the jets
        if (normalizedMass > 0.3) {
          const knots = [0.35, 0.65];
          knots.forEach((k) => {
            const ky1 = -jetLength * k;
            const ky2 = jetLength * k;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(0, ky1, 3 + normalizedMass * 4, 0, Math.PI * 2);
            ctx.arc(0, ky2, 3 + normalizedMass * 4, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Fermi-Bubble Cavities
        if (isOptimal) {
          ctx.strokeStyle = 'rgba(160, 120, 255, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, -jetLength * 0.55, 45, 65, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(0, jetLength * 0.55, 45, 65, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 2. Circumgalactic Gas Particles (Dynamics driven by Feedback)
      ctx.save();
      ctx.translate(cx, cy);

      gasParticles.forEach((p) => {
        let r = p.dist;
        let a = p.angle;

        if (isWeak) {
          // Weak feedback: Gas infall spiral into center
          r = Math.max(15, (p.dist - time * 8 * p.speed) % 190);
          a += time * 0.4;
          ctx.fillStyle = 'rgba(255, 180, 120, 0.7)';
        } else if (isOptimal) {
          // Balanced feedback: Gentle circulation in stable disk
          a += (time * 0.5 * p.speed * 40) / Math.max(30, r);
          ctx.fillStyle = 'rgba(180, 210, 255, 0.65)';
        } else {
          // Violent quasar blowout: Gas driven outward radially
          r = 25 + ((p.dist + time * 45 * p.speed) % 220);
          a += time * 0.1;
          ctx.fillStyle = 'rgba(255, 100, 80, 0.75)';
        }

        const px = Math.cos(a) * r;
        const py = Math.sin(a) * (r * 0.38); // Foreshortened disk angle

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // 3. Accretion Disk (Tilted relativistic ellipse)
      const diskRadius = 24 + normalizedMass * 65;
      const diskGrad = ctx.createRadialGradient(cx, cy, 6, cx, cy, diskRadius);
      diskGrad.addColorStop(0, '#ffffff');
      diskGrad.addColorStop(0.2, '#ffdd66');
      diskGrad.addColorStop(0.5, '#ff8833');
      diskGrad.addColorStop(0.85, 'rgba(180, 40, 20, 0.4)');
      diskGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1.0, 0.32); // Elliptical foreshortening
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);
      ctx.fill();

      // Relativistic Doppler Beaming (Left side of disk moving towards viewer is brighter!)
      const beamGrad = ctx.createLinearGradient(-diskRadius, 0, diskRadius, 0);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      beamGrad.addColorStop(0.5, 'transparent');
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Central Supermassive Black Hole Event Horizon (Shadow)
      const horizonRadius = 8 + normalizedMass * 18;

      // Photon ring glow
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, horizonRadius + 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Pure black event horizon
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, horizonRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Restore dpr scale

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [blackHoleMass, isWeak, isOptimal, isExcessive]);

  return (
    <div className="relative w-full rounded-xl border border-[var(--hair)] bg-[var(--void)] overflow-hidden shadow-2xl flex flex-col">
      {/* Instrument Stage Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--hair)] bg-[var(--void-2)] px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--goldilocks)] animate-pulse" />
          <span className="mono text-xs uppercase tracking-wider text-[var(--goldilocks)]">
            Instrument B · Sagittarius A* AGN Feedback
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOptimal ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--goldilocks)]/15 border border-[var(--goldilocks)] text-[var(--goldilocks)] text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Equilibrium Window
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--warm)]/15 border border-[var(--warm)] text-[var(--warm)] text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {isWeak ? 'Under-Regulated' : 'Gas Stripping Hazard'}
            </span>
          )}
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[380px] bg-[var(--void-2)] flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Live HUD Overlay */}
        <div className="absolute top-3 left-3 bg-[var(--void)]/85 backdrop-blur-md border border-[var(--hair)] rounded-lg p-2.5 pointer-events-none text-xs space-y-1 shadow-lg max-w-[260px]">
          <div className="text-[var(--ink)] font-bold text-sm leading-tight flex items-center justify-between">
            <span>M_BH = 10^{blackHoleMass.toFixed(2)} M☉</span>
          </div>
          <div className="text-[var(--ink-soft)] font-mono text-[11px]">
            ≈ {realMass.toExponential(2)} Solar Masses
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[11px] text-[var(--ink-soft)] border-t border-[var(--hair)]">
            <span>Outflow Velocity:</span>
            <span className="font-mono text-[var(--ink)] text-right">{outflowVelocityKmS.toLocaleString()} km/s</span>
            <span>ISM Retention:</span>
            <span className="font-mono text-[var(--ink)] text-right">{gasRetentionPercent}%</span>
            <span>Eddington Luminosity:</span>
            <span className="font-mono text-[var(--ink)] text-right">{eddingtonLuminosity} erg/s</span>
          </div>
        </div>

        {/* Bottom State Pill */}
        <div className="absolute bottom-3 inset-x-3 flex justify-center">
          <div className="bg-[var(--void)]/90 backdrop-blur-md border border-[var(--hair)] px-3 py-1.5 rounded-full shadow-lg text-xs flex items-center gap-2">
            <span className="text-[var(--ink-soft)]">Galaxy Fate:</span>
            <span
              className={`font-semibold ${
                isOptimal
                  ? 'text-[var(--goldilocks)]'
                  : isWeak
                  ? 'text-[var(--warm)]'
                  : 'text-red-400'
              }`}
            >
              {isOptimal
                ? 'Balanced Star-Forming Disk (Milky Way Type)'
                : isWeak
                ? 'Runaway Gas Collapse → Suffocated Hyper-Dense Core'
                : 'Catastrophic Quasar Blast → Stripped Dead Elliptical'}
            </span>
          </div>
        </div>
      </div>

      {/* Parameter Control Panel */}
      <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)] space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[var(--ink)]">
              Central Supermassive Black Hole Mass (log₁₀ M☉)
            </label>
            <span className="font-mono text-xs sm:text-sm text-[var(--goldilocks)] font-bold">
              {blackHoleMass.toFixed(2)} log₁₀ M☉
            </span>
          </div>

          <Slider
            min={5.0}
            max={9.0}
            step={0.05}
            value={[blackHoleMass]}
            onValueChange={([val]) => onMassChange(val)}
            className="my-2"
          />

          <div className="flex justify-between text-[10px] text-[var(--ink-soft)] font-mono">
            <span>5.0 (Weak / 10⁵ M☉)</span>
            <span className="text-[var(--goldilocks)] font-semibold">6.0 – 7.3 (Reference Band · Sgr A* = 6.61)</span>
            <span>9.0 (Behemoth / 10⁹ M☉)</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 pt-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onMassChange(preset.value)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all text-left ${
                Math.abs(blackHoleMass - preset.value) < 0.1
                  ? 'bg-[var(--indigo)] text-white border-[var(--indigo)] shadow'
                  : 'bg-[var(--void)] text-[var(--ink-soft)] hover:text-[var(--ink)] border-[var(--hair-2)]'
              }`}
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-[10px] opacity-75">{preset.desc}</div>
            </button>
          ))}
        </div>

        {/* Educator / Physical Insight */}
        {educatorMode && (
          <div className="p-3 rounded-lg bg-[var(--void)] border border-[var(--hair-2)] text-xs space-y-1.5">
            <div className="font-semibold text-[var(--indigo)] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              The M_BH–σ Co-Evolution Theorem
            </div>
            <p className="text-[var(--ink-soft)] leading-relaxed">
              Supermassive black holes account for less than 0.1% of their host galaxy’s total mass, yet their energy feedback completely dictates galactic destiny. Through the <em>M_BH–σ</em> relation, acoustic plasma jets heat the halo and blow away runaway gas. Too little mass, and the core overheats into a suffocated star cluster; too much, and the entire galaxy is permanently sterilized into an inert spheroid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
