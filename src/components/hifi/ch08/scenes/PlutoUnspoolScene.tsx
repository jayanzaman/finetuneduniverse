'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TOKENS, clamp01, easeInOut, useProgressDriver } from './sceneUtils';
import type { SceneProps } from './sceneUtils';

const TUBULAR_SEGMENTS = 300;
const RADIAL_SEGMENTS = 6;

const PLANETS: { f: number; size: number; color: string }[] = [
  { f: 0.14, size: 0.05, color: TOKENS.inkSoft },
  { f: 0.2, size: 0.07, color: TOKENS.inkMid },
  { f: 0.24, size: 0.075, color: TOKENS.mint },
  { f: 0.29, size: 0.06, color: TOKENS.warm },
  { f: 0.42, size: 0.13, color: TOKENS.inkMid },
  { f: 0.54, size: 0.11, color: TOKENS.inkMid },
  { f: 0.7, size: 0.09, color: TOKENS.indigo },
  { f: 0.84, size: 0.09, color: TOKENS.indigo },
  { f: 1, size: 0.17, color: TOKENS.warm },
];

function PlutoUnspoolScene({ progress = 0, active = true }: SceneProps) {
  const strandGeoRef = useRef<THREE.TubeGeometry>(null);
  const strandMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const planetRefs = useRef<(THREE.Mesh | null)[]>([]);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.6, 0),
        new THREE.Vector3(1.2, -0.2, 0.35),
        new THREE.Vector3(2.7, 0.25, -0.4),
        new THREE.Vector3(4.3, 0.75, 0.45),
        new THREE.Vector3(5.8, 1.25, -0.2),
        new THREE.Vector3(7, 1.7, 0),
      ]),
    [],
  );

  const planetPositions = useMemo(
    () => PLANETS.map(({ f }) => curve.getPointAt(f)),
    [curve],
  );

  useProgressDriver(progress, active, (p) => {
    const geo = strandGeoRef.current;
    if (geo) {
      const drawn = Math.floor(clamp01(p) * TUBULAR_SEGMENTS);
      geo.setDrawRange(0, drawn * RADIAL_SEGMENTS * 6);
    }
    if (strandMatRef.current) strandMatRef.current.opacity = 0.25 + 0.65 * p;
    PLANETS.forEach(({ f, size }, i) => {
      const mesh = planetRefs.current[i];
      if (!mesh) return;
      const grow = easeInOut(clamp01((p - f) / 0.06));
      mesh.scale.setScalar(Math.max(0.0001, (size / 0.09) * grow));
    });
  });

  return (
    <group position={[-3, -0.6, 0]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 8]} intensity={1.1} />
      <group>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 4, 12]} />
          <meshStandardMaterial color={TOKENS.inkMid} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={TOKENS.inkMid} roughness={0.6} />
        </mesh>
      </group>
      <mesh>
        <tubeGeometry
          ref={strandGeoRef}
          args={[curve, TUBULAR_SEGMENTS, 0.045, RADIAL_SEGMENTS, false]}
        />
        <meshBasicMaterial
          ref={strandMatRef}
          color={TOKENS.mint}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {PLANETS.map(({ f, color }, i) => (
        <mesh
          key={f}
          ref={(m) => {
            planetRefs.current[i] = m;
          }}
          position={planetPositions[i]}
          scale={0.0001}
        >
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export default PlutoUnspoolScene;
