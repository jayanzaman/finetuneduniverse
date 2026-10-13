'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Flame, ShieldCheck, AlertTriangle, RotateCcw, Activity } from 'lucide-react';

interface PrimordialCrucibleVisualProps {
  asymmetry: number; // 0.0 to 0.20, optimal 0.08 to 0.12 (displayed as value * 100 %)
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'matter' | 'antimatter' | 'survivor';
  color: string;
  size: number;
  alpha: number;
  history: Array<{ x: number; y: number }>;
  morphing?: number; // 0 to 1 for visual transition flash
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
  const [liveRatio, setLiveRatio] = useState<{ matter: number; antimatter: number }>({ matter: 50, antimatter: 50 });

  const particlesRef = useRef<Particle[]>([]);
  const photonRingsRef = useRef<PhotonRing[]>([]);
  const nextParticleId = useRef<number>(1);

  // Initialize a stable population of particles
  const initParticles = useCallback((asymm: number) => {
    const total = 110;
    const matterRatio = 0.5 + asymm * 0.5;
    const matterCount = Math.round(total * matterRatio);
    const antimatterCount = total - matterCount;

    const particles: Particle[] = [];
    nextParticleId.current = 1;

    for (let i = 0; i < total; i++) {
      const isMatter = i < matterCount;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 2.0;

      particles.push({
        id: nextParticleId.current++,
        x: Math.random() * 520 + 40,
        y: Math.random() * 320 + 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: isMatter ? 'matter' : 'antimatter',
        color: isMatter ? '#00e5ff' : '#ff2a77',
        size: isMatter ? 3.5 : 3.2,
        alpha: 1,
        history: [],
      });
    }

    particlesRef.current = particles;
    photonRingsRef.current = [];
    setLiveRatio({
      matter: Math.round((matterCount / total) * 100),
      antimatter: Math.round((antimatterCount / total) * 100),
    });
  }, []);

  // First-time mount initialization
  useEffect(() => {
    if (particlesRef.current.length === 0) {
      initParticles(asymmetry);
    }
  }, [asymmetry, initParticles]);

  // Dynamically update population when slider moves WITHOUT destroying or resetting positions
  useEffect(() => {
    const total = particlesRef.current.length || 110;
    const targetMatterRatio = 0.5 + asymmetry * 0.5;
    const targetMatterCount = Math.round(total * targetMatterRatio);

    const activeParticles = particlesRef.current.filter((p) => !p.annihilated);
    const currentMatterCount = activeParticles.filter((p) => p.type === 'matter' || p.type === 'survivor').length;
    const diff = targetMatterCount - currentMatterCount;

    if (diff > 0) {
      // Need more matter: convert antimatter particles to matter with an ionization burst
      let converted = 0;
      for (const p of activeParticles) {
        if (p.type === 'antimatter' && converted < diff) {
          p.type = 'matter';
          p.color = '#00e5ff';
          p.morphing = 1.0;
          converted++;
        }
      }
    } else if (diff < 0) {
      // Need more antimatter: convert matter particles back
      let converted = 0;
      const needed = Math.abs(diff);
      for (const p of activeParticles) {
        if (p.type === 'matter' && converted < needed) {
          p.type = 'antimatter';
          p.color = '#ff2a77';
          p.morphing = 1.0;
          converted++;
        }
      }
    }

    const matterPct = Math.round(targetMatterRatio * 100);
    setLiveRatio({ matter: matterPct, antimatter: 100 - matterPct });
  }, [asymmetry]);

  const triggerAnnihilation = () => {
    if (epoch === 'furnace') {
      setEpoch('annihilating');
    } else {
      initParticles(asymmetry);
      setEpoch('furnace');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.025;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 420;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const centerX = width / 2;
      const centerY = height / 2;

      // Radial background influenced by asymmetry regime
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, width / 1.3);
      if (epoch === 'survivor') {
        bgGrad.addColorStop(0, 'rgba(8, 16, 32, 0.95)');
        bgGrad.addColorStop(1, 'rgba(2, 2, 8, 1)');
      } else if (isPureLight) {
        // High thermal annihilation glow
        bgGrad.addColorStop(0, 'rgba(32, 10, 28, 0.95)');
        bgGrad.addColorStop(1, 'rgba(3, 2, 10, 1)');
      } else if (isOverdense) {
        // Heavy gravitational well core
        bgGrad.addColorStop(0, 'rgba(30, 20, 8, 0.95)');
        bgGrad.addColorStop(1, 'rgba(4, 2, 8, 1)');
      } else {
        // Optimal cosmos: balanced, deep blue-violet
        bgGrad.addColorStop(0, 'rgba(12, 16, 38, 0.95)');
        bgGrad.addColorStop(1, 'rgba(2, 3, 8, 1)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle gravitational or orbital guide ring in optimal/overdense regimes
      if (isOptimal) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(111, 228, 177, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 12]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isOverdense) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(231, 140, 90, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Handle Manual Annihilation Sequence Transition
      if (epoch === 'annihilating') {
        const matters = particlesRef.current.filter((p) => p.type === 'matter' && !p.annihilated);
        const antis = particlesRef.current.filter((p) => p.type === 'antimatter' && !p.annihilated);

        if (antis.length > 0 && matters.length > 0) {
          const pairsToKill = Math.min(matters.length, antis.length, 2);
          for (let i = 0; i < pairsToKill; i++) {
            const m = matters[i];
            const a = antis[i];
            if (m && a) {
              m.annihilated = true;
              a.annihilated = true;

              const midX = (m.x + a.x) / 2;
              const midY = (m.y + a.y) / 2;
              photonRingsRef.current.push({
                x: midX,
                y: midY,
                radius: 4,
                maxRadius: 50,
                alpha: 1,
                color: '#ffd055',
              });
            }
          }
        } else {
          setEpoch('survivor');
          // Promote remaining matter particle to survivor
          const survivor = particlesRef.current.find((p) => p.type === 'matter' && !p.annihilated);
          if (survivor) {
            survivor.type = 'survivor';
            survivor.color = '#00f0ff';
          }
        }
      }

      // === KINEMATICS ENGINE: MOVEMENT LINKED DIRECTLY TO ASYMMETRY ===
      const activeParticles = particlesRef.current.filter((p) => !p.annihilated);

      // Physics parameters governed by asymmetry slider:
      // 1. Mutual Annihilation Attraction Force: Strongest when asymmetry is near 0.
      const attractionStrength = Math.max(0.05, 0.45 - asymmetry * 1.8);

      // 2. Coherent Orbital Torque: Maximized in the Goldilocks zone (0.08 - 0.12).
      const orbitalStrength = isOptimal ? 0.045 : 0.005;

      // 3. Gravitational Collapse Inward Pull: Dominates at high asymmetry (> 0.12).
      const collapsePull = isOverdense ? (asymmetry - 0.12) * 0.8 : 0;

      // 4. Kinetic Velocity Limit & Damping
      const maxSpeed = isPureLight ? 5.2 : isOptimal ? 2.4 : 6.0;

      for (let i = 0; i < activeParticles.length; i++) {
        const p = activeParticles[i];

        // Store trail history
        p.history.push({ x: p.x, y: p.y });
        const trailLength = isOptimal ? 8 : isOverdense ? 10 : 4;
        if (p.history.length > trailLength) {
          p.history.shift();
        }

        if (epoch === 'survivor' && p.type === 'survivor' && !isPureLight) {
          // Solitary survivor drifts gracefully to center
          p.x += (centerX - p.x) * 0.05;
          p.y += (centerY - p.y) * 0.05;
        } else {
          // Inter-particle forces: Matter attracts Antimatter (Mutual Collision Attraction)
          for (let j = i + 1; j < activeParticles.length; j++) {
            const p2 = activeParticles[j];
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const distSq = dx * dx + dy * dy;

            if (distSq > 1 && distSq < 14000) {
              const dist = Math.sqrt(distSq);

              if (p.type !== p2.type) {
                // Opposite charges: mutual attraction for annihilation
                const force = (attractionStrength * 30) / (distSq + 80);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                p.vx += fx;
                p.vy += fy;
                p2.vx -= fx;
                p2.vy -= fy;

                // Micro-annihilation spark on proximity during furnace epoch
                if (dist < 8 && Math.random() < 0.25) {
                  photonRingsRef.current.push({
                    x: (p.x + p2.x) / 2,
                    y: (p.y + p2.y) / 2,
                    radius: 2,
                    maxRadius: 22,
                    alpha: 0.85,
                    color: '#ffd055',
                  });
                }
              } else {
                // Same charges: gentle repulsive separation
                const rep = 8 / (distSq + 40);
                p.vx -= (dx / dist) * rep;
                p.vy -= (dy / dist) * rep;
              }
            }
          }

          // Global Field Forces:
          const distToCenter = Math.hypot(p.x - centerX, p.y - centerY) || 1;

          if (isOptimal) {
            // Goldilocks: Smooth orbital swirl (Coriolis centripetal drift forming cosmic structures)
            const tangentX = -(p.y - centerY) / distToCenter;
            const tangentY = (p.x - centerX) / distToCenter;

            p.vx += tangentX * orbitalStrength * 1.5;
            p.vy += tangentY * orbitalStrength * 1.5;

            // Soft radial stabilizer toward orbit ring (r ~ 120px)
            const orbitOffset = distToCenter - 120;
            p.vx -= ((p.x - centerX) / distToCenter) * orbitOffset * 0.003;
            p.vy -= ((p.y - centerY) / distToCenter) * orbitOffset * 0.003;

            // Gentle damping for majestic, glassy laminar motion
            p.vx *= 0.985;
            p.vy *= 0.985;
          } else if (isOverdense) {
            // Excess matter: Strong gravitational collapse toward center core
            const grav = collapsePull * (120 / (distToCenter + 30));
            p.vx -= ((p.x - centerX) / distToCenter) * grav;
            p.vy -= ((p.y - centerY) / distToCenter) * grav;

            // Spiral component
            const tangentX = -(p.y - centerY) / distToCenter;
            const tangentY = (p.x - centerX) / distToCenter;
            p.vx += tangentX * 0.2;
            p.vy += tangentY * 0.2;
          } else {
            // Low asymmetry: High thermal agitation (erratic Brownian jitter)
            p.vx += (Math.random() - 0.5) * 0.35;
            p.vy += (Math.random() - 0.5) * 0.35;
          }

          // Speed clamp
          const currentSpeed = Math.hypot(p.vx, p.vy);
          if (currentSpeed > maxSpeed) {
            p.vx = (p.vx / currentSpeed) * maxSpeed;
            p.vy = (p.vy / currentSpeed) * maxSpeed;
          }

          // Apply position update
          p.x += p.vx;
          p.y += p.vy;

          // Soft boundary bounce
          if (p.x < 15) {
            p.x = 15;
            p.vx = Math.abs(p.vx) * 0.9;
          } else if (p.x > width - 15) {
            p.x = width - 15;
            p.vx = -Math.abs(p.vx) * 0.9;
          }
          if (p.y < 15) {
            p.y = 15;
            p.vy = Math.abs(p.vy) * 0.9;
          } else if (p.y > height - 15) {
            p.y = height - 15;
            p.vy = -Math.abs(p.vy) * 0.9;
          }
        }

        // --- RENDER PARTICLES & LUMINOUS VELOCITY TRAILS ---
        // 1. Draw glowing velocity trail
        if (p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let h = 1; h < p.history.length; h++) {
            ctx.lineTo(p.history[h].x, p.history[h].y);
          }
          ctx.lineTo(p.x, p.y);

          const trailAlpha = isOptimal ? 0.35 : isOverdense ? 0.45 : 0.2;
          ctx.strokeStyle = p.type === 'matter' ? `rgba(0, 229, 255, ${trailAlpha})` : `rgba(255, 42, 119, ${trailAlpha})`;
          ctx.lineWidth = isOptimal ? 1.8 : 1.2;
          ctx.stroke();
        }

        // 2. Draw particle core & glow
        if (epoch === 'survivor' && p.type === 'survivor' && !isPureLight) {
          // Grand survivor aura
          const sGlow = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 65);
          sGlow.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
          sGlow.addColorStop(0.3, 'rgba(111, 228, 177, 0.5)');
          sGlow.addColorStop(0.8, 'rgba(122, 123, 255, 0.2)');
          sGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = sGlow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 65, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else {
          // Morphing flash if particle just converted from slider movement
          if (p.morphing && p.morphing > 0) {
            p.morphing -= 0.05;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8 + p.morphing * 10, 0, Math.PI * 2);
            ctx.fillStyle = p.type === 'matter' ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 42, 119, 0.6)';
            ctx.fill();
          }

          // Particle body
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Core bright center
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }

      // 3. Render Expanding Photon Annihilation Shockwaves
      for (let i = photonRingsRef.current.length - 1; i >= 0; i--) {
        const ring = photonRingsRef.current[i];
        ring.radius += 2.2;
        ring.alpha -= 0.04;

        if (ring.alpha <= 0) {
          photonRingsRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 215, 80, ${ring.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // === ON-CANVAS KINETIC TELEMETRY HUD ===
      // Live dynamic badge showing the kinetic regime
      ctx.fillStyle = 'rgba(7, 7, 26, 0.85)';
      ctx.strokeStyle = isOptimal ? 'rgba(111, 228, 177, 0.4)' : isPureLight ? 'rgba(255, 42, 119, 0.4)' : 'rgba(231, 140, 90, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, 16, 260, 48, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isOptimal ? '#6fe4b1' : isPureLight ? '#ff6699' : '#e78c5a';
      ctx.font = 'bold 10px var(--font-mono, monospace)';
      ctx.textAlign = 'left';
      ctx.fillText(
        isOptimal
          ? '● COHERENT COSMIC ORBITS (STABLE MATTER)'
          : isPureLight
          ? '▲ HIGH-ENTROPY ANNIHILATION CHAOS'
          : '▼ GRAVITATIONAL COLLAPSE CLUSTERING',
        26,
        34
      );

      ctx.font = '9px var(--font-mono, monospace)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(
        isOptimal
          ? 'Laminar swirl: Proto-atomic stable rotation'
          : isPureLight
          ? 'Frenetic collision pull: 100% mutual destruction'
          : 'Centripetal collapse: Black hole clustering',
        26,
        50
      );

      // Real-time population ratio mini-meter (top center)
      const barX = width / 2 - 80;
      const barY = 22;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(barX, barY, 160, 6);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(barX, barY, (160 * liveRatio.matter) / 100, 6);
      ctx.fillStyle = '#ff2a77';
      ctx.fillRect(barX + (160 * liveRatio.matter) / 100, barY, (160 * liveRatio.antimatter) / 100, 6);

      ctx.font = '9px var(--font-mono, monospace)';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Matter ${liveRatio.matter}% : Antimatter ${liveRatio.antimatter}%`, width / 2, barY + 20);

      // Narrative text for survivor epoch
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
  }, [asymmetry, epoch, isPureLight, isOptimal, isOverdense, liveRatio]);

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
            Kinetic Phase: <strong className="text-[var(--ink)]">{isOptimal ? 'Coherent Orbit' : isPureLight ? 'Annihilation Chaos' : 'Gravitational Clumping'}</strong>
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" /> Matter (Quarks)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a77]" /> Antimatter (Antiquarks)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd055]" /> Photons (2γ)
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-[var(--indigo)]">
            <Activity className="w-3 h-3" /> Drag slider to see motion phase change
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
          {isOptimal && 'Watch the motion: At 8–12%, particles break out of chaotic collision loops into smooth, stable rotational orbits—the kinematic birth of atomic structure.'}
          {isPureLight && 'Watch the motion: Below 8%, mutual attraction drives relentless zigzag collisions. All particles pair off and perish into pure radiation.'}
          {isOverdense && 'Watch the motion: Above 12%, mutual gravitational attraction overpowers radiation pressure, pulling particles into dense, black-hole-forming clumps.'}
        </span>
      </div>
    </div>
  );
}
