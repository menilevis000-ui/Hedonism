import tracking from "./tracking.json";
import art from "./art.json";

/**
 * Data for the "Arrows Alive" clip.
 * - tracking.json: for each arrow, one homography per source frame that maps
 *   first-frame pixel coords to that frame (made by scripts/track_arrows.py).
 * - art.json: arrow outlines, star positions and line-mask boxes, all in
 *   first-frame pixel coords.
 */

export type Pt = [number, number];
type Mat = number[]; // 3x3 row-major

export const AW = 1080;
export const AH = 1920;
export const FPS = 30;

/** Footage is slowed to 0.75x with motion interpolation. */
export const SLOW = 0.75;
export const SRC_FRAMES: number = tracking.n;
export const ARROWS_TOTAL = Math.floor((SRC_FRAMES - 1) / SLOW);

export const POLYS = art.polys as Pt[][];
export const STARS = art.stars as [number, number, number][][];
export const LINE_BOX = art.lineBox as [number, number, number, number][];

/** Arrow tips (first vertex of each outline) and which way each arrow points. */
export const TIPS: Pt[] = [POLYS[0][0], [1110, 520], POLYS[2][0]];
// Middle of the tail edge for each arrow.
const TAILS: Pt[] = [
  [765, 394],
  [402, 688],
  [765, 930],
];
export const DIRS: Pt[] = TIPS.map((tip, i) => {
  const dx = tip[0] - TAILS[i][0];
  const dy = tip[1] - TAILS[i][1];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
});
/** Points along each arrowhead's two outer edges, used as spark emitters. */
export const HEAD_EDGES: [Pt, Pt, Pt][] = [
  [POLYS[0][1], TIPS[0], POLYS[0][7]],
  [POLYS[1][2], TIPS[1], POLYS[1][4]],
  [POLYS[2][1], TIPS[2], POLYS[2][7]],
];

const Hs = tracking.H as Mat[][];

/** Homography of arrow `a` at output frame `f` (interpolated between source frames). */
export const homography = (a: number, f: number): Mat => {
  const s = Math.max(0, Math.min(f * SLOW, SRC_FRAMES - 1));
  const i = Math.floor(s);
  const j = Math.min(i + 1, SRC_FRAMES - 1);
  const k = s - i;
  return Hs[a][i].map((v, n) => v + (Hs[a][j][n] - v) * k);
};

export const apply = (h: Mat, p: Pt): Pt => {
  const w = h[6] * p[0] + h[7] * p[1] + h[8];
  return [(h[0] * p[0] + h[1] * p[1] + h[2]) / w, (h[3] * p[0] + h[4] * p[1] + h[5]) / w];
};

export const toMatrix3d = (h: Mat) =>
  `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,${h[8]})`;

export const centroid = (poly: Pt[]): Pt => {
  const x = poly.reduce((s, p) => s + p[0], 0) / poly.length;
  const y = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  return [x, y];
};

/**
 * Full silhouette of each arrow in the first frame, including the blue side faces,
 * so an arrow can be lifted out of the footage whole.
 */
export const SILS: Pt[][] = [
  [[185, 462], [375, 257], [417, 292], [417, 316], [762, 280], [794, 284], [794, 490], [765, 502], [410, 598], [408, 668], [340, 662]],
  [[405, 593], [835, 483], [835, 376], [1110, 520], [1110, 612], [872, 872], [853, 862], [850, 795], [400, 782]],
  [[125, 790], [400, 686], [402, 790], [805, 795], [831, 800], [752, 1075], [725, 1070], [300, 1056], [240, 1058]],
];

/** Constellation graph per arrow: each star joined to its two nearest neighbours. */
export const STAR_EDGES: [number, number][][] = STARS.map((stars) => {
  const edges = new Set<string>();
  stars.forEach((s, i) => {
    stars
      .map((o, j) => ({ j, d: Math.hypot(o[0] - s[0], o[1] - s[1]) }))
      .filter((o) => o.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2)
      .forEach((o) => edges.add([Math.min(i, o.j), Math.max(i, o.j)].join(",")));
  });
  return [...edges].map((e) => e.split(",").map(Number) as [number, number]);
});
