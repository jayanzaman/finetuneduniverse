import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { prefersReducedMotion } from '../../motion';

export type SceneQuality = 'high' | 'low';

export type SceneId = 'server-to-cell' | 'nucleus-zoom' | 'helix' | 'pluto-unspool' | 'folding';

export type SceneProps = {
  progress?: number;
  active?: boolean;
  quality?: SceneQuality;
};

export const TOKENS = {
  indigo: '#7A7BFF',
  mint: '#6FE4B1',
  warm: '#E78C5A',
  ink: '#ECECF5',
  inkMid: '#B9B9CC',
  inkSoft: '#7B7B92',
  inkFaint: '#4A4A60',
  bg: '#030308',
} as const;

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

export const easeInOut = (t: number): number => t * t * (3 - 2 * t);

export const bandOpacity = (p: number, start: number, end: number, fade = 0.08): number => {
  const inT = start <= 0 ? 1 : clamp01((p - start) / fade);
  const outT = end >= 1 ? 1 : clamp01((end - p) / fade);
  return easeInOut(inT) * easeInOut(outT);
};

export function useReducedMotion(): boolean {
  return useMemo(
    () => (typeof window !== 'undefined' ? prefersReducedMotion() : false),
    [],
  );
}

/**
 * Drives a scene from its props. While active, the smoothed progress damps
 * toward the `progress` prop so scrubbing either direction lerps cleanly.
 * Under reduced motion there is no animation: the apply callback receives the
 * target progress and a frozen clock (t = 0) immediately. `apply` also gets
 * the R3F root state so scenes can dolly the camera.
 */
export function useProgressDriver(
  progress: number | undefined,
  active: boolean | undefined,
  apply: (p: number, t: number, state: RootState) => void,
): { reduced: boolean } {
  const reduced = useReducedMotion();
  const target = clamp01(progress ?? 0);
  const smoothed = useRef(target);
  const applyRef = useRef(apply);
  const get = useThree((s) => s.get);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    applyRef.current = apply;
  });

  useLayoutEffect(() => {
    if (mounted.current && !reduced) return;
    mounted.current = true;
    applyRef.current(target, 0, get());
  }, [reduced, target, get]);

  useFrame((state, dt) => {
    if (active === false) return;
    smoothed.current = reduced
      ? target
      : THREE.MathUtils.damp(smoothed.current, target, 6, dt);
    applyRef.current(smoothed.current, reduced ? 0 : state.clock.elapsedTime, state);
  });

  return { reduced };
}
