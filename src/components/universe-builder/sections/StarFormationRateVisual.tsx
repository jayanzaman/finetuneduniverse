'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface StarFormationRateVisualProps {
  starFormationRate: number; // 0.1 to 2.0 M☉/yr (optimal: 0.8 - 1.5)
  onRateChange?: (rate: number) => void;
  isTimeLapseActive?: boolean;
  onToggleTimeLapse?: () => void;
  currentCosmicAge?: number;
}

export function StarFormationRateVisual({
  starFormationRate,
  onRateChange,
  isTimeLapseActive: parentTimeLapseActive,
  onToggleTimeLapse: parentToggleTimeLapse,
  currentCosmicAge: parentCosmicAge,
}: StarFormationRateVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Local time-lapse state fallback if not managed by parent
  const [localTimeLapse, setLocalTimeLapse] = useState(false);
  const [localCosmicAge, setLocalCosmicAge] = useState(13.8);

  const isTimeLapse = parentTimeLapseActive !== undefined ? parentTimeLapseActive : localTimeLapse;
  const cosmicAge = parentCosmicAge !== undefined ? parentCosmicAge : localCosmicAge;

  const isOptimal = starFormationRate >= 0.8 && starFormationRate <= 1.5;
  const isTooSlow = starFormationRate < 0.8;
  const isTooViolent = starFormationRate > 1.5;

  // The 5 Astronomical Cosmic Eras (Madau-Dickinson timeline)
  const cosmicEras = useMemo(
    () => [
      { id: 'dark', ageRange: '> 13.0 Gyr ago', rate: 0.1, label: 'Dark Ages', redshift: 'z > 15', desc: 'Pre-stellar neutral gas cloud cooling' },
      { id: 'first-light', ageRange: '13.0 – 11.0 Gyr', rate: 0.5, label: 'First Light (Cosmic Dawn)', redshift: 'z ~ 10', desc: 'Pop III stars ignite & reionize the cosmos' },
      { id: 'peak', ageRange: '11.0 – 8.0 Gyr', rate: 1.5, label: 'Cosmic Noon (Peak Formation)', redshift: 'z ~ 2', desc: 'Maximum cosmic star birth rate' },
      { id: 'post-peak', ageRange: '8.0 – 4.6 Gyr', rate: 1.2, label: 'Post-Peak Maturation', redshift: 'z ~ 1', desc: 'Disk galaxies form; chemical enrichment' },
      { id: 'modern', ageRange: '4.6 Gyr – Today', rate: 1.0, label: 'Modern Quiescent Era', redshift: 'z = 0', desc: 'Sun & Solar System formed 4.6 Gyr ago' },
    ],
    []
  );

  // Internal time-lapse runner if local
  useEffect(() => {
    if (parentTimeLapseActive !== undefined) return;
    if (!localTimeLapse) return;

    const interval = setInterval(() => {
      setLocalCosmicAge((prev) => {
        const next = prev - 0.2;
        if (next <= 0) {
          setLocalTimeLapse(false);
          return 13.8;
        }

        let newRate = 1.0;
        if (next > 13.0) newRate = 0.1;
        else if (next > 11.0) newRate = 0.5;
        else if (next > 8.0) newRate = 1.5;
        else if (next > 4.6) newRate = 1.2;
        else newRate = 1.0;

        if (onRateChange) onRateChange(newRate);
        return next;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [localTimeLapse, parentTimeLapseActive, onRateChange]);

  const handleToggle = () => {
    if (parentToggleTimeLapse) {
      parentToggleTimeLapse();
    } else {
      setLocalTimeLapse((prev) => !prev);
    }
  };

  const handleResetTimeline = () => {
    if (parentToggleTimeLapse && parentTimeLapseActive) {
      parentToggleTimeLapse();
    }
    setLocalTimeLapse(false);
    setLocalCosmicAge(13.8);
    if (onRateChange) onRateChange(1.0);
  };

  // Canvas render for the Madau-Dickinson Curve
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
      const height = canvas.clientHeight || 340;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep space void
      ctx.fillStyle = 'rgba(7, 7, 26, 0.95)';
      ctx.fillRect(0, 0, width, height);

      // Chart Padding
      const padLeft = 55;
      const padRight = 35;
      const padTop = 35;
      const padBottom = 55;
      const chartW = width - padLeft - padRight;
      const chartH = height - padTop - padBottom;

      // 1. Chart Gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      // Horizontal rate lines: 0.5, 1.0, 1.5, 2.0 M☉/yr
      for (let r = 0; r <= 2.0; r += 0.5) {
        const y = padTop + chartH - (r / 2.0) * chartH;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(width - padRight, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '9px var(--font-mono, monospace)';
        ctx.textAlign = 'right';
        ctx.fillText(`${r.toFixed(1)}`, padLeft - 8, y + 3);
      }

      // 2. Goldilocks Optimal Formation Band (0.8 - 1.5 M☉/yr)
      const bandTopY = padTop + chartH - (1.5 / 2.0) * chartH;
      const bandBottomY = padTop + chartH - (0.8 / 2.0) * chartH;
      const bandH = bandBottomY - bandTopY;

      ctx.fillStyle = 'rgba(111, 228, 177, 0.08)';
      ctx.fillRect(padLeft, bandTopY, chartW, bandH);

      ctx.strokeStyle = 'rgba(111, 228, 177, 0.25)';
      ctx.setLineDash([3, 4]);
      ctx.strokeRect(padLeft, bandTopY, chartW, bandH);
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(111, 228, 177, 0.8)';
      ctx.font = '9px var(--font-mono, monospace)';
      ctx.textAlign = 'right';
      ctx.fillText('Goldilocks Formation Zone (0.8 – 1.5 M☉/yr)', width - padRight - 8, bandTopY + 14);

      // 3. The Madau-Dickinson Cosmic Star Formation History Curve
      // X maps 13.8 Gyr (Big Bang, left) to 0 Gyr (Today, right)
      const getCurveRate = (lookbackGyr: number) => {
        // Parametric approximation of Madau & Dickinson (2014)
        if (lookbackGyr > 13.0) return 0.1;
        if (lookbackGyr > 10.0) return 0.1 + ((13.0 - lookbackGyr) / 3.0) * 1.5; // Rise to Cosmic Noon (10 Gyr ago)
        if (lookbackGyr > 4.6) return 1.6 - ((10.0 - lookbackGyr) / 5.4) * 0.45; // Decline toward solar birth
        return 1.15 - ((4.6 - lookbackGyr) / 4.6) * 0.15; // Decline to modern day (~1.0)
      };

      ctx.beginPath();
      for (let xPix = 0; xPix <= chartW; xPix += 2) {
        const t = xPix / chartW;
        const lookback = 13.8 - t * 13.8;
        const rate = getCurveRate(lookback);
        const yPix = padTop + chartH - (rate / 2.0) * chartH;

        if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
        else ctx.lineTo(padLeft + xPix, yPix);
      }

      ctx.strokeStyle = '#7a7bff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Subtle curve fill gradient
      ctx.lineTo(padLeft + chartW, padTop + chartH);
      ctx.lineTo(padLeft, padTop + chartH);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
      fillGrad.addColorStop(0, 'rgba(122, 123, 255, 0.25)');
      fillGrad.addColorStop(1, 'rgba(122, 123, 255, 0.0)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // 4. Time-Lapse Playhead Marker
      const playheadT = Math.max(0, Math.min(1, (13.8 - cosmicAge) / 13.8));
      const playheadX = padLeft + playheadT * chartW;
      const currentRateY = padTop + chartH - (starFormationRate / 2.0) * chartH;

      // Vertical Playhead Line
      ctx.beginPath();
      ctx.moveTo(playheadX, padTop);
      ctx.lineTo(playheadX, padTop + chartH);
      ctx.strokeStyle = isTimeLapse ? 'rgba(255, 215, 80, 0.85)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash(isTimeLapse ? [] : [4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Rate Marker Point
      ctx.beginPath();
      ctx.arc(playheadX, currentRateY, 6, 0, Math.PI * 2);
      ctx.fillStyle = isOptimal ? '#6fe4b1' : '#ff5566';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing halo if time-lapse is active
      if (isTimeLapse) {
        const pulse = Math.sin(time * 6) * 4 + 10;
        ctx.beginPath();
        ctx.arc(playheadX, currentRateY, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 215, 80, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 5. X-Axis Cosmic Era Labels
      const eraXPositions = [
        { label: 'Dark Ages', lookback: 13.4, sub: '> 13 Gyr' },
        { label: 'First Light', lookback: 12.0, sub: '11-13 Gyr' },
        { label: 'Cosmic Noon (Peak)', lookback: 9.5, sub: '8-11 Gyr' },
        { label: 'Solar Birth', lookback: 4.6, sub: '4.6 Gyr' },
        { label: 'Today', lookback: 0.2, sub: '0 Gyr' },
      ];

      eraXPositions.forEach((era) => {
        const ex = padLeft + ((13.8 - era.lookback) / 13.8) * chartW;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = 'bold 8.5px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.fillText(era.label, ex, padTop + chartH + 18);

        ctx.font = '7.5px var(--font-mono, monospace)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(era.sub, ex, padTop + chartH + 29);
      });

      // Y-Axis Title
      ctx.save();
      ctx.translate(14, padTop + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '9px var(--font-mono, monospace)';
      ctx.textAlign = 'center';
      ctx.fillText('Star Formation Rate (M☉ / yr)', 0, 0);
      ctx.restore();

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [starFormationRate, cosmicAge, isTimeLapse, isOptimal]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--void)] select-none">
      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--hair)] bg-[var(--void-2)] text-xs">
        <div className="flex items-center gap-3">
          <span className="mono font-semibold flex items-center gap-1.5" style={{ color: isOptimal ? 'var(--goldilocks)' : 'var(--warm)' }}>
            {isOptimal ? <ShieldCheck className="w-4 h-4 text-[var(--goldilocks)]" /> : <AlertTriangle className="w-4 h-4 text-[var(--warm)]" />}
            {isOptimal ? 'Optimal Cosmic Era (Stable Star Birth)' : isTooSlow ? 'Star-Starved (Insufficient Metals)' : 'Disruptive Feedback (Supernova Wind Storms)'}
          </span>
          <span className="hidden sm:inline-block w-px h-3 bg-[var(--hair-2)]" />
          <span className="hidden sm:inline-block mono text-[var(--ink-soft)] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--indigo)]" />
            Cosmic Clock: <strong className="text-[var(--ink)]">{cosmicAge.toFixed(1)} Gyr ago</strong>
          </span>
        </div>

        {/* Playable Transport Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className={`px-3 py-1 rounded border text-[11px] mono flex items-center gap-1.5 transition-colors ${
              isTimeLapse
                ? 'bg-[var(--indigo)] text-white border-[var(--indigo)] shadow-md shadow-[var(--indigo-glow)]'
                : 'border-[var(--hair)] text-[var(--ink-soft)] hover:text-white hover:border-[var(--hair-2)]'
            }`}
          >
            {isTimeLapse ? (
              <>
                <Pause className="w-3 h-3 text-[var(--goldilocks)]" /> Playing 13.8 Gyr History...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[var(--goldilocks)]" /> Play 13.8 Gyr Epoch
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleResetTimeline}
            className="p-1.5 rounded border border-[var(--hair)] text-[var(--ink-soft)] hover:text-white hover:border-[var(--hair-2)] transition-colors"
            title="Reset to Big Bang (13.8 Gyr)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Canvas Chart Stage */}
      <div className="relative flex-1 min-h-[340px] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Readout overlay */}
        <div className="absolute top-3 right-4 pointer-events-none text-right">
          <div className="text-xs mono uppercase tracking-wider text-[var(--ink-soft)]">Formation Rate</div>
          <div className="text-xl font-bold mono text-[var(--indigo)]">{starFormationRate.toFixed(1)} M☉/yr</div>
          <div className={`text-[11px] font-medium mono ${isOptimal ? 'text-[var(--goldilocks)]' : 'text-[var(--warm)]'}`}>
            {isOptimal ? '✅ 0.8 – 1.5 M☉/yr (Optimal)' : '❌ Outside Goldilocks Band'}
          </div>
        </div>
      </div>

      {/* Physical Consequence Footer */}
      <div className="px-4 py-2 border-t border-[var(--hair)] bg-[var(--void-2)]/60 text-xs flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[var(--indigo)] shrink-0" />
        <span className="text-[var(--ink-mid)]">
          {isOptimal && 'Star formation peaked 10 billion years ago during "Cosmic Noon", then declined to a stable rate (1 M☉/yr) just as our Solar System was born.'}
          {isTooSlow && 'Insufficient star formation: the galaxy is starved of supernovae, failing to seed enough heavy elements for rocky terrestrial worlds.'}
          {isTooViolent && 'Extreme starburst: relentless supernova shockwaves and stellar winds strip gas disks, preventing planetesimals from coalescing.'}
        </span>
      </div>
    </div>
  );
}
