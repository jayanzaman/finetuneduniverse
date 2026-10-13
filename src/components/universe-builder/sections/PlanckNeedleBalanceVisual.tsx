'use client';

import { useEffect, useRef, useState } from 'react';
import { Scale, Zap, ShieldCheck, AlertTriangle, Compass } from 'lucide-react';

interface PlanckNeedleBalanceVisualProps {
  massScale: number; // 0.5 to 2.0, optimal 0.9 to 1.1
}

export function PlanckNeedleBalanceVisual({ massScale }: PlanckNeedleBalanceVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [pulseLoop, setPulseLoop] = useState<number>(0);

  const isBalanced = massScale >= 0.9 && massScale <= 1.1;
  const isNegativeCollapse = massScale < 0.9; // Massless world
  const isBlackHoleCollapse = massScale > 1.1; // Planckian black hole world

  const tiltAngleDeg = isBalanced
    ? (massScale - 1.0) * 12
    : isNegativeCollapse
    ? -24 - (0.9 - massScale) * 35
    : 24 + (massScale - 1.1) * 35;

  const triggerQuantumPerturbation = () => {
    setPulseLoop((p) => p + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let smoothTilt = tiltAngleDeg;

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

      // Interpolate tilt
      smoothTilt += (tiltAngleDeg - smoothTilt) * 0.1;
      const tiltRad = (smoothTilt * Math.PI) / 180;

      // Cosmic background
      const bg = ctx.createRadialGradient(width / 2, height / 2, 30, width / 2, height / 2, width / 1.4);
      if (isNegativeCollapse) {
        bg.addColorStop(0, 'rgba(8, 14, 30, 0.95)');
        bg.addColorStop(1, 'rgba(2, 4, 12, 1)');
      } else if (isBlackHoleCollapse) {
        bg.addColorStop(0, 'rgba(30, 6, 12, 0.95)');
        bg.addColorStop(1, 'rgba(4, 1, 6, 1)');
      } else {
        bg.addColorStop(0, 'rgba(12, 14, 32, 0.95)');
        bg.addColorStop(1, 'rgba(3, 3, 8, 1)');
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Gridlines representing spacetime metric
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const fulcrumX = width / 2;
      const fulcrumY = height * 0.62;
      const beamHalfWidth = Math.min(220, width * 0.38);

      // 1. Draw The Fulcrum: Ultra-Sharp Diamond Needle Tip
      ctx.save();
      // Needle base stand
      ctx.beginPath();
      ctx.moveTo(fulcrumX - 45, height - 20);
      ctx.lineTo(fulcrumX + 45, height - 20);
      ctx.lineTo(fulcrumX + 8, fulcrumY + 3);
      ctx.lineTo(fulcrumX - 8, fulcrumY + 3);
      ctx.closePath();
      const standGrad = ctx.createLinearGradient(fulcrumX - 40, height - 20, fulcrumX + 40, fulcrumY);
      standGrad.addColorStop(0, 'rgba(18, 20, 38, 0.9)');
      standGrad.addColorStop(0.5, 'rgba(60, 64, 100, 0.9)');
      standGrad.addColorStop(1, 'rgba(122, 123, 255, 0.8)');
      ctx.fillStyle = standGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      // Needle Razor Tip Point (Electroweak Scale v = 246 GeV)
      ctx.beginPath();
      ctx.moveTo(fulcrumX - 7, fulcrumY + 3);
      ctx.lineTo(fulcrumX + 7, fulcrumY + 3);
      ctx.lineTo(fulcrumX, fulcrumY);
      ctx.closePath();
      ctx.fillStyle = isBalanced ? '#6fe4b1' : '#ff5566';
      ctx.fill();

      // Needle Glow Halo
      const tipGlow = ctx.createRadialGradient(fulcrumX, fulcrumY, 1, fulcrumX, fulcrumY, 20);
      tipGlow.addColorStop(0, isBalanced ? 'rgba(111, 228, 177, 0.8)' : 'rgba(255, 85, 102, 0.8)');
      tipGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(fulcrumX, fulcrumY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Draw The Tilting Monolithic Balance Beam
      ctx.save();
      ctx.translate(fulcrumX, fulcrumY);
      ctx.rotate(tiltRad);

      // The Beam Structure
      ctx.beginPath();
      ctx.moveTo(-beamHalfWidth, -4);
      ctx.lineTo(beamHalfWidth, -4);
      ctx.lineTo(beamHalfWidth, 4);
      ctx.lineTo(-beamHalfWidth, 4);
      ctx.closePath();
      const beamGrad = ctx.createLinearGradient(-beamHalfWidth, 0, beamHalfWidth, 0);
      beamGrad.addColorStop(0, 'rgba(100, 160, 255, 0.85)');
      beamGrad.addColorStop(0.5, '#ffffff');
      beamGrad.addColorStop(1, 'rgba(255, 100, 140, 0.85)');
      ctx.fillStyle = beamGrad;
      ctx.fill();

      // Central pivot bearing
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.stroke();

      // --- Left Arm: Bare Lagrangian Mass Monolith (m0^2) ---
      const leftWeightX = -beamHalfWidth + 20;
      // Monolith hanging chain
      ctx.beginPath();
      ctx.moveTo(leftWeightX, 4);
      ctx.lineTo(leftWeightX, 36);
      ctx.strokeStyle = 'rgba(160, 180, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Crystalline Cosmic Monolith (Bare Mass ~ 10^19 GeV)
      ctx.beginPath();
      ctx.rect(leftWeightX - 32, 36, 64, 52);
      const monoGrad = ctx.createLinearGradient(leftWeightX - 32, 36, leftWeightX + 32, 88);
      monoGrad.addColorStop(0, 'rgba(60, 100, 220, 0.85)');
      monoGrad.addColorStop(1, 'rgba(20, 30, 80, 0.95)');
      ctx.fillStyle = monoGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(122, 123, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label on Left Monolith
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px var(--font-mono, monospace)';
      ctx.textAlign = 'center';
      ctx.fillText('BARE MASS', leftWeightX, 55);
      ctx.font = '8px var(--font-mono, monospace)';
      ctx.fillStyle = 'rgba(200, 220, 255, 0.85)';
      ctx.fillText('m₀² ~ 10¹⁹ GeV', leftWeightX, 70);

      // --- Right Arm: Quantum Loop Corrections Vortex (δm_H^2) ---
      const rightWeightX = beamHalfWidth - 20;
      // Loop suspension cable
      ctx.beginPath();
      ctx.moveTo(rightWeightX, 4);
      ctx.lineTo(rightWeightX, 36);
      ctx.strokeStyle = 'rgba(255, 120, 160, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Quantum Loop Swirling Vortex
      ctx.save();
      ctx.translate(rightWeightX, 62);
      const loopRadius = 28;
      // Vortex glow
      const vGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, loopRadius * 1.2);
      vGrad.addColorStop(0, 'rgba(255, 80, 120, 0.9)');
      vGrad.addColorStop(0.7, 'rgba(160, 40, 90, 0.4)');
      vGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = vGrad;
      ctx.beginPath();
      ctx.arc(0, 0, loopRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Virtual top-quark loop orbits
      for (let l = 0; l < 3; l++) {
        ctx.beginPath();
        const loopAngle = time * 3 + l * ((Math.PI * 2) / 3);
        ctx.ellipse(0, 0, loopRadius, loopRadius * 0.45, loopAngle, 0, Math.PI * 2);
        ctx.strokeStyle = l === 0 ? 'rgba(255, 200, 220, 0.8)' : 'rgba(255, 100, 140, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px var(--font-mono, monospace)';
      ctx.textAlign = 'center';
      ctx.fillText('QUANTUM LOOPS', 0, -4);
      ctx.font = '8px var(--font-mono, monospace)';
      ctx.fillStyle = 'rgba(255, 200, 220, 0.85)';
      ctx.fillText('δm_H² ~ 10¹⁹ GeV', 0, 9);
      ctx.restore();

      ctx.restore(); // Exit rotating beam coordinate space

      // 3. Precision Cancellation Micro-Gauge (1 part in 10^34)
      const gaugeY = fulcrumY - 60;
      ctx.fillStyle = 'rgba(7, 7, 26, 0.85)';
      ctx.strokeStyle = isBalanced ? 'rgba(111, 228, 177, 0.4)' : 'rgba(255, 85, 102, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(fulcrumX - 110, gaugeY - 26, 220, 46, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isBalanced ? '#6fe4b1' : '#ff8899';
      ctx.font = 'bold 10px var(--font-mono, monospace)';
      ctx.textAlign = 'center';
      ctx.fillText(
        isBalanced ? 'CANCELLATION: 1 PART IN 10³⁴' : isNegativeCollapse ? 'UNDER-CANCELLATION (NEGATIVE)' : 'LOOP BLOW-UP (PLANCK OVERLOAD)',
        fulcrumX,
        gaugeY - 8
      );

      // Micro needle deflection bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(fulcrumX - 80, gaugeY + 4, 160, 4);

      const markerX = fulcrumX + (smoothTilt / 35) * 80;
      ctx.fillStyle = isBalanced ? '#6fe4b1' : '#ff4455';
      ctx.beginPath();
      ctx.arc(markerX, gaugeY + 6, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [massScale, isBalanced, isNegativeCollapse, isBlackHoleCollapse, tiltAngleDeg, pulseLoop]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--void)] select-none">
      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
        <div className="flex items-center gap-3">
          <span className="mono font-semibold flex items-center gap-1.5" style={{ color: isBalanced ? 'var(--goldilocks)' : 'var(--warm)' }}>
            {isBalanced ? <ShieldCheck className="w-4 h-4 text-[var(--goldilocks)]" /> : <AlertTriangle className="w-4 h-4 text-[var(--warm)]" />}
            {isBalanced ? 'Electroweak VEV: 246 GeV' : isNegativeCollapse ? 'VEV = 0 (Massless Quarks)' : 'Planck Scale Collapse (10¹⁹ GeV)'}
          </span>
          <span className="hidden sm:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden sm:inline-block mono text-[var(--ink-soft)]">
            Precision: <strong className="text-[var(--ink)]">1 in 10³⁴</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerQuantumPerturbation}
            className="px-2.5 py-1 rounded border border-[var(--hair)] text-[10px] text-[var(--indigo)] hover:text-white hover:border-[var(--indigo)] transition-colors flex items-center gap-1.5"
            title="Inject virtual top-quark quantum fluctuation"
          >
            <Zap className="w-3 h-3 text-[var(--warm)]" /> Test Quantum Loop
          </button>
        </div>
      </div>

      {/* Main Balance Canvas */}
      <div className="relative flex-1 min-h-[340px] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Needle Tip Annotation */}
        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] mono text-[var(--ink-soft)] flex items-center gap-2 bg-[var(--void-2)]/85 px-3 py-1.5 rounded border border-[var(--hair)]">
          <Scale className="w-3.5 h-3.5 text-[var(--indigo)]" />
          <span>The Fulcrum: The 246 GeV Electroweak scale balanced against 10¹⁹ GeV Planck loops</span>
        </div>

        {/* Readout overlay */}
        <div className="absolute top-3 right-4 pointer-events-none text-right">
          <div className="text-xs mono uppercase tracking-wider text-[var(--ink-soft)]">Hierarchy Multiplier</div>
          <div className="text-xl font-bold mono text-[var(--indigo)]">{massScale.toFixed(2)}×</div>
          <div className={`text-[11px] font-medium mono ${isBalanced ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
            {isBalanced ? '✅ Fine-Tuned (0.9 – 1.1)' : '❌ Balance Broken'}
          </div>
        </div>
      </div>

      {/* Physical Consequence Footer */}
      <div className="px-4 py-2 border-t border-[var(--hair)] bg-[var(--void-2)]/60 text-xs flex items-center gap-2">
        <Compass className="w-3.5 h-3.5 text-[var(--indigo)] shrink-0" />
        <span className="text-[var(--ink-mid)]">
          {isBalanced && 'Quantum loops and bare mass cancel to 34 decimal places, allowing atoms to have finite mass and chemistry to exist.'}
          {isNegativeCollapse && 'Under-cancellation: The Higgs field does not condense. Quarks and electrons remain strictly massless, flying at light speed.'}
          {isBlackHoleCollapse && 'Over-cancellation: The Higgs mass rockets to the Planck scale. Elementary particles become microscopic black holes.'}
        </span>
      </div>
    </div>
  );
}
