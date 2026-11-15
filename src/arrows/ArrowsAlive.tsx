import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  OffthreadVideo,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  ARROWS_TOTAL,
  AH,
  AW,
  DIRS,
  HEAD_EDGES,
  LINE_BOX,
  POLYS,
  Pt,
  STARS,
  TIPS,
  apply,
  centroid,
  homography,
  toMatrix3d,
} from "./data";
import { BEATS, DROP, FLICKERS, IGNITE } from "./timeline";

const FOOTAGE = staticFile("arrows/footage-slow.mp4");
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const COL = {
  pink: "#ff5ce1",
  violet: "#7b5cff",
  cyan: "#8ff7ff",
  white: "#ffffff",
};
const ORDER = [0, 1, 2]; // back to front: arrow 2 overlaps arrow 1

/* ------------------------------------------------------------------ state */

const ignite = (a: number, f: number) =>
  interpolate(f, [IGNITE[a], IGNITE[a] + 18], [0, 1], clamp);

/** Kicks hitting arrow `a` that are still animating at frame f. */
const kicksOf = (a: number, f: number, window = 40) =>
  BEATS.filter((b) => b.arrows.includes(a) && f >= b.f && f < b.f + window).map((b) => ({
    e: f - b.f,
    f: b.f,
    big: b.big,
  }));

/** How far the arrow jumps forward (px) on a kick. */
const punch = (a: number, f: number) =>
  kicksOf(a, f).reduce((s, k) => {
    const amp = k.big ? 46 : 24;
    return s + amp * Math.sin(Math.min(k.e / 2.5, 1) * (Math.PI / 2)) * Math.exp(-Math.max(k.e - 2.5, 0) / 5);
  }, 0);

/** Brightness flash from kicks and ignition. */
const flash = (a: number, f: number) => {
  const k = kicksOf(a, f).reduce((s, x) => s + Math.exp(-x.e / 5) * (x.big ? 1.6 : 1), 0);
  const ig = f >= IGNITE[a] ? Math.exp(-(f - IGNITE[a]) / 7) * 1.4 : 0;
  return k + ig;
};

const flickerOn = (f: number) => FLICKERS.some((x) => f >= x && f < x + 2);

/** Screen-space unit vector the arrow points in at frame f. */
const screenDir = (a: number, f: number): Pt => {
  const h = homography(a, f);
  const p1 = apply(h, TIPS[a]);
  const p0 = apply(h, [TIPS[a][0] - DIRS[a][0] * 200, TIPS[a][1] - DIRS[a][1] * 200]);
  const l = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  return [(p1[0] - p0[0]) / l, (p1[1] - p0[1]) / l];
};

const offset = (a: number, f: number): Pt => {
  const d = screenDir(a, f);
  const p = punch(a, f);
  return [d[0] * p, d[1] * p];
};

const screenPoly = (a: number, f: number, local: Pt[] = POLYS[a]) => {
  const h = homography(a, f);
  return local.map((p) => apply(h, p));
};

const svgPath = (pts: Pt[]) =>
  `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}Z`;

const clipPolygon = (pts: Pt[]) =>
  `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",")})`;

/** Position of a local point along the arrow, 0 = tail, 1 = tip. */
const along = (a: number, p: Pt) => {
  const tip = TIPS[a];
  const len = a === 1 ? 710 : 600;
  const d = (tip[0] - p[0]) * DIRS[a][0] + (tip[1] - p[1]) * DIRS[a][1];
  return 1 - Math.max(0, Math.min(1, d / len));
};

/* ---------------------------------------------------------------- footage */

const Footage: React.FC<{ filter?: string; clip?: string; style?: React.CSSProperties }> = ({
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

/** The real arrow, cut out of the footage, lit up and kicked forward on the beat. */
const ArrowCut: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const lit = ignite(a, f);
  const fl = flash(a, f);
  const [dx, dy] = offset(a, f);
  const dormant = flickerOn(f) && f < IGNITE[a] ? 0.25 : 0;
  const bright = interpolate(lit, [0, 1], [0.55, 1.08]) + dormant + fl * 0.35;
  const sat = interpolate(lit, [0, 1], [0.55, 1.35]);
  return (
    <Footage
      clip={clipPolygon(screenPoly(a, f))}
      filter={`brightness(${bright}) saturate(${sat}) contrast(1.05)`}
      style={{ transform: `translate(${dx}px, ${dy}px)` }}
    />
  );
};

/** Holographic copy of the arrow that shoots off in its direction after a kick. */
const ArrowEcho: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const ks = kicksOf(a, f, 22);
  if (ks.length === 0) return null;
  const k = ks[ks.length - 1];
  const d = screenDir(a, f);
  const dist = k.e * (k.big ? 44 : 30) + k.e * k.e * 1.2;
  const op = Math.pow(1 - k.e / 22, 1.6) * (k.big ? 0.75 : 0.55);
  const sc = 1 + k.e * 0.006;
  const c = apply(homography(a, f), centroid(POLYS[a]));
  return (
    <Footage
      clip={clipPolygon(screenPoly(a, f))}
      filter={`brightness(1.6) saturate(1.8) hue-rotate(${a === 1 ? -25 : 20}deg)`}
      style={{
        transform: `translate(${d[0] * dist}px, ${d[1] * dist}px) scale(${sc})`,
        transformOrigin: `${c[0]}px ${c[1]}px`,
        opacity: op,
        mixBlendMode: "screen",
      }}
    />
  );
};

/* ------------------------------------------------------ constellation lines */

const Lines: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const lit = ignite(a, f);
  if (lit <= 0) return null;
  const [x, y, w, h] = LINE_BOX[a];
  const [dx, dy] = offset(a, f);
  const fl = flash(a, f);
  const dir = a === 1 ? "to right" : "to left";
  const front = lit * 130;
  const live = f - IGNITE[a];
  // Two energy bands travelling from tail to tip, forever.
  const band = (shift: number) => ((live * 3.2 + shift) % 170) - 35;
  const b1 = band(0);
  const b2 = band(85);
  const breath = 0.55 + 0.15 * Math.sin(f * 0.18 + a * 2);
  const base = Math.min(1, breath + fl * 0.5);
  const bandCol = "rgba(170,250,255,1)";
  const background = [
    `linear-gradient(${dir}, transparent ${b1 - 10}%, ${bandCol} ${b1}%, transparent ${b1 + 10}%)`,
    `linear-gradient(${dir}, transparent ${b2 - 10}%, ${bandCol} ${b2}%, transparent ${b2 + 10}%)`,
    `linear-gradient(${dir}, rgba(255,235,255,${base}) ${front - 12}%, rgba(255,120,240,0) ${front}%)`,
  ].join(",");
  const glow = 6 + fl * 6;
  const mask = `url(${staticFile(`arrows/lines${a}.png`)})`;
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)`, mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: AW,
          height: AH,
          transformOrigin: "0 0",
          transform: toMatrix3d(homography(a, f)),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            filter: `drop-shadow(0 0 ${glow}px ${COL.pink}) drop-shadow(0 0 ${glow * 2.6}px ${COL.violet})`,
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
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------- stars, outlines, fx */

const Star: React.FC<{ x: number; y: number; r: number; k: number; seed: string }> = ({
  x,
  y,
  r,
  k,
  seed,
}) => {
  if (k <= 0.01) return null;
  const L = r * (5 + 9 * k);
  const rot = random(seed) * 30 - 15;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`} opacity={Math.min(1, k)}>
      <circle r={r * (2.4 + 2 * k)} fill="url(#starGlow)" />
      <line x1={-L} x2={L} y1={0} y2={0} stroke="url(#flareH)" strokeWidth={1.8} />
      <line x1={0} x2={0} y1={-L} y2={L} stroke="url(#flareV)" strokeWidth={1.8} />
      <circle r={Math.max(1.5, r * 0.55)} fill="#fff" />
    </g>
  );
};

const Stars: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {ORDER.map((a) => {
        const lit = ignite(a, f);
        if (lit <= 0) return null;
        const h = homography(a, f);
        const [dx, dy] = offset(a, f);
        const fl = flash(a, f);
        const live = f - IGNITE[a];
        return STARS[a].map((s, i) => {
          const t = along(a, [s[0], s[1]]);
          const on = Math.max(0, Math.min(1, (lit * 1.3 - t) * 5));
          const pop = Math.exp(-Math.max(0, lit * 1.3 - t) * 6) * on; // flare as the wipe passes
          const twinkle = 0.55 + 0.45 * Math.sin(f * (0.2 + random(`tw${a}${i}`) * 0.25) + random(`ph${a}${i}`) * 6.28);
          // energy bands passing over the star
          const bandHit = [0, 85]
            .map((sh) => {
              const pos = (((live * 3.2 + sh) % 170) - 35) / 100;
              return Math.exp(-Math.pow((t - pos) / 0.08, 2));
            })
            .reduce((m, v) => m + v, 0);
          const k = on * (0.45 + 0.35 * twinkle) + pop * 1.4 + fl * 0.5 + bandHit * 0.6;
          const p = apply(h, [s[0], s[1]]);
          return <Star key={`${a}-${i}`} x={p[0] + dx} y={p[1] + dy} r={s[2]} k={k} seed={`rot${a}${i}`} />;
        });
      })}
    </>
  );
};

/** Neon tube along each arrow's edge. */
const Outlines: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {ORDER.map((a) => {
        const lit = ignite(a, f);
        const fl = flash(a, f);
        const [dx, dy] = offset(a, f);
        const pts = screenPoly(a, f).map((p) => [p[0] + dx, p[1] + dy] as Pt);
        const d = svgPath(pts);
        const flick = f < IGNITE[a] ? (flickerOn(f) ? 0.7 : 0.04) : 0;
        const op = Math.min(1, flick + lit * (0.75 + fl * 0.4));
        const draw = f < IGNITE[a] ? 1 : lit;
        const tube = {
          pathLength: 1,
          strokeDasharray: "1 1",
          strokeDashoffset: 1 - draw,
          fill: "none",
          strokeLinejoin: "round" as const,
        };
        return (
          <g key={a} opacity={op}>
            <path d={d} fill="url(#fillGlow)" opacity={lit * (0.18 + fl * 0.3)} />
            <path d={d} {...tube} stroke={COL.violet} strokeWidth={26 + fl * 16} opacity={0.5} filter="url(#blurBig)" />
            <path d={d} {...tube} stroke={COL.pink} strokeWidth={10 + fl * 4} filter="url(#blurSmall)" />
            <path d={d} {...tube} stroke={COL.white} strokeWidth={3} />
          </g>
        );
      })}
    </>
  );
};

/** Outline echoes that ripple out in the arrow's direction on each kick. */
const Ripples: React.FC = () => {
  const f = useCurrentFrame();
  const out: React.ReactNode[] = [];
  ORDER.forEach((a) => {
    const c = centroid(POLYS[a]);
    kicksOf(a, f, 34).forEach((k) => {
      [0, 5, 10].forEach((delay, j) => {
        const e = k.e - delay;
        if (e < 0 || e > 24) return;
        const dist = e * (k.big ? 26 : 18) + 10;
        const sc = 1 + e * (k.big ? 0.02 : 0.01);
        const local = POLYS[a].map(
          (p) => [c[0] + (p[0] - c[0]) * sc + DIRS[a][0] * dist, c[1] + (p[1] - c[1]) * sc + DIRS[a][1] * dist] as Pt,
        );
        const op = Math.pow(1 - e / 24, 2) * (j === 0 ? 0.9 : 0.55);
        out.push(
          <path
            key={`${a}-${k.f}-${j}`}
            d={svgPath(screenPoly(a, f, local))}
            fill="none"
            stroke={j % 2 ? COL.pink : COL.cyan}
            strokeWidth={j === 0 ? 4 : 2.5}
            opacity={op}
            filter="url(#blurSmall)"
          />,
        );
      });
    });
  });
  return <>{out}</>;
};

/** Sparks thrown off the arrowheads: bursts on kicks plus a steady trickle. */
const Sparks: React.FC = () => {
  const f = useCurrentFrame();
  const out: React.ReactNode[] = [];
  const spark = (a: number, born: number, id: string, power: number) => {
    const e = f - born;
    const life = 16 + random(`${id}l`) * 14;
    if (e < 0 || e > life) return;
    const edge = HEAD_EDGES[a];
    const side = random(`${id}s`) < 0.5 ? 0 : 1;
    const t = Math.pow(random(`${id}t`), 0.6);
    const from = edge[side * 2];
    const local: Pt = [from[0] + (edge[1][0] - from[0]) * t, from[1] + (edge[1][1] - from[1]) * t];
    const p0 = apply(homography(a, born), local);
    const d = screenDir(a, born);
    const ang = (random(`${id}a`) - 0.5) * 1.1;
    const vx = (d[0] * Math.cos(ang) - d[1] * Math.sin(ang)) * (14 + random(`${id}v`) * 34) * power;
    const vy = (d[0] * Math.sin(ang) + d[1] * Math.cos(ang)) * (14 + random(`${id}v`) * 34) * power + 0;
    const decay = 0.93;
    const travel = (1 - Math.pow(decay, e)) / (1 - decay);
    const x = p0[0] + vx * travel;
    const y = p0[1] + vy * travel + e * e * 0.12;
    const sp = Math.pow(decay, e);
    const tail = 2.6;
    const op = 1 - e / life;
    const color = [COL.white, COL.cyan, COL.pink][Math.floor(random(`${id}c`) * 3)];
    out.push(
      <line
        key={id}
        x1={x}
        y1={y}
        x2={x - vx * sp * tail}
        y2={y - vy * sp * tail}
        stroke={color}
        strokeWidth={1.5 + 2.5 * op}
        strokeLinecap="round"
        opacity={op}
      />,
    );
  };
  ORDER.forEach((a) => {
    BEATS.filter((b) => b.arrows.includes(a) && f >= b.f && f < b.f + 32).forEach((b) => {
      const n = b.big ? 46 : 22;
      for (let i = 0; i < n; i++) spark(a, b.f, `k${a}-${b.f}-${i}`, b.big ? 1.5 : 1);
    });
    if (f >= IGNITE[a]) {
      for (let s = Math.max(IGNITE[a], f - 30); s <= f; s++) {
        spark(a, s, `amb${a}-${s}`, 0.55);
        if (s === IGNITE[a]) for (let i = 0; i < 26; i++) spark(a, s, `ig${a}-${i}`, 1.2);
      }
    }
  });
  return <>{out}</>;
};

/** Ring blasts on ignition and on the drop. */
const Shockwaves: React.FC = () => {
  const f = useCurrentFrame();
  const waves: { f: number; a: number; big: boolean }[] = [
    ...IGNITE.map((t, a) => ({ f: t, a, big: false })),
    ...[0, 1, 2].map((a) => ({ f: DROP, a, big: true })),
  ];
  return (
    <>
      {waves.map((w, i) => {
        const e = f - w.f;
        if (e < 0 || e > 26) return null;
        const c = apply(homography(w.a, f), centroid(POLYS[w.a]));
        const r = interpolate(e, [0, 26], [60, w.big ? 1100 : 650], {
          easing: (x) => 1 - Math.pow(1 - x, 3),
        });
        return (
          <ellipse
            key={i}
            cx={c[0]}
            cy={c[1]}
            rx={r}
            ry={r * 0.62}
            fill="none"
            stroke={i % 2 ? COL.pink : COL.cyan}
            strokeWidth={interpolate(e, [0, 26], [w.big ? 30 : 16, 1])}
            opacity={interpolate(e, [0, 26], [0.8, 0])}
            filter="url(#blurSmall)"
          />
        );
      })}
    </>
  );
};

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="starGlow">
      <stop offset="0%" stopColor="#fff" stopOpacity={1} />
      <stop offset="30%" stopColor={COL.pink} stopOpacity={0.55} />
      <stop offset="100%" stopColor={COL.violet} stopOpacity={0} />
    </radialGradient>
    <linearGradient id="flareH" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stopColor="#fff" stopOpacity={0} />
      <stop offset="50%" stopColor="#fff" stopOpacity={1} />
      <stop offset="100%" stopColor="#fff" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="flareV" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#fff" stopOpacity={0} />
      <stop offset="50%" stopColor="#fff" stopOpacity={1} />
      <stop offset="100%" stopColor="#fff" stopOpacity={0} />
    </linearGradient>
    <radialGradient id="fillGlow">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="60%" stopColor={COL.pink} />
      <stop offset="100%" stopColor={COL.violet} />
    </radialGradient>
    <filter id="blurSmall" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={4} />
    </filter>
    <filter id="blurBig" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={14} />
    </filter>
  </defs>
);

/** Light rays fanning out from behind the stack, from the build-up on. */
const Rays: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [170, DROP, DROP + 30, ARROWS_TOTAL], [0, 0.55, 0.28, 0.18], clamp);
  if (op <= 0) return null;
  const c = apply(homography(1, f), [600, 650]);
  return (
    <div
      style={{
        position: "absolute",
        left: c[0] - 1600,
        top: c[1] - 1600,
        width: 3200,
        height: 3200,
        borderRadius: "50%",
        opacity: op,
        mixBlendMode: "screen",
        transform: `rotate(${f * 0.35}deg)`,
        background: `repeating-conic-gradient(from 0deg, rgba(255,92,225,0.55) 0deg 3deg, transparent 3deg 11deg, rgba(143,247,255,0.4) 11deg 13deg, transparent 13deg 22deg)`,
        maskImage: "radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 30%, transparent 60%)",
        WebkitMaskImage: "radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 30%, transparent 60%)",
        filter: "blur(6px)",
      }}
    />
  );
};

/* ------------------------------------------------------------------- main */

export const ArrowsAlive: React.FC = () => {
  const f = useCurrentFrame();
  const anyLit = ignite(0, f);
  const worldBright = interpolate(anyLit, [0, 1], [0.42, 0.6]) + (flickerOn(f) && f < IGNITE[0] ? 0.08 : 0);
  const dropE = f - DROP;
  const dropFlash = dropE >= 0 ? Math.exp(-dropE / 3) : 0;
  const zoom =
    interpolate(f, [0, ARROWS_TOTAL], [1, 1.07]) +
    BEATS.filter((b) => f >= b.f && f < b.f + 20).reduce(
      (s, b) => s + (b.big ? 0.05 : 0.012) * Math.exp(-(f - b.f) / 4),
      0,
    );
  const fadeOut = interpolate(f, [ARROWS_TOTAL - 16, ARROWS_TOTAL - 1], [1, 0], clamp);
  const fadeIn = interpolate(f, [0, 6], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, opacity: fadeIn * fadeOut }}>
        <Footage filter={`brightness(${worldBright}) saturate(0.7) contrast(1.15)`} />
        <Rays />
        {ORDER.map((a) => (
          <ArrowCut key={a} a={a} />
        ))}
        {ORDER.map((a) => (
          <ArrowEcho key={a} a={a} />
        ))}
        {ORDER.map((a) => (
          <Lines key={a} a={a} />
        ))}
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <svg width={AW} height={AH} viewBox={`0 0 ${AW} ${AH}`}>
            <Defs />
            <Shockwaves />
            <Ripples />
            <Outlines />
            <Stars />
            <Sparks />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: dropFlash * 0.65, mixBlendMode: "screen" }} />
      <Html5Audio src={staticFile("arrows-soundtrack.wav")} />
    </AbsoluteFill>
  );
};
