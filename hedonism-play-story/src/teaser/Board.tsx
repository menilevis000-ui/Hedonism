import React, { useMemo } from "react";
import * as THREE from "three";
import { random, useCurrentFrame } from "remotion";
import { M, glowMat, makeWindowTexture } from "./materials";
import {
  F_BOARD, F_CITY, F_CONVERGE, F_PIECES, backOut, easeIn, easeInOut, easeOut, lerp, span,
} from "./timeline";

const HALF = 5;
const WAVE = 2.6; // frames per unit of distance for the emergence wave

/* ---------- layout ---------- */
type Tile = { x: number; z: number; i: number; corner: boolean; h: number; ang: number };
const RING: Tile[] = [];
{
  let i = 0;
  const push = (x: number, z: number) => {
    const corner = Math.abs(x) === HALF && Math.abs(z) === HALF;
    RING.push({ x, z, i, corner, h: corner ? 6.2 : 1.3 + random(`h${i}`) * 4.2, ang: Math.atan2(z, x) });
    i++;
  };
  for (let x = -HALF; x <= HALF; x++) push(x, -HALF);
  for (let z = -HALF + 1; z <= HALF; z++) push(HALF, z);
  for (let x = HALF - 1; x >= -HALF; x--) push(x, HALF);
  for (let z = HALF - 1; z > -HALF; z--) push(-HALF, z);
}
const CELLS: { x: number; z: number }[] = [];
for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) CELLS.push({ x, z });

const POINT_W = 0.75;
const POINTS: { x: number; top: boolean; k: number }[] = [];
for (let k = 0; k < 12; k++) {
  const x = -4.5 + POINT_W / 2 + k * POINT_W;
  POINTS.push({ x, top: true, k }, { x, top: false, k });
}
const STACKS: { k: number; top: boolean; n: number; white: boolean }[] = [
  { k: 0, top: true, n: 2, white: true }, { k: 5, top: true, n: 4, white: false }, { k: 7, top: true, n: 3, white: false },
  { k: 11, top: true, n: 4, white: true }, { k: 0, top: false, n: 2, white: false }, { k: 5, top: false, n: 4, white: true },
  { k: 7, top: false, n: 3, white: true }, { k: 11, top: false, n: 4, white: false },
];

/* ---------- shared geometry ---------- */
const tileGeo = new THREE.BoxGeometry(0.95, 0.12, 0.95);
const cellGeo = new THREE.BoxGeometry(0.985, 0.1, 0.985);
const triShape = new THREE.Shape();
triShape.moveTo(-POINT_W * 0.46, 0);
triShape.lineTo(POINT_W * 0.46, 0);
triShape.lineTo(0, 3.3);
triShape.closePath();
const triGeo = new THREE.ShapeGeometry(triShape);
const checkerGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.09, 48);
const rimGeo = new THREE.TorusGeometry(0.31, 0.012, 8, 48);
const pawnGeo = new THREE.LatheGeometry(
  [[0, 0], [0.28, 0], [0.28, 0.05], [0.21, 0.09], [0.12, 0.3], [0.09, 0.48], [0.15, 0.52], [0.09, 0.57], [0, 0.57]].map(([x, y]) => new THREE.Vector2(x, y)),
  48,
);
const headGeo = new THREE.SphereGeometry(0.13, 32, 16);
const houseGeo = new THREE.BoxGeometry(0.36, 0.26, 0.36);
const roofGeo = new THREE.ConeGeometry(0.3, 0.22, 4);
const obeliskGeo = new THREE.ConeGeometry(0.42, 2.8, 4);
const towerGeo = new THREE.BoxGeometry(0.78, 1, 0.78);
const capGeo = new THREE.BoxGeometry(0.82, 0.04, 0.82);
const lineGeo = new THREE.BoxGeometry(1, 0.012, 0.03);
const ringGeo = new THREE.RingGeometry(0.97, 1, 160);
const softRingGeo = new THREE.RingGeometry(0.8, 1, 160);
const archGeo = new THREE.TorusGeometry(2.1, 0.05, 12, 96, Math.PI);
const domeGeo = new THREE.SphereGeometry(2.15, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2);
const haloGeo = new THREE.TorusGeometry(1, 0.022, 12, 160);

const goldGlow = glowMat("#f0d49a", 0.9);
const waveA = glowMat("#f0d49a", 1);
const waveB = glowMat("#ffffff", 0.3);
const domeMat = new THREE.MeshBasicMaterial({ color: "#dfe6f0", wireframe: true, transparent: true, opacity: 0.14, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false });
const beamMat = glowMat("#fff3dc", 0.22);

/** emergence progress of an element at distance d from the impact point */
const emerge = (f: number, d: number, dur = 16) => easeOut(span(f, F_BOARD + d * WAVE, dur));
/** everything sinks back into the floor during the convergence */
const recede = (f: number, d: number) => easeIn(span(f, F_CONVERGE + 2 + (7.5 - d) * 1.0, 12));

export const Board: React.FC = () => {
  const f = useCurrentFrame();
  const towerMats = useMemo(() => {
    const base = makeWindowTexture("win");
    return RING.map((t) => {
      const tex = base.clone();
      tex.needsUpdate = true;
      tex.repeat.set(1, Math.max(1, Math.round(t.h / 1.2)));
      return new THREE.MeshStandardMaterial({ color: "#07080b", metalness: 0.9, roughness: 0.22, emissive: new THREE.Color("#ffffff"), emissiveMap: tex, emissiveIntensity: 0 });
    });
  }, []);
  const cityLights = easeInOut(span(f, F_CITY + 14, 26)) * (1 - easeIn(span(f, F_CONVERGE, 14)));
  towerMats.forEach((m) => (m.emissiveIntensity = cityLights * 1.3));

  const wave = (f - F_BOARD) / WAVE;
  const waveO = f >= F_BOARD ? Math.max(0, 1 - wave / 9) : 0;
  waveA.opacity = waveO;
  waveB.opacity = waveO * 0.25;

  // city & convergence controls
  const cityT = (t: Tile) => easeOut(span(f, F_CITY + ((t.i * 7) % 40) * 0.55, 24));
  const towerDown = easeIn(span(f, F_CONVERGE, 16));
  const piecesDown = easeIn(span(f, F_CONVERGE, 14));

  return (
    <group>
      {/* emergence shock-wave */}
      {waveO > 0 && (
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <mesh geometry={ringGeo} material={waveA} scale={Math.max(0.01, wave)} />
          <mesh geometry={softRingGeo} material={waveB} scale={Math.max(0.01, wave * 0.92)} />
        </group>
      )}

      {/* ring tiles + towers */}
      {RING.map((t) => {
        const d = Math.hypot(t.x, t.z);
        const e = emerge(f, d);
        const r = recede(f, d);
        if (e <= 0 || r >= 1) return null;
        const y = -0.06 - (1 - e) * 0.4 - r * 0.5;
        const ct = cityT(t) * (1 - towerDown);
        const h = t.h * ct;
        return (
          <group key={`t${t.i}`} position={[t.x, y, t.z]}>
            <mesh geometry={tileGeo} material={t.corner ? M.graphite : t.i % 2 ? M.lacquer : M.graphite} receiveShadow castShadow />
            {h > 0.01 && (
              <>
                <mesh geometry={towerGeo} material={towerMats[t.i]} position={[0, 0.06 + h / 2, 0]} scale={[1, h, 1]} castShadow />
                <mesh geometry={capGeo} material={M.silver} position={[0, 0.06 + h + 0.02, 0]} />
              </>
            )}
          </group>
        );
      })}

      {/* inner board cells */}
      {CELLS.map((c, i) => {
        const d = Math.hypot(c.x, c.z);
        const e = emerge(f, d);
        const r = recede(f, d);
        if (e <= 0 || r >= 1) return null;
        return <mesh key={`c${i}`} geometry={cellGeo} material={M.lacquer} position={[c.x, -0.05 - (1 - e) * 0.4 - r * 0.5, c.z]} receiveShadow />;
      })}

      {/* backgammon points */}
      {POINTS.map((p, i) => {
        const z0 = p.top ? -4.45 : 4.45;
        const d = Math.hypot(p.x, z0 * 0.6);
        const e = emerge(f, d + 0.6, 14);
        const r = recede(f, d);
        if (e <= 0 || r >= 1) return null;
        return (
          <mesh key={`p${i}`} geometry={triGeo} material={(p.k + (p.top ? 0 : 1)) % 2 ? M.marble : M.brushed}
            position={[p.x, 0.004 - r * 0.5, z0]} rotation={[-Math.PI / 2, 0, p.top ? Math.PI : 0]} scale={[1, e, 1]} receiveShadow />
        );
      })}

      {/* checker stacks — grow into cylindrical towers in the city phase */}
      {STACKS.map((s, si) => {
        const x = -4.5 + POINT_W / 2 + s.k * POINT_W;
        return new Array(s.n).fill(0).map((_, j) => {
          const z = s.top ? -4.1 + j * 0.64 : 4.1 - j * 0.64;
          const d = Math.hypot(x, z);
          const sp = span(f, F_PIECES + si * 1.5 + j * 2, 14);
          const e = backOut(sp);
          const r = recede(f, d);
          if (sp <= 0 || r >= 1) return null;
          const grow = j === 0 ? easeOut(span(f, F_CITY + 6 + si * 2, 22)) * (1 - towerDown) : 0;
          const hScale = 1 + grow * (18 + si * 4);
          const hh = 0.09 * hScale;
          return (
            <group key={`k${si}-${j}`} position={[x, 0.01 + hh / 2 + (1 - e) * 1.2 - r * 0.6, z]}>
              <mesh geometry={checkerGeo} material={s.white ? M.pearl : M.obsidian} scale={[1, hScale, 1]} castShadow receiveShadow />
              <mesh geometry={rimGeo} material={M.silver} rotation={[Math.PI / 2, 0, 0]} position={[0, hh / 2, 0]} />
            </group>
          );
        });
      })}

      {/* glowing gold paths drawing around the board */}
      {[5.5, 4.5].map((hf, li) =>
        [0, 1, 2, 3].map((side) => {
          const p = easeInOut(span(f, F_BOARD + 12 + side * 5 + li * 8, 16)) * (1 - easeIn(span(f, F_CONVERGE + 4, 14)));
          if (p <= 0) return null;
          const len = hf * 2 * p;
          const rot = side % 2 ? Math.PI / 2 : 0;
          const sign = side < 2 ? -1 : 1;
          const start = -hf;
          const pos: [number, number, number] =
            side % 2 === 0 ? [start + len / 2, 0.015, sign * hf] : [sign * -hf, 0.015, start + len / 2];
          return <mesh key={`l${li}${side}`} geometry={lineGeo} material={goldGlow} position={pos} rotation={[0, rot, 0]} scale={[len, 1, 1]} />;
        }),
      )}

      {/* pawns & houses */}
      {[3, 9, 14, 22, 27, 35].map((ti, k) => {
        const t = RING[ti];
        const sp = span(f, F_PIECES + 4 + k * 2.5, 18);
        const e = backOut(sp);
        const down = piecesDown;
        if (sp <= 0 || down >= 1) return null;
        const mat = [M.silver, M.obsidian, M.pearl][k % 3];
        return (
          <group key={`pw${k}`} position={[t.x, -0.6 + e * 0.6 - down * 0.8, t.z]} rotation={[0, (1 - e) * 3, 0]} scale={1 - down * 0.5}>
            <mesh geometry={pawnGeo} material={mat} castShadow />
            <mesh geometry={headGeo} material={mat} position={[0, 0.68, 0]} castShadow />
          </group>
        );
      })}
      {[6, 12, 18, 25, 31, 38].map((ti, k) => {
        const t = RING[ti];
        const sp = span(f, F_PIECES + 8 + k * 2.5, 18);
        const e = backOut(sp);
        if (sp <= 0 || piecesDown >= 1) return null;
        const big = 1 + easeOut(span(f, F_CITY, 20)) * 0.6;
        return (
          <group key={`hs${k}`} position={[t.x + 0.0, -0.4 + e * 0.4, t.z]} scale={e * big * (1 - piecesDown)}>
            <mesh geometry={houseGeo} material={M.gold} position={[0, 0.13, 0]} castShadow />
            <mesh geometry={roofGeo} material={M.gold} position={[0, 0.37, 0]} rotation={[0, Math.PI / 4, 0]} castShadow />
          </group>
        );
      })}

      {/* corner obelisks */}
      {RING.filter((t) => t.corner).map((t, k) => {
        const e = easeOut(span(f, F_PIECES + 6 + k * 3, 24));
        const down = easeIn(span(f, F_CONVERGE, 10));
        if (e <= 0 || down >= 1) return null;
        const s = e * (1 - down);
        return <mesh key={`ob${k}`} geometry={obeliskGeo} material={M.brushed} position={[t.x, 1.4 * s, t.z]} scale={[1, s, 1]} rotation={[0, Math.PI / 4, 0]} castShadow />;
      })}

      {/* levitating halos → pavilion crown */}
      {[1.5, 2.0, 2.5].map((rad, k) => {
        const e = easeOut(span(f, F_PIECES + 10 + k * 4, 26));
        const down = easeIn(span(f, F_CONVERGE, 16));
        if (e <= 0 || down >= 1) return null;
        const lift = lerp(2.2, 3.4 + k * 0.5, easeInOut(span(f, F_CITY, 30)));
        return (
          <mesh key={`hl${k}`} geometry={haloGeo} material={k === 1 ? M.goldSoft : M.satin} position={[0, lift * (1 - down), 0]}
            rotation={[Math.PI / 2 + Math.sin(f / 30 + k) * 0.35, f * 0.02 * (k % 2 ? -1 : 1), Math.cos(f / 25 + k) * 0.25]}
            scale={rad * e * (1 - down)} />
        );
      })}

      {/* city: event pavilion (arches + dome + light pillar) */}
      {(() => {
        const e = easeOut(span(f, F_CITY + 4, 28));
        const down = easeIn(span(f, F_CONVERGE, 14));
        if (e <= 0 || down >= 1) return null;
        const s = e * (1 - down);
        return (
          <group>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <mesh key={k} geometry={archGeo} material={M.silver} rotation={[0, (k * Math.PI) / 6 + f * 0.003, 0]} scale={[1, s, 1]} castShadow />
            ))}
            <mesh geometry={domeGeo} material={domeMat} scale={[1, s, 1]} />
            <mesh position={[0, 6 * s, 0]} scale={[0.06, 12 * s, 0.06]} material={beamMat}>
              <cylinderGeometry args={[1, 1, 1, 16]} />
            </mesh>
          </group>
        );
      })()}
    </group>
  );
};
