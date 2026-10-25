'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../lib/codonTable';
import { HelixContents } from './HelixScene';
import { TOKENS, bandOpacity, easeInOut, useProgressDriver } from './sceneUtils';
import type { SceneProps } from './sceneUtils';

const BANDS = {
  body: [0, 0.24],
  cell: [0.18, 0.48],
  nucleus: [0.42, 0.7],
  chromosomes: [0.64, 0.9],
  helix: [0.84, 1],
} as const;

function NucleusZoomScene({ progress = 0, active = true, quality = 'high' }: SceneProps) {
  const torsoMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const headMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const cellMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const nucleusMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const nucleusGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const chromoMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const chromoRef = useRef<THREE.InstancedMesh>(null);
  const helixGroupRef = useRef<THREE.Group>(null);

  const chromoCount = quality === 'low' ? 3 : 9;

  const chromoGeometry = useMemo(() => {
    const armA = new THREE.BoxGeometry(0.22, 1.2, 0.22);
    armA.rotateZ(0.6);
    const armB = new THREE.BoxGeometry(0.22, 1.2, 0.22);
    armB.rotateZ(-0.6);
    return mergeGeometries([armA, armB]);
  }, []);

  const chromoMatrices = useMemo(() => {
    const rng = mulberry32(0xc220);
    const dummy = new THREE.Object3D();
    return Array.from({ length: chromoCount }, () => {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = 0.35 + rng() * 0.75;
      dummy.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
      dummy.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      dummy.scale.setScalar(0.8 + rng() * 0.5);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
  }, [chromoCount]);

  useLayoutEffect(() => {
    const mesh = chromoRef.current;
    if (!mesh) return;
    chromoMatrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [chromoMatrices]);

  useProgressDriver(progress, active, (p, t, state) => {
    state.camera.position.z = 12 * Math.pow(0.25, p);
    const bodyOpacity = 0.85 * bandOpacity(p, ...BANDS.body);
    if (torsoMatRef.current) torsoMatRef.current.opacity = bodyOpacity;
    if (headMatRef.current) headMatRef.current.opacity = bodyOpacity;
    if (cellMatRef.current) cellMatRef.current.opacity = 0.16 * bandOpacity(p, ...BANDS.cell);
    if (nucleusMatRef.current)
      nucleusMatRef.current.opacity = 0.45 * bandOpacity(p, ...BANDS.nucleus);
    if (nucleusGlowMatRef.current)
      nucleusGlowMatRef.current.opacity = 0.4 * bandOpacity(p, ...BANDS.nucleus);
    if (chromoMatRef.current)
      chromoMatRef.current.opacity = 0.95 * bandOpacity(p, ...BANDS.chromosomes);
    const helixT = easeInOut(bandOpacity(p, ...BANDS.helix, 0.12));
    if (helixGroupRef.current) {
      helixGroupRef.current.scale.setScalar(Math.max(0.0001, 0.3 * helixT));
      helixGroupRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 8]} intensity={1.2} />
      <group>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.42, 1.5, 6, 16]} />
          <meshStandardMaterial ref={torsoMatRef} color={TOKENS.inkMid} transparent opacity={0} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial ref={headMatRef} color={TOKENS.inkMid} transparent opacity={0} />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[3, 48, 48]} />
        <meshBasicMaterial
          ref={cellMatRef}
          color={TOKENS.indigo}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <group>
        <mesh>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial
            ref={nucleusMatRef}
            color={TOKENS.indigo}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshBasicMaterial
            ref={nucleusGlowMatRef}
            color={TOKENS.indigo}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
      <instancedMesh
        key={`chromo-${chromoCount}`}
        ref={chromoRef}
        args={[chromoGeometry, undefined, chromoCount]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          ref={chromoMatRef}
          color={TOKENS.indigo}
          emissive={TOKENS.indigo}
          emissiveIntensity={0.3}
          roughness={0.4}
          transparent
          opacity={0}
        />
      </instancedMesh>
      <group ref={helixGroupRef} scale={0.0001}>
        <HelixContents progress={progress} active={active} quality={quality} />
      </group>
    </group>
  );
}

export default NucleusZoomScene;
