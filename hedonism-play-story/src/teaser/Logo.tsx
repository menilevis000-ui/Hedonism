import React from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { M, glowMat } from "./materials";
import { F_CONVERGE, F_LOGO, backOut, easeInOut, easeOut, lerp, span } from "./timeline";

export const S = 1.15; // tile size
const K = S / 100; // svg unit → world
const TOP = 0.2; // slab thickness

type Part =
  | { kind: "rect"; x: number; y: number; w: number; h: number; m: THREE.Material }
  | { kind: "half"; cx: number; cy: number; r: number; side: "L" | "R"; m: THREE.Material }
  | { kind: "disc"; cx: number; cy: number; r: number; m: THREE.Material }
  | { kind: "tri"; pts: [number, number][]; m: THREE.Material };

/* The four HEDONISM tiles in a black / white / silver / gold finish */
const TILES: { m: THREE.Material; parts: Part[] }[] = [
  { m: M.logoSilver, parts: [
    { kind: "rect", x: 52, y: 18, w: 14, h: 62, m: M.pearl },
    { kind: "half", cx: 52, cy: 65, r: 15, side: "L", m: M.ink },
  ] },
  { m: M.logoBlack, parts: [
    { kind: "half", cx: 56, cy: 50, r: 28, side: "L", m: M.pearl },
    { kind: "half", cx: 56, cy: 50, r: 14, side: "R", m: M.logoSilver },
  ] },
  { m: M.pearl, parts: [
    { kind: "half", cx: 56, cy: 55, r: 25, side: "L", m: M.ink },
    { kind: "disc", cx: 51, cy: 55, r: 9, m: M.pearl },
    { kind: "rect", x: 56, y: 30, w: 15, h: 50, m: M.logoSilver },
  ] },
  { m: M.gold, parts: [
    { kind: "rect", x: 36, y: 20, w: 15, h: 60, m: M.ink },
    { kind: "tri", pts: [[51, 50], [70, 80], [51, 80]], m: M.pearl },
  ] },
];

const slabGeo = new THREE.BoxGeometry(S * 0.995, TOP, S * 0.995);
const geoCache = new Map<string, THREE.BufferGeometry>();
const partGeo = (p: Part) => {
  const key = JSON.stringify({ ...p, m: undefined });
  if (geoCache.has(key)) return geoCache.get(key)!;
  let g: THREE.BufferGeometry;
  if (p.kind === "rect") g = new THREE.PlaneGeometry(p.w * K, p.h * K);
  else if (p.kind === "half") g = new THREE.CircleGeometry(p.r * K, 64, p.side === "L" ? Math.PI / 2 : -Math.PI / 2, Math.PI);
  else if (p.kind === "disc") g = new THREE.CircleGeometry(p.r * K, 48);
  else {
    const sh = new THREE.Shape();
    p.pts.forEach(([x, y], i) => (i ? sh.lineTo((x - 50) * K, -(y - 50) * K) : sh.moveTo((x - 50) * K, -(y - 50) * K)));
    sh.closePath();
    g = new THREE.ShapeGeometry(sh);
  }
  geoCache.set(key, g);
  return g;
};
const partPos = (p: Part, layer: number): [number, number, number] => {
  const y = TOP / 2 + 0.002 + layer * 0.002;
  if (p.kind === "rect") return [(p.x + p.w / 2 - 50) * K, y, (p.y + p.h / 2 - 50) * K];
  if (p.kind === "half" || p.kind === "disc") return [(p.cx - 50) * K, y, (p.cy - 50) * K];
  return [0, y, 0];
};

const edgeMat = glowMat("#f4e2b8", 0.9);
const edgeGeo = new THREE.BoxGeometry(1, 0.01, 0.018);

export const LogoForm: React.FC = () => {
  const f = useCurrentFrame();
  const start = F_CONVERGE + 4;
  if (f < start) return null;
  const outline = easeInOut(span(f, F_LOGO + 2, 18));
  edgeMat.opacity = 0.85 * outline * (0.75 + 0.25 * Math.sin(f / 6));
  const W = S * 2 + 0.16;
  return (
    <group>
      {TILES.map((t, i) => {
        const sx = i % 2 ? 1 : -1, sz = i < 2 ? -1 : 1;
        const from = new THREE.Vector3(sx * 3.4, 1.4, sz * 3.4);
        const to = new THREE.Vector3((sx * S) / 2, TOP / 2, (sz * S) / 2);
        const t0 = start + i * 2.5;
        const p = easeInOut(span(f, t0, 26));
        const pos = from.clone().lerp(to, p);
        pos.y = lerp(from.y, to.y, p) + Math.sin(p * Math.PI) * 0.9;
        const settle = f > t0 + 26 ? Math.exp(-(f - t0 - 26) / 3) * Math.sin((f - t0 - 26) * 1.4) * 0.05 : 0;
        pos.y += Math.abs(settle);
        const spin = (1 - p) * Math.PI * 2.5;
        const gsp = span(f, t0 + 24, 14);
        const glyph = backOut(gsp);
        return (
          <group key={i} position={pos} rotation={[spin * 0.6 * sz, spin * sx * 0.5, spin * 0.4]} scale={lerp(0.4, 1, easeOut(p))}>
            <mesh geometry={slabGeo} material={t.m} castShadow receiveShadow />
            {gsp > 0 &&
              t.parts.map((pt, j) => (
                <mesh key={j} geometry={partGeo(pt)} material={pt.m} position={partPos(pt, j)} rotation={[-Math.PI / 2, 0, 0]}
                  scale={Math.max(0.001, glyph)} />
              ))}
          </group>
        );
      })}
      {/* luminous frame tracing around the assembled mark */}
      {outline > 0 &&
        [0, 1, 2, 3].map((k) => {
          const len = W * outline;
          const horiz = k % 2 === 0;
          const sign = k < 2 ? -1 : 1;
          const pos: [number, number, number] = horiz ? [sign * (W / 2 - len / 2), 0.01, sign * (W / 2)] : [sign * -(W / 2), 0.01, sign * (W / 2 - len / 2)];
          return <mesh key={k} geometry={edgeGeo} material={edgeMat} position={pos} rotation={[0, horiz ? 0 : Math.PI / 2, 0]} scale={[len, 1, 1]} />;
        })}
    </group>
  );
};
