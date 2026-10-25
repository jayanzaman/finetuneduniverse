'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mulberry32 } from '../lib/codonTable';
import { TOKENS, easeInOut, useProgressDriver } from './sceneUtils';
import type { SceneProps } from './sceneUtils';

const COUNT_HIGH = 60;
const COUNT_LOW = 20;

const buildPalette = (): THREE.Color[] => {
  const indigoHue = 0.667;
  const mintHue = 0.42;
  const warmHue = 0.066;
  return Array.from({ length: 20 }, (_, i) => {
    const t = i / 19;
    const hue =
      t < 0.5
        ? THREE.MathUtils.lerp(indigoHue, mintHue, t * 2)
        : THREE.MathUtils.lerp(mintHue, warmHue + 1, (t - 0.5) * 2) % 1;
    return new THREE.Color().setHSL(hue, 0.55, 0.62);
  });
};

function FoldingScene({ progress = 0, active = true, quality = 'high' }: SceneProps) {
  const count = quality === 'low' ? COUNT_LOW : COUNT_HIGH;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const chain = useMemo(() => {
    const rng = mulberry32(0xf01d);
    const unfolded: THREE.Vector3[] = [];
    const folded: THREE.Vector3[] = [];
    const seeds: number[] = [];
    for (let i = 0; i < count; i++) {
      const angle = i * 0.55;
      unfolded.push(
        new THREE.Vector3(
          (i / (count - 1) - 0.5) * 6,
          Math.sin(angle) * 0.55,
          Math.cos(angle) * 0.55,
        ),
      );
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = Math.pow(rng(), 0.6) * 1.05;
      folded.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ),
      );
      seeds.push(rng());
    }
    return { unfolded, folded, seeds, palette: buildPalette() };
  }, [count]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    chain.palette.forEach((c, i) => mesh.setColorAt(i % 20, c));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [chain]);

  useProgressDriver(progress, active, (pRaw, t) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = easeInOut(pRaw);
    const dummy = new THREE.Object3D();
    const pos = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      pos.lerpVectors(chain.unfolded[i], chain.folded[i], p);
      if (p > 0.001) {
        const s = chain.seeds[i];
        pos.x += Math.sin(t * 1.3 + s * 6.28) * 0.045 * p;
        pos.y += Math.cos(t * 1.1 + s * 9.4) * 0.045 * p;
        pos.z += Math.sin(t * 0.9 + s * 3.1) * 0.045 * p;
      }
      dummy.position.copy(pos);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 8]} intensity={1.3} />
      <pointLight position={[-5, -3, 5]} intensity={10} color={TOKENS.indigo} />
      <instancedMesh
        key={`chain-${count}`}
        ref={meshRef}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </instancedMesh>
    </group>
  );
}

export default FoldingScene;
