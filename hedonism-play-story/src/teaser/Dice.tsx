import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { useCurrentFrame } from "remotion";
import { DICE, dieState } from "./dice";
import { M } from "./materials";
import { F_CITY, easeIn, span } from "./timeline";

const FACES: { n: [number, number, number]; u: [number, number, number]; v: [number, number, number]; val: number }[] = [
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1], val: 6 },
  { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], val: 1 },
  { n: [1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], val: 3 },
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], val: 4 },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], val: 2 },
  { n: [0, 0, -1], u: [1, 0, 0], v: [0, 1, 0], val: 5 },
];
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  5: [[-1, -1], [-1, 1], [0, 0], [1, -1], [1, 1]],
  6: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]],
};
const pipGeo = new THREE.CircleGeometry(0.085, 32);
const Z = new THREE.Vector3(0, 0, 1);

const Die: React.FC<{ idx: number; body: THREE.Material; pip: THREE.Material }> = ({ idx, body, pip }) => {
  const frame = useCurrentFrame();
  const { pos, q } = dieState(DICE[idx], frame);
  const sink = easeIn(span(frame, F_CITY - 4, 22));
  const pips = useMemo(() => {
    const out: { p: THREE.Vector3; q: THREE.Quaternion }[] = [];
    for (const f of FACES) {
      const n = new THREE.Vector3(...f.n), u = new THREE.Vector3(...f.u), v = new THREE.Vector3(...f.v);
      const qq = new THREE.Quaternion().setFromUnitVectors(Z, n);
      for (const [a, b] of PIPS[f.val])
        out.push({ p: n.clone().multiplyScalar(0.502).addScaledVector(u, a * 0.25).addScaledVector(v, b * 0.25), q: qq });
    }
    return out;
  }, []);
  return (
    <group position={[pos.x, pos.y - sink * 1.2, pos.z]} quaternion={q} scale={1 - sink * 0.3}>
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={6} material={body} castShadow receiveShadow />
      {pips.map((p, i) => (
        <mesh key={i} geometry={pipGeo} material={pip} position={p.p} quaternion={p.q} />
      ))}
    </group>
  );
};

export const Dice: React.FC = () => (
  <>
    <Die idx={0} body={M.obsidian} pip={M.silver} />
    <Die idx={1} body={M.pearl} pip={M.ink} />
  </>
);
