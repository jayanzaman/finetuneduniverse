'use client';

import { useState, useEffect, useMemo } from 'react';
import { MilkyWayChronologyVisual, GALAXY_PHASES } from './MilkyWayChronologyVisual';
import { AgnFeedbackVisual } from './AgnFeedbackVisual';
import { GalacticHabitableZoneVisual } from './GalacticHabitableZoneVisual';
import {
  Clock,
  Flame,
  Orbit,
  LayoutGrid,
  Maximize2,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function GalacticHeartSection({
  educatorMode,
  cosmicTime = 0,
}: {
  educatorMode: boolean;
  cosmicTime?: number;
}) {
  void cosmicTime;

  // The 3 Fundamental Galactic Parameters
  // 1. Galactic Age & Phase (13.8 to 0 Gya, start at 13.8 Big Bang)
  const [currentGalacticAge, setCurrentGalacticAge] = useState(13.8);

  // 2. Sagittarius A* Black Hole Mass (log10 M☉, range 5.0 to 9.0, reference: 6.61)
  const [blackHoleMass, setBlackHoleMass] = useState(6.61);

  // 3. Galactocentric Orbital Radius (kpc, range 1.0 to 20.0, reference: 8.2)
  const [radiusKpc, setRadiusKpc] = useState(8.2);

  // Active Instrument Index (0: Chronology, 1: Sgr A* Feedback, 2: Habitable Zone)
  const [activeInstrumentIndex, setActiveInstrumentIndex] = useState(0);

  // View Mode: 'studio' (master-detail hero stage) vs 'grid' (3-column triptych)
  const [viewMode, setViewMode] = useState<'studio' | 'grid'>('studio');

  // Compute Current Phase
  const currentPhaseIndex = useMemo(() => {
    if (currentGalacticAge > 13.6) return 0;
    if (currentGalacticAge > 12.0) return 1;
    if (currentGalacticAge > 10.0) return 2;
    if (currentGalacticAge > 7.0) return 3;
    if (currentGalacticAge > 4.0) return 4;
    return 5;
  }, [currentGalacticAge]);

  const currentPhase = GALAXY_PHASES[currentPhaseIndex];

  // Fine-tuning band conditions
  const isBlackHoleOptimal = blackHoleMass >= 6.0 && blackHoleMass <= 7.3;
  const isGhzOptimal = radiusKpc >= 7.0 && radiusKpc <= 9.0;
  const isPhaseSettled = currentPhaseIndex >= 4;

  const bandStatus = [
    { name: 'Sgr A* Mass (6.0–7.3 log₁₀ M☉)', ok: isBlackHoleOptimal },
    { name: 'Galactic Habitable Zone (7–9 kpc)', ok: isGhzOptimal },
    { name: 'Disk Settling (Thin Disk Era)', ok: isPhaseSettled },
  ];

  // Randomize Universe event listener
  useEffect(() => {
    const handleRandomize = () => {
      setCurrentGalacticAge(Math.random() * 13.8);
      setBlackHoleMass(5.0 + Math.random() * 4.0);
      setRadiusKpc(1.0 + Math.random() * 19.0);
    };

    window.addEventListener('randomizeUniverse', handleRandomize);
    return () => window.removeEventListener('randomizeUniverse', handleRandomize);
  }, []);

  // Instrument definitions
  const instruments = [
    {
      id: 0,
      title: 'Milky Way Evolution & Chronology',
      shortTitle: 'Evolutionary Chronology',
      icon: Clock,
      subtitle: '13.8-billion-year morphogenesis across 6 distinct cosmological epochs',
      badge: currentPhase.age,
      badgeColor: 'var(--indigo)',
    },
    {
      id: 1,
      title: 'Sgr A* & The AGN Feedback Regulator',
      shortTitle: 'Black Hole Feedback',
      icon: Flame,
      subtitle: 'Relativistic jets regulate cooling and halt runaway core collapse',
      badge: `${blackHoleMass.toFixed(2)} log₁₀ M☉`,
      badgeColor: isBlackHoleOptimal ? 'var(--goldilocks)' : 'var(--warm)',
    },
    {
      id: 2,
      title: 'The Galactic Habitable Zone (GHZ)',
      shortTitle: 'Galactic Habitable Zone',
      icon: Orbit,
      subtitle: 'Balancing core radiation hazards with outer-rim metallicity scarcity',
      badge: `${radiusKpc.toFixed(1)} kpc`,
      badgeColor: isGhzOptimal ? 'var(--goldilocks)' : 'var(--warm)',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Chapter 04 Title Heading */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--hair)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            Milky Way Evolution
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-0.5">
            Explore 13.8 billion years of galactic morphogenesis, black hole regulation, and habitability
          </p>
        </div>
      </div>

      {/* Top Laboratory Status Strip */}
      <div className="rounded-xl border border-[var(--hair)] bg-[var(--void)] p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Phase & Cosmological Status Summary */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--indigo)]/10 border border-[var(--indigo)]/30 text-[var(--indigo)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div aria-live="polite">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[var(--ink-soft)] font-mono">Current phase</span>
                <span className="flex h-2 w-2 rounded-full bg-[var(--indigo)] animate-pulse" />
              </div>
              <p className="text-sm sm:text-base font-bold text-[var(--ink)]">
                {`${currentPhase.name} · ${currentPhase.age}`}
              </p>
            </div>
          </div>

          {/* Center: Live Fine-Tuning Parameter Band Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {bandStatus.map((band) => (
              <div
                key={band.name}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                  band.ok
                    ? 'bg-[var(--goldilocks)]/10 border-[var(--goldilocks)]/40 text-[var(--goldilocks)]'
                    : 'bg-[var(--warm)]/10 border-[var(--warm)]/40 text-[var(--warm)]'
                }`}
              >
                {band.ok ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{band.name}</span>
              </div>
            ))}
          </div>

          {/* Right: View Mode Switcher (Studio vs 3-Column Triptych) */}
          <div className="flex items-center gap-1.5 bg-[var(--void-2)] p-1 rounded-lg border border-[var(--hair)]">
            <button
              type="button"
              onClick={() => setViewMode('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded font-medium transition-all ${
                viewMode === 'studio'
                  ? 'bg-[var(--indigo)] text-white shadow'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
              title="Focused Master-Detail Studio View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focused Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--indigo)] text-white shadow'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
              title="3-Column Triptych View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3-Column Triptych</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Presentation */}
      {viewMode === 'studio' ? (
        /* ================= MASTER-DETAIL STUDIO VIEW (Default) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 65% Hero Stage Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {activeInstrumentIndex === 0 && (
              <MilkyWayChronologyVisual
                currentAge={currentGalacticAge}
                onAgeChange={setCurrentGalacticAge}
                educatorMode={educatorMode}
              />
            )}
            {activeInstrumentIndex === 1 && (
              <AgnFeedbackVisual
                blackHoleMass={blackHoleMass}
                onMassChange={setBlackHoleMass}
                educatorMode={educatorMode}
              />
            )}
            {activeInstrumentIndex === 2 && (
              <GalacticHabitableZoneVisual
                radiusKpc={radiusKpc}
                onRadiusChange={setRadiusKpc}
                educatorMode={educatorMode}
              />
            )}
          </div>

          {/* Right Column: 35% Control Column & Telemetry Hub */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Instrument Selector Tabs */}
            <div className="rounded-xl border border-[var(--hair)] bg-[var(--void)] p-4 space-y-2.5 shadow-lg">
              <span className="mono text-xs uppercase tracking-wider text-[var(--ink-soft)] block mb-1">
                Select Active Instrument
              </span>
              <div className="flex flex-col gap-2">
                {instruments.map((inst) => {
                  const Icon = inst.icon;
                  const isActive = activeInstrumentIndex === inst.id;
                  return (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => setActiveInstrumentIndex(inst.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                        isActive
                          ? 'bg-[var(--void-2)] border-[var(--indigo)] shadow-md ring-1 ring-[var(--indigo)]/50'
                          : 'bg-[var(--void)] border-[var(--hair-2)] hover:border-[var(--hair)] hover:bg-[var(--void-2)]/60'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg border ${
                          isActive
                            ? 'bg-[var(--indigo)] text-white border-[var(--indigo)]'
                            : 'bg-[var(--void-3)] text-[var(--ink-soft)] border-[var(--hair-2)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-mid)]'
                            }`}
                          >
                            {inst.shortTitle}
                          </span>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                            style={{
                              borderColor: inst.badgeColor,
                              color: inst.badgeColor,
                              backgroundColor: `color-mix(in srgb, ${inst.badgeColor} 10%, transparent)`,
                            }}
                          >
                            {inst.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--ink-soft)] leading-snug line-clamp-2">
                          {inst.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Astrophysical Laws & Scientific Formulation Card */}
            <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)]">
                <BookOpen className="w-4 h-4 text-[var(--indigo)]" />
                <span>Underlying Astrophysical Models</span>
              </div>
              <div className="text-xs space-y-2 text-[var(--ink-soft)]">
                <div className="p-2.5 rounded-lg bg-[var(--void)] border border-[var(--hair-2)]">
                  <span className="text-[var(--goldilocks)] font-mono block mb-1">
                    The M_BH–σ Velocity Dispersion Relation
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    M_BH ∝ σ⁴·⁸⁶ (Kormendy & Ho 2013). The central black hole energy injection self-regulates cold gas accretion to within ~0.1% galactic mass balance.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--void)] border border-[var(--hair-2)]">
                  <span className="text-[var(--goldilocks)] font-mono block mb-1">
                    Lin-Shu Spiral Density Waves & Corotation
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Ω_pattern ≈ Ω_star at R ≈ 8.2 kpc (Lineweaver et al. 2004). Minimal spiral arm crossings preserve long-term circular planetary orbits.
                  </p>
                </div>
              </div>
            </div>

            {/* Educator Notes Callout */}
            {educatorMode && (
              <div className="rounded-xl border border-[var(--warm)]/40 bg-[var(--warm-soft)]/20 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--warm)]">
                  <ShieldCheck className="w-4 h-4" />
                  Educator Fine-Tuning Synthesis
                </div>
                <p className="text-[var(--ink)] leading-relaxed">
                  Galactic habitability requires both temporal and spatial fine-tuning:
                  temporally, the central black hole must gently quench runaway starburst without blowing the disk away; spatially, planets must emerge in the narrow golden ring where metallicity is high enough for rocky mantles while radiation hazards remain benign.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= 3-COLUMN TRIPTYCH VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <MilkyWayChronologyVisual
              currentAge={currentGalacticAge}
              onAgeChange={setCurrentGalacticAge}
              educatorMode={educatorMode}
            />
          </div>
          <div className="flex flex-col">
            <AgnFeedbackVisual
              blackHoleMass={blackHoleMass}
              onMassChange={setBlackHoleMass}
              educatorMode={educatorMode}
            />
          </div>
          <div className="flex flex-col">
            <GalacticHabitableZoneVisual
              radiusKpc={radiusKpc}
              onRadiusChange={setRadiusKpc}
              educatorMode={educatorMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}
