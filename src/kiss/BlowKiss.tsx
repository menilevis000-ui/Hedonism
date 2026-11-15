import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  Html5Audio,
  OffthreadVideo,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import tracking from "./tracking.json";

/**
 * "Blow Kiss": the illustrated woman on the panel closes her eye, puts on lipstick,
 * puckers up and blows a kiss that flies at the camera and lands on the lens.
 *
 * The footage is the 50fps phone clip played at 0.6x (one source frame per output
 * frame), then held on its last frame. The face is tracked with one homography per
 * frame (scripts/track_kiss.py) from the reference frame (the last one) to that frame;
 * all face drawing below is in reference-frame pixels.
 * scripts/make_kiss_soundtrack.py uses the same frame numbers.
 */

type Pt = [number, number];
const KW = 1080;
const KH = 1920;
const SRC_N: number = tracking.n;
export const KISS_TOTAL = 168;
export const KISS = {
  eyeClose: [22, 30] as const,
  lipstick: [22, 32] as const,
  pucker: [30, 46] as const,
  release: 56,
  stamp: 96,
  relax: [100, 116] as const,
  eyeOpen: [102, 110] as const,
  wink: [136, 144] as const,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const C = {
  ink: "#3a2148",
  lip1: "#ff5c93",
  lip2: "#d4145a",
  lip3: "#8e0b3d",
  pink: "#ff8fb8",
  white: "#fff6fa",
};

/* --------------------------------------------------------------- tracking */

const Hs = tracking.H as number[][];
const homography = (f: number) => Hs[Math.max(0, Math.min(Math.round(f), SRC_N - 1))];
const apply = (h: number[], p: Pt): Pt => {
  const w = h[6] * p[0] + h[7] * p[1] + h[8];
  return [(h[0] * p[0] + h[1] * p[1] + h[2]) / w, (h[3] * p[0] + h[4] * p[1] + h[5]) / w];
};
const toMatrix3d = (h: number[]) =>
  `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,${h[8]})`;
const clipPolygon = (pts: Pt[]) => `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",")})`;

// Face features in reference-frame pixels
const EYE_BOX: Pt[] = [[708, 1046], [792, 1046], [796, 1100], [708, 1100]];
const LIPS_BOX: Pt[] = [[792, 1228], [858, 1228], [862, 1322], [792, 1322]];
const LIPS_NEUTRAL: Pt[] = [
  [802, 1270], [858, 1240], [872, 1245], [878, 1258], [873, 1270],
  [866, 1278], [876, 1292], [877, 1302], [868, 1314], [852, 1314],
];
const LIPS_PUCKER: Pt[] = [
  [836, 1274], [866, 1236], [889, 1237], [905, 1252], [902, 1268],
  [897, 1276], [906, 1290], [901, 1307], [884, 1317], [860, 1314],
];
const MOUTH_NEUTRAL: [Pt, Pt] = [[820, 1278], [866, 1278]];
const MOUTH_PUCKER: [Pt, Pt] = [[854, 1276], [897, 1276]];
const LIPS_TIP: Pt = [905, 1272];

/* ------------------------------------------------------------------ state */

const eased = (f: number, r: readonly [number, number]) =>
  interpolate(f, r, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

const eyeClosed = (f: number) => {
  const close = eased(f, KISS.eyeClose) * (1 - eased(f, KISS.eyeOpen));
  const w = f - KISS.wink[0];
  const wink = w >= 0 && w < 8 ? Math.sin((w / 8) * Math.PI) : 0;
  return Math.max(close, wink > 0.35 ? 1 : 0);
};
const lipstick = (f: number) => eased(f, KISS.lipstick);
const pucker = (f: number) => eased(f, KISS.pucker) * (1 - eased(f, KISS.relax));

/** "Mwah": squeeze before the release, then a pop forward. */
const squeeze = (f: number) => {
  const pre = interpolate(f, [KISS.pucker[1], KISS.release], [0, 1], clamp);
  const e = f - KISS.release;
  if (e < 0) return { sx: 1 - pre * 0.06, sy: 1 - pre * 0.1, push: pre * 4 };
  const k = Math.exp(-e / 5);
  return { sx: 1 + 0.12 * k * Math.cos(e * 0.9), sy: 1 + 0.08 * k * Math.cos(e * 0.9), push: 10 * k };
};

/* -------------------------------------------------------------- drawing */

/** Smooth closed path through points (Catmull-Rom → cubic Bézier). */
const smoothPath = (pts: Pt[]) => {
  const n = pts.length;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
};
const lerpPts = (a: Pt[], b: Pt[], t: number) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t] as Pt);

const HEART = "M0,-6 C0,-14 -12,-16 -14,-8 C-16,0 -6,6 0,12 C6,6 16,0 14,-8 C12,-16 0,-14 0,-6 Z";

/** Lipstick print. Drawn in a 200x120 box centred on 0,0. */
const LipPrint: React.FC<{ id: string; rough?: boolean }> = ({ id, rough }) => (
  <g transform="translate(-100 -60)">
    <defs>
      <linearGradient id={`lp${id}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={C.lip1} />
        <stop offset="55%" stopColor={C.lip2} />
        <stop offset="100%" stopColor={C.lip3} />
      </linearGradient>
      <filter id={`ink${id}`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={rough ? 6 : 2} />
      </filter>
    </defs>
    <g filter={`url(#ink${id})`}>
      <path
        d="M8,62 C28,40 58,18 84,27 C93,30 97,37 100,40 C103,37 107,30 116,27 C142,18 172,40 192,62 C160,60 130,57 100,62 C70,57 40,60 8,62 Z"
        fill={`url(#lp${id})`}
      />
      <path
        d="M12,67 C40,66 70,64 100,68 C130,64 160,66 188,67 C172,96 136,114 100,114 C64,114 28,96 12,67 Z"
        fill={`url(#lp${id})`}
      />
      {/* lip creases */}
      {new Array(22).fill(0).map((_, i) => {
        const x = 22 + i * 7.3;
        const top = i % 2 === 0;
        return (
          <line
            key={i}
            x1={x}
            x2={x + (x - 100) * 0.06}
            y1={top ? 40 + Math.abs(x - 100) * 0.12 : 72}
            y2={top ? 58 : 98 - Math.abs(x - 100) * 0.18}
            stroke={C.lip3}
            strokeWidth={1.4}
            opacity={0.45}
          />
        );
      })}
      <ellipse cx={80} cy={84} rx={26} ry={7} fill="#fff" opacity={0.35} />
      <ellipse cx={70} cy={40} rx={12} ry={4} fill="#fff" opacity={0.3} transform="rotate(-18 70 40)" />
    </g>
  </g>
);

const Heart: React.FC<{ x: number; y: number; s: number; rot: number; op: number; col: string }> = ({
  x,
  y,
  s,
  rot,
  op,
  col,
}) => (
  <path
    d={HEART}
    transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`}
    fill={col}
    opacity={op}
  />
);

const Sparkle: React.FC<{ x: number; y: number; s: number; op: number }> = ({ x, y, s, op }) => (
  <path
    d="M0,-10 C1,-2 2,-1 10,0 C2,1 1,2 0,10 C-1,2 -2,1 -10,0 C-2,-1 -1,-2 0,-10 Z"
    transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})`}
    fill="#fff"
    opacity={op}
  />
);

/* ----------------------------------------------------------- face layers */

const Plate: React.FC<{ src: string; clip?: string; opacity?: number }> = ({ src, clip, opacity = 1 }) => {
  const f = useCurrentFrame();
  const video = <OffthreadVideo src={src} muted style={{ width: KW, height: KH, clipPath: clip }} />;
  return (
    <AbsoluteFill style={{ opacity }}>
      {f >= SRC_N - 1 ? <Freeze frame={SRC_N - 1}>{video}</Freeze> : video}
    </AbsoluteFill>
  );
};

/** Animated eye, blush and lips, drawn on the panel's plane. */
const Face: React.FC = () => {
  const f = useCurrentFrame();
  const h = homography(f);
  const ls = lipstick(f);
  const pk = pucker(f);
  const sq = squeeze(f);
  const lips = lerpPts(LIPS_NEUTRAL, LIPS_PUCKER, pk);
  const cx = 870;
  const cy = 1276;
  const mouth = [0, 1].map((i) => [
    MOUTH_NEUTRAL[i][0] + (MOUTH_PUCKER[i][0] - MOUTH_NEUTRAL[i][0]) * pk,
    MOUTH_NEUTRAL[i][1] + (MOUTH_PUCKER[i][1] - MOUTH_NEUTRAL[i][1]) * pk,
  ]);
  const ec = eyeClosed(f);
  const blush = Math.max(eased(f, [26, 40]) * (1 - eased(f, [140, 160])) * 0.9, 0);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: KW, height: KH, transformOrigin: "0 0", transform: toMatrix3d(h) }}>
      <svg width={KW} height={KH}>
        <defs>
          <radialGradient id="blush">
            <stop offset="0%" stopColor="#ff4f8b" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#ff4f8b" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="lipFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={C.lip1} />
            <stop offset="60%" stopColor={C.lip2} />
            <stop offset="100%" stopColor={C.lip3} />
          </linearGradient>
        </defs>
        {/* blush + little cartoon blush strokes */}
        <g opacity={blush}>
          <ellipse cx={742} cy={1160} rx={62} ry={34} fill="url(#blush)" />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={718 + i * 16} y1={1172} x2={728 + i * 16} y2={1152} stroke="#ff3d7f" strokeWidth={3} strokeLinecap="round" opacity={0.75} />
          ))}
        </g>
        {/* closed, happy eye with lashes */}
        <g opacity={ec} stroke={C.ink} strokeWidth={3.6} strokeLinecap="round" fill="none">
          <path d="M716,1066 Q752,1090 790,1060" />
          <line x1={736} y1={1078} x2={731} y2={1090} />
          <line x1={754} y1={1081} x2={753} y2={1094} />
          <line x1={772} y1={1076} x2={776} y2={1088} />
        </g>
        {/* lips */}
        <g
          opacity={ls}
          transform={`translate(${sq.push * pk} 0) translate(${cx} ${cy}) scale(${1 + (sq.sx - 1) * pk} ${1 + (sq.sy - 1) * pk}) translate(${-cx} ${-cy})`}
        >
          <path d={smoothPath(lips)} fill="url(#lipFill)" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
          <line x1={mouth[0][0]} y1={mouth[0][1]} x2={mouth[1][0]} y2={mouth[1][1]} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
          <ellipse cx={lips[7][0] - 14} cy={lips[7][1] - 5} rx={9 - pk * 2} ry={3.2} fill="#fff" opacity={0.55} />
          <ellipse cx={lips[2][0] - 8} cy={lips[2][1] + 7} rx={6} ry={2.2} fill="#fff" opacity={0.4} />
        </g>
      </svg>
    </div>
  );
};

/* ----------------------------------------------------------- screen FX */

/** Screen position of the lips at frame f. */
const lipsScreen = (f: number) => apply(homography(f), LIPS_TIP);

/** Where the flying kiss is at time t (0..1 of the flight). */
const STAMP_AT: Pt = [560, 700];
const flight = (t: number) => {
  const s0 = lipsScreen(KISS.release);
  const p = Easing.inOut(Easing.quad)(t);
  const c: Pt = [s0[0] + 260, s0[1] - 420];
  const x = (1 - p) * (1 - p) * s0[0] + 2 * (1 - p) * p * c[0] + p * p * STAMP_AT[0];
  const y = (1 - p) * (1 - p) * s0[1] + 2 * (1 - p) * p * c[1] + p * p * STAMP_AT[1];
  const scale = 0.12 * Math.pow(1 / 0.12, Math.pow(t, 1.5)) * 3.6; // grows as it comes at the camera
  const rot = -28 + 22 * t + Math.sin(t * 14) * 7 * (1 - t);
  return { x, y, scale, rot };
};

const FX: React.FC = () => {
  const f = useCurrentFrame();
  const out: React.ReactNode[] = [];
  const lp = lipsScreen(f);
  // little hearts drifting up while she puckers
  for (let i = 0; i < 6; i++) {
    const born = 36 + i * 4;
    const e = f - born;
    if (e < 0 || e > 34) continue;
    out.push(
      <Heart
        key={`u${i}`}
        x={lp[0] + 20 + e * 1.8 + Math.sin(e * 0.3 + i) * 8}
        y={lp[1] - 30 - e * 4.5}
        s={0.9 + random(`us${i}`) * 0.8}
        rot={Math.sin(e * 0.2 + i) * 15}
        op={interpolate(e, [0, 6, 24, 34], [0, 1, 1, 0])}
        col={i % 2 ? C.pink : "#ff3d7f"}
      />,
    );
  }
  // "mwah" puff lines on release
  const re = f - KISS.release;
  if (re >= 0 && re < 14) {
    const s0 = lipsScreen(KISS.release);
    [-1, 0, 1].forEach((k) => {
      const ang = k * 0.45;
      const r0 = 26 + re * 7;
      const r1 = r0 + 22;
      out.push(
        <line
          key={`puff${k}`}
          x1={s0[0] + Math.cos(ang) * r0}
          y1={s0[1] + Math.sin(ang) * r0}
          x2={s0[0] + Math.cos(ang) * r1}
          y2={s0[1] + Math.sin(ang) * r1}
          stroke="#fff"
          strokeWidth={5}
          strokeLinecap="round"
          opacity={1 - re / 14}
        />,
      );
    });
  }
  // burst of hearts on release
  for (let i = 0; i < 10; i++) {
    if (re < 0 || re > 26) break;
    const s0 = lipsScreen(KISS.release);
    const a = -1.2 + random(`ra${i}`) * 2.0;
    const v = 6 + random(`rv${i}`) * 8;
    const d = v * re * Math.exp(-re / 18);
    out.push(
      <Heart
        key={`r${i}`}
        x={s0[0] + Math.cos(a) * d}
        y={s0[1] + Math.sin(a) * d - re * 1.5}
        s={0.8 + random(`rs${i}`) * 1.0}
        rot={(random(`rr${i}`) - 0.5) * 60}
        op={1 - re / 26}
        col={[C.pink, "#ff3d7f", C.white][i % 3]}
      />,
    );
  }
  // the kiss flying at the camera, with a ghost trail and sparkles
  const ft = (f - KISS.release) / (KISS.stamp - KISS.release);
  if (ft >= 0 && ft < 1) {
    for (let g = 4; g >= 0; g--) {
      const t = Math.max(0, ft - g * 0.025);
      const k = flight(t);
      out.push(
        <g key={`k${g}`} transform={`translate(${k.x} ${k.y}) rotate(${k.rot}) scale(${k.scale})`} opacity={g === 0 ? 1 : 0.22 / g}>
          <LipPrint id={`fly${g}`} />
        </g>,
      );
    }
    for (let i = 0; i < 14; i++) {
      const t = ft - i * 0.035;
      if (t < 0) continue;
      const k = flight(t);
      out.push(
        <Sparkle
          key={`ks${i}`}
          x={k.x + (random(`kx${i}`) - 0.5) * 80 * k.scale}
          y={k.y + (random(`ky${i}`) - 0.5) * 60 * k.scale}
          s={0.5 + k.scale * 0.6}
          op={1 - i / 14}
        />,
      );
    }
  }
  return <>{out}</>;
};

/** The kiss landing on the lens. */
const Stamp: React.FC = () => {
  const f = useCurrentFrame();
  const e = f - KISS.stamp;
  if (e < 0) return null;
  const k = flight(1);
  const bounce = 1 + 0.14 * Math.exp(-e / 4) * Math.cos(e * 0.9);
  const squash = 1 - 0.1 * Math.exp(-e / 4) * Math.cos(e * 0.9);
  const glow = Math.exp(-e / 10);
  return (
    <svg width={KW} height={KH} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="stampGlow">
          <stop offset="0%" stopColor="#ff7fb0" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#ff7fb0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={k.x} cy={k.y} rx={520} ry={360} fill="url(#stampGlow)" opacity={0.4 + glow * 0.6} />
      <g transform={`translate(${k.x} ${k.y}) rotate(${k.rot}) scale(${k.scale * bounce} ${k.scale * squash})`} opacity={0.9}>
        <LipPrint id="stamp" rough />
      </g>
      {/* ring of hearts and sparkles blasting out */}
      {new Array(18).fill(0).map((_, i) => {
        if (e > 40) return null;
        const a = (i / 18) * Math.PI * 2 + random(`ha${i}`) * 0.3;
        const d = (180 + random(`hd${i}`) * 140) * (1 - Math.exp(-e / 7)) + 120;
        return (
          <Heart
            key={i}
            x={k.x + Math.cos(a) * d * 1.2}
            y={k.y + Math.sin(a) * d - e * 1.5}
            s={2 + random(`hs${i}`) * 2.2}
            rot={(random(`hr${i}`) - 0.5) * 50 + e * 2}
            op={interpolate(e, [0, 3, 28, 40], [0, 1, 1, 0])}
            col={[C.pink, "#ff3d7f", C.white][i % 3]}
          />
        );
      })}
      {new Array(12).fill(0).map((_, i) => {
        const a = random(`sa${i}`) * Math.PI * 2;
        const d = 260 + random(`sd${i}`) * 260;
        const tw = Math.max(0, Math.sin((e - i * 2) * 0.25));
        return <Sparkle key={`s${i}`} x={k.x + Math.cos(a) * d} y={k.y + Math.sin(a) * d * 0.8} s={1.2 + random(`ss${i}`) * 1.6} op={tw} />;
      })}
      {/* hearts floating up while we hold */}
      {new Array(10).fill(0).map((_, i) => {
        const born = 20 + i * 5;
        const he = e - born;
        if (he < 0 || he > 50) return null;
        return (
          <Heart
            key={`f${i}`}
            x={80 + random(`fx${i}`) * 920 + Math.sin(he * 0.12 + i) * 20}
            y={1750 - he * 14}
            s={1.4 + random(`fs${i}`) * 1.6}
            rot={Math.sin(he * 0.1 + i) * 20}
            op={interpolate(he, [0, 8, 38, 50], [0, 0.9, 0.9, 0])}
            col={i % 2 ? C.pink : C.white}
          />
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ main */

export const BlowKiss: React.FC = () => {
  const f = useCurrentFrame();
  const h = homography(f);
  const eyeClip = clipPolygon(EYE_BOX.map((p) => apply(h, p)));
  const lipsClip = clipPolygon(LIPS_BOX.map((p) => apply(h, p)));
  const ec = eyeClosed(f);
  const se = f - KISS.stamp;
  const shake = se >= 0 && se < 10 ? (random(`sh${f}`) - 0.5) * 16 * (1 - se / 10) : 0;
  const hold = interpolate(f, [SRC_N - 1, KISS_TOTAL], [1, 1.06], clamp);
  const flash = se >= 0 ? Math.exp(-se / 3) * 0.45 : 0;
  const fade = interpolate(f, [0, 5, KISS_TOTAL - 12, KISS_TOTAL - 1], [0, 1, 1, 0], clamp);
  // the face pivot for the hold zoom: the lips
  const lp = apply(h, LIPS_TIP);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity: fade, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${hold})`, transformOrigin: `${lp[0]}px ${lp[1]}px` }}>
          <Plate src={staticFile("kiss/footage.mp4")} />
          <Plate src={staticFile("kiss/clean30.mp4")} clip={eyeClip} opacity={ec} />
          <Plate src={staticFile("kiss/clean30.mp4")} clip={lipsClip} opacity={lipstick(f)} />
          <Face />
          <svg width={KW} height={KH} style={{ position: "absolute" }}>
            <FX />
          </svg>
        </AbsoluteFill>
        <Stamp />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#ff8fb8", opacity: flash, mixBlendMode: "screen" }} />
      <Html5Audio src={staticFile("kiss-soundtrack.wav")} />
    </AbsoluteFill>
  );
};
