import * as THREE from "three";
import { F_LAND, physTime } from "./timeline";

const G = 9.8;
export type DieSpec = {
  p0: THREE.Vector3;
  land: THREE.Vector3;
  axis: THREE.Vector3;
  spin: number; // rad/s in flight
  yaw: number; // final yaw
  bounce: number;
};

export const DICE: DieSpec[] = [
  { p0: new THREE.Vector3(-4.0, 2.6, 3.0), land: new THREE.Vector3(-0.55, 0.5, 0.25), axis: new THREE.Vector3(0.8, 0.35, 0.5).normalize(), spin: 7.5, yaw: 0.35, bounce: 1.9 },
  { p0: new THREE.Vector3(-5.4, 0.7, 3.6), land: new THREE.Vector3(0.75, 0.5, -0.55), axis: new THREE.Vector3(-0.3, 0.6, 0.9).normalize(), spin: 9, yaw: -0.5, bounce: 1.6 },
];

const VERTS: THREE.Vector3[] = [];
for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) VERTS.push(new THREE.Vector3(x, y, z).multiplyScalar(0.47));

const tmp = new THREE.Vector3();
export const dieState = (d: DieSpec, frame: number) => {
  const t = physTime(frame);
  const t1 = physTime(F_LAND);
  const tb = (2 * d.bounce) / G;
  const t2 = t1 + tb;
  const vel = d.land.clone().sub(d.p0).divideScalar(t1);
  vel.y = (d.land.y - d.p0.y + 0.5 * G * t1 * t1) / t1;
  const hv = new THREE.Vector3(vel.x, 0, vel.z).multiplyScalar(0.18);

  let pos: THREE.Vector3;
  if (t < t1) {
    pos = d.p0.clone().addScaledVector(vel, t);
    pos.y = d.p0.y + vel.y * t - 0.5 * G * t * t;
  } else {
    const tt = Math.min(t, t2) - t1;
    pos = d.land.clone().addScaledVector(hv, tt);
    pos.y = 0.5 + (t < t2 ? d.bounce * tt - 0.5 * G * tt * tt : 0);
  }
  const wb = 3.2;
  const theta = t < t1 ? wb * tb + d.spin * (t1 - t) : t < t2 ? wb * (t2 - t) : 0;
  const qF = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), d.yaw);
  const q = qF.clone().multiply(new THREE.Quaternion().setFromAxisAngle(d.axis, theta));
  // keep the die resting on (never inside) the floor
  let support = 0;
  for (const v of VERTS) support = Math.max(support, -tmp.copy(v).applyQuaternion(q).y);
  pos.y = Math.max(pos.y, support + 0.03);
  return { pos, q, landed: t >= t2 };
};
