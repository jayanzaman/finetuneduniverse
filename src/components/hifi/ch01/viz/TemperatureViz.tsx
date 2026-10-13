'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

export interface TemperatureVizProps {
  value?: number;
  className?: string;
  minimal?: boolean;
}

// -------------------------------------------------------------
// DETERMINISTIC CAUSAL HORIZON SEEDS & PHYSICS CONSTANTS
// -------------------------------------------------------------
interface HorizonSeed {
  x: number;
  y: number;
  z: number;
  deltaT: number; // in Kelvins, e.g. -1.2 to +1.2
}

// 72 deterministic Fibonacci horizon seeds on the unit sphere
function generateHorizonSeeds(count = 72): HorizonSeed[] {
  const seeds: HorizonSeed[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = (2 * Math.PI * i) / goldenRatio;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    // Pseudo-random temperature delta in Kelvins [-1.2 K, +1.2 K]
    const pseudoRand = (((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1) + 1) % 1;
    const deltaT = (pseudoRand - 0.5) * 2.4;
    seeds.push({ x, y, z, deltaT });
  }
  return seeds;
}

const HORIZON_SEEDS = generateHorizonSeeds(72);

// Dipole direction towards Leo / Crater: l ≈ 264°, b ≈ +48°
const DIPOLE_L_RAD = (264 * Math.PI) / 180;
const DIPOLE_B_RAD = (48 * Math.PI) / 180;
const DIPOLE_DIR = {
  x: Math.cos(DIPOLE_B_RAD) * Math.sin(DIPOLE_L_RAD),
  y: Math.sin(DIPOLE_B_RAD),
  z: Math.cos(DIPOLE_B_RAD) * Math.cos(DIPOLE_L_RAD),
};

// Primordial acoustic noise harmonics (simulating sound horizon multipoles l ~ 2 to 200)
function getAcousticHarmonics(x: number, y: number, z: number): number {
  const n1 = Math.sin(3.2 * x + 2.1 * y) * Math.cos(3.9 * z);
  const n2 = Math.sin(7.4 * x - 5.8 * z) * Math.cos(6.1 * y + 1.2);
  const n3 = Math.sin(14.8 * x + 11.5 * y) * Math.cos(13.7 * z - 0.7);
  const n4 = Math.sin(28.2 * x - 21.6 * y) * Math.cos(25.1 * z + 2.1);
  const n5 = Math.sin(52.4 * x + 43.9 * z) * Math.cos(48.2 * y - 1.4);
  return 0.35 * n1 + 0.28 * n2 + 0.21 * n3 + 0.11 * n4 + 0.05 * n5;
}

// Colormap sampler (RGB 0..255)
function sampleColormap(
  norm: number,
  lens: 'acoustic' | 'dipole' | 'raw'
): [number, number, number] {
  const t = Math.max(0, Math.min(1, norm));

  if (lens === 'raw') {
    // 0: Deep black-violet (cold) -> 0.5: 2.725K cosmic amber -> 1: Hot incandescent white
    if (t < 0.5) {
      const s = t / 0.5;
      return [
        Math.round(15 + s * (231 - 15)),
        Math.round(10 + s * (140 - 10)),
        Math.round(30 + s * (90 - 30)),
      ];
    } else {
      const s = (t - 0.5) / 0.5;
      return [
        Math.round(231 + s * (255 - 231)),
        Math.round(140 + s * (250 - 140)),
        Math.round(90 + s * (220 - 90)),
      ];
    }
  }

  if (lens === 'dipole') {
    // 0: Deep blueshift (Leo) -> 0.5: Neutral dark slate -> 1: Deep redshift
    if (t < 0.5) {
      const s = t / 0.5;
      return [
        Math.round(29 + s * (30 - 29)),
        Math.round(78 + s * (41 - 78)),
        Math.round(216 + s * (59 - 216)),
      ];
    } else {
      const s = (t - 0.5) / 0.5;
      return [
        Math.round(30 + s * (220 - 30)),
        Math.round(41 + s * (38 - 41)),
        Math.round(59 + s * (38 - 59)),
      ];
    }
  }

  // Authentic Planck satellite acoustic colormap:
  // Deep Blue (Cold Spot) -> Cyan -> Dark Slate (Neutral) -> Amber -> Crimson (Warm Spot)
  if (t < 0.25) {
    const s = t / 0.25;
    return [
      Math.round(15 + s * (30 - 15)),
      Math.round(23 + s * (90 - 23)),
      Math.round(60 + s * (200 - 60)),
    ];
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    return [
      Math.round(30 + s * (30 - 30)),
      Math.round(90 + s * (41 - 90)),
      Math.round(200 + s * (59 - 200)),
    ];
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    return [
      Math.round(30 + s * (245 - 30)),
      Math.round(41 + s * (158 - 41)),
      Math.round(59 + s * (11 - 59)),
    ];
  } else {
    const s = (t - 0.75) / 0.25;
    return [
      Math.round(245 + s * (239 - 245)),
      Math.round(158 + s * (68 - 158)),
      Math.round(11 + s * (68 - 11)),
    ];
  }
}

export type ViewMode = 'mollweide' | 'globe3d';
export type ContrastLens = 'acoustic' | 'dipole' | 'raw';

export function TemperatureViz({
  value = 0.99999,
  className = '',
  minimal = false,
}: TemperatureVizProps) {
  void minimal;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('mollweide');
  const [lens, setLens] = useState<ContrastLens>('acoustic');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Rotation angles for 3D Globe mode (radians)
  const [yaw, setYaw] = useState<number>(0.4);
  const [pitch, setPitch] = useState<number>(-0.2);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Thermal Probe Hover / Reticle State
  const [probe, setProbe] = useState<{
    active: boolean;
    x: number;
    y: number;
    lDeg: number;
    bDeg: number;
    tempK: number;
    deltaTStr: string;
    patchId: number;
    diagnosis: string;
  } | null>(null);

  // Physics mapping from slider value
  // Goldilocks band is [0.99998, 1.00000], default 0.99999
  const physics = useMemo(() => {
    const v = Math.max(0.9, Math.min(1.0, value));
    const inBand = v >= 0.99998 && v <= 1.0;

    let mottledWeight = 0;
    if (v < 0.99998) {
      // Disjoint causal bubbles have not thermalized
      const t = (0.99998 - v) / (0.99998 - 0.9);
      mottledWeight = Math.min(1.0, Math.pow(t, 0.65));
    }

    // Acoustic ripples disappear if uniformity reaches exactly 1.0 (featureless void)
    let acousticWeight = 1.0;
    if (v > 0.99999) {
      acousticWeight = Math.max(0, 1.0 - (v - 0.99999) / 0.00001);
    }

    return {
      v,
      inBand,
      mottledWeight,
      acousticWeight,
      isVoid: v >= 0.999999,
    };
  }, [value]);

  // Handle Dragging in 3D Globe Mode
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current && viewMode === 'globe3d') {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setYaw((prev) => prev - dx * 0.008);
      setPitch((prev) => Math.max(-1.4, Math.min(1.4, prev - dy * 0.008)));
    }

    // Thermal Probe coordinate calculation
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    let hit = false;
    let lRad = 0;
    let bRad = 0;

    if (viewMode === 'mollweide') {
      const xc = w / 2;
      const yc = h / 2;
      const rx = Math.min(w * 0.44, h * 0.82);
      const ry = rx / 2;

      const u = (mouseX - xc) / rx;
      const v = (mouseY - yc) / ry;

      if (u * u + v * v <= 1.0) {
        hit = true;
        const theta = Math.asin(Math.max(-1, Math.min(1, v)));
        bRad = Math.asin(
          Math.max(-1, Math.min(1, (2 * theta + Math.sin(2 * theta)) / Math.PI))
        );
        const cosTheta = Math.max(0.0001, Math.sqrt(1 - v * v));
        lRad = (u / cosTheta) * (Math.PI / 2);
      }
    } else {
      const xc = w / 2;
      const yc = h / 2;
      const r = Math.min(w * 0.38, h * 0.38);

      const u = (mouseX - xc) / r;
      const v = (mouseY - yc) / r;

      if (u * u + v * v <= 1.0) {
        hit = true;
        const sphereZ = Math.sqrt(1 - u * u - v * v);
        // Rotate by yaw and pitch
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);

        const x1 = u * cosYaw + sphereZ * sinYaw;
        const z1 = -u * sinYaw + sphereZ * cosYaw;

        const y2 = -v * cosPitch + z1 * sinPitch;
        const z2 = v * sinPitch + z1 * cosPitch;

        bRad = Math.asin(Math.max(-1, Math.min(1, y2)));
        lRad = Math.atan2(x1, z2);
      }
    }

    if (hit) {
      const sx = Math.cos(bRad) * Math.sin(lRad);
      const sy = Math.sin(bRad);
      const sz = Math.cos(bRad) * Math.cos(lRad);

      // Dipole
      const cosDipole =
        sx * DIPOLE_DIR.x + sy * DIPOLE_DIR.y + sz * DIPOLE_DIR.z;
      const deltaTDipole = 3.36e-3 * cosDipole;

      // Acoustic ripple
      const acousticNorm = getAcousticHarmonics(sx, sy, sz);
      const deltaTAcoustic = acousticNorm * 4.5e-5 * physics.acousticWeight;

      // Mottled horizon patch
      let maxDot = -2;
      let nearestSeed = HORIZON_SEEDS[0];
      let patchId = 0;
      for (let i = 0; i < HORIZON_SEEDS.length; i++) {
        const dot =
          sx * HORIZON_SEEDS[i].x +
          sy * HORIZON_SEEDS[i].y +
          sz * HORIZON_SEEDS[i].z;
        if (dot > maxDot) {
          maxDot = dot;
          nearestSeed = HORIZON_SEEDS[i];
          patchId = i + 1;
        }
      }
      const deltaTMottled = nearestSeed.deltaT * physics.mottledWeight;

      const totalDeltaT =
        deltaTAcoustic +
        deltaTMottled +
        (lens === 'dipole' ? deltaTDipole : 0);
      const tempK = 2.72548 + totalDeltaT;

      let deltaTStr = '';
      if (physics.mottledWeight > 0.05) {
        deltaTStr = `${totalDeltaT > 0 ? '+' : ''}${totalDeltaT.toFixed(3)} K`;
      } else {
        const uK = totalDeltaT * 1e6;
        deltaTStr = `${uK > 0 ? '+' : ''}${uK.toFixed(1)} μK`;
      }

      let diagnosis = 'Thermal Equilibrium (Planck Sky)';
      if (physics.mottledWeight > 0.1) {
        diagnosis = `Uncorrelated Horizon Patch #${patchId}`;
      } else if (physics.isVoid) {
        diagnosis = 'Acoustic Vacuum (Zero Density Seeds)';
      } else if (deltaTAcoustic > 15e-6) {
        diagnosis = 'Acoustic Compression (Warm Overdensity)';
      } else if (deltaTAcoustic < -15e-6) {
        diagnosis = 'Acoustic Rarefaction (Cold Underdensity)';
      }

      setProbe({
        active: true,
        x: mouseX,
        y: mouseY,
        lDeg: Math.round((lRad * 180) / Math.PI),
        bDeg: Math.round((bRad * 180) / Math.PI),
        tempK,
        deltaTStr,
        patchId,
        diagnosis,
      });
    } else {
      setProbe(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animId: number;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        setIsCompact(height < 240 || width < 360);
      }
    });
    resizeObserver.observe(container);

    // Offscreen raster buffer (280 x 140 pixels)
    const bufW = 280;
    const bufH = 140;
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
      offscreenRef.current.width = bufW;
      offscreenRef.current.height = bufH;
    }
    const offCanvas = offscreenRef.current;
    const offCtx = offCanvas.getContext('2d');

    const renderFrame = () => {
      if (width <= 0 || height <= 0 || !offCtx) {
        animId = requestAnimationFrame(renderFrame);
        return;
      }

      // Auto-rotation in 3D globe mode
      if (autoRotate && viewMode === 'globe3d' && !isDraggingRef.current) {
        setYaw((prev) => (prev + 0.005) % (Math.PI * 2));
      }

      // 1. RASTERIZE THE CMB FIELD ON OFFSCREEN BUFFER
      const imgData = offCtx.createImageData(bufW, bufH);
      const data = imgData.data;

      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      if (viewMode === 'mollweide') {
        const xc = bufW / 2;
        const yc = bufH / 2;
        const rx = bufW * 0.47;
        const ry = rx / 2;

        for (let py = 0; py < bufH; py++) {
          const v = (py - yc) / ry;
          if (v * v > 1.0) continue;

          const theta = Math.asin(Math.max(-1, Math.min(1, v)));
          const bRad = Math.asin(
            Math.max(-1, Math.min(1, (2 * theta + Math.sin(2 * theta)) / Math.PI))
          );
          const cosTheta = Math.max(0.0001, Math.sqrt(1 - v * v));
          const maxU = cosTheta;

          const sy = Math.sin(bRad);
          const cosB = Math.cos(bRad);

          for (let px = 0; px < bufW; px++) {
            const u = (px - xc) / rx;
            if (u * u > maxU * maxU) continue;

            const lRad = (u / cosTheta) * (Math.PI / 2);
            const sx = cosB * Math.sin(lRad);
            const sz = cosB * Math.cos(lRad);

            // Compute Temperature Components
            let normVal = 0.5;

            if (lens === 'raw') {
              // Raw glow at 2.725K
              let dT = 0;
              if (physics.mottledWeight > 0.001) {
                let maxDot = -2;
                let nearest = HORIZON_SEEDS[0];
                for (let i = 0; i < HORIZON_SEEDS.length; i++) {
                  const dot =
                    sx * HORIZON_SEEDS[i].x +
                    sy * HORIZON_SEEDS[i].y +
                    sz * HORIZON_SEEDS[i].z;
                  if (dot > maxDot) {
                    maxDot = dot;
                    nearest = HORIZON_SEEDS[i];
                  }
                }
                dT = nearest.deltaT * physics.mottledWeight;
              }
              // Scaled around 2.725K (-1.5 K to +1.5 K)
              normVal = 0.5 + (dT / 3.0);
            } else if (lens === 'dipole') {
              // Dipole Doppler + subtle ripples
              const cosDipole =
                sx * DIPOLE_DIR.x + sy * DIPOLE_DIR.y + sz * DIPOLE_DIR.z;
              const dTDipole = cosDipole; // in range [-1, +1]
              let dTMottled = 0;
              if (physics.mottledWeight > 0.001) {
                let maxDot = -2;
                let nearest = HORIZON_SEEDS[0];
                for (let i = 0; i < HORIZON_SEEDS.length; i++) {
                  const dot =
                    sx * HORIZON_SEEDS[i].x +
                    sy * HORIZON_SEEDS[i].y +
                    sz * HORIZON_SEEDS[i].z;
                  if (dot > maxDot) {
                    maxDot = dot;
                    nearest = HORIZON_SEEDS[i];
                  }
                }
                dTMottled = (nearest.deltaT / 1.5) * physics.mottledWeight * 0.4;
              }
              normVal = 0.5 + dTDipole * 0.45 + dTMottled;
            } else {
              // Microkelvin Acoustic View (Dipole removed, 100,000x contrast)
              const acoustic = getAcousticHarmonics(sx, sy, sz) * physics.acousticWeight;
              let mottled = 0;
              if (physics.mottledWeight > 0.001) {
                let maxDot = -2;
                let nearest = HORIZON_SEEDS[0];
                for (let i = 0; i < HORIZON_SEEDS.length; i++) {
                  const dot =
                    sx * HORIZON_SEEDS[i].x +
                    sy * HORIZON_SEEDS[i].y +
                    sz * HORIZON_SEEDS[i].z;
                  if (dot > maxDot) {
                    maxDot = dot;
                    nearest = HORIZON_SEEDS[i];
                  }
                }
                mottled = (nearest.deltaT / 1.2) * physics.mottledWeight;
              }

              normVal = 0.5 + acoustic * 0.45 * (1 - physics.mottledWeight) + mottled * 0.45;
            }

            const [r, g, b] = sampleColormap(normVal, lens);
            const idx = (py * bufW + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
          }
        }
      } else {
        // 3D CELESTIAL GLOBE RASTER
        const xc = bufW / 2;
        const yc = bufH / 2;
        const r = bufH * 0.44;

        for (let py = 0; py < bufH; py++) {
          const v = (py - yc) / r;
          if (v * v > 1.0) continue;

          for (let px = 0; px < bufW; px++) {
            const u = (px - xc) / r;
            if (u * u + v * v > 1.0) continue;

            const sphereZ = Math.sqrt(1 - u * u - v * v);

            const x1 = u * cosYaw + sphereZ * sinYaw;
            const z1 = -u * sinYaw + sphereZ * cosYaw;

            const y2 = -v * cosPitch + z1 * sinPitch;
            const z2 = v * sinPitch + z1 * cosPitch;

            const bRad = Math.asin(Math.max(-1, Math.min(1, y2)));
            const lRad = Math.atan2(x1, z2);

            const sx = Math.cos(bRad) * Math.sin(lRad);
            const sy = Math.sin(bRad);
            const sz = Math.cos(bRad) * Math.cos(lRad);

            let normVal = 0.5;

            if (lens === 'raw') {
              let dT = 0;
              if (physics.mottledWeight > 0.001) {
                let maxDot = -2;
                let nearest = HORIZON_SEEDS[0];
                for (let i = 0; i < HORIZON_SEEDS.length; i++) {
                  const dot =
                    sx * HORIZON_SEEDS[i].x +
                    sy * HORIZON_SEEDS[i].y +
                    sz * HORIZON_SEEDS[i].z;
                  if (dot > maxDot) {
                    maxDot = dot;
                    nearest = HORIZON_SEEDS[i];
                  }
                }
                dT = nearest.deltaT * physics.mottledWeight;
              }
              normVal = 0.5 + dT / 3.0;
            } else if (lens === 'dipole') {
              const cosDipole =
                sx * DIPOLE_DIR.x + sy * DIPOLE_DIR.y + sz * DIPOLE_DIR.z;
              let dTMottled = 0;
              if (physics.mottledWeight > 0.001) {
                let maxDot = -2;
                let nearest = HORIZON_SEEDS[0];
                for (let i = 0; i < HORIZON_SEEDS.length; i++) {
                  const dot =
                    sx * HORIZON_SEEDS[i].x +
                    sy * HORIZON_SEEDS[i].y +
                    sz * HORIZON_SEEDS[i].z;
                  if (dot > maxDot) {
                    maxDot = dot;
                    nearest = HORIZON_SEEDS[i];
                  }
                }
                dTMottled = (nearest.deltaT / 1.5) * physics.mottledWeight * 0.4;
              }
              normVal = 0.5 + cosDipole * 0.45 + dTMottled;
            } else {
              const acoustic = getAcousticHarmonics(sx, sy, sz) * physics.acousticWeight;
              let mottled = 0;
              if (physics.mottledWeight > 0.001) {
                let maxDot = -2;
                let nearest = HORIZON_SEEDS[0];
                for (let i = 0; i < HORIZON_SEEDS.length; i++) {
                  const dot =
                    sx * HORIZON_SEEDS[i].x +
                    sy * HORIZON_SEEDS[i].y +
                    sz * HORIZON_SEEDS[i].z;
                  if (dot > maxDot) {
                    maxDot = dot;
                    nearest = HORIZON_SEEDS[i];
                  }
                }
                mottled = (nearest.deltaT / 1.2) * physics.mottledWeight;
              }
              normVal = 0.5 + acoustic * 0.45 * (1 - physics.mottledWeight) + mottled * 0.45;
            }

            // Limb darkening / spherical shading
            const limbShade = 0.65 + 0.35 * sphereZ;
            const [r0, g0, b0] = sampleColormap(normVal, lens);

            const idx = (py * bufW + px) * 4;
            data[idx] = Math.round(r0 * limbShade);
            data[idx + 1] = Math.round(g0 * limbShade);
            data[idx + 2] = Math.round(b0 * limbShade);
            data[idx + 3] = 255;
          }
        }
      }

      offCtx.putImageData(imgData, 0, 0);

      // 2. BLIT TO MAIN CANVAS & DRAW VECTOR OVERLAYS
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Deep space background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      const targetX = 0;
      const targetY = 0;
      const targetW = width;
      const targetH = height;

      // Draw smoothed buffer
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offCanvas, targetX, targetY, targetW, targetH);

      // Draw Vector Graticule & Borders
      if (viewMode === 'mollweide') {
        const xc = width / 2;
        const yc = height / 2;
        const rx = width * 0.47;
        const ry = rx / 2;

        // Graticule: Equator and Prime Meridian
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xc - rx, yc);
        ctx.lineTo(xc + rx, yc);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(xc, yc, rx * 0.001, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Parallels at b = ±30°
        ctx.beginPath();
        ctx.moveTo(xc - rx * 0.866, yc - ry * 0.5);
        ctx.lineTo(xc + rx * 0.866, yc - ry * 0.5);
        ctx.moveTo(xc - rx * 0.866, yc + ry * 0.5);
        ctx.lineTo(xc + rx * 0.866, yc + ry * 0.5);
        ctx.stroke();

        // Outer Ellipse Rim
        ctx.strokeStyle = 'rgba(122, 123, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(xc, yc, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Tick Labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '9px var(--f-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.fillText('0°', xc, yc - ry - 6);
        ctx.fillText('+90°', xc + rx + 14, yc + 3);
        ctx.fillText('−90°', xc - rx - 14, yc + 3);
      } else {
        // 3D Celestial Globe Vector Overlays
        const xc = width / 2;
        const yc = height / 2;
        const r = height * 0.44;

        // Celestial Globe Rim
        ctx.strokeStyle = 'rgba(122, 123, 255, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(xc, yc, r, 0, Math.PI * 2);
        ctx.stroke();

        // Rotating Equator line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const ellipseRy = Math.abs(Math.sin(pitch) * r);
        ctx.ellipse(xc, yc, r, Math.max(1, ellipseRy), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Thermal Probe Target & 1° Causal Horizon Reticle
      if (probe && probe.active) {
        ctx.save();
        ctx.translate(probe.x, probe.y);

        // Glowing crosshair
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-6, 0);
        ctx.moveTo(6, 0);
        ctx.lineTo(10, 0);
        ctx.moveTo(0, -10);
        ctx.lineTo(0, -6);
        ctx.moveTo(0, 6);
        ctx.lineTo(0, 10);
        ctx.stroke();

        // 1° Causal Horizon Circle (at scale ~14px)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '8px var(--f-mono, monospace)';
        ctx.textAlign = 'left';
        ctx.fillText('1° Horizon', 18, -4);

        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [viewMode, lens, autoRotate, yaw, pitch, probe, physics]);

  return (
    <div
      ref={containerRef}
      className={`temperature-viz-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 380,
        background: '#030712',
        borderRadius: 12,
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
      aria-label="Cosmic Microwave Background All-Sky Temperature Simulation"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setProbe(null)}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: viewMode === 'globe3d' ? 'grab' : 'crosshair',
        }}
      />

      {/* TOP HEADER CONTROLS */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        {/* Left: View Mode Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--hair-2)',
            borderRadius: 6,
            padding: 2,
            pointerEvents: 'auto',
          }}
        >
          <button
            type="button"
            className="hifi-btn"
            style={{
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              background: viewMode === 'mollweide' ? 'var(--indigo)' : 'transparent',
              color: viewMode === 'mollweide' ? '#FFF' : 'var(--ink-faint)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            onClick={() => setViewMode('mollweide')}
          >
            Mollweide 2D
          </button>
          <button
            type="button"
            className="hifi-btn"
            style={{
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              background: viewMode === 'globe3d' ? 'var(--indigo)' : 'transparent',
              color: viewMode === 'globe3d' ? '#FFF' : 'var(--ink-faint)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            onClick={() => setViewMode('globe3d')}
          >
            3D Globe
          </button>
        </div>

        {/* Center: Contrast Lens Mode */}
        {!isCompact && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--hair-2)',
              borderRadius: 6,
              padding: 2,
              pointerEvents: 'auto',
            }}
          >
            <button
              type="button"
              className="hifi-btn"
              style={{
                padding: '4px 8px',
                fontSize: 9.5,
                fontFamily: 'var(--f-mono)',
                background: lens === 'raw' ? 'rgba(231, 140, 90, 0.3)' : 'transparent',
                color: lens === 'raw' ? '#FBBF24' : 'var(--ink-faint)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={() => setLens('raw')}
              title="Raw 2.725K Cosmic Blackbody Glow"
            >
              Raw 2.7K
            </button>
            <button
              type="button"
              className="hifi-btn"
              style={{
                padding: '4px 8px',
                fontSize: 9.5,
                fontFamily: 'var(--f-mono)',
                background: lens === 'dipole' ? 'rgba(56, 189, 248, 0.3)' : 'transparent',
                color: lens === 'dipole' ? '#38BDF8' : 'var(--ink-faint)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={() => setLens('dipole')}
              title="Dipole Doppler Shift (Earth motion at 370 km/s)"
            >
              Dipole (3.36 mK)
            </button>
            <button
              type="button"
              className="hifi-btn"
              style={{
                padding: '4px 8px',
                fontSize: 9.5,
                fontFamily: 'var(--f-mono)',
                background: lens === 'acoustic' ? 'rgba(192, 132, 252, 0.3)' : 'transparent',
                color: lens === 'acoustic' ? '#C084FC' : 'var(--ink-faint)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={() => setLens('acoustic')}
              title="Planck Acoustic Multipoles (±18 μK, Dipole subtracted)"
            >
              Acoustic (±18 μK)
            </button>
          </div>
        )}

        {/* Right: Orbit control in 3D */}
        <div style={{ pointerEvents: 'auto' }}>
          {viewMode === 'globe3d' ? (
            <button
              type="button"
              className="hifi-btn"
              style={{
                padding: '4px 8px',
                fontSize: 9.5,
                fontFamily: 'var(--f-mono)',
                background: 'rgba(15, 23, 42, 0.85)',
                color: autoRotate ? '#38BDF8' : 'var(--ink-faint)',
                border: '1px solid var(--hair-2)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              onClick={() => setAutoRotate(!autoRotate)}
            >
              Orbit: {autoRotate ? 'On' : 'Off'}
            </button>
          ) : (
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                color: 'var(--ink-faint)',
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '3px 8px',
                borderRadius: 4,
                border: '1px solid var(--hair-2)',
              }}
            >
              360° All-Sky
            </span>
          )}
        </div>
      </div>

      {/* FLOATING THERMAL PROBE HUD */}
      {probe && probe.active && (
        <div
          style={{
            position: 'absolute',
            right: 14,
            top: 50,
            background: 'rgba(10, 15, 30, 0.92)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 8,
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 4,
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            minWidth: 170,
          }}
        >
          <div style={{ fontSize: 9, fontFamily: 'var(--f-mono)', color: 'var(--ink-faint)' }}>
            THERMAL PROBE RETICLE
          </div>
          <div style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: '#FFFFFF', marginTop: 2, fontWeight: 600 }}>
            {probe.tempK.toFixed(5)} K
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: 'var(--f-mono)',
              color: probe.deltaTStr.startsWith('+') ? '#F59E0B' : '#38BDF8',
              marginTop: 1,
            }}
          >
            ΔT = {probe.deltaTStr}
          </div>
          <div style={{ fontSize: 9.5, color: '#A855F7', marginTop: 4 }}>
            {probe.diagnosis}
          </div>
          <div style={{ fontSize: 8.5, fontFamily: 'var(--f-mono)', color: 'var(--ink-faint)', marginTop: 2 }}>
            Coords: ℓ = {probe.lDeg}°, b = {probe.bDeg}°
          </div>
        </div>
      )}

      {/* BOTTOM CONTROL & STATUS BAR */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        {/* Status Pill */}
        <div
          style={{
            background: 'rgba(10, 15, 30, 0.88)',
            border: `1px solid ${
              physics.inBand
                ? 'rgba(56, 189, 248, 0.4)'
                : 'rgba(239, 68, 68, 0.4)'
            }`,
            borderRadius: 6,
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: physics.inBand ? '#38BDF8' : '#EF4444',
            }}
          />
          <span
            style={{
              fontSize: 9.5,
              fontFamily: 'var(--f-mono)',
              color: physics.inBand ? '#38BDF8' : '#F87171',
              fontWeight: 600,
            }}
          >
            {physics.inBand
              ? physics.isVoid
                ? 'TOTAL ISOTROPY (NO DENSITY SEEDS)'
                : 'PLANCK SKY · ΔT = ±18 μK (10⁻⁵)'
              : 'MOTTLED (NO INFLATION) · ΔT ~ ±1 K'}
          </span>
        </div>

        {/* Colormap Scale Legend */}
        {!isCompact && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(10, 15, 30, 0.88)',
              border: '1px solid var(--hair-2)',
              borderRadius: 6,
              padding: '4px 10px',
              fontFamily: 'var(--f-mono)',
              fontSize: 9,
            }}
          >
            <span style={{ color: '#38BDF8' }}>Cold (−100 μK)</span>
            <div
              style={{
                width: 60,
                height: 6,
                borderRadius: 3,
                background:
                  lens === 'raw'
                    ? 'linear-gradient(to right, #0F0A1E, #E78C5A, #FFFCE6)'
                    : lens === 'dipole'
                    ? 'linear-gradient(to right, #1D4ED8, #1E293B, #DC2626)'
                    : 'linear-gradient(to right, #1E3A8A, #06B6D4, #1E293B, #F59E0B, #DC2626)',
              }}
            />
            <span style={{ color: '#F59E0B' }}>Hot (+100 μK)</span>
          </div>
        )}
      </div>
    </div>
  );
}
