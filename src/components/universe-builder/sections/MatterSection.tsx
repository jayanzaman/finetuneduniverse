'use client';

import { useState, useEffect, useMemo } from 'react';
import { Slider } from '../../ui/slider';
import { QcdFluxTubeVisual } from './QcdFluxTubeVisual';
import { PlanckNeedleBalanceVisual } from './PlanckNeedleBalanceVisual';
import { PrimordialCrucibleVisual } from './PrimordialCrucibleVisual';
import { NeutronProtonMassDialVisual } from './NeutronProtonMassDialVisual';
import {
  Atom,
  Scale,
  Sparkles,
  Shield,
  LayoutGrid,
  Maximize2,
  BookOpen,
} from 'lucide-react';

export default function MatterSection({
  educatorMode,
  cosmicTime = 0,
}: {
  educatorMode: boolean;
  cosmicTime?: number;
}) {
  void cosmicTime;

  // The 4 Fundamental Parameters
  const [strongForce, setStrongForce] = useState(1);
  const [hierarchyScale, setHierarchyScale] = useState(1);
  const [matterAsymmetry, setMatterAsymmetry] = useState(0.1);
  const [protonLifetime, setProtonLifetime] = useState(35);

  // Active parameter index for the hero visualization stage (0 to 3)
  const [activeParamIndex, setActiveParamIndex] = useState(0);

  // View Mode: 'studio' (Widescreen Hero Stage + Instrument Rack) vs 'grid' (2x2 Quad Deck)
  const [viewMode, setViewMode] = useState<'studio' | 'grid'>('studio');

  // Single live outcome summary across the four parameters (matching test contract)
  const bandStatus = useMemo(
    () => [
      { name: 'Quark binding (αs)', ok: strongForce >= 0.98 && strongForce <= 1.02 },
      { name: 'Mass hierarchy', ok: hierarchyScale >= 0.9 && hierarchyScale <= 1.1 },
      { name: 'Matter asymmetry', ok: matterAsymmetry >= 0.08 && matterAsymmetry <= 0.12 },
      { name: 'Proton lifetime', ok: protonLifetime >= 34 },
    ],
    [strongForce, hierarchyScale, matterAsymmetry, protonLifetime]
  );

  // Window randomize event listener
  useEffect(() => {
    const handleRandomize = () => {
      setStrongForce(0.8 + Math.random() * 0.4);
      setHierarchyScale(0.5 + Math.random() * 1.5);
      setMatterAsymmetry(Math.random() * 0.2);
      setProtonLifetime(30 + Math.random() * 10);
    };

    window.addEventListener('randomizeUniverse', handleRandomize);
    return () => window.removeEventListener('randomizeUniverse', handleRandomize);
  }, []);

  // Visuals dictionary
  const visuals = [
    <QcdFluxTubeVisual key="qcd" strongForce={strongForce} />,
    <PlanckNeedleBalanceVisual key="planck" massScale={hierarchyScale} />,
    <PrimordialCrucibleVisual key="crucible" asymmetry={matterAsymmetry} />,
    <NeutronProtonMassDialVisual key="neutron" lifetime={protonLifetime} />,
  ];

  return (
    <div className="w-full text-[var(--ink)] select-none">
      {/* 1. Accessible Outcome Summary Banner (Matches test expectations) */}
      <div
        aria-live="polite"
        className="mb-5 rounded-lg border border-[var(--hair)] bg-[var(--void-2)]/90 px-4 py-3 text-[var(--ink)] backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[var(--ink-soft)]">Outcome</span>
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
              <Maximize2 className="w-3.5 h-3.5" /> Focused Studio
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
              <LayoutGrid className="w-3.5 h-3.5" /> 2×2 Quad Deck
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'studio' ? (
        /* WIDESCREEN FOCUSED STUDIO: 65% Interactive Hero Stage + 35% Precision Control Deck */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          {/* Left Widescreen Hero Stage (8 cols / ~65% width) */}
          <div className="lg:col-span-8 flex flex-col rounded-xl border border-[var(--hair)] bg-[var(--void)] overflow-hidden shadow-2xl min-h-[500px]">
            {/* Visual stage header with tabs to jump between the 4 visualizations */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
              <span className="mono text-[var(--ink-soft)] uppercase tracking-wider text-[11px]">
                Active Simulation Stage
              </span>
              <div className="flex items-center gap-1">
                {[
                  { name: '1. Quark Binding', icon: <Atom className="w-3 h-3" /> },
                  { name: '2. Mass Hierarchy', icon: <Scale className="w-3 h-3" /> },
                  { name: '3. Matter Asymmetry', icon: <Sparkles className="w-3 h-3" /> },
                  { name: '4. Proton Stability', icon: <Shield className="w-3 h-3" /> },
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
            {/* Knob 1: Quark Binding Force */}
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
                  <Atom className="w-3.5 h-3.5 text-[var(--indigo)]" /> Strong Nuclear Force
                </span>
                <span
                  className={`text-xs font-semibold mono ${
                    strongForce >= 0.98 && strongForce <= 1.02
                      ? 'text-[var(--goldilocks)]'
                      : 'text-[var(--warm)]'
                  }`}
                >
                  {strongForce >= 0.98 && strongForce <= 1.02 ? '✅ Stable Matter' : '❌ Unstable'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">Quark Binding Force</h3>
                <span className="text-xl font-bold mono text-[var(--indigo)]">
                  {strongForce.toFixed(3)} <span className="text-xs font-normal text-[var(--ink-soft)]">αs</span>
                </span>
              </div>

              <div className="relative py-1">
                <Slider
                  value={[strongForce]}
                  onValueChange={(val) => {
                    setStrongForce(val[0]);
                    setActiveParamIndex(0);
                  }}
                  min={0.8}
                  max={1.2}
                  step={0.001}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.98 - 0.8) / (1.2 - 0.8)) * 100}%`,
                    width: `${((1.02 - 0.98) / (1.2 - 0.8)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] mono text-[var(--ink-soft)] mt-1">
                <span>0.8</span>
                <span className="text-[var(--goldilocks)] font-medium">0.98 – 1.02</span>
                <span>1.2</span>
              </div>

              {activeParamIndex === 0 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--hair)]">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--indigo)] font-semibold mb-1">
                    <BookOpen className="w-3 h-3" /> Confinement Insight
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--ink-mid)]">
                    Gluons bind quarks via constant-tension flux tubes (~14 tons). Outside the 4% window, either confinement fails (void) or diprotons fuse instantly in the Big Bang.
                  </p>
                </div>
              )}
            </div>

            {/* Knob 2: Mass Hierarchy */}
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
                  <Scale className="w-3.5 h-3.5 text-[var(--indigo)]" /> Force Strength Ratios
                </span>
                <span
                  className={`text-xs font-semibold mono ${
                    hierarchyScale >= 0.9 && hierarchyScale <= 1.1
                      ? 'text-[var(--goldilocks)]'
                      : 'text-[var(--warm)]'
                  }`}
                >
                  {hierarchyScale >= 0.9 && hierarchyScale <= 1.1 ? '✅ Balanced Forces' : '❌ Imbalanced'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">Mass Hierarchy</h3>
                <span className="text-xl font-bold mono text-[var(--indigo)]">
                  {hierarchyScale.toFixed(2)} <span className="text-xs font-normal text-[var(--ink-soft)]">×</span>
                </span>
              </div>

              <div className="relative py-1">
                <Slider
                  value={[hierarchyScale]}
                  onValueChange={(val) => {
                    setHierarchyScale(val[0]);
                    setActiveParamIndex(1);
                  }}
                  min={0.5}
                  max={2.0}
                  step={0.01}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.9 - 0.5) / (2 - 0.5)) * 100}%`,
                    width: `${((1.1 - 0.9) / (2 - 0.5)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] mono text-[var(--ink-soft)] mt-1">
                <span>0.50</span>
                <span className="text-[var(--goldilocks)] font-medium">0.90 – 1.10 (1 part in 10³⁴)</span>
                <span>2.00</span>
              </div>

              {activeParamIndex === 1 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--hair)]">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--indigo)] font-semibold mb-1">
                    <BookOpen className="w-3 h-3" /> The Hierarchy Problem
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--ink-mid)]">
                    Quantum loops and bare mass must cancel to 34 decimal places to balance the electroweak scale (246 GeV) against the Planck scale (10¹⁹ GeV).
                  </p>
                </div>
              )}
            </div>

            {/* Knob 3: Matter vs Antimatter */}
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
                  <Sparkles className="w-3.5 h-3.5 text-[var(--indigo)]" /> Cosmic Asymmetry
                </span>
                <span
                  className={`text-xs font-semibold mono ${
                    matterAsymmetry >= 0.08 && matterAsymmetry <= 0.12
                      ? 'text-[var(--goldilocks)]'
                      : 'text-[var(--warm)]'
                  }`}
                >
                  {matterAsymmetry >= 0.08 && matterAsymmetry <= 0.12 ? '✅ Matter Exists' : '❌ No Matter'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">Matter vs Antimatter</h3>
                <span className="text-xl font-bold mono text-[var(--indigo)]">
                  {(matterAsymmetry * 100).toFixed(1)}%
                </span>
              </div>

              <div className="relative py-1">
                <Slider
                  value={[matterAsymmetry]}
                  onValueChange={(val) => {
                    setMatterAsymmetry(val[0]);
                    setActiveParamIndex(2);
                  }}
                  min={0}
                  max={0.2}
                  step={0.001}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.08 - 0) / (0.2 - 0)) * 100}%`,
                    width: `${((0.12 - 0.08) / (0.2 - 0)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] mono text-[var(--ink-soft)] mt-1">
                <span>0%</span>
                <span className="text-[var(--goldilocks)] font-medium">8.0 – 12.0% (1 in 10⁹ excess)</span>
                <span>20%</span>
              </div>

              {activeParamIndex === 2 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--hair)]">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--indigo)] font-semibold mb-1">
                    <BookOpen className="w-3 h-3" /> Baryogenesis
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--ink-mid)]">
                    1 extra quark per billion antiquarks survived the great annihilation. That solitary remnant became all stars, planets, and observers.
                  </p>
                </div>
              )}
            </div>

            {/* Knob 4: Proton Stability */}
            <div
              onClick={() => setActiveParamIndex(3)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeParamIndex === 3
                  ? 'bg-[var(--void-2)] border-[var(--indigo)] shadow-lg shadow-[var(--indigo-glow)]'
                  : 'bg-[var(--void-2)]/60 border-[var(--hair)] hover:border-[var(--hair-2)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="mono text-[11px] text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[var(--indigo)]" /> Atomic Longevity
                </span>
                <span
                  className={`text-xs font-semibold mono ${
                    protonLifetime >= 34 ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'
                  }`}
                >
                  {protonLifetime >= 34 ? '✅ Stable Protons' : '❌ Decay Too Fast'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">Proton Stability</h3>
                <span className="text-xl font-bold mono text-[var(--indigo)]">
                  10^{protonLifetime.toFixed(0)} <span className="text-xs font-normal text-[var(--ink-soft)]">yr</span>
                </span>
              </div>

              <div className="relative py-1">
                <Slider
                  value={[protonLifetime]}
                  onValueChange={(val) => {
                    setProtonLifetime(val[0]);
                    setActiveParamIndex(3);
                  }}
                  min={30}
                  max={40}
                  step={0.1}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((34 - 30) / (40 - 30)) * 100}%`,
                    width: `${((40 - 34) / (40 - 30)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] mono text-[var(--ink-soft)] mt-1">
                <span>10³⁰</span>
                <span className="text-[var(--goldilocks)] font-medium">10³⁴+ (Threshold Floor)</span>
                <span>10⁴⁰</span>
              </div>

              {activeParamIndex === 3 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--hair)]">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--indigo)] font-semibold mb-1">
                    <BookOpen className="w-3 h-3" /> Mass Gap & Threshold
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--ink-mid)]">
                    Threshold parameter, not a narrow band: longer than 10³⁴ years is safe to infinity. Protected by the neutron-proton mass gap (1.293 MeV &gt; me).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 2×2 SPACIOUS QUAD DECK: Generous 600px+ cards displaying all four concepts concurrently */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Quark Binding Force */}
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] overflow-hidden shadow-xl flex flex-col">
            <div className="p-3.5 border-b border-[var(--hair)] flex items-center justify-between bg-[var(--void)]">
              <div>
                <div className="text-xs mono text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-[var(--indigo)]" /> Strong Nuclear Force
                </div>
                <h3 className="text-base font-bold text-[var(--ink)]">Quark Binding Force</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold mono text-[var(--indigo)]">{strongForce.toFixed(3)} αs</div>
                <div className={`text-xs mono font-medium ${strongForce >= 0.98 && strongForce <= 1.02 ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {strongForce >= 0.98 && strongForce <= 1.02 ? '✅ Stable Matter' : '❌ Unstable'}
                </div>
              </div>
            </div>
            <div className="h-[280px] bg-[var(--void)] relative overflow-hidden">
              <QcdFluxTubeVisual strongForce={strongForce} />
            </div>
            <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)]">
              <div className="relative py-1 mb-1.5">
                <Slider
                  value={[strongForce]}
                  onValueChange={(val) => setStrongForce(val[0])}
                  min={0.8}
                  max={1.2}
                  step={0.001}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.98 - 0.8) / (1.2 - 0.8)) * 100}%`,
                    width: `${((1.02 - 0.98) / (1.2 - 0.8)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mono text-[var(--ink-soft)]">
                <span>0.8</span>
                <span className="text-[var(--goldilocks)]">0.98 – 1.02</span>
                <span>1.2</span>
              </div>
            </div>
          </div>

          {/* Card 2: Mass Hierarchy */}
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] overflow-hidden shadow-xl flex flex-col">
            <div className="p-3.5 border-b border-[var(--hair)] flex items-center justify-between bg-[var(--void)]">
              <div>
                <div className="text-xs mono text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[var(--indigo)]" /> Force Strength Ratios
                </div>
                <h3 className="text-base font-bold text-[var(--ink)]">Mass Hierarchy</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold mono text-[var(--indigo)]">{hierarchyScale.toFixed(2)}×</div>
                <div className={`text-xs mono font-medium ${hierarchyScale >= 0.9 && hierarchyScale <= 1.1 ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {hierarchyScale >= 0.9 && hierarchyScale <= 1.1 ? '✅ Balanced Forces' : '❌ Imbalanced'}
                </div>
              </div>
            </div>
            <div className="h-[280px] bg-[var(--void)] relative overflow-hidden">
              <PlanckNeedleBalanceVisual massScale={hierarchyScale} />
            </div>
            <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)]">
              <div className="relative py-1 mb-1.5">
                <Slider
                  value={[hierarchyScale]}
                  onValueChange={(val) => setHierarchyScale(val[0])}
                  min={0.5}
                  max={2.0}
                  step={0.01}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.9 - 0.5) / (2 - 0.5)) * 100}%`,
                    width: `${((1.1 - 0.9) / (2 - 0.5)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mono text-[var(--ink-soft)]">
                <span>0.50</span>
                <span className="text-[var(--goldilocks)]">0.90 – 1.10</span>
                <span>2.00</span>
              </div>
            </div>
          </div>

          {/* Card 3: Matter vs Antimatter */}
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] overflow-hidden shadow-xl flex flex-col">
            <div className="p-3.5 border-b border-[var(--hair)] flex items-center justify-between bg-[var(--void)]">
              <div>
                <div className="text-xs mono text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--indigo)]" /> Cosmic Asymmetry
                </div>
                <h3 className="text-base font-bold text-[var(--ink)]">Matter vs Antimatter</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold mono text-[var(--indigo)]">{(matterAsymmetry * 100).toFixed(1)}%</div>
                <div className={`text-xs mono font-medium ${matterAsymmetry >= 0.08 && matterAsymmetry <= 0.12 ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {matterAsymmetry >= 0.08 && matterAsymmetry <= 0.12 ? '✅ Matter Exists' : '❌ No Matter'}
                </div>
              </div>
            </div>
            <div className="h-[280px] bg-[var(--void)] relative overflow-hidden">
              <PrimordialCrucibleVisual asymmetry={matterAsymmetry} />
            </div>
            <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)]">
              <div className="relative py-1 mb-1.5">
                <Slider
                  value={[matterAsymmetry]}
                  onValueChange={(val) => setMatterAsymmetry(val[0])}
                  min={0}
                  max={0.2}
                  step={0.001}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((0.08 - 0) / (0.2 - 0)) * 100}%`,
                    width: `${((0.12 - 0.08) / (0.2 - 0)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mono text-[var(--ink-soft)]">
                <span>0%</span>
                <span className="text-[var(--goldilocks)]">8.0 – 12.0%</span>
                <span>20%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Proton Stability */}
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--void-2)] overflow-hidden shadow-xl flex flex-col">
            <div className="p-3.5 border-b border-[var(--hair)] flex items-center justify-between bg-[var(--void)]">
              <div>
                <div className="text-xs mono text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[var(--indigo)]" /> Atomic Longevity
                </div>
                <h3 className="text-base font-bold text-[var(--ink)]">Proton Stability</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold mono text-[var(--indigo)]">10^{protonLifetime.toFixed(0)} yr</div>
                <div className={`text-xs mono font-medium ${protonLifetime >= 34 ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
                  {protonLifetime >= 34 ? '✅ Stable Protons' : '❌ Decay Too Fast'}
                </div>
              </div>
            </div>
            <div className="h-[280px] bg-[var(--void)] relative overflow-hidden">
              <NeutronProtonMassDialVisual lifetime={protonLifetime} />
            </div>
            <div className="p-4 bg-[var(--void-2)] border-t border-[var(--hair)]">
              <div className="relative py-1 mb-1.5">
                <Slider
                  value={[protonLifetime]}
                  onValueChange={(val) => setProtonLifetime(val[0])}
                  min={30}
                  max={40}
                  step={0.1}
                  className="w-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-[rgba(111,228,177,0.35)] rounded pointer-events-none"
                  style={{
                    left: `${((34 - 30) / (40 - 30)) * 100}%`,
                    width: `${((40 - 34) / (40 - 30)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mono text-[var(--ink-soft)]">
                <span>10³⁰</span>
                <span className="text-[var(--goldilocks)]">10³⁴+ yr</span>
                <span>10⁴⁰</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
