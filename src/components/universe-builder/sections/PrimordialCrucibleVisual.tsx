'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Flame, ShieldCheck, AlertTriangle, Eye, RotateCcw } from 'lucide-react';

interface PrimordialCrucibleVisualProps {
  asymmetry: number; // 0.0 to 0.20, optimal 0.08 to 0.12 (displayed as value * 100 %)
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'matter' | 'antimatter' | 'survivor';
  color: string;
  size: number;
  alpha: number;
  annihilated?: boolean;
}

interface PhotonRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export function PrimordialCrucibleVisual({ asymmetry }: PrimordialCrucibleVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const isOptimal = asymmetry >= 0.08 && asymmetry <= 0.12;
  const isPureLight = asymmetry < 0.08;
  const isOverdense = asymmetry > 0.12;

  const [epoch, setEpoch] = useState<'furnace' | 'annihilating' | 'survivor'>('furnace');
  const [annihilationProgress, setAnnihilationProgress] = useState<number>(0);

  const particlesRef = useRef<Particle[]>([]);
  const photonRingsRef = useRef<PhotonRing[]>([]);

  // Initialize primordial particle soup
  const initParticles = useCallback((asymm: number) => {
    const total = 140;
    const matterRatio = 0.5 + (asymm * 0.5); // 0.5 at 0%, 0.55 at 10%
    const matterCount = Math.round(total * matterRatio);
    const antimatterCount = total - matterCount;

    const particles: Particle[] = [];
    for (let i = 0; i < matterCount; i++) {
      const isTheOne = i === 0 && asymm > 0.01;
      particles.push({
        x: Math.random() * 500 + 50,
        y: Math.random() * 320 + 40,
        vx: (Math.random() - 0.5) * 4.5,
        vy: (Math.random() - 0.5) * 4.5,
        type: isTheOne ? 'survivor' : 'matter',
        color: '#00f0ff',
        size: isTheOne ? 4.5 : 3,
        alpha: 1,
      });
    }

    for (let i = 0; i < antimatterCount; i++) {
      particles.push({
        x: Math.random() * 500 + 50,
        y: Math.random() * 320 + 40,
        vx: (Math.random() - 0.5) * 4.5,
        vy: (Math.random() - 0.5) * 4.5,
        type: 'antimatter',
        color: '#ff2277',
        size: 3,
        alpha: 1,
      });
    }

    particlesRef.current = particles;
    photonRingsRef.current = [];
  }, []);

  useEffect(() => {
    initParticles(asymmetry);
    setEpoch('furnace');
    setAnnihilationProgress(0);
  }, [asymmetry, initParticles]);

  const triggerAnnihilation = () => {
    if (epoch === 'furnace') {
      setEpoch('annihilating');
    } else {
      initParticles(asymmetry);
      setEpoch('furnace');
      setAnnihilationProgress(0);
    }
  };

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

      // Deep space void with thermal radiation background
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 1.3);
      if (epoch === 'survivor') {
        bgGrad.addColorStop(0, 'rgba(6, 12, 26, 0.95)');
        bgGrad.addColorStop(1, 'rgba(2, 2, 8, 1)');
      } else if (epoch === 'annihilating') {
        bgGrad.addColorStop(0, 'rgba(38, 26, 10, 0.95)');
        bgGrad.addColorStop(1, 'rgba(4, 3, 10, 1)');
      } else {
        bgGrad.addColorStop(0, 'rgba(24, 10, 36, 0.95)');
        bgGrad.addColorStop(1, 'rgba(3, 3, 8, 1)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Handle Annihilation Sequence
      if (epoch === 'annihilating') {
        setAnnihilationProgress((prev) => {
          const next = prev + 0.015;
          if (next >= 1) {
            setEpoch('survivor');
            return 1;
          }
          return next;
        });

        // Pair annihilation logic
        const matters = particlesRef.current.filter((p) => p.type === 'matter' && !p.annihilated);
        const antis = particlesRef.current.filter((p) => p.type === 'antimatter' && !p.annihilated);

        const pairsToAnnihilate = Math.min(matters.length, antis.length, 3);
        for (let i = 0; i < pairsToAnnihilate; i++) {
          const m = matters[i];
          const a = antis[i];
          if (m && a) {
            m.annihilated = true;
            a.annihilated = true;

            const midX = (m.x + a.x) / 2;
            const midY = (m.y + a.y) / 2;
            // Spawn gamma-ray photon shockwaves
            photonRingsRef.current.push({
              x: midX,
              y: midY,
              radius: 4,
              maxRadius: 40 + Math.random() * 30,
              alpha: 1,
              color: '#ffd055',
            });
          }
        }
      }

      // Update and Draw Particles
      particlesRef.current.forEach((p) => {
        if (p.annihilated) return;

        if (epoch === 'survivor' && p.type === 'survivor' && !isPureLight) {
          // Survivor drifts gracefully to center
          p.x += (centerX - p.x) * 0.05;
          p.y += (centerY - p.y) * 0.05;

          // Grand Survivor Halo
          const sGlow = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 65);
          sGlow.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
          sGlow.addColorStop(0.3, 'rgba(111, 228, 177, 0.5)');
          sGlow.addColorStop(0.8, 'rgba(122, 123, 255, 0.2)');
          sGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = sGlow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 65, 0, Math.PI * 2);
          ctx.fill();

          // Seed of Cosmic Structure (Hydrogen Orbit ring around survivor)
          ctx.beginPath();
          ctx.arc(p.x, p.y, 35, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(111, 228, 177, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Primordial motion
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 10 || p.x > width - 10) p.vx *= -1;
          if (p.y < 10 || p.y > height - 10) p.vy *= -1;
        }

        // Render Particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.type === 'survivor' && epoch === 'survivor' ? 6 : p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Particle subtle glow
        const glow = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 10);
        glow.addColorStop(0, p.color);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and Draw Expanding Photon Rings (The CMB Precursor)
      for (let i = photonRingsRef.current.length - 1; i >= 0; i--) {
        const ring = photonRingsRef.current[i];
        ring.radius += 2.2;
        ring.alpha -= 0.035;

        if (ring.alpha <= 0) {
          photonRingsRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 215, 80, ${ring.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // If epoch is survivor, draw cosmic narrative overlay
      if (epoch === 'survivor') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        if (isPureLight) {
          ctx.fillText('0 SURVIVORS: TOTAL ANNIHILATION → STERILE UNIVERSE OF LIGHT', centerX, height - 35);
        } else {
          ctx.fillText('1 IN A BILLION SURVIVED: THIS SINGLE EXCESS FORMED ALL ATOMS', centerX, height - 35);
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [epoch, isPureLight, isOptimal, isOverdense]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--void)] select-none">
      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
        <div className="flex items-center gap-3">
          <span className="mono font-semibold flex items-center gap-1.5" style={{ color: isOptimal ? 'var(--goldilocks)' : 'var(--warm)' }}>
            {isOptimal ? <ShieldCheck className="w-4 h-4 text-[var(--goldilocks)]" /> : <AlertTriangle className="w-4 h-4 text-[var(--warm)]" />}
            {isOptimal ? 'Baryon Asymmetry: 1 in 10⁹' : isPureLight ? 'Exact Symmetry (Complete Annihilation)' : 'Excess Baryon Density'}
          </span>
          <span className="hidden sm:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden sm:inline-block mono text-[var(--ink-soft)]">
            CMB Photons/Baryon: <strong className="text-[var(--ink)]">~2,000,000,000 : 1</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerAnnihilation}
            className={`px-2.5 py-1 rounded border text-[10px] font-mono transition-colors flex items-center gap-1.5 ${
              epoch === 'furnace'
                ? 'border-[var(--indigo)] bg-[var(--indigo-band)] text-[var(--ink)] hover:bg-[var(--indigo)]'
                : 'border-[var(--hair)] text-[var(--ink-soft)] hover:text-white'
            }`}
          >
            {epoch === 'furnace' ? (
              <>
                <Flame className="w-3 h-3 text-[var(--warm)]" /> Trigger Annihilation Epoch
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3" /> Reheat to Primordial Furnace
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative flex-1 min-h-[340px] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Legend */}
        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] mono text-[var(--ink-soft)] flex items-center gap-3 bg-[var(--void-2)]/85 px-3 py-1.5 rounded border border-[var(--hair)]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff]" /> Matter (Quarks)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff2277]" /> Antimatter (Antiquarks)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd055]" /> Photons (2γ)
          </span>
        </div>

        {/* Readout overlay */}
        <div className="absolute top-3 right-4 pointer-events-none text-right">
          <div className="text-xs mono uppercase tracking-wider text-[var(--ink-soft)]">Matter Surplus</div>
          <div className="text-xl font-bold mono text-[var(--indigo)]">{(asymmetry * 100).toFixed(1)}%</div>
          <div className={`text-[11px] font-medium mono ${isOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
            {isOptimal ? '✅ 8–12% Window' : isPureLight ? '❌ No Matter Left' : '❌ Runaway Collapse'}
          </div>
        </div>
      </div>

      {/* Physical Consequence Footer */}
      <div className="px-4 py-2 border-t border-[var(--hair)] bg-[var(--void-2)]/60 text-xs flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[var(--indigo)] shrink-0" />
        <span className="text-[var(--ink-mid)]">
          {isOptimal && 'A one-in-a-billion surplus escaped annihilation. That solitary remnant is every star, planet, ocean, and person that has ever existed.'}
          {isPureLight && 'Complete annihilation: quarks and antiquarks paired off perfectly into radiation. The universe is a sterile void of light.'}
          {isOverdense && 'Too much matter survived: baryon density suffocates stellar formation, collapsing the early universe into supermassive black holes.'}
        </span>
      </div>
    </div>
  );
}
