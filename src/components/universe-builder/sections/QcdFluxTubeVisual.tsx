'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Move, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface QcdFluxTubeVisualProps {
  strongForce: number; // αs value: 0.8 to 1.2, optimal 0.98 - 1.02
  minimal?: boolean;
}

interface Quark {
  id: string;
  name: string;
  flavor: 'u' | 'd';
  charge: string;
  colorName: 'Red' | 'Green' | 'Blue';
  colorHex: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isDragging?: boolean;
}

export function QcdFluxTubeVisual({ strongForce, minimal = false }: QcdFluxTubeVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  // Physical states derived from strong force
  const isOptimal = strongForce >= 0.98 && strongForce <= 1.02;
  const isTooWeak = strongForce < 0.98;
  const isTooStrong = strongForce > 1.02;

  // Tension & vacuum parameters
  const stringTensionTons = (14 * strongForce).toFixed(1);
  const protonRadiusFm = isTooWeak ? (0.84 * (1 + (0.98 - strongForce) * 5)).toFixed(2) : (0.84 / Math.sqrt(strongForce)).toFixed(2);
  const [draggedQuarkId, setDraggedQuarkId] = useState<string | null>(null);
  const [stringSnapped, setStringSnapped] = useState<boolean>(false);
  const [vacuumMesonCreated, setVacuumMesonCreated] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'flux' | 'vacuum' | 'energy'>('flux');

  // Quarks state ref for continuous animation
  const quarksRef = useRef<Quark[]>([
    { id: 'q1', name: 'Up', flavor: 'u', charge: '+2/3', colorName: 'Red', colorHex: '#ff4455', x: 0, y: 0, targetX: 0, targetY: 0 },
    { id: 'q2', name: 'Up', flavor: 'u', charge: '+2/3', colorName: 'Green', colorHex: '#44ff88', x: 0, y: 0, targetX: 0, targetY: 0 },
    { id: 'q3', name: 'Down', flavor: 'd', charge: '-1/3', colorName: 'Blue', colorHex: '#4499ff', x: 0, y: 0, targetX: 0, targetY: 0 },
  ]);

  // Color rotation phase for QCD color-charge exchange
  const colorPhaseRef = useRef<number>(0);
  const virtualPairsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  // Mouse interaction handling
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check hit on quarks
    quarksRef.current.forEach((q) => {
      const dist = Math.hypot(q.x - mouseX, q.y - mouseY);
      if (dist < 32) {
        setDraggedQuarkId(q.id);
        q.isDragging = true;
      }
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedQuarkId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const q = quarksRef.current.find((item) => item.id === draggedQuarkId);
    if (q) {
      q.x = mouseX;
      q.y = mouseY;

      // Check for string-breaking distance from center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const distFromCenter = Math.hypot(q.x - centerX, q.y - centerY);

      if (distFromCenter > 130 && !stringSnapped) {
        setStringSnapped(true);
        setVacuumMesonCreated(true);
        // Spawn virtual pair particles
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 4;
          virtualPairsRef.current.push({
            x: (q.x + centerX) / 2,
            y: (q.y + centerY) / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color: Math.random() > 0.5 ? '#ff44aa' : '#44ffff',
          });
        }
      }
    }
  }, [draggedQuarkId, stringSnapped]);

  const handleMouseUp = useCallback(() => {
    if (draggedQuarkId) {
      const q = quarksRef.current.find((item) => item.id === draggedQuarkId);
      if (q) q.isDragging = false;
      setDraggedQuarkId(null);
    }
  }, [draggedQuarkId]);

  // Touch interaction handling for mobile and tablet
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;

    quarksRef.current.forEach((q) => {
      const dist = Math.hypot(q.x - mouseX, q.y - mouseY);
      if (dist < 36) {
        setDraggedQuarkId(q.id);
        q.isDragging = true;
      }
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!draggedQuarkId || e.touches.length !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;

    const q = quarksRef.current.find((item) => item.id === draggedQuarkId);
    if (q) {
      q.x = mouseX;
      q.y = mouseY;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const distFromCenter = Math.hypot(q.x - centerX, q.y - centerY);

      if (distFromCenter > 130 && !stringSnapped) {
        setStringSnapped(true);
        setVacuumMesonCreated(true);
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 4;
          virtualPairsRef.current.push({
            x: (q.x + centerX) / 2,
            y: (q.y + centerY) / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color: Math.random() > 0.5 ? '#ff44aa' : '#44ffff',
          });
        }
      }
    }
  }, [draggedQuarkId, stringSnapped]);

  const resetQuarks = () => {
    setStringSnapped(false);
    setVacuumMesonCreated(false);
    virtualPairsRef.current = [];
  };

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      colorPhaseRef.current += 0.02;

      // Responsive dimensions with pixel ratio
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 420;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background rendering (transparent with soft cosmic glow in minimal mode)
      if (minimal) {
        ctx.clearRect(0, 0, width, height);
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) * 0.45);
        if (isTooWeak) {
          bgGrad.addColorStop(0, 'rgba(12, 18, 50, 0.35)');
          bgGrad.addColorStop(1, 'transparent');
        } else if (isTooStrong) {
          bgGrad.addColorStop(0, 'rgba(60, 15, 20, 0.4)');
          bgGrad.addColorStop(1, 'transparent');
        } else {
          bgGrad.addColorStop(0, 'rgba(30, 35, 95, 0.3)');
          bgGrad.addColorStop(1, 'transparent');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 1.5);
        if (isTooWeak) {
          bgGrad.addColorStop(0, 'rgba(8, 12, 32, 0.95)');
          bgGrad.addColorStop(1, 'rgba(2, 3, 10, 1)');
        } else if (isTooStrong) {
          bgGrad.addColorStop(0, 'rgba(38, 10, 14, 0.95)');
          bgGrad.addColorStop(1, 'rgba(4, 2, 8, 1)');
        } else {
          bgGrad.addColorStop(0, 'rgba(10, 16, 38, 0.95)');
          bgGrad.addColorStop(1, 'rgba(3, 3, 8, 1)');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // Base radius scaled by strong force
      let baseOrbitRadius = 85;
      if (isTooWeak) {
        baseOrbitRadius = 85 + (0.98 - strongForce) * 350; // Drifts apart into void
      } else if (isTooStrong) {
        baseOrbitRadius = Math.max(30, 85 - (strongForce - 1.02) * 200); // Crushed into dense core
      }

      // Update Quark target coordinates
      quarksRef.current.forEach((q, i) => {
        const baseAngle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        // Jitter from quantum fluctuations, higher when strong force is anomalous
        const jitterFreq = isTooStrong ? 8 : 4;
        const jitterAmp = isTooWeak ? 14 : isTooStrong ? 2 : 5;
        const angle = baseAngle + Math.sin(time * jitterFreq + i * 2) * 0.08;
        const rad = baseOrbitRadius + Math.cos(time * (jitterFreq + 1) + i) * jitterAmp;

        q.targetX = centerX + Math.cos(angle) * rad;
        q.targetY = centerY + Math.sin(angle) * rad;

        if (!q.isDragging) {
          // Smooth return to orbit
          const lerpFactor = isTooWeak ? 0.03 : 0.15;
          q.x += (q.targetX - q.x) * lerpFactor;
          q.y += (q.targetY - q.y) * lerpFactor;
        }
      });

      // Calculate Y-junction Steiner minimal point (or centroid)
      const junctionX = (quarksRef.current[0].x + quarksRef.current[1].x + quarksRef.current[2].x) / 3;
      const junctionY = (quarksRef.current[0].y + quarksRef.current[1].y + quarksRef.current[2].y) / 3;

      // 1. Draw Proton Boundary Halo (Color Confinement Bag)
      if (!isTooWeak) {
        ctx.beginPath();
        const bagRadius = isTooStrong ? baseOrbitRadius * 1.35 : baseOrbitRadius * 1.5;
        const bagGrad = ctx.createRadialGradient(centerX, centerY, bagRadius * 0.2, centerX, centerY, bagRadius);
        bagGrad.addColorStop(0, isTooStrong ? 'rgba(255, 90, 60, 0.08)' : 'rgba(122, 123, 255, 0.09)');
        bagGrad.addColorStop(0.8, isTooStrong ? 'rgba(255, 60, 60, 0.04)' : 'rgba(111, 228, 177, 0.05)');
        bagGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bagGrad;
        ctx.arc(centerX, centerY, bagRadius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle dashed boundary of proton bag
        ctx.beginPath();
        ctx.arc(centerX, centerY, bagRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isTooStrong ? 'rgba(255, 100, 80, 0.25)' : 'rgba(122, 123, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Draw Gluon Flux Tubes (Y-Junction String Model)
      quarksRef.current.forEach((q, i) => {
        if (isTooWeak && strongForce < 0.92) {
          // Dissolved flux tube: faint broken line
          ctx.beginPath();
          ctx.moveTo(junctionX, junctionY);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(80, 100, 160, 0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 8]);
          ctx.stroke();
          ctx.setLineDash([]);
          return;
        }

        // Animated wavy flux tube lines representing self-interacting gluons
        const segments = 24;
        const dx = q.x - junctionX;
        const dy = q.y - junctionY;
        const length = Math.hypot(dx, dy);
        const normalX = -dy / (length || 1);
        const normalY = dx / (length || 1);

        // Flux tube thickness scales with strong coupling αs
        const tubeWidth = Math.max(2, 6 * strongForce * (1 - (length / 300)));

        // Multi-strand color flux tube
        const strandOffsets = [-tubeWidth / 2, 0, tubeWidth / 2];
        const colors = isTooStrong
          ? ['rgba(255, 60, 40, 0.7)', 'rgba(255, 180, 60, 0.8)', 'rgba(255, 90, 40, 0.7)']
          : isTooWeak
          ? ['rgba(80, 120, 255, 0.3)', 'rgba(140, 180, 255, 0.4)', 'rgba(80, 120, 255, 0.3)']
          : ['rgba(255, 80, 100, 0.8)', 'rgba(80, 255, 140, 0.8)', 'rgba(80, 140, 255, 0.8)'];

        strandOffsets.forEach((offset, sIdx) => {
          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            const t = s / segments;
            const baseX = junctionX + dx * t;
            const baseY = junctionY + dy * t;
            // Chromodynamic wave vibration
            const wave = Math.sin(time * 6 + s * 0.7 + i * 2 + sIdx) * (3.5 * strongForce);
            const px = baseX + normalX * (offset + wave);
            const py = baseY + normalY * (offset + wave);

            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }

          ctx.strokeStyle = colors[sIdx];
          ctx.lineWidth = isTooStrong ? 2.5 : 1.8;
          ctx.stroke();
        });

        // Glowing center core of the tube
        ctx.beginPath();
        ctx.moveTo(junctionX, junctionY);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = isTooStrong
          ? 'rgba(255, 240, 180, 0.9)'
          : isTooWeak
          ? 'rgba(180, 210, 255, 0.3)'
          : 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = Math.max(1, 2.5 * strongForce);
        ctx.stroke();
      });

      // 3. Draw Central Triple-Gluon Junction Node
      if (!isTooWeak || strongForce > 0.92) {
        ctx.beginPath();
        const juncGlow = ctx.createRadialGradient(junctionX, junctionY, 2, junctionX, junctionY, 22);
        juncGlow.addColorStop(0, isTooStrong ? '#ffbb44' : '#ffffff');
        juncGlow.addColorStop(0.5, isTooStrong ? 'rgba(255, 80, 40, 0.6)' : 'rgba(122, 123, 255, 0.6)');
        juncGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = juncGlow;
        ctx.arc(junctionX, junctionY, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(junctionX, junctionY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // 4. Draw Quarks
      quarksRef.current.forEach((q) => {
        // Quark glow halo
        const qGlow = ctx.createRadialGradient(q.x, q.y, 6, q.x, q.y, 28);
        qGlow.addColorStop(0, q.colorHex);
        qGlow.addColorStop(0.6, `${q.colorHex}66`);
        qGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = qGlow;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 28, 0, Math.PI * 2);
        ctx.fill();

        // Quark core sphere
        ctx.beginPath();
        ctx.arc(q.x, q.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = q.colorHex;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Quark Label (Flavor & Charge)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${q.flavor}`, q.x, q.y - 1);

        // Small Charge Subscript
        ctx.font = '8px var(--font-mono, monospace)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText(q.charge, q.x, q.y + 22);
      });

      // 5. Render Virtual Meson Particles / String-Breaking Sparks
      if (virtualPairsRef.current.length > 0) {
        for (let i = virtualPairsRef.current.length - 1; i >= 0; i--) {
          const p = virtualPairsRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;

          if (p.life <= 0) {
            virtualPairsRef.current.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }

      // 6. String-Breaking Visual Banner if user pulled quark
      if (stringSnapped && vacuumMesonCreated) {
        ctx.fillStyle = 'rgba(255, 220, 100, 0.95)';
        ctx.font = 'bold 11px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ STRING BREAKING OCCURRED: Virtual Meson (q̄q) Created from Vacuum', width / 2, height - 28);
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [strongForce, isOptimal, isTooWeak, isTooStrong, stringSnapped, vacuumMesonCreated]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col select-none ${
        minimal ? 'bg-transparent border-none shadow-none pointer-events-auto' : 'bg-[var(--void)]'
      }`}
    >
      {/* Interactive Top Toolbelt (Hidden in minimal mode) */}
      {!minimal && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
          <div className="flex items-center gap-3">
            <span className="mono font-semibold flex items-center gap-1.5" style={{ color: isOptimal ? 'var(--goldilocks)' : 'var(--warm)' }}>
              {isOptimal ? <ShieldCheck className="w-4 h-4 text-[var(--goldilocks)]" /> : <AlertTriangle className="w-4 h-4 text-[var(--warm)]" />}
              {isOptimal ? 'Confinement Equilibrium' : isTooWeak ? 'Confinement Failure (Void)' : 'Diproton Catastrophe'}
            </span>
            <span className="hidden sm:inline-block w-px h-3 bg-[var(--hair-2)]" />
            <span className="hidden sm:inline-block mono text-[var(--ink-soft)]">
              Tension: <strong className="text-[var(--ink)]">{stringTensionTons} metric tons</strong>
            </span>
            <span className="hidden md:inline-block w-px h-3 bg-[var(--hair-2)]" />
            <span className="hidden md:inline-block mono text-[var(--ink-soft)]">
              Radius: <strong className="text-[var(--ink)]">{protonRadiusFm} fm</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetQuarks}
              className="px-2 py-1 rounded border border-[var(--hair)] text-[10px] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--indigo)] transition-colors flex items-center gap-1"
              title="Reset quark positions"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Stage */}
      <div className="relative flex-1 min-h-[340px] overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseUp}
          className="w-full h-full block touch-none"
        />

        {/* Floating Physics Legend / Drag Hint */}
        <div className={`absolute bottom-4 left-4 pointer-events-none text-[11px] mono text-[var(--ink-soft)] flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--hair)] ${
          minimal ? 'bg-[var(--void-2)]/90 backdrop-blur-md shadow-lg' : 'bg-[var(--void-2)]/85'
        }`}>
          <Move className="w-3 h-3 text-[var(--indigo)] animate-pulse" />
          <span>Interactive: Click & drag any quark to test gluon flux-tube tension</span>
        </div>

        {/* Real-time Subatomic Readout Overlay */}
        <div className={`absolute top-4 right-4 pointer-events-none text-right ${
          minimal ? 'bg-[var(--void-2)]/85 backdrop-blur-md p-2.5 rounded-lg border border-[var(--hair)] shadow-lg' : ''
        }`}>
          <div className="text-xs mono uppercase tracking-wider text-[var(--ink-soft)]">QCD Coupling</div>
          <div className="text-xl font-bold mono text-[var(--indigo)]">{strongForce.toFixed(3)} αs</div>
          <div className={`text-[11px] font-medium mono ${isOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
            {isOptimal ? '✅ 4% Safe Window' : isTooWeak ? '❌ Below 0.98 αs' : '❌ Above 1.02 αs'}
          </div>
        </div>

        {/* Reset button when minimal */}
        {minimal && (stringSnapped || Math.abs(strongForce - 1.0) > 0.05) && (
          <div className="absolute top-4 left-4 pointer-events-auto">
            <button
              type="button"
              onClick={resetQuarks}
              className="px-2.5 py-1 rounded bg-[var(--void-2)]/90 backdrop-blur-md border border-[var(--hair)] text-[11px] text-[var(--ink)] hover:border-[var(--indigo)] transition-colors flex items-center gap-1.5 shadow-lg"
              title="Reset quark positions"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--indigo)]" />
              <span>Reset Quarks</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-canvas Physical Consequence Bar (Hidden in minimal mode) */}
      {!minimal && (
        <div className="px-4 py-2 border-t border-[var(--hair)] bg-[var(--void-2)]/60 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--indigo)]" />
            <span className="text-[var(--ink-mid)]">
              {isOptimal && 'Stable protons enable hydrogen stars, stellar nucleosynthesis, and complex organic chemistry.'}
              {isTooWeak && 'Gluon flux tube fails: quarks separate into an unbound plasma. No hydrogen or atoms can ever form.'}
              {isTooStrong && 'Diprotons (^2He) become tightly bound: all primordial hydrogen fuses violently into helium-2 during the Big Bang.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
