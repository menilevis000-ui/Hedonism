import React from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import {
  ARROWS_TOTAL,
  AH,
  AW,
  LINE_BOX,
  POLYS,
  Pt,
  SILS,
  STARS,
  apply,
  centroid,
  homography,
  toMatrix3d,
} from "./data";
import { Footage, along, clamp, clipPolygon, screenPoly } from "./shared";

/**
 * Style 2, "Cosmos": the room opens into deep space through a portal. The arrows'
 * constellations draw themselves, then the arrows lift off and float apart, joined by
 * threads of light, and finally lock back together.
 * scripts/make_cosmos_soundtrack.py uses the same frame numbers.
 */

export const COSMOS = {
  wake: 6,
  portal: [18, 84] as const,
  draw: [28, 42, 56],
  lift: [84, 124] as const,
  bridges: 132,
  reunite: [200, 228] as const,
};

const COL = {
  deep: "#070214",
  violet: "#8a6bff",
  magenta: "#ff6ad5",
  teal: "#5fe8ff",
};
const ease = Easing.inOut(Easing.cubic);

/* ------------------------------------------------------------- state */

const drawn = (a: number, f: number) =>
  interpolate(f, [COSMOS.draw[a], COSMOS.draw[a] + 40], [0, 1], { ...clamp, easing: ease });

const liftAmt = (f: number) =>
  interpolate(f, [COSMOS.lift[0], COSMOS.lift[1], COSMOS.reunite[0], COSMOS.reunite[1]], [0, 1, 1, 0], {
    ...clamp,
    easing: ease,
  });

/** Energy pulse when the arrows lock back together. */
const lockPulse = (f: number) => {
  const e = f - COSMOS.reunite[1];
  return e >= 0 ? Math.exp(-e / 9) : 0;
};

const SEP: Pt[] = [
  [-12, -78],
  [30, 0],
  [-12, 78],
];
const PH = [0, 2.1, 4.2];

/** How each arrow floats: offset, rotation and pivot (screen space). */
const floatOf = (a: number, f: number) => {
  const l = liftAmt(f);
  const bobX = Math.sin(f * 0.05 + PH[a]) * 7;
  const bobY = Math.sin(f * 0.062 + PH[a]) * 16;
  const dx = l * (SEP[a][0] + bobX);
  const dy = l * (SEP[a][1] + bobY);
  const rot = l * Math.sin(f * 0.045 + PH[a]) * (a === 1 ? 0.7 : 1.8);
  const c = apply(homography(a, f), centroid(SILS[a]));
  return { dx, dy, rot, c };
};

const floatPoint = (a: number, f: number, p: Pt): Pt => {
  const { dx, dy, rot, c } = floatOf(a, f);
  const r = (rot * Math.PI) / 180;
  const x = p[0] - c[0];
  const y = p[1] - c[1];
  return [c[0] + x * Math.cos(r) - y * Math.sin(r) + dx, c[1] + x * Math.sin(r) + y * Math.cos(r) + dy];
};

/** Camera shift relative to the first frame, for parallax. */
const camShift = (f: number): Pt => {
  const c = centroid(POLYS[1]);
  const p = apply(homography(1, f), c);
  return [p[0] - c[0], p[1] - c[1]];
};

const portalRadius = (f: number) =>
  interpolate(f, [COSMOS.portal[0], COSMOS.portal[1]], [0, 2300], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });

const portalCenter = (f: number) => apply(homography(1, f), [560, 700]);

/* --------------------------------------------------------- background */

const FIELD = new Array(320).fill(0).map((_, i) => ({
  x: random(`sx${i}`) * 1400 - 160,
  y: random(`sy${i}`) * 2240 - 160,
  d: 0.15 + random(`sd${i}`) * 0.7,
  r: 0.6 + Math.pow(random(`sr${i}`), 3) * 2.6,
  w: 0.05 + random(`sw${i}`) * 0.12,
  ph: random(`sp${i}`) * 6.28,
  hue: random(`sh${i}`),
}));

const Starfield: React.FC = () => {
  const f = useCurrentFrame();
  const [cx, cy] = camShift(f);
  return (
    <svg width={AW} height={AH} style={{ position: "absolute" }}>
      {FIELD.map((s, i) => {
        const x = s.x + cx * s.d * 0.6 - f * 0.12 * s.d;
        const y = s.y + cy * s.d * 0.6 + f * 0.05 * s.d;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f * s.w + s.ph));
        const col = s.hue < 0.7 ? "#ffffff" : s.hue < 0.85 ? "#c9b8ff" : "#a8f3ff";
        return (
          <g key={i} opacity={tw}>
            <circle cx={x} cy={y} r={s.r} fill={col} />
            {s.r > 2 ? (
              <>
                <line x1={x - s.r * 6} x2={x + s.r * 6} y1={y} y2={y} stroke={col} strokeWidth={0.8} opacity={0.6} />
                <line x1={x} x2={x} y1={y - s.r * 6} y2={y + s.r * 6} stroke={col} strokeWidth={0.8} opacity={0.6} />
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

const NEBULA = [
  { x: 200, y: 520, s: 1500, c: "rgba(138,107,255,0.55)", sp: 0.004 },
  { x: 900, y: 900, s: 1300, c: "rgba(255,106,213,0.4)", sp: -0.005 },
  { x: 400, y: 1500, s: 1600, c: "rgba(95,232,255,0.22)", sp: 0.003 },
  { x: 950, y: 250, s: 1100, c: "rgba(90,60,200,0.5)", sp: -0.003 },
];

const Nebula: React.FC = () => {
  const f = useCurrentFrame();
  const [cx, cy] = camShift(f);
  return (
    <>
      {NEBULA.map((n, i) => {
        const x = n.x + Math.sin(f * n.sp * 4 + i) * 60 + cx * 0.25;
        const y = n.y + Math.cos(f * n.sp * 3 + i) * 50 + cy * 0.25;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - n.s / 2,
              top: y - n.s / 2,
              width: n.s,
              height: n.s * 0.75,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${n.c} 0%, transparent 65%)`,
              transform: `rotate(${f * n.sp * 40 + i * 40}deg)`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
};

const SHOOTING = [102, 150, 186, 246];

const ShootingStars: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={AW} height={AH} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="shoot" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity={0} />
          <stop offset="100%" stopColor="#fff" stopOpacity={1} />
        </linearGradient>
      </defs>
      {SHOOTING.map((s, i) => {
        const e = f - s;
        if (e < 0 || e > 20) return null;
        const x0 = 300 + random(`shx${i}`) * 900;
        const y0 = 100 + random(`shy${i}`) * 600;
        const ang = 2.4 + random(`sha${i}`) * 0.3;
        const dist = e * 55;
        const x = x0 + Math.cos(ang) * dist;
        const y = y0 + Math.sin(ang) * dist;
        const len = 260;
        const op = interpolate(e, [0, 4, 14, 20], [0, 1, 1, 0]);
        return (
          <g key={i} opacity={op} transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI + 180})`}>
            <rect x={0} y={-1.5} width={len} height={3} fill="url(#shoot)" transform="scale(-1 1)" />
            <circle r={3.5} fill="#fff" />
          </g>
        );
      })}
    </svg>
  );
};

const DUST = new Array(46).fill(0).map((_, i) => ({
  x: 80 + random(`dx${i}`) * 920,
  y: 300 + random(`dy${i}`) * 1100,
  r: 3 + random(`dr${i}`) * 12,
  v: 0.4 + random(`dv${i}`) * 1.2,
  ph: random(`dp${i}`) * 6.28,
}));

const Dust: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={AW} height={AH} style={{ position: "absolute", mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="bokeh">
          <stop offset="0%" stopColor="#ffd9f6" stopOpacity={0.9} />
          <stop offset="100%" stopColor={COL.violet} stopOpacity={0} />
        </radialGradient>
      </defs>
      {DUST.map((d, i) => {
        const y = ((d.y - f * d.v + 2000) % 1300) + 250;
        const x = d.x + Math.sin(f * 0.03 + d.ph) * 30;
        return <circle key={i} cx={x} cy={y} r={d.r} fill="url(#bokeh)" opacity={0.35 + 0.35 * Math.sin(f * 0.07 + d.ph)} />;
      })}
    </svg>
  );
};

/** Deep space, revealed through an expanding portal behind the arrows. */
const Space: React.FC = () => {
  const f = useCurrentFrame();
  const R = portalRadius(f);
  if (R <= 0) return null;
  const [px, py] = portalCenter(f);
  const mask = `radial-gradient(circle at ${px}px ${py}px, #000 ${Math.max(0, R - 120)}px, transparent ${R}px)`;
  const halo = 0.55 + 0.2 * Math.sin(f * 0.08) + lockPulse(f) * 0.6;
  return (
    <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, #1a0a3a 0%, ${COL.deep} 55%, #000 100%)` }} />
      <Nebula />
      <Starfield />
      <ShootingStars />
      <div
        style={{
          position: "absolute",
          left: px - 700,
          top: py - 600,
          width: 1400,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(170,120,255,${halo}) 0%, rgba(255,106,213,${halo * 0.35}) 30%, transparent 65%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

/** Glowing rim of the portal as it opens. */
const PortalRing: React.FC = () => {
  const f = useCurrentFrame();
  const R = portalRadius(f);
  if (R <= 0 || R >= 2300) return null;
  const [px, py] = portalCenter(f);
  return (
    <svg width={AW} height={AH} style={{ position: "absolute", mixBlendMode: "screen" }}>
      <defs>
        <filter id="ringBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={18} />
        </filter>
      </defs>
      <circle cx={px} cy={py} r={Math.max(0, R - 60)} fill="none" stroke={COL.magenta} strokeWidth={70} opacity={0.55} filter="url(#ringBlur)" />
      <circle cx={px} cy={py} r={Math.max(0, R - 60)} fill="none" stroke={COL.teal} strokeWidth={5} opacity={0.9} />
      <circle cx={px} cy={py} r={Math.max(0, R - 90)} fill="none" stroke="#fff" strokeWidth={2} opacity={0.6} />
    </svg>
  );
};

/* ------------------------------------------------------------- arrows */

const ArrowLines: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const d = drawn(a, f);
  if (d <= 0) return null;
  const [x, y, w, h] = LINE_BOX[a];
  const dir = a === 1 ? "to right" : "to left";
  const front = d * 125;
  const live = f - COSMOS.draw[a];
  const b = ((live * 1.6) % 160) - 30;
  const shimmer = 0.6 + 0.2 * Math.sin(f * 0.1 + a) + lockPulse(f) * 0.5;
  const background = [
    `linear-gradient(${dir}, transparent ${b - 14}%, rgba(200,250,255,0.9) ${b}%, transparent ${b + 14}%)`,
    `linear-gradient(${dir}, rgba(255,245,255,${Math.min(1, shimmer)}) ${front - 15}%, rgba(255,255,255,0) ${front}%)`,
  ].join(",");
  const mask = `url(${staticFile(`arrows/lines${a}.png`)})`;
  const g = 5 + lockPulse(f) * 10;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: AW,
        height: AH,
        transformOrigin: "0 0",
        transform: toMatrix3d(homography(a, f)),
        mixBlendMode: "screen",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          filter: `drop-shadow(0 0 ${g}px ${COL.teal}) drop-shadow(0 0 ${g * 3}px ${COL.violet})`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background,
            maskImage: mask,
            WebkitMaskImage: mask,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        />
      </div>
    </div>
  );
};

const ArrowStars: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const d = drawn(a, f);
  const wake = a === 0 ? interpolate(f, [COSMOS.wake, COSMOS.wake + 14], [0, 1], clamp) : 0;
  if (d <= 0 && wake <= 0) return null;
  const h = homography(a, f);
  return (
    <svg width={AW} height={AH} style={{ position: "absolute", mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id={`cstar${a}`}>
          <stop offset="0%" stopColor="#fff" />
          <stop offset="35%" stopColor={COL.teal} stopOpacity={0.5} />
          <stop offset="100%" stopColor={COL.violet} stopOpacity={0} />
        </radialGradient>
      </defs>
      {STARS[a].map((s, i) => {
        const t = along(a, [s[0], s[1]]);
        const on = Math.max(0, Math.min(1, (d * 1.25 - t) * 4));
        // the very first star wakes up on its own, before anything else moves
        const first = a === 0 && i === 0 ? wake : 0;
        const tw = 0.6 + 0.4 * Math.sin(f * (0.08 + random(`ct${a}${i}`) * 0.1) + random(`cp${a}${i}`) * 6.28);
        const k = Math.max(on * tw, first * 1.4) + lockPulse(f) * on;
        if (k <= 0.01) return null;
        const [x, y] = apply(h, [s[0], s[1]]);
        const L = Math.min(55, s[2] * (5 + 8 * Math.min(k, 1)));
        return (
          <g key={i} opacity={Math.min(1, k)}>
            <circle cx={x} cy={y} r={s[2] * (2.5 + 2 * k)} fill={`url(#cstar${a})`} />
            <line x1={x - L} x2={x + L} y1={y} y2={y} stroke="#fff" strokeWidth={1.2} opacity={0.7} />
            <line x1={x} x2={x} y1={y - L} y2={y + L} stroke="#fff" strokeWidth={1.2} opacity={0.7} />
            <circle cx={x} cy={y} r={Math.max(1.5, s[2] * 0.5)} fill="#fff" />
          </g>
        );
      })}
    </svg>
  );
};

/** One arrow lifted out of the footage with its lines and stars, floating as one piece. */
const FloatingArrow: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const { dx, dy, rot, c } = floatOf(a, f);
  const l = liftAmt(f);
  const d = drawn(a, f);
  const glow = 10 + l * 30 + lockPulse(f) * 40;
  const bright = 0.95 + d * 0.15 + lockPulse(f) * 0.3;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
        transformOrigin: `${c[0]}px ${c[1]}px`,
      }}
    >
      <Footage
        clip={clipPolygon(screenPoly(a, f, SILS[a]))}
        filter={`brightness(${bright}) saturate(${1.1 + d * 0.2})`}
        style={{
          filter: `drop-shadow(0 0 ${glow}px rgba(150,110,255,${0.25 + portalRadius(f) / 4000}))`,
        }}
      />
      <ArrowLines a={a} />
      <ArrowStars a={a} />
    </AbsoluteFill>
  );
};

/* --------------------------------------------------- constellation bridges */

/** The closest star pairs between neighbouring arrows. */
const BRIDGES: { a: number; i: number; b: number; j: number }[] = (() => {
  const out: { a: number; i: number; b: number; j: number }[] = [];
  const pairs: [number, number, number][] = [
    [0, 1, 3],
    [1, 2, 3],
    [0, 2, 2],
  ];
  pairs.forEach(([a, b, n]) => {
    const cands: { a: number; i: number; b: number; j: number; d: number }[] = [];
    STARS[a].forEach((s, i) =>
      STARS[b].forEach((o, j) => cands.push({ a, i, b, j, d: Math.hypot(s[0] - o[0], s[1] - o[1]) })),
    );
    cands.sort((x, y) => x.d - y.d);
    const used = new Set<string>();
    for (const c of cands) {
      if (out.filter((o) => o.a === a && o.b === b).length >= n) break;
      if (c.d < 90 || used.has(`a${c.i}`) || used.has(`b${c.j}`)) continue;
      used.add(`a${c.i}`);
      used.add(`b${c.j}`);
      out.push({ a: c.a, i: c.i, b: c.b, j: c.j });
    }
  });
  return out;
})();

const Bridges: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [COSMOS.reunite[0], COSMOS.reunite[0] + 20], [1, 0], clamp);
  return (
    <svg width={AW} height={AH} style={{ position: "absolute", mixBlendMode: "screen" }}>
      <defs>
        <filter id="bridgeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>
      {BRIDGES.map((br, n) => {
        const p = interpolate(f, [COSMOS.bridges + n * 6, COSMOS.bridges + n * 6 + 18], [0, 1], {
          ...clamp,
          easing: ease,
        });
        if (p <= 0 || fade <= 0) return null;
        const s1 = STARS[br.a][br.i];
        const s2 = STARS[br.b][br.j];
        const p1 = floatPoint(br.a, f, apply(homography(br.a, f), [s1[0], s1[1]]));
        const p2 = floatPoint(br.b, f, apply(homography(br.b, f), [s2[0], s2[1]]));
        const x = p1[0] + (p2[0] - p1[0]) * p;
        const y = p1[1] + (p2[1] - p1[1]) * p;
        const tw = 0.7 + 0.3 * Math.sin(f * 0.15 + n);
        return (
          <g key={n} opacity={fade * tw}>
            <line x1={p1[0]} y1={p1[1]} x2={x} y2={y} stroke={COL.teal} strokeWidth={6} filter="url(#bridgeGlow)" />
            <line x1={p1[0]} y1={p1[1]} x2={x} y2={y} stroke="#fff" strokeWidth={1.6} />
            <circle cx={x} cy={y} r={4} fill="#fff" />
          </g>
        );
      })}
    </svg>
  );
};

/** Soft ring when the arrows click back together. */
const LockRing: React.FC = () => {
  const f = useCurrentFrame();
  const e = f - COSMOS.reunite[1];
  if (e < 0 || e > 34) return null;
  const [px, py] = portalCenter(f);
  const r = interpolate(e, [0, 34], [200, 1300], { easing: Easing.out(Easing.cubic) });
  return (
    <svg width={AW} height={AH} style={{ position: "absolute", mixBlendMode: "screen" }}>
      <defs>
        <filter id="lockBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <ellipse cx={px} cy={py} rx={r} ry={r * 0.7} fill="none" stroke={COL.teal} strokeWidth={24} opacity={0.6 * (1 - e / 34)} filter="url(#lockBlur)" />
      <ellipse cx={px} cy={py} rx={r} ry={r * 0.7} fill="none" stroke="#fff" strokeWidth={2} opacity={1 - e / 34} />
    </svg>
  );
};

/* --------------------------------------------------------------- main */

export const ArrowsCosmos: React.FC = () => {
  const f = useCurrentFrame();
  const R = portalRadius(f);
  const roomDim = interpolate(R, [0, 1500], [0.85, 0.35], clamp);
  const zoom = interpolate(f, [0, ARROWS_TOTAL], [1, 1.08]) + lockPulse(f) * 0.02;
  const fade = interpolate(f, [0, 8, ARROWS_TOTAL - 16, ARROWS_TOTAL - 1], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, opacity: fade }}>
        <Footage filter={`brightness(${roomDim}) saturate(0.85)`} />
        <Space />
        <PortalRing />
        {[0, 1, 2].map((a) => (
          <FloatingArrow key={a} a={a} />
        ))}
        <Bridges />
        {R > 0 ? <Dust /> : null}
        <LockRing />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,0,0,0.7) 100%)" }}
      />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: lockPulse(f) * 0.15, mixBlendMode: "screen" }} />
      <Html5Audio src={staticFile("cosmos-soundtrack.wav")} />
    </AbsoluteFill>
  );
};
