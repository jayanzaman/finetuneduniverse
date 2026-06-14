'use client';

import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import * as THREE from 'three';

// Shared R3F stage for the experience. Fills its parent, renders into the void
// palette, and tone-maps for the soft additive glow the cosmos relies on.
export function ExperienceCanvas({ children }: { children: ReactNode }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 12], fov: 55, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#030308', 1);
      }}
    >
      <fog attach="fog" args={['#030308', 10, 26]} />
      {children}
    </Canvas>
  );
}
