'use client';

import { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, Disc, Sparkles } from 'lucide-react';

export interface StarOption {
  value: string;
  label: string;
  description: string;
  metallicity: number;
  nickname: string;
}

interface MetallicitySpectrumVisualProps {
  metallicity: number;
  starName: string;
  starType: string;
  selectedStar: string;
  onStarChange: (starValue: string) => void;
  starOptions: StarOption[];
}

export function MetallicitySpectrumVisual({
  metallicity,
  starName,
  starType,
  selectedStar,
  onStarChange,
  starOptions,
}: MetallicitySpectrumVisualProps) {
  // Planetary formation regime
  const isTooMetalPoor = metallicity < 0.01;
  const isOptimal = metallicity >= 0.015 && metallicity <= 0.03;
  const isTooMetalRich = metallicity > 0.04;

  // Real spectral absorption lines positioned accurately across the 380-720nm optical spectrum
  const absorptionLines = useMemo(() => {
    // Hydrogen lines (Balmer series, present in all stellar atmospheres)
    const lines = [
      { name: 'H-α', wavelength: 656.3, leftPct: 81.2, strength: 0.9, color: 'rgba(255, 60, 60, 0.95)' },
      { name: 'H-β', wavelength: 486.1, leftPct: 31.2, strength: 0.85, color: 'rgba(60, 220, 255, 0.95)' },
      { name: 'H-γ', wavelength: 434.0, leftPct: 15.8, strength: 0.75, color: 'rgba(100, 140, 255, 0.95)' },
      { name: 'H-δ', wavelength: 410.2, leftPct: 8.8, strength: 0.65, color: 'rgba(160, 100, 255, 0.95)' },
    ];

    // Metal lines: optical depth / absorption strength scales directly with metallicity Z
    if (metallicity > 0.0002) {
      // Iron (Fe) lines
      lines.push({ name: 'Fe I', wavelength: 527.0, leftPct: 43.2, strength: Math.min(0.95, metallicity * 35), color: '#000000' });
      lines.push({ name: 'Fe I', wavelength: 438.3, leftPct: 17.1, strength: Math.min(0.9, metallicity * 30), color: '#000000' });
      lines.push({ name: 'Fe II', wavelength: 532.8, leftPct: 44.9, strength: Math.min(0.85, metallicity * 28), color: '#000000' });
    }

    if (metallicity > 0.0005) {
      // Calcium H & K lines
      lines.push({ name: 'Ca K', wavelength: 393.4, leftPct: 3.9, strength: Math.min(0.98, metallicity * 40), color: '#000000' });
      lines.push({ name: 'Ca H', wavelength: 396.8, leftPct: 4.9, strength: Math.min(0.95, metallicity * 38), color: '#000000' });
    }

    if (metallicity > 0.001) {
      // Sodium D lines (doublet)
      lines.push({ name: 'Na D1', wavelength: 589.0, leftPct: 61.4, strength: Math.min(0.9, metallicity * 32), color: '#000000' });
      lines.push({ name: 'Na D2', wavelength: 589.6, leftPct: 61.6, strength: Math.min(0.9, metallicity * 32), color: '#000000' });
    }

    if (metallicity > 0.003) {
      // Magnesium b triplet
      lines.push({ name: 'Mg b', wavelength: 517.2, leftPct: 40.3, strength: Math.min(0.85, metallicity * 25), color: '#000000' });
    }

    if (metallicity > 0.007) {
      // Silicon and Carbon lines
      lines.push({ name: 'Si I', wavelength: 390.5, leftPct: 3.1, strength: Math.min(0.8, metallicity * 20), color: '#000000' });
      lines.push({ name: 'C I', wavelength: 477.0, leftPct: 28.5, strength: Math.min(0.75, metallicity * 18), color: '#000000' });
    }

    return lines;
  }, [metallicity]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--void)] select-none">
      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
        <div className="flex items-center gap-3">
          <span className="mono font-semibold flex items-center gap-1.5" style={{ color: isOptimal ? 'var(--goldilocks)' : 'var(--warm)' }}>
            {isOptimal ? <ShieldCheck className="w-4 h-4 text-[var(--goldilocks)]" /> : <AlertTriangle className="w-4 h-4 text-[var(--warm)]" />}
            {isOptimal ? 'Solar Composition Standard (Rocky Planets Viable)' : isTooMetalPoor ? 'Metal-Starved (Gas Giants Only)' : 'Metal-Rich (Orbital Migration Chaos)'}
          </span>
          <span className="hidden sm:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden sm:inline-block mono text-[var(--ink-soft)]">
            Observed Object: <strong className="text-[var(--ink)]">{starName}</strong>
          </span>
          <span className="hidden md:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden md:inline-block mono text-[var(--ink-soft)]">
            Type: <strong className="text-[var(--ink)]">{starType}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] mono text-[var(--ink-soft)]">
          <Disc className="w-3.5 h-3.5 text-[var(--indigo)]" />
          <span>Fraunhofer Spectroscopy</span>
        </div>
      </div>

      {/* Main Observatory Stage */}
      <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
        {/* 1. Fraunhofer Absorption Spectrograph */}
        <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] p-4 shadow-lg mb-4">
          <div className="flex items-center justify-between text-xs mono text-[var(--ink-soft)] mb-2">
            <span className="uppercase tracking-wider">High-Resolution Absorption Spectrum (380 – 720 nm)</span>
            <span className="text-[var(--indigo)]">{absorptionLines.length} Absorption Dark-Lines Identified</span>
          </div>

          {/* Continuous Solar Optical Rainbow Band */}
          <div className="relative w-full h-12 rounded-md overflow-hidden shadow-inner border border-[var(--hair)]">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, #440088 0%, #2244ff 18%, #00bbcc 32%, #22ee44 48%, #ffee00 62%, #ff7700 76%, #cc1100 100%)',
              }}
            />

            {/* Dark Absorption Lines Overlay */}
            {absorptionLines.map((line, idx) => (
              <div
                key={`${line.name}-${idx}`}
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{
                  left: `${line.leftPct}%`,
                  width: `${line.name.startsWith('H') ? 2 : 1.5}px`,
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  boxShadow: `0 0 1.5px rgba(0, 0, 0, 0.8)`,
                  opacity: line.strength,
                }}
              />
            ))}
          </div>

          {/* Wavelength Axis Markers */}
          <div className="flex justify-between text-[10px] mono text-[var(--ink-soft)] mt-1.5 px-1">
            <span>380 nm (Near-UV)</span>
            <span>450 nm (Blue)</span>
            <span>500 nm (Green)</span>
            <span>589 nm (Na D)</span>
            <span>656 nm (H-α)</span>
            <span>720 nm (Near-IR)</span>
          </div>

          {/* Key Line Badges */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--hair)] text-[10px] mono">
            <span className="px-2 py-0.5 rounded bg-[var(--void)] border border-[var(--hair)] text-blue-300">
              Balmer Series: H-α (656 nm), H-β (486 nm)
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--void)] border border-[var(--hair)] text-yellow-300">
              Fraunhofer D: Na Doublet (589 nm)
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--void)] border border-[var(--hair)] text-purple-300">
              Fraunhofer H&K: Ca II (393, 397 nm)
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--void)] border border-[var(--hair)] text-orange-300">
              Iron Lines: Fe I/II Multiplets
            </span>
          </div>
        </div>

        {/* 2. Interactive Astronomical Star Gallery (The 6 Real Stars) */}
        <div>
          <div className="text-xs mono uppercase tracking-wider text-[var(--ink-soft)] mb-2 flex items-center justify-between">
            <span>Astronomical Star Catalog (Observed Objects):</span>
            <span className="text-[var(--goldilocks)]">Select Star to Examine Composition</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {starOptions.map((star) => {
              const isSelected = star.value === selectedStar;
              const starZ = star.metallicity;
              const isSol = star.value === 'sun';

              return (
                <button
                  key={star.value}
                  type="button"
                  onClick={() => onStarChange(star.value)}
                  className={`p-2.5 rounded-lg border text-left transition-all relative ${
                    isSelected
                      ? 'bg-[var(--void-2)] border-[var(--indigo)] shadow-lg shadow-[var(--indigo-glow)]'
                      : 'bg-[var(--void-2)]/50 border-[var(--hair)] hover:border-[var(--hair-2)] hover:bg-[var(--void-2)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] mono text-[var(--ink-soft)]">
                      {isSol ? '★ Sol' : star.value.toUpperCase()}
                    </span>
                    <span
                      className={`text-[9px] mono font-bold ${
                        starZ >= 0.015 && starZ <= 0.03
                          ? 'text-[var(--goldilocks)]'
                          : starZ < 0.01
                          ? 'text-blue-400'
                          : 'text-[var(--warm)]'
                      }`}
                    >
                      {starZ >= 0.015 && starZ <= 0.03 ? 'OPTIMAL' : starZ < 0.01 ? 'POOR' : 'RICH'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[var(--ink)] truncate">{star.label.split(' (')[0]}</div>
                  <div className="text-[10px] text-[var(--ink-soft)] truncate">{star.nickname}</div>

                  <div className="mt-2 text-xs mono font-bold text-[var(--indigo)]">
                    Z = {starZ >= 0.001 ? starZ.toFixed(3) : starZ.toFixed(5)}
                  </div>

                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--indigo)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Planet Formation Viability Metric */}
        <div className="mt-4 p-3 rounded-lg bg-[var(--void-2)] border border-[var(--hair)] flex flex-wrap items-center justify-between gap-3 text-xs mono">
          <div className="flex items-center gap-2">
            <span className="text-[var(--ink-soft)]">Rocky Terrestrial Core Condensation:</span>
            <strong className={isOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}>
              {isOptimal ? 'Viable (1.5% – 3% Metals)' : isTooMetalPoor ? 'Impossible (< 1% Heavy Elements)' : 'Unstable (> 4% Gas Giant Migration)'}
            </strong>
          </div>
          <div className="text-[var(--ink-soft)]">
            Distance: <strong className="text-[var(--ink)]">{starName === 'Sun (Sol)' ? '0 ly (Solar System)' : starName.includes('Methuselah') ? '190 ly (Halo)' : starName.includes('Sgr') ? '26,000 ly (Core)' : 'Local Galaxy'}</strong>
          </div>
        </div>
      </div>

      {/* Physical Consequence Footer */}
      <div className="px-4 py-2 border-t border-[var(--hair)] bg-[var(--void-2)]/60 text-xs flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[var(--indigo)] shrink-0" />
        <span className="text-[var(--ink-mid)]">
          {isOptimal && 'At Z ≈ 0.02, accretion disks contain the critical ratio of iron, silicon, and oxygen to build rocky terrestrial planets and hold liquid water.'}
          {isTooMetalPoor && 'Below 1% metallicity, there is insufficient heavy refractory dust to seed rocky cores; only sterile gas giants and void can form.'}
          {isTooMetalRich && 'Above 4% metallicity, supermassive gas giants form too rapidly and migrate inward toward the star, destroying any nascent terrestrial worlds.'}
        </span>
      </div>
    </div>
  );
}
