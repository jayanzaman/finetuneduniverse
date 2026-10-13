'use client';

import { useState, useEffect, useMemo } from 'react';
import { Slider } from '../../ui/slider';
import { StellarEvolutionVisual } from './StellarEvolutionVisual';
import { MetallicitySpectrumVisual } from './MetallicitySpectrumVisual';
import { StarFormationRateVisual } from './StarFormationRateVisual';
import {
  Sun,
  Disc,
  Clock,
  LayoutGrid,
  Maximize2,
  BookOpen,
} from 'lucide-react';

export default function StarlightSection({
  educatorMode,
  cosmicTime = 0,
}: {
  educatorMode: boolean;
  cosmicTime?: number;
}) {
  void cosmicTime;

  // The 3 Fundamental Parameters of Chapter 03
  const [stellarMass, setStellarMass] = useState(1);
  const [selectedStar, setSelectedStar] = useState('sun');
  const [starFormationRate, setStarFormationRate] = useState(1);

  // Time-lapse cosmic history animation state
  const [isTimeLapseActive, setIsTimeLapseActive] = useState(false);
  const [currentCosmicAge, setCurrentCosmicAge] = useState(13.8);

  // Active parameter index for Focused Observatory Stage (0: Mass, 1: Metallicity, 2: Formation Rate)
  const [activeParamIndex, setActiveParamIndex] = useState(0);

  // View Mode: 'studio' (widescreen master-detail) vs 'grid' (3-column triptych)
  const [viewMode, setViewMode] = useState<'studio' | 'grid'>('studio');

  // Real stellar catalog database
  const stellarDatabase = useMemo(
    () => ({
      popiii: { name: 'Population III', nickname: 'First Stars (Theoretical)', metallicity: 0.00001, distance: '∞ ly', age: '13.7 Gyr', type: 'Population III Primordial' },
      hd140283: { name: 'HD 140283', nickname: '"Methuselah Star"', metallicity: 0.0004, distance: '190 ly', age: '14.5 Gyr', type: 'Population II Halo' },
      tauceti: { name: 'Tau Ceti', nickname: 'Metal-Poor Neighbor', metallicity: 0.008, distance: '11.9 ly', age: '5.8 Gyr', type: 'Population II Disk' },
      sun: { name: 'Sun (Sol)', nickname: 'Solar Standard', metallicity: 0.02, distance: '0 ly', age: '4.6 Gyr', type: 'Population I Disk' },
      muleo: { name: 'μ Leonis', nickname: 'Metal-Rich Giant', metallicity: 0.04, distance: '133 ly', age: '2.5 Gyr', type: 'Population I Enriched' },
      galcenter: { name: 'Sgr A* Region', nickname: 'Galactic Core Stars', metallicity: 0.08, distance: '26,000 ly', age: '1.0 Gyr', type: 'Super Metal-Rich' },
    }),
    []
  );

  const currentStar = stellarDatabase[selectedStar as keyof typeof stellarDatabase] || stellarDatabase.sun;
  const metallicity = currentStar.metallicity;

  const starOptions = useMemo(
    () => [
      { value: 'popiii', label: 'Population III (0.00001)', description: 'First Stars - No Heavy Elements', metallicity: 0.00001, nickname: 'First Stars (Theoretical)' },
      { value: 'hd140283', label: 'HD 140283 (0.0004)', description: 'Methuselah Star - Ancient', metallicity: 0.0004, nickname: '"Methuselah Star"' },
      { value: 'tauceti', label: 'Tau Ceti (0.008)', description: 'Metal-Poor Neighbor', metallicity: 0.008, nickname: 'Metal-Poor Neighbor' },
      { value: 'sun', label: 'Sun (0.02)', description: 'Solar Standard - Optimal', metallicity: 0.02, nickname: 'Solar Standard' },
      { value: 'muleo', label: 'μ Leonis (0.04)', description: 'Metal-Rich Giant', metallicity: 0.04, nickname: 'Metal-Rich Giant' },
      { value: 'galcenter', label: 'Galactic Core (0.08)', description: 'Super Metal-Rich', metallicity: 0.08, nickname: 'Galactic Core Stars' },
    ],
    []
  );

  // Time-lapse animation loop: counts down from 13.8 Gyr (Big Bang) toward today (0 Gyr)
  useEffect(() => {
    if (!isTimeLapseActive) return;

    const interval = setInterval(() => {
      setCurrentCosmicAge((prevAge) => {
        const nextAge = prevAge - 0.2;
        if (nextAge <= 0) {
          setIsTimeLapseActive(false);
          return 13.8;
        }

        let newRate = 1.0;
        if (nextAge > 13.0) newRate = 0.1;
        else if (nextAge > 11.0) newRate = 0.5;
        else if (nextAge > 8.0) newRate = 1.5;
        else if (nextAge > 4.6) newRate = 1.2;
        else newRate = 1.0;

        setStarFormationRate(newRate);
        return nextAge;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isTimeLapseActive]);

  // Window randomize event listener
  useEffect(() => {
    const handleRandomize = () => {
      setStellarMass(0.1 + Math.random() * 1.9);
      const starKeys = ['popiii', 'hd140283', 'tauceti', 'sun', 'muleo', 'galcenter'];
      const randomStar = starKeys[Math.floor(Math.random() * starKeys.length)];
      setSelectedStar(randomStar);
      setStarFormationRate(0.1 + Math.random() * 1.9);
    };

    window.addEventListener('randomizeUniverse', handleRandomize);
    return () => window.removeEventListener('randomizeUniverse', handleRandomize);
  }, []);

  // Live status indicators
  const isMassOptimal = stellarMass >= 0.8 && stellarMass <= 1.4;
  const isMetallicityOptimal = metallicity >= 0.015 && metallicity <= 0.03;
  const isFormationOptimal = starFormationRate >= 0.8 && starFormationRate <= 1.5;

  const bandStatus = [
    { name: 'Stellar Mass (0.8–1.4 M☉)', ok: isMassOptimal },
    { name: 'Metallicity (Solar Z ≈ 0.02)', ok: isMetallicityOptimal },
    { name: 'Star Formation Rate (0.8–1.5 M☉/yr)', ok: isFormationOptimal },
  ];

  // Visual stages
  const visuals = [
    <StellarEvolutionVisual
      key="stellar-mass"
      stellarMass={stellarMass}
      metallicity={metallicity}
      starFormationRate={starFormationRate}
    />,
    <MetallicitySpectrumVisual
      key="metallicity"
      metallicity={metallicity}
      starName={currentStar.name}
      starType={currentStar.type}
      selectedStar={selectedStar}
      onStarChange={setSelectedStar}
      starOptions={starOptions}
    />,
    <StarFormationRateVisual
      key="formation-rate"
      starFormationRate={starFormationRate}
      onRateChange={setStarFormationRate}
      isTimeLapseActive={isTimeLapseActive}
      onToggleTimeLapse={() => setIsTimeLapseActive((p) => !p)}
      currentCosmicAge={currentCosmicAge}
    />,
  ];

  return (
    <div className="w-full text-[var(--ink)] select-none">
      {/* 1. Accessible Outcome Summary Banner */}
      <div
        aria-live="polite"
        className="mb-5 rounded-lg border border-[var(--hair)] bg-[var(--void-2)]/90 px-4 py-3 text-[var(--ink)] backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[var(--ink-soft)]">
              Outcome · First Generation Stellar Ignition
            </span>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1.5 text-xs mono">
              {bandStatus.map((s) => (
                <span
                  key={s.name}
                  className={`inline-flex items-center gap-1 font-medium ${
                    s.ok ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'
                  }`}
                >
                  {s.ok ? '✅' : '❌'} {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Desktop View Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-[var(--void)] p-1 rounded-md border border-[var(--hair)] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('studio')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors mono text-[11px] ${
                viewMode === 'studio'
                  ? 'bg-[var(--indigo)] text-white font-medium'
                  : 'text-[var(--ink-soft)] hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" /> Focused Observatory
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors mono text-[11px] ${
                viewMode === 'grid'
                  ? 'bg-[var(--indigo)] text-white font-medium'
                  : 'text-[var(--ink-soft)] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 3-Column Triptych
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'studio' ? (
        /* WIDESCREEN FOCUSED OBSERVATORY: 65% Interactive Hero Stage + 35% Precision Control Deck */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          {/* Left Widescreen Hero Stage (8 cols / ~65% width) */}
          <div className="lg:col-span-8 flex flex-col rounded-xl border border-[var(--hair)] bg-[var(--void)] overflow-hidden shadow-2xl min-h-[500px]">
            {/* Visual stage header with selector tabs */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
              <span className="mono text-[var(--ink-soft)] uppercase tracking-wider text-[11px]">
                Active Stellar Stage
              </span>
              <div className="flex items-center gap-1">
                {[
                  { name: '1. Stellar Mass & Disk', icon: <Sun className="w-3 h-3" /> },
                  { name: '2. Metallicity Spectrograph', icon: <Disc className="w-3 h-3" /> },
                  { name: '3. Cosmic Star Formation', icon: <Clock className="w-3 h-3" /> },
                ].map((item, idx) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveParamIndex(idx)}
                    className={`px-2.5 py-1 rounded text-[11px] mono flex items-center gap-1.5 transition-colors ${
                      activeParamIndex === idx
                        ? 'bg-[var(--indigo)] text-white font-medium'
                        : 'text-[var(--ink-soft)] hover:text-white hover:bg-[var(--void-3)]'
                    }`}
                  >
                    {item.icon} {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* The Active High-Fidelity Simulation */}
            <div className="flex-1 relative flex flex-col">
              {visuals[activeParamIndex]}
            </div>
          </div>

          {/* Right Precision Telemetry & Control Column (4 cols / ~35% width) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* Knob 1: Stellar Mass */}
            <div
              onClick={() => setActiveParamIndex(0)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeParamIndex === 0
                  ? 'bg-[var(--void-2)] border-[var(--indigo)] shadow-lg shadow-[var(--indigo-glow)]'
                  : 'bg-[var(--void-2)]/60 border-[var(--hair)] hover:border-[var(--hair-2)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="mono text-[11px] text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[var(--indigo)]" /> First Generation Stars
                </span>
                <span className={`text-xs font-semibold mono ${isMassOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {isMassOptimal ? '✅ Main Sequence' : stellarMass < 0.8 ? '❌ Brown / Red Dwarf' : '❌ Supernova Collapse'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">Stellar Mass</h3>
                <span className="text-xl font-bold mono text-[var(--indigo)]">
                  {stellarMass.toFixed(1)} M☉
                </span>
              </div>

              <div className="relative py-1">
                <Slider
                  value={[stellarMass]}
                  onValueChange={(val) => {
                    setStellarMass(val[0]);
                    setActiveParamIndex(0);
                  }}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.8 - 0.1) / (2.0 - 0.1)) * 100}%`,
                    width: `${((1.4 - 0.8) / (2.0 - 0.1)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] mono text-[var(--ink-soft)] mt-1">
                <span>0.1 (Red Dwarf)</span>
                <span className="text-[var(--goldilocks)] font-medium">0.8 – 1.4 M☉ (optimal)</span>
                <span>2.0 (Supergiant)</span>
              </div>

              {activeParamIndex === 0 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--hair)]">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--indigo)] font-semibold mb-1">
                    <BookOpen className="w-3 h-3" /> Stellar Evolution Insight
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--ink-mid)]">
                    Stars need 0.8–1.4 solar masses for stable, multi-billion-year hydrogen fusion. Below 0.8 M☉, core pressure is too low; above 1.4 M☉, the star exhausts its fuel and explodes within millions of years.
                  </p>
                </div>
              )}
            </div>

            {/* Knob 2: Metallicity */}
            <div
              onClick={() => setActiveParamIndex(1)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeParamIndex === 1
                  ? 'bg-[var(--void-2)] border-[var(--indigo)] shadow-lg shadow-[var(--indigo-glow)]'
                  : 'bg-[var(--void-2)]/60 border-[var(--hair)] hover:border-[var(--hair-2)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="mono text-[11px] text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-[var(--indigo)]" /> Heavy Element Content
                </span>
                <span className={`text-xs font-semibold mono ${isMetallicityOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {isMetallicityOptimal ? '✅ Rocky Planets Viable' : metallicity < 0.01 ? '❌ Too Metal-Poor' : '❌ Gas Giant Migration'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">Metallicity</h3>
                <span className="text-xl font-bold mono text-[var(--indigo)]">
                  {currentStar.name} <span className="text-xs font-normal text-[var(--ink-soft)]">(Z = {metallicity})</span>
                </span>
              </div>

              {/* Star selector dropdown / quick chips */}
              <div className="grid grid-cols-3 gap-1.5 my-2">
                {starOptions.map((star) => (
                  <button
                    key={star.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStar(star.value);
                      setActiveParamIndex(1);
                    }}
                    className={`px-2 py-1 rounded text-[10px] mono truncate border transition-colors ${
                      selectedStar === star.value
                        ? 'border-[var(--indigo)] bg-[var(--indigo)] text-white font-bold'
                        : 'border-[var(--hair)] bg-[var(--void)] text-[var(--ink-mid)] hover:text-white'
                    }`}
                  >
                    {star.value === 'sun' ? '★ Sun' : star.label.split(' (')[0]}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-[10px] mono text-[var(--ink-soft)] mt-1">
                <span>0.00001 (Pop III)</span>
                <span className="text-[var(--goldilocks)] font-medium">Z ≈ 0.02 (Solar Standard)</span>
                <span>0.08 (Sgr A*)</span>
              </div>

              {activeParamIndex === 1 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--hair)]">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--indigo)] font-semibold mb-1">
                    <BookOpen className="w-3 h-3" /> Nucleosynthesis & Terrestrial Worlds
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--ink-mid)]">
                    Early stars had zero heavy elements. Generations of supernovae enriched the cosmos with carbon, oxygen, and iron. Rocky planets require at least ~1.5% heavy elements to form solid crusts.
                  </p>
                </div>
              )}
            </div>

            {/* Knob 3: Star Formation Rate */}
            <div
              onClick={() => setActiveParamIndex(2)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeParamIndex === 2
                  ? 'bg-[var(--void-2)] border-[var(--indigo)] shadow-lg shadow-[var(--indigo-glow)]'
                  : 'bg-[var(--void-2)]/60 border-[var(--hair)] hover:border-[var(--hair-2)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="mono text-[11px] text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--indigo)]" /> Stellar Birth Rate
                </span>
                <span className={`text-xs font-semibold mono ${isFormationOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {isFormationOptimal ? '✅ Optimal Cosmic Era' : starFormationRate < 0.8 ? '❌ Star-Starved' : '❌ Violent Feedback'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">Star Formation Rate</h3>
                <span className="text-xl font-bold mono text-[var(--indigo)]">
                  {starFormationRate.toFixed(1)} M☉/yr
                </span>
              </div>

              <div className="relative py-1">
                <Slider
                  value={[starFormationRate]}
                  onValueChange={(val) => {
                    setStarFormationRate(val[0]);
                    setActiveParamIndex(2);
                  }}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.8 - 0.1) / (2.0 - 0.1)) * 100}%`,
                    width: `${((1.5 - 0.8) / (2.0 - 0.1)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] mono text-[var(--ink-soft)] mt-1">
                <span>0.1 (Dark Ages)</span>
                <span className="text-[var(--goldilocks)] font-medium">0.8 – 1.5 M☉/yr (optimal)</span>
                <span>2.0 (Cosmic Noon)</span>
              </div>

              {activeParamIndex === 2 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--hair)]">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--indigo)] font-semibold mb-1">
                    <BookOpen className="w-3 h-3" /> The Cosmic Noon Arc
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--ink-mid)]">
                    Cosmic star formation peaked ~10 billion years ago during Cosmic Noon. It then settled to a steady, quiet 1 M☉/yr—the exact peaceful epoch when our Sun and Earth emerged.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 3-COLUMN TRIPTYCH VIEW: Spacious 400px+ cards for side-by-side comparison */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Stellar Mass */}
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] overflow-hidden shadow-xl flex flex-col">
            <div className="p-3.5 border-b border-[var(--hair)] flex items-center justify-between bg-[var(--void)]">
              <div>
                <div className="text-xs mono text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[var(--indigo)]" /> First Generation Stars
                </div>
                <h3 className="text-base font-bold text-[var(--ink)]">Stellar Mass</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold mono text-[var(--indigo)]">{stellarMass.toFixed(1)} M☉</div>
                <div className={`text-xs mono font-medium ${isMassOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {isMassOptimal ? '✅ Main Sequence' : '❌ Out of Band'}
                </div>
              </div>
            </div>
            <div className="h-[280px] bg-[var(--void)] relative overflow-hidden">
              <StellarEvolutionVisual
                stellarMass={stellarMass}
                metallicity={metallicity}
                starFormationRate={starFormationRate}
              />
            </div>
            <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)]">
              <div className="relative py-1 mb-1.5">
                <Slider
                  value={[stellarMass]}
                  onValueChange={(val) => setStellarMass(val[0])}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.8 - 0.1) / (2.0 - 0.1)) * 100}%`,
                    width: `${((1.4 - 0.8) / (2.0 - 0.1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mono text-[var(--ink-soft)]">
                <span>0.1 M☉</span>
                <span className="text-[var(--goldilocks)]">0.8 – 1.4 M☉</span>
                <span>2.0 M☉</span>
              </div>
            </div>
          </div>

          {/* Card 2: Metallicity */}
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] overflow-hidden shadow-xl flex flex-col">
            <div className="p-3.5 border-b border-[var(--hair)] flex items-center justify-between bg-[var(--void)]">
              <div>
                <div className="text-xs mono text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-[var(--indigo)]" /> Heavy Element Content
                </div>
                <h3 className="text-base font-bold text-[var(--ink)]">Metallicity</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold mono text-[var(--indigo)]">{currentStar.name}</div>
                <div className={`text-xs mono font-medium ${isMetallicityOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {isMetallicityOptimal ? '✅ Solar Standard' : '❌ Poor / Excessive'}
                </div>
              </div>
            </div>
            <div className="h-[280px] bg-[var(--void)] relative overflow-hidden">
              <MetallicitySpectrumVisual
                metallicity={metallicity}
                starName={currentStar.name}
                starType={currentStar.type}
                selectedStar={selectedStar}
                onStarChange={setSelectedStar}
                starOptions={starOptions}
              />
            </div>
            <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)]">
              <div className="grid grid-cols-3 gap-1.5">
                {starOptions.map((star) => (
                  <button
                    key={star.value}
                    type="button"
                    onClick={() => setSelectedStar(star.value)}
                    className={`px-2 py-1 rounded text-[10px] mono truncate border transition-colors ${
                      selectedStar === star.value
                        ? 'border-[var(--indigo)] bg-[var(--indigo)] text-white font-bold'
                        : 'border-[var(--hair)] bg-[var(--void)] text-[var(--ink-mid)] hover:text-white'
                    }`}
                  >
                    {star.value === 'sun' ? '★ Sun' : star.label.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Star Formation Rate */}
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] overflow-hidden shadow-xl flex flex-col">
            <div className="p-3.5 border-b border-[var(--hair)] flex items-center justify-between bg-[var(--void)]">
              <div>
                <div className="text-xs mono text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--indigo)]" /> Stellar Birth Rate
                </div>
                <h3 className="text-base font-bold text-[var(--ink)]">Formation Rate</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold mono text-[var(--indigo)]">{starFormationRate.toFixed(1)} M☉/yr</div>
                <div className={`text-xs mono font-medium ${isFormationOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {isFormationOptimal ? '✅ Optimal Rate' : '❌ Out of Band'}
                </div>
              </div>
            </div>
            <div className="h-[280px] bg-[var(--void)] relative overflow-hidden">
              <StarFormationRateVisual
                starFormationRate={starFormationRate}
                onRateChange={setStarFormationRate}
                isTimeLapseActive={isTimeLapseActive}
                onToggleTimeLapse={() => setIsTimeLapseActive((p) => !p)}
                currentCosmicAge={currentCosmicAge}
              />
            </div>
            <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)]">
              <div className="relative py-1 mb-1.5">
                <Slider
                  value={[starFormationRate]}
                  onValueChange={(val) => setStarFormationRate(val[0])}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.8 - 0.1) / (2.0 - 0.1)) * 100}%`,
                    width: `${((1.5 - 0.8) / (2.0 - 0.1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mono text-[var(--ink-soft)]">
                <span>0.1 M☉/yr</span>
                <span className="text-[var(--goldilocks)]">0.8 – 1.5 M☉/yr</span>
                <span>2.0 M☉/yr</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
