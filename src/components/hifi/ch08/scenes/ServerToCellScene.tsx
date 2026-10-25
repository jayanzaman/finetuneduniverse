'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mulberry32 } from '../lib/codonTable';
import { TOKENS, clamp01, easeInOut, useProgressDriver } from './sceneUtils';
import type { SceneProps } from './sceneUtils';

const RACK_COLS = 5;
const RACK_ROWS = 2;

function ServerToCellScene({ progress = 0, active = true, quality = 'high' }: SceneProps) {
  const rackRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.InstancedMesh>(null);
  const rackMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const nucleusRef = useRef<THREE.Group>(null);
  const shellMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const lightsPerRack = quality === 'low' ? 3 : 8;
  const rackCount = RACK_COLS * RACK_ROWS;

  const racks = useMemo(() => {
    const rng = mulberry32(0x5eed01);
    return Array.from({ length: rackCount }, (_, i) => {
      const row = Math.floor(i / RACK_COLS);
      const col = i % RACK_COLS;
      const angle = rng() * Math.PI * 2;
      return {
        base: new THREE.Vector3((col - (RACK_COLS - 1) / 2) * 1.35, 0, -row * 1.5),
        offset: new THREE.Vector3(
          Math.cos(angle) * (1.5 + rng() * 2.5),
          0.5 + rng() * 2.5,
          Math.sin(angle) * (1.5 + rng() * 2.5) + 1.5,
        ),
        spin: (rng() - 0.5) * 2,
        delay: rng() * 0.35,
      };
    });
  }, [rackCount]);

  const lightLocals = useMemo(() => {
    const rng = mulberry32(0x5eed02);
    return Array.from(
      { length: lightsPerRack },
      () => new THREE.Vector3((rng() - 0.5) * 0.6, (rng() - 0.5) * 2.2, 0.26),
    );
  }, [lightsPerRack]);

  const lightColors = useMemo(() => {
    const rng = mulberry32(0x5eed03);
    const palette = [TOKENS.mint, TOKENS.indigo, TOKENS.mint, TOKENS.warm];
    return Array.from(
      { length: rackCount * lightsPerRack },
      () => new THREE.Color(palette[Math.floor(rng() * palette.length)]),
    );
  }, [rackCount, lightsPerRack]);

  const scratch = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      rackMatrix: new THREE.Matrix4(),
      local: new THREE.Matrix4(),
      lightMatrix: new THREE.Matrix4(),
    }),
    [],
  );

  useLayoutEffect(() => {
    const lights = lightRef.current;
    if (!lights) return;
    lightColors.forEach((c, i) => lights.setColorAt(i, c));
    if (lights.instanceColor) lights.instanceColor.needsUpdate = true;
  }, [lightColors, lightsPerRack]);

  useProgressDriver(progress, active, (pRaw) => {
    const rackMesh = rackRef.current;
    const lightMesh = lightRef.current;
    if (!rackMesh || !lightMesh) return;
    const { dummy, rackMatrix, local, lightMatrix } = scratch;

    racks.forEach((rack, i) => {
      const p = easeInOut(clamp01((pRaw - rack.delay) / (1 - rack.delay)));
      dummy.position.copy(rack.base).addScaledVector(rack.offset, p);
      dummy.rotation.set(0, rack.spin * p, 0);
      dummy.scale.setScalar(Math.max(0.0001, 1 - p));
      dummy.updateMatrix();
      rackMatrix.copy(dummy.matrix);
      rackMesh.setMatrixAt(i, rackMatrix);
      for (let j = 0; j < lightsPerRack; j++) {
        local.makeTranslation(lightLocals[j].x, lightLocals[j].y, lightLocals[j].z);
        lightMatrix.multiplyMatrices(rackMatrix, local);
        lightMesh.setMatrixAt(i * lightsPerRack + j, lightMatrix);
      }
    });
    rackMesh.instanceMatrix.needsUpdate = true;
    lightMesh.instanceMatrix.needsUpdate = true;

    const fade = 1 - easeInOut(pRaw);
    if (rackMatRef.current) rackMatRef.current.opacity = fade;
    if (lightMatRef.current) lightMatRef.current.opacity = fade;

    const grow = easeInOut(pRaw);
    if (nucleusRef.current) {
      nucleusRef.current.scale.setScalar(Math.max(0.0001, grow));
    }
    if (shellMatRef.current) shellMatRef.current.opacity = 0.22 * grow;
    if (glowMatRef.current) glowMatRef.current.opacity = 0.5 * grow;
  });

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 7, 6]} intensity={1.1} />
      <instancedMesh
        ref={rackRef}
        args={[undefined, undefined, rackCount]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 2.6, 0.5]} />
        <meshStandardMaterial
          ref={rackMatRef}
          color={TOKENS.inkFaint}
          roughness={0.7}
          metalness={0.3}
          transparent
        />
      </instancedMesh>
      <instancedMesh
        key={`lights-${lightsPerRack}`}
        ref={lightRef}
        args={[undefined, undefined, rackCount * lightsPerRack]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.07, 0.07, 0.02]} />
        <meshBasicMaterial
          ref={lightMatRef}
          color="#ffffff"
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
      <group ref={nucleusRef} position={[0, 0, 1.8]} scale={0.0001}>
        <mesh>
          <sphereGeometry args={[1.05, 32, 32]} />
          <meshBasicMaterial
            ref={shellMatRef}
            color={TOKENS.indigo}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.72, 32, 32]} />
          <meshBasicMaterial
            ref={glowMatRef}
            color={TOKENS.indigo}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export default ServerToCellScene;
