'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, AlertTriangle, Atom, Layers, ArrowRight, Zap } from 'lucide-react';

interface NeutronProtonMassDialVisualProps {
  lifetime: number; // 30 to 40, displayed as 10^value years
}

export function NeutronProtonMassDialVisual({ lifetime }: NeutronProtonMassDialVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState<'mass' | 'timeline'>('mass');

  // Physical stability: lifetime >= 34 is the experimental threshold
  const isStable = lifetime >= 34;

  // Derived mass gap: at 35, Δm = 1.293 MeV (standard observed)
  // Maps 30..40 to ~ -0.2 MeV .. 2.8 MeV
  const deltaM = 1.293 + (lifetime - 35) * 0.28;
  const isProtonDecaying = deltaM < 0.511; // Less than electron mass me = 0.511 MeV

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 420;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep space void
      const bg = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 1.3);
      if (!isStable || isProtonDecaying) {
        bg.addColorStop(0, 'rgba(32, 12, 16, 0.95)');
        bg.addColorStop(1, 'rgba(4, 2, 8, 1)');
      } else {
        bg.addColorStop(0, 'rgba(10, 16, 32, 0.95)');
        bg.addColorStop(1, 'rgba(2, 3, 8, 1)');
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      if (activeTab === 'mass') {
        // --- VIEW A: THE MASS DIFFERENCE DIAL (mn - mp) ---

        // Draw Energy Level Pillars
        const pillarWidth = 130;
        const protonX = centerX - 150;
        const neutronX = centerX + 150;
        const groundY = height * 0.72;

        // Proton Level (Base: 938.27 MeV)
        const protonLevelY = groundY;
        // Neutron Level (Elevated by deltaM)
        // Scale: 1 MeV = 50px
        const neutronLevelY = groundY - deltaM * 50;

        // 1. Proton Energy Well (Left)
        ctx.beginPath();
        ctx.roundRect(protonX - pillarWidth / 2, protonLevelY - 40, pillarWidth, 60, 8);
        const pGrad = ctx.createLinearGradient(protonX, protonLevelY - 40, protonX, protonLevelY + 20);
        pGrad.addColorStop(0, 'rgba(60, 120, 255, 0.3)');
        pGrad.addColorStop(1, 'rgba(20, 40, 100, 0.6)');
        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.strokeStyle = isProtonDecaying ? 'rgba(255, 80, 80, 0.7)' : 'rgba(111, 228, 177, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Proton Particle inside
        ctx.beginPath();
        ctx.arc(protonX, protonLevelY - 10, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#4488ff';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.fillText('p⁺', protonX, protonLevelY - 6);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px var(--font-mono, monospace)';
        ctx.fillText('PROTON (uud)', protonX, protonLevelY + 36);
        ctx.font = '10px var(--font-mono, monospace)';
        ctx.fillStyle = 'rgba(180, 200, 255, 0.8)';
        ctx.fillText('938.27 MeV', protonX, protonLevelY + 50);

        // 2. Neutron Energy Level (Right)
        ctx.beginPath();
        ctx.roundRect(neutronX - pillarWidth / 2, neutronLevelY - 40, pillarWidth, 60, 8);
        const nGrad = ctx.createLinearGradient(neutronX, neutronLevelY - 40, neutronX, neutronLevelY + 20);
        nGrad.addColorStop(0, 'rgba(160, 160, 180, 0.25)');
        nGrad.addColorStop(1, 'rgba(40, 40, 60, 0.5)');
        ctx.fillStyle = nGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 200, 220, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Neutron Particle inside
        ctx.beginPath();
        ctx.arc(neutronX, neutronLevelY - 10, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#8899aa';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.fillText('n⁰', neutronX, neutronLevelY - 6);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px var(--font-mono, monospace)';
        ctx.fillText('NEUTRON (udd)', neutronX, neutronLevelY + 36);
        ctx.font = '10px var(--font-mono, monospace)';
        ctx.fillStyle = 'rgba(200, 200, 220, 0.8)';
        ctx.fillText(`${(938.27 + deltaM).toFixed(2)} MeV`, neutronX, neutronLevelY + 50);

        // 3. Central Mass Gap Dial (Δm = mn - mp)
        ctx.beginPath();
        ctx.moveTo(centerX - 40, protonLevelY - 10);
        ctx.lineTo(centerX + 40, protonLevelY - 10);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 40, neutronLevelY - 10);
        ctx.lineTo(centerX + 40, neutronLevelY - 10);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();
        ctx.setLineDash([]);

        // Vertical Delta Dimension Line
        ctx.beginPath();
        ctx.moveTo(centerX, protonLevelY - 10);
        ctx.lineTo(centerX, neutronLevelY - 10);
        ctx.strokeStyle = isProtonDecaying ? '#ff5566' : '#6fe4b1';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Delta M Readout Card in Center
        const cardY = (protonLevelY + neutronLevelY) / 2 - 10;
        ctx.fillStyle = 'rgba(7, 7, 26, 0.9)';
        ctx.strokeStyle = isProtonDecaying ? 'rgba(255, 80, 80, 0.5)' : 'rgba(111, 228, 177, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(centerX - 68, cardY - 24, 136, 48, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isProtonDecaying ? '#ff8899' : '#6fe4b1';
        ctx.font = 'bold 13px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.fillText(`Δm = ${deltaM.toFixed(3)} MeV`, centerX, cardY - 4);

        ctx.font = '9px var(--font-mono, monospace)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(deltaM >= 0.511 ? 'Threshold > me (0.511 MeV)' : 'CRITICAL: Below me', centerX, cardY + 12);

        // 4. Beta Decay Feynman Animated Particle Stream
        if (deltaM >= 0.511) {
          // Free neutron decays safely into proton
          const decayProgress = (time * 0.6) % 1;
          const decayX = neutronX - 30 - decayProgress * (neutronX - protonX - 60);
          const decayY = neutronLevelY + decayProgress * (protonLevelY - neutronLevelY);

          ctx.beginPath();
          ctx.arc(decayX, decayY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#6fe4b1';
          ctx.fill();

          ctx.fillStyle = 'rgba(111, 228, 177, 0.9)';
          ctx.font = '9px var(--font-mono, monospace)';
          ctx.fillText('n → p + e⁻ + ν (Safe)', centerX, height - 35);
        } else {
          // Catastrophic Inverse Beta Decay: Proton decays into neutron!
          const decayProgress = (time * 0.8) % 1;
          const decayX = protonX + 30 + decayProgress * (neutronX - protonX - 60);
          const decayY = protonLevelY - decayProgress * (protonLevelY - neutronLevelY);

          ctx.beginPath();
          ctx.arc(decayX, decayY, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ff4455';
          ctx.fill();

          ctx.fillStyle = '#ff5566';
          ctx.font = 'bold 10px var(--font-mono, monospace)';
          ctx.fillText('⚡ CATASTROPHE: p → n + e⁺ + ν (ALL HYDROGEN DECAYS)', centerX, height - 35);
        }
      } else {
        // --- VIEW B: COSMIC TIMELINE HORIZON & EXPERIMENTAL FLOOR ---
        const startX = 60;
        const endX = width - 60;
        const barY = height * 0.5;

        // Axis line
        ctx.beginPath();
        ctx.moveTo(startX, barY);
        ctx.lineTo(endX, barY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Threshold Marker at 10^34 years
        const thresholdX = startX + ((34 - 30) / (40 - 30)) * (endX - startX);

        // Danger zone (< 10^34)
        ctx.beginPath();
        ctx.moveTo(startX, barY);
        ctx.lineTo(thresholdX, barY);
        ctx.strokeStyle = '#ff4455';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Infinite Plateau (> 10^34 to infinity)
        ctx.beginPath();
        ctx.moveTo(thresholdX, barY);
        ctx.lineTo(endX, barY);
        ctx.strokeStyle = '#6fe4b1';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Indicator
        const currentX = startX + Math.max(0, Math.min(1, (lifetime - 30) / 10)) * (endX - startX);
        ctx.beginPath();
        ctx.arc(currentX, barY, 8, 0, Math.PI * 2);
        ctx.fillStyle = isStable ? '#6fe4b1' : '#ff4455';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.fillText('10³⁰ yr (Immediate collapse)', startX + 30, barY + 30);
        ctx.fillText('10³⁴ yr (Super-K Limit)', thresholdX, barY + 30);
        ctx.fillText('10⁴⁰ yr → ∞ (Safe Plateau)', endX - 40, barY + 30);

        ctx.fillStyle = isStable ? '#6fe4b1' : '#ff8899';
        ctx.font = 'bold 12px var(--font-mono, monospace)';
        ctx.fillText(`Current: 10^${lifetime.toFixed(0)} years · ${isStable ? 'Beyond Floor (Untouched by Decay)' : 'Below Threshold (Decays Rapidly)'}`, centerX, height - 35);
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [lifetime, deltaM, isStable, isProtonDecaying, activeTab]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--void)] select-none">
      {/* Top Bar with View Mode Toggle */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
        <div className="flex items-center gap-3">
          <span className="mono font-semibold flex items-center gap-1.5" style={{ color: !isProtonDecaying ? 'var(--goldilocks)' : 'var(--warm)' }}>
            {!isProtonDecaying ? <ShieldCheck className="w-4 h-4 text-[var(--goldilocks)]" /> : <AlertTriangle className="w-4 h-4 text-[var(--warm)]" />}
            {!isProtonDecaying ? 'Stable Proton Ground State' : 'Hydrogen Decay Catastrophe'}
          </span>
          <span className="hidden sm:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden sm:inline-block mono text-[var(--ink-soft)]">
            Mass Gap: <strong className="text-[var(--ink)]">{deltaM.toFixed(3)} MeV</strong>
          </span>
          <span className="hidden md:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden md:inline-block mono text-[var(--ink-soft)]">
            Observed Lifetime: <strong className="text-[var(--ink)]">&gt; 10³⁴ years</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[var(--void-3)] p-0.5 rounded border border-[var(--hair)]">
          <button
            type="button"
            onClick={() => setActiveTab('mass')}
            className={`px-2 py-0.5 rounded text-[10px] mono transition-colors ${
              activeTab === 'mass' ? 'bg-[var(--indigo)] text-white font-medium' : 'text-[var(--ink-soft)] hover:text-white'
            }`}
          >
            Δm Mass Dial
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-2 py-0.5 rounded text-[10px] mono transition-colors ${
              activeTab === 'timeline' ? 'bg-[var(--indigo)] text-white font-medium' : 'text-[var(--ink-soft)] hover:text-white'
            }`}
          >
            Cosmic Horizon
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative flex-1 min-h-[340px] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Note on Threshold Parameter */}
        <div className="absolute top-3 left-4 pointer-events-none text-[11px] mono text-[var(--ink-soft)] flex items-center gap-2 bg-[var(--void-2)]/85 px-3 py-1.5 rounded border border-[var(--hair)]">
          <Layers className="w-3.5 h-3.5 text-[var(--indigo)]" />
          <span>Threshold Parameter: Safe to Infinity (∞). Not a narrow sweet spot.</span>
        </div>

        {/* Readout overlay */}
        <div className="absolute top-3 right-4 pointer-events-none text-right">
          <div className="text-xs mono uppercase tracking-wider text-[var(--ink-soft)]">Proton Lifetime</div>
          <div className="text-xl font-bold mono text-[var(--indigo)]">10^{lifetime.toFixed(0)} yr</div>
          <div className={`text-[11px] font-medium mono ${isStable ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
            {isStable ? '✅ Above 10³⁴ yr Floor' : '❌ Decays Too Fast'}
          </div>
        </div>
      </div>

      {/* Physical Consequence Footer */}
      <div className="px-4 py-2 border-t border-[var(--hair)] bg-[var(--void-2)]/60 text-xs flex items-center gap-2">
        <Atom className="w-3.5 h-3.5 text-[var(--indigo)] shrink-0" />
        <span className="text-[var(--ink-mid)]">
          {!isProtonDecaying
            ? 'Because the neutron is 1.293 MeV heavier than the proton, the proton is the lightest baryon and cannot decay into anything lighter without violating energy conservation.'
            : 'If mn - mp < 0.511 MeV, the mass hierarchy inverts! Protons capture electrons and turn into neutrons. All hydrogen dissolves.'}
        </span>
      </div>
    </div>
  );
}
