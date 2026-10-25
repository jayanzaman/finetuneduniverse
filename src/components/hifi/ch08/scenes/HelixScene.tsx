'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mulberry32 } from '../lib/codonTable';
import { TOKENS, useProgressDriver } from './sceneUtils';
import type { SceneProps } from './sceneUtils';

const TURNS = 5;
const HEIGHT = 7.2;
const RADIUS = 1.15;

const BASE_COLORS: Record<string, THREE.Color> = {
  A: new THREE.Color(TOKENS.indigo),
  T: new THREE.Color(TOKENS.warm),
  G: new THREE.Color(TOKENS.mint),
  C: new THREE.Color(TOKENS.inkSoft),
};

function helixPoint(t: number, phase: number, out: THREE.Vector3): THREE.Vector3 {
  const a = t * TURNS * Math.PI * 2 + phase;
  return out.set(Math.cos(a) * RADIUS, (t - 0.5) * HEIGHT, Math.sin(a) * RADIUS);
}

export function HelixContents({ progress = 0, active = true, quality = 'high' }: SceneProps) {
  const rungCount = quality === 'low' ? 48 : 120;
  const groupRef = useRef<THREE.Group>(null);
  const strandARef = useRef<THREE.InstancedMesh>(null);
  const strandBRef = useRef<THREE.InstancedMesh>(null);

  const backbones = useMemo(() => {
    const build = (phase: number) => {
      const pts: THREE.Vector3[] = [];
      const v = new THREE.Vector3();
      for (let i = 0; i <= 96; i++) pts.push(helixPoint(i / 96, phase, v).clone());
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.05, 8, false);
    };
    return [build(0), build(Math.PI)];
  }, []);

  const rungs = useMemo(() => {
    const rng = mulberry32(0xc08e);
    const dummy = new THREE.Object3D();
    const yAxis = new THREE.Vector3(0, 1, 0);
    const pa = new THREE.Vector3();
    const pb = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const matsA: THREE.Matrix4[] = [];
    const matsB: THREE.Matrix4[] = [];
    const colsA: THREE.Color[] = [];
    const colsB: THREE.Color[] = [];
    for (let i = 0; i < rungCount; i++) {
      const t = (i + 0.5) / rungCount;
      helixPoint(t, 0, pa);
      helixPoint(t, Math.PI, pb);
      const at = rng() < 0.5;
      const swap = rng() < 0.5;
      let aBase = at ? 'A' : 'G';
      let bBase = at ? 'T' : 'C';
      if (swap) [aBase, bBase] = [bBase, aBase];
      colsA.push(BASE_COLORS[aBase]);
      colsB.push(BASE_COLORS[bBase]);
      for (const [strand, mats] of [
        [pa, matsA],
        [pb, matsB],
      ] as const) {
        dir.set(-strand.x, 0, -strand.z).normalize();
        dummy.position.set(strand.x / 2, strand.y, strand.z / 2);
        dummy.quaternion.setFromUnitVectors(yAxis, dir);
        dummy.scale.set(1, RADIUS, 1);
        dummy.updateMatrix();
        mats.push(dummy.matrix.clone());
      }
    }
    return { matsA, matsB, colsA, colsB };
  }, [rungCount]);

  useLayoutEffect(() => {
    for (const [mesh, mats, cols] of [
      [strandARef.current, rungs.matsA, rungs.colsA],
      [strandBRef.current, rungs.matsB, rungs.colsB],
    ] as const) {
      if (!mesh) continue;
      mats.forEach((m, i) => mesh.setMatrixAt(i, m));
      cols.forEach((c, i) => mesh.setColorAt(i, c));
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [rungs]);

  useProgressDriver(progress, active, (p, t) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y = p * Math.PI * 2 + t * 0.12;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 8]} intensity={1.4} />
      <pointLight position={[-6, -4, 6]} intensity={14} color={TOKENS.indigo} />
      <mesh geometry={backbones[0]}>
        <meshStandardMaterial
          color={TOKENS.indigo}
          emissive={TOKENS.indigo}
          emissiveIntensity={0.35}
          roughness={0.4}
        />
      </mesh>
      <mesh geometry={backbones[1]}>
        <meshStandardMaterial
          color={TOKENS.inkMid}
          emissive={TOKENS.indigo}
          emissiveIntensity={0.15}
          roughness={0.5}
        />
      </mesh>
      <instancedMesh
        key={`rungs-a-${rungCount}`}
        ref={strandARef}
        args={[undefined, undefined, rungCount]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.032, 0.032, 1, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </instancedMesh>
      <instancedMesh
        key={`rungs-b-${rungCount}`}
        ref={strandBRef}
        args={[undefined, undefined, rungCount]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.032, 0.032, 1, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </instancedMesh>
    </group>
  );
}

export default HelixContents;
