'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Slider } from '../../ui/slider';
import { ShieldCheck, AlertTriangle, Disc, Orbit, Sparkles, Compass } from 'lucide-react';

interface GalacticHabitableZoneVisualProps {
  radiusKpc: number; // Galactocentric radius in kpc (1.0 to 20.0, Sun = 8.2)
  onRadiusChange: (radius: number) => void;
  educatorMode: boolean;
}

export function GalacticHabitableZoneVisual({
  radiusKpc,
  onRadiusChange,
  educatorMode,
}: GalacticHabitableZoneVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Regimes
  const isTooClose = radiusKpc < 7.0;
  const isOptimal = radiusKpc >= 7.0 && radiusKpc <= 9.0;
  const isTooFar = radiusKpc > 9.0;

  // Real astrophysical calculations
  // Galactic flat rotation curve velocity: v_c ≈ 220 km/s
  const orbitalVelocityKmS = 220;
  // Orbital period: T = 2πR / v
  const orbitalPeriodMyr = Math.round(((2 * Math.PI * radiusKpc * 3.086e16) / (orbitalVelocityKmS * 3.154e7)) / 1e6);

  // Metallicity gradient: [Fe/H] ≈ +0.3 - 0.05 * R
  const metallicityFeH = (0.35 - 0.052 * radiusKpc).toFixed(2);

  // Supernova lethal encounter rate (within 10 pc per billion years)
  const snRatePerGyr = useMemo(() => {
    if (radiusKpc < 4.0) return (45 * Math.exp((4.0 - radiusKpc) * 0.8)).toFixed(1);
    if (radiusKpc < 7.0) return (8 + (7.0 - radiusKpc) * 6).toFixed(1);
    if (radiusKpc <= 9.0) return (1.2 + (9.0 - radiusKpc) * 0.8).toFixed(2);
    return Math.max(0.05, 1.0 - (radiusKpc - 9.0) * 0.08).toFixed(2);
  }, [radiusKpc]);

  // Habitability Index Score (0 to 100%)
  const habitabilityScore = useMemo(() => {
    if (radiusKpc < 4.0) return 2;
    if (radiusKpc < 7.0) return Math.round(15 + (radiusKpc - 4.0) * 24);
    if (radiusKpc <= 9.0) return Math.round(92 + (1.0 - Math.abs(radiusKpc - 8.2) / 0.8) * 8);
    if (radiusKpc <= 13.0) return Math.round(85 - (radiusKpc - 9.0) * 16);
    return Math.max(4, Math.round(21 - (radiusKpc - 13.0) * 2.5));
  }, [radiusKpc]);

  const presets = [
    { label: 'Galactic Bulge (3.0 kpc)', value: 3.0, desc: 'Lethal radiation & frequent supernovae' },
    { label: 'Solar Orbit (8.2 kpc)', value: 8.2, desc: 'Optimal: Corotation resonance & Goldilocks metallicity' },
    { label: 'Outer Rim (15.0 kpc)', value: 15.0, desc: 'Metal-poor: Insufficient terrestrial rocky elements' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

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

      // Dark space background
      ctx.fillStyle = '#03030d';
      ctx.fillRect(0, 0, width, height);

      // Coordinate scaling: Map 20 kpc to ~190 canvas pixels
      const scaleKpcToPx = 180 / 20;

      // 1. Concentric Galactic Zones (GHZ Map)
      // Sterilization Zone (< 7.0 kpc)
      const rInner = 7.0 * scaleKpcToPx;
      const sterGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rInner);
      sterGrad.addColorStop(0, 'rgba(255, 80, 50, 0.45)');
      sterGrad.addColorStop(0.7, 'rgba(255, 120, 50, 0.25)');
      sterGrad.addColorStop(1, 'rgba(255, 120, 50, 0.05)');
      ctx.fillStyle = sterGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
      ctx.fill();

      // Galactic Habitable Zone Ring (7.0 - 9.0 kpc)
      const rOuter = 9.0 * scaleKpcToPx;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
      ctx.arc(cx, cy, rInner, 0, Math.PI * 2, true);
      ctx.fill();

      // Golden ring dashed boundaries
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer Metal-Starved Zone (> 9.0 kpc)
      const rEdge = 19.5 * scaleKpcToPx;
      ctx.strokeStyle = 'rgba(122, 140, 200, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, rEdge, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Rotating Milky Way Spiral Arms (Lin-Shu density waves)
      const arms = 4;
      for (let a = 0; a < arms; a++) {
        const armOffset = a * (Math.PI / 2);
        ctx.strokeStyle = 'rgba(160, 190, 255, 0.35)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < 150; i++) {
          const r = (1.5 + (i / 150) * 18) * scaleKpcToPx;
          const theta = armOffset + Math.log(r / (1.5 * scaleKpcToPx)) * 1.8 + time * 0.3;
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Rotating Central Bar (Bulge)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.3);
      const barGlow = ctx.createRadialGradient(0, 0, 3, 0, 0, 3.5 * scaleKpcToPx);
      barGlow.addColorStop(0, '#ffffff');
      barGlow.addColorStop(0.3, '#ffdd88');
      barGlow.addColorStop(0.7, 'rgba(231, 140, 90, 0.4)');
      barGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = barGlow;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.8 * scaleKpcToPx, 1.4 * scaleKpcToPx, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Current Selected Planetary Orbit Ring
      const currentRadiusPx = radiusKpc * scaleKpcToPx;
      ctx.strokeStyle = isOptimal
        ? 'rgba(255, 215, 0, 0.85)'
        : isTooClose
        ? 'rgba(255, 80, 80, 0.85)'
        : 'rgba(140, 180, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadiusPx, 0, Math.PI * 2);
      ctx.stroke();

      // Star system probe traveling along the orbit
      // Angular velocity ω = v / R -> faster at inner radii, slower at outer
      const orbitSpeed = (orbitalVelocityKmS / (radiusKpc * 50)) * 0.25;
      const currentAngle = time * orbitSpeed;
      const starX = cx + Math.cos(currentAngle) * currentRadiusPx;
      const starY = cy + Math.sin(currentAngle) * currentRadiusPx;

      // Pulse ring around the probe star
      const starPulse = 4 + Math.sin(time * 5) * 1.5;
      ctx.fillStyle = isOptimal ? '#ffdd44' : isTooClose ? '#ff4444' : '#88aaff';
      ctx.beginPath();
      ctx.arc(starX, starY, starPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(starX, starY, starPulse + 3, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Zone Annotation Text Callouts in Canvas Space
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255, 100, 80, 0.75)';
      ctx.fillText('Lethal Core (< 7 kpc)', cx - 55, cy - 25);

      ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.fillText('GHZ (7–9 kpc)', cx + 7.2 * scaleKpcToPx + 4, cy - 8);

      ctx.fillStyle = 'rgba(160, 180, 255, 0.65)';
      ctx.fillText('Outer Rim (> 9 kpc)', cx + 11.5 * scaleKpcToPx, cy + 18);

      ctx.restore(); // Restore dpr scale

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [radiusKpc, isTooClose, isOptimal, isTooFar]);

  return (
    <div className="relative w-full rounded-xl border border-[var(--hair)] bg-[var(--void)] overflow-hidden shadow-2xl flex flex-col">
      {/* Instrument Stage Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--hair)] bg-[var(--void-2)] px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--indigo)] animate-pulse" />
          <span className="mono text-xs uppercase tracking-wider text-[var(--indigo)]">
            Instrument C · Galactic Habitable Zone (GHZ)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOptimal ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--goldilocks)]/15 border border-[var(--goldilocks)] text-[var(--goldilocks)] text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Inside Habitable Golden Ring
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--warm)]/15 border border-[var(--warm)] text-[var(--warm)] text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {isTooClose ? 'Radiation Sterilization Zone' : 'Metallicity-Starved Zone'}
            </span>
          )}
        </div>
      </div>

      {/* Main Simulation Stage Viewport */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[380px] bg-[var(--void-2)] flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Live HUD Overlay */}
        <div className="absolute top-3 left-3 bg-[var(--void)]/85 backdrop-blur-md border border-[var(--hair)] rounded-lg p-2.5 pointer-events-none text-xs space-y-1 shadow-lg max-w-[260px]">
          <div className="text-[var(--ink)] font-bold text-sm leading-tight flex items-center justify-between">
            <span>Radius R = {radiusKpc.toFixed(1)} kpc</span>
            <span className="text-[var(--goldilocks)] font-mono text-xs">Score: {habitabilityScore}%</span>
          </div>
          <div className="text-[var(--ink-soft)] font-mono text-[11px]">
            Orbital Period: ~{orbitalPeriodMyr} Myr / revolution
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[11px] text-[var(--ink-soft)] border-t border-[var(--hair)]">
            <span>Supernova Rate:</span>
            <span className="font-mono text-[var(--ink)] text-right">{snRatePerGyr} / Gyr</span>
            <span>Metallicity [Fe/H]:</span>
            <span className="font-mono text-[var(--ink)] text-right">{metallicityFeH} dex</span>
            <span>Corotation Status:</span>
            <span className="font-mono text-[var(--ink)] text-right">
              {Math.abs(radiusKpc - 8.2) < 0.6 ? 'Resonance Lock' : 'Arm Crosser'}
            </span>
          </div>
        </div>

        {/* Bottom Orbit Assessment Pill */}
        <div className="absolute bottom-3 inset-x-3 flex justify-center">
          <div className="bg-[var(--void)]/90 backdrop-blur-md border border-[var(--hair)] px-3 py-1.5 rounded-full shadow-lg text-xs flex items-center gap-2">
            <span className="text-[var(--ink-soft)]">Planetary Orbit Assessment:</span>
            <span
              className={`font-semibold ${
                isOptimal
                  ? 'text-[var(--goldilocks)]'
                  : isTooClose
                  ? 'text-red-400'
                  : 'text-blue-300'
              }`}
            >
              {isOptimal
                ? 'Optimal Terrestrial Habitability (Solar Reference at 8.2 kpc)'
                : isTooClose
                ? 'Sterilizing Supernovae & Sgr A* High-Energy Radiation'
                : 'Deficient Heavy Elements: Low Rocky Planet Formation Probability'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Habitability Curves */}
      <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)] space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[var(--ink)]">
              Galactocentric Orbital Radius (kpc from Sgr A*)
            </label>
            <span className="font-mono text-xs sm:text-sm text-[var(--goldilocks)] font-bold">
              {radiusKpc.toFixed(1)} kpc {Math.abs(radiusKpc - 8.2) < 0.1 ? '(Solar Standard)' : ''}
            </span>
          </div>

          <Slider
            min={1.0}
            max={20.0}
            step={0.1}
            value={[radiusKpc]}
            onValueChange={([val]) => onRadiusChange(val)}
            className="my-2"
          />

          <div className="flex justify-between text-[10px] text-[var(--ink-soft)] font-mono">
            <span>1.0 kpc (Galactic Center)</span>
            <span className="text-[var(--goldilocks)] font-semibold">7.0 – 9.0 kpc (Galactic Habitable Zone)</span>
            <span>20.0 kpc (Outer Disk)</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 pt-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onRadiusChange(preset.value)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all text-left ${
                Math.abs(radiusKpc - preset.value) < 0.2
                  ? 'bg-[var(--indigo)] text-white border-[var(--indigo)] shadow'
                  : 'bg-[var(--void)] text-[var(--ink-soft)] hover:text-[var(--ink)] border-[var(--hair-2)]'
              }`}
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-[10px] opacity-75">{preset.desc}</div>
            </button>
          ))}
        </div>

        {/* Dual Constraint Curve Graph (SVG) */}
        <div className="rounded-lg bg-[var(--void)] border border-[var(--hair-2)] p-3">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-[var(--ink)]">The Galactic Goldilocks Intersection</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-0.5 bg-red-400 inline-block" /> Radiation Hazard
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-0.5 bg-blue-400 inline-block" /> Metallicity [Fe/H]
              </span>
              <span className="flex items-center gap-1 text-[var(--goldilocks)]">
                <span className="w-2 h-0.5 bg-[var(--goldilocks)] inline-block" /> Net Habitability
              </span>
            </div>
          </div>

          <div className="relative w-full h-24">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 90" preserveAspectRatio="none">
              {/* GHZ Golden Band Shade */}
              {/* 7 kpc -> x = 120, 9 kpc -> x = 160 */}
              <rect x="120" y="0" width="40" height="90" fill="rgba(255, 215, 0, 0.12)" />
              <line x1="120" y1="0" x2="120" y2="90" stroke="rgba(255, 215, 0, 0.4)" strokeDasharray="3 3" />
              <line x1="160" y1="0" x2="160" y2="90" stroke="rgba(255, 215, 0, 0.4)" strokeDasharray="3 3" />

              {/* Radiation Hazard Curve: Drops rapidly from center */}
              <path
                d="M 20 5 Q 60 10 120 75 T 400 88"
                fill="none"
                stroke="rgba(255, 100, 100, 0.7)"
                strokeWidth="1.8"
              />

              {/* Metallicity Availability: Declines linearly */}
              <path
                d="M 20 18 L 400 84"
                fill="none"
                stroke="rgba(100, 180, 255, 0.7)"
                strokeWidth="1.8"
              />

              {/* Net Habitability Curve: Bell-like curve peaking at 8.2 kpc (x ≈ 144) */}
              <path
                d="M 20 88 C 80 88 110 50 144 15 C 175 45 220 80 400 88"
                fill="none"
                stroke="var(--goldilocks)"
                strokeWidth="2.5"
              />

              {/* Current Radius Indicator Line */}
              {(() => {
                const markerX = 20 + ((radiusKpc - 1.0) / 19.0) * 380;
                return (
                  <g>
                    <line x1={markerX} y1="0" x2={markerX} y2="90" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx={markerX} cy="15" r="3.5" fill="var(--goldilocks)" stroke="#ffffff" strokeWidth="1" />
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-[var(--ink-soft)] font-mono mt-1">
            <span>1 kpc (Galactic Core)</span>
            <span className="text-[var(--goldilocks)]">7–9 kpc (Golden Zone)</span>
            <span>20 kpc (Galactic Rim)</span>
          </div>
        </div>

        {/* Educator / Physical Insight */}
        {educatorMode && (
          <div className="p-3 rounded-lg bg-[var(--void)] border border-[var(--hair-2)] text-xs space-y-1.5">
            <div className="font-semibold text-[var(--indigo)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              The Corotation Synchrony Advantage
            </div>
            <p className="text-[var(--ink-soft)] leading-relaxed">
              Planetary habitability is not merely about receiving warmth from a parent star—it requires an island of stability in the galaxy. At 8.2 kpc, our Sun revolves at nearly the exact same angular velocity as the spiral pattern speed (the corotation resonance). As a consequence, our Solar System has crossed turbulent spiral arms only four times across Earth’s 4.5-billion-year history, protecting fragile biospheres from close-range supernova shocks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
