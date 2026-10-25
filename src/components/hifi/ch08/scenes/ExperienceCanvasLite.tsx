'use client';

import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { TOKENS } from './sceneUtils';
import type { SceneQuality } from './sceneUtils';

export type CanvasCameraSpec = {
  position?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
};

type Props = {
  children: ReactNode;
  camera?: CanvasCameraSpec;
  quality?: SceneQuality;
};

export function ExperienceCanvasLite({ children, camera, quality = 'high' }: Props) {
  return (
    <Canvas
      dpr={quality === 'low' ? [1, 1] : [1, 1.5]}
      camera={{
        position: camera?.position ?? [0, 0, 8],
        fov: camera?.fov ?? 50,
        near: camera?.near ?? 0.1,
        far: camera?.far ?? 100,
      }}
      gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
      onCreated={({ gl }) => {
        gl.setClearColor(TOKENS.bg, 1);
      }}
    >
      {children}
    </Canvas>
  );
}
