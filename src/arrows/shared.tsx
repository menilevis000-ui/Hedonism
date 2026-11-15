import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { AH, AW, DIRS, POLYS, Pt, TIPS, apply, homography } from "./data";

/** Helpers shared by the three "arrows" styles. */

export const FOOTAGE = staticFile("arrows/footage-slow.mp4");
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Screen-space unit vector the arrow points in at frame f. */
export const screenDir = (a: number, f: number): Pt => {
  const h = homography(a, f);
  const p1 = apply(h, TIPS[a]);
  const p0 = apply(h, [TIPS[a][0] - DIRS[a][0] * 200, TIPS[a][1] - DIRS[a][1] * 200]);
  const l = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  return [(p1[0] - p0[0]) / l, (p1[1] - p0[1]) / l];
};

export const screenPoly = (a: number, f: number, local: Pt[] = POLYS[a]) => {
  const h = homography(a, f);
  return local.map((p) => apply(h, p));
};

export const svgPath = (pts: Pt[]) =>
  `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}Z`;

export const clipPolygon = (pts: Pt[]) =>
  `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",")})`;

/** Position of a local point along the arrow, 0 = tail, 1 = tip. */
export const along = (a: number, p: Pt) => {
  const tip = TIPS[a];
  const len = a === 1 ? 710 : 600;
  const d = (tip[0] - p[0]) * DIRS[a][0] + (tip[1] - p[1]) * DIRS[a][1];
  return 1 - Math.max(0, Math.min(1, d / len));
};

export const Footage: React.FC<{ filter?: string; clip?: string; style?: React.CSSProperties }> = ({
  filter,
  clip,
  style,
}) => (
  <AbsoluteFill style={style}>
    <OffthreadVideo
      src={FOOTAGE}
      muted
      style={{ width: AW, height: AH, filter, clipPath: clip }}
    />
  </AbsoluteFill>
);
