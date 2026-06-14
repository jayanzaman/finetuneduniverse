'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cosmosVertexShader, cosmosFragmentShader } from './cosmos.glsl';

// Design tokens (globals.css) translated to linear-ish vec3s for the shader.
const COLOR_INDIGO = new THREE.Color('#7A7BFF');
const COLOR_GOLDILOCKS = new THREE.Color('#6FE4B1');
const COLOR_WARM = new THREE.Color('#E78C5A');

const PARTICLE_COUNT = 14000;

// Deterministic field so the composition is hand-tunable and stable between
// renders. A flattened, center-biased cloud reads as a cosmic plane with a
// luminous core — the "matter waiting to gather."
function buildField() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const scales = new Float32Array(PARTICLE_COUNT);
  const seeds = new Float32Array(PARTICLE_COUNT);
  const colorMix = new Float32Array(PARTICLE_COUNT);
  const radii = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Bias toward the center: cube of a uniform variable concentrates mass.
    const u = Math.random();
    const r = Math.pow(u, 2.4) * 9.0;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);

    // Flatten into a disk so the field has a horizon, then add a faint warp.
    y *= 0.32;
    y += Math.sin(x * 0.4 + z * 0.3) * 0.25;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const norm = r / 9.0; // 0 at core, 1 at rim
    radii[i] = norm;

    // Core motes are larger and hotter; rim motes are small and cold.
    scales[i] = THREE.MathUtils.lerp(2.2, 0.5, norm) * (0.6 + Math.random() * 0.8);

    // Color: warm/green core blooming out to indigo cold at the edges.
    colorMix[i] = THREE.MathUtils.clamp(1.0 - norm + (Math.random() - 0.5) * 0.25, 0, 1);

    seeds[i] = Math.random();
  }

  return { positions, scales, seeds, colorMix, radii };
}

export function Cosmos() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const field = useMemo(buildField, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 18 },
      uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
      uExpansion: { value: 0.5 },
      uColorA: { value: COLOR_INDIGO.clone() },
      uColorB: { value: COLOR_GOLDILOCKS.clone() },
      uColorC: { value: COLOR_WARM.clone() },
    }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }
    if (groupRef.current) {
      // Slow, hands-off orbit so the static scene still breathes.
      groupRef.current.rotation.y = t * 0.035;
      groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
          <bufferAttribute attach="attributes-aScale" args={[field.scales, 1]} />
          <bufferAttribute attach="attributes-aSeed" args={[field.seeds, 1]} />
          <bufferAttribute attach="attributes-aColorMix" args={[field.colorMix, 1]} />
          <bufferAttribute attach="attributes-aRadius" args={[field.radii, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={cosmosVertexShader}
          fragmentShader={cosmosFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
