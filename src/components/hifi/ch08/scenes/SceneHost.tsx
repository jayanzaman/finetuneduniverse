'use client';

import { useSyncExternalStore } from 'react';
import type { ComponentType } from 'react';
import { prefersReducedMotion } from '../../motion';
import { ExperienceCanvasLite } from './ExperienceCanvasLite';
import type { CanvasCameraSpec } from './ExperienceCanvasLite';
import { SceneFallback } from './fallbacks';
import ServerToCellScene from './ServerToCellScene';
import NucleusZoomScene from './NucleusZoomScene';
import HelixScene from './HelixScene';
import PlutoUnspoolScene from './PlutoUnspoolScene';
import FoldingScene from './FoldingScene';
import type { SceneId, SceneProps } from './sceneUtils';

let webglCache: boolean | null = null;

export function webglAvailable(): boolean {
  if (webglCache !== null) return webglCache;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    webglCache = Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    );
  } catch {
    webglCache = false;
  }
  return webglCache;
}

type SceneEntry = {
  Component: ComponentType<SceneProps>;
  camera?: CanvasCameraSpec;
};

export const SCENES: Record<SceneId, SceneEntry> = {
  'server-to-cell': { Component: ServerToCellScene },
  'nucleus-zoom': { Component: NucleusZoomScene, camera: { position: [0, 0, 12], fov: 50 } },
  helix: { Component: HelixScene },
  'pluto-unspool': { Component: PlutoUnspoolScene },
  folding: { Component: FoldingScene },
};

export type SceneHostProps = SceneProps & { scene: SceneId };

const noopSubscribe = () => () => {};

export function SceneHost({ scene, progress = 0, active = true, quality = 'high' }: SceneHostProps) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!mounted || prefersReducedMotion() || !webglAvailable()) {
    return <SceneFallback scene={scene} />;
  }

  const { Component, camera } = SCENES[scene];
  return (
    <ExperienceCanvasLite quality={quality} camera={camera}>
      <Component progress={progress} active={active} quality={quality} />
    </ExperienceCanvasLite>
  );
}
