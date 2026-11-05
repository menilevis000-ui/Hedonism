import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { random, useCurrentFrame } from "remotion";
import { DICE, dieState } from "./dice";
import { F_CITY, F_CONVERGE, F_LAND, easeInOut, lerp, span } from "./timeline";

/* ---------- camera choreography ---------- */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rotY = (v: THREE.Vector3, a: number) => v.clone().applyAxisAngle(V(0, 1, 0), a);

type Pose = { pos: THREE.Vector3; tgt: THREE.Vector3; fov: number };
const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  pos: a.pos.clone().lerp(b.pos, t),
  tgt: a.tgt.clone().lerp(b.tgt, t),
  fov: lerp(a.fov, b.fov, t),
});

const diceMid = (f: number) => {
  const a = dieState(DICE[0], f).pos, b = dieState(DICE[1], f).pos;
  return a.add(b).multiplyScalar(0.5);
};

export const cameraPose = (f: number): Pose => {
  // A · slow-motion tracking shot of the flying dice
  const ft = Math.max(f, 14);
  const mid = diceMid(Math.min(ft, F_LAND + 14));
  const ang = lerp(-0.85, 0.3, easeInOut(ft / 100));
  const A: Pose = { pos: mid.clone().add(rotY(V(0.5, 0.7 + ft * 0.006, 7.4 - ft * 0.018), ang)), tgt: mid.clone().add(V(0, -0.05, 0)), fov: 42 };
  // B · crane up to reveal the board world
  const bAng = 0.3 + (f - 96) * 0.0045;
  const B: Pose = { pos: rotY(V(0, 9.5 + (f - 96) * 0.025, 11.5), bAng), tgt: V(0, 0, 0.3), fov: 44 };
  // C · low sweeping orbit through the rising city
  const cAng = lerp(0.95, -0.55, easeInOut(span(f, 150, 60)));
  const C: Pose = { pos: rotY(V(0, lerp(4.0, 7.5, span(f, 150, 60)), 14.5), cAng), tgt: V(0, 2.2, 0), fov: 50 };
  // D · overhead — the pieces lock into the HEDONISM mark
  const D: Pose = { pos: V(0, lerp(12.8, 11.6, easeInOut(span(f, 236, 64))), 1.55), tgt: V(0, 0, 1.15), fov: 34 };

  let p = mixPose(A, B, easeInOut(span(f, 90, 36)));
  p = mixPose(p, C, easeInOut(span(f, 146, 30)));
  p = mixPose(p, D, easeInOut(span(f, F_CONVERGE - 2, 36)));
  // impact shake
  for (const at of [F_LAND, F_LAND + 11]) {
    if (f >= at) {
      const k = Math.exp(-(f - at) / 4) * (at === F_LAND ? 0.07 : 0.03);
      p.pos.add(V(Math.sin(f * 2.7) * k, Math.cos(f * 3.1) * k, 0));
    }
  }
  return p;
};

export const CameraRig: React.FC = () => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const p = cameraPose(f);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.copy(p.pos);
  cam.fov = p.fov;
  cam.near = 0.1;
  cam.far = 80;
  cam.lookAt(p.tgt);
  cam.updateProjectionMatrix();
  return null;
};

/* ---------- atmosphere: floating dust ---------- */
export const Dust: React.FC = () => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const n = 500;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (random(`dx${i}`) - 0.5) * 18;
      arr[i * 3 + 1] = random(`dy${i}`) * 7;
      arr[i * 3 + 2] = (random(`dz${i}`) - 0.5) * 18;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: "#ffffff", size: 0.025, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), []);
  return <points geometry={geo} material={mat} rotation={[0, f * 0.0016, 0]} position={[0, Math.sin(f / 50) * 0.15, 0]} />;
};

/* ---------- impact sparks ---------- */
export const Sparks: React.FC = () => {
  const f = useCurrentFrame();
  const n = 70;
  const seeds = useMemo(
    () => DICE.map((d, di) => new Array(n).fill(0).map((_, i) => {
      const a = random(`sa${di}${i}`) * Math.PI * 2;
      const up = 0.6 + random(`su${di}${i}`) * 2.6;
      const sp = 1 + random(`ss${di}${i}`) * 3.2;
      return { v: V(Math.cos(a) * sp, up, Math.sin(a) * sp), base: d.land.clone().setY(0.02) };
    })),
    [],
  );
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
    const m = new THREE.PointsMaterial({ color: "#ffe9c4", size: 0.05, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    return { geo: g, mat: m };
  }, []);
  const t = (f - F_LAND) / 30;
  if (t < 0 || t > 1.2) return null;
  const arr = geo.attributes.position.array as Float32Array;
  let k = 0;
  for (const set of seeds)
    for (const s of set) {
      arr[k++] = s.base.x + s.v.x * t * 0.55;
      arr[k++] = Math.max(0.02, s.base.y + s.v.y * t - 4.9 * t * t);
      arr[k++] = s.base.z + s.v.z * t * 0.55;
    }
  geo.attributes.position.needsUpdate = true;
  mat.opacity = Math.max(0, 1 - t / 1.1);
  return <points geometry={geo} material={mat} />;
};

/* moving key light that glints across the finished logo */
export const Glint: React.FC = () => {
  const f = useCurrentFrame();
  const p = span(f, 236, 40);
  if (p <= 0) return null;
  return <pointLight position={[lerp(-4, 4, easeInOut(p)), 3, lerp(-2, 2, p)]} intensity={1.8 * Math.sin(p * Math.PI)} distance={9} color="#fff2d6" />;
};

export const cityGlow = (f: number) => easeInOut(span(f, F_CITY + 10, 30)) * (1 - easeInOut(span(f, F_CONVERGE, 20)));
