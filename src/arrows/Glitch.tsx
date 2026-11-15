import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import {
  ARROWS_TOTAL,
  AH,
  AW,
  LINE_BOX,
  POLYS,
  Pt,
  SILS,
  STARS,
  STAR_EDGES,
  apply,
  homography,
  toMatrix3d,
} from "./data";
import { Footage, along, clamp, clipPolygon, screenDir, screenPoly, svgPath } from "./shared";
import { mono } from "../theme";

/**
 * Style 3, "Glitch": the arrows get picked up by a tracking HUD, scanned by a laser and
 * digitised. Then they glitch on the beat (slice tears, RGB split, stutter jumps) while
 * data packets race along their constellations toward each tip.
 * scripts/make_glitch_soundtrack.py uses the same frame numbers.
 */

export const GLITCH = {
  signal: 8,
  lock: [14, 22, 30],
  scan: [38, 80] as const,
  drop: 222,
};

const COL = {
  cyan: "#00f0ff",
  magenta: "#ff2bd6",
  lime: "#c6ff3a",
  white: "#f4f8ff",
};

type Hit = { f: number; arrows: number[]; big: boolean };
const HITS: Hit[] = (() => {
  const out: Hit[] = [];
  const pattern = [0, 1, 2, 1];
  let n = 0;
  for (let f = 84; f < 174; f += 15) out.push({ f, arrows: [pattern[n++ % 4]], big: false });
  n = 0;
  for (let f = 174; f < GLITCH.drop - 3; f += 6) out.push({ f, arrows: [n++ % 3], big: false });
  out.push({ f: GLITCH.drop, arrows: [0, 1, 2], big: true });
  for (let f = GLITCH.drop + 15; f < ARROWS_TOTAL - 18; f += 15) out.push({ f, arrows: [0, 1, 2], big: false });
  return out;
})();
export const GLITCH_HITS = HITS;

/** Frames where the whole picture tears. */
const TEARS = [GLITCH.signal, GLITCH.signal + 1, 81, 82, 129, 150, 151, 198, 210, 216, GLITCH.drop, GLITCH.drop + 1, GLITCH.drop + 2, GLITCH.drop + 4];

/* ------------------------------------------------------------- state */

const hitOf = (a: number, f: number, window = 10) => {
  const h = HITS.filter((x) => x.arrows.includes(a) && f >= x.f && f < x.f + window);
  return h.length ? { e: f - h[h.length - 1].f, big: h[h.length - 1].big, f: h[h.length - 1].f } : null;
};

const beamY = (f: number) =>
  interpolate(f, [GLITCH.scan[0], GLITCH.scan[1]], [-60, 1500], clamp);

const bbox = (pts: Pt[]) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
};

/** 0..1: how much of the arrow the scan beam has passed. */
const digitised = (a: number, f: number) => {
  const b = bbox(screenPoly(a, f, SILS[a]));
  return interpolate(beamY(f), [b.y0, b.y1], [0, 1], clamp);
};

/** Hard-stepped stutter jump on a hit (px along the arrow's direction). */
const stutter = (a: number, f: number) => {
  const h = hitOf(a, f);
  if (!h) return 0;
  const amp = h.big ? 60 : 34;
  if (h.e < 2) return amp;
  if (h.e < 4) return -amp * 0.35;
  if (h.e < 5) return amp * 0.5;
  return 0;
};

const stutterVec = (a: number, f: number): Pt => {
  const d = screenDir(a, f);
  const s = stutter(a, f);
  return [d[0] * s, d[1] * s];
};

/* ------------------------------------------------------- arrow layers */

/** Clean, full-colour arrow cut from the footage: revealed by the scan beam. */
const ArrowColor: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const by = beamY(f);
  if (by <= -60) return null;
  const [sx, sy] = stutterVec(a, f);
  const h = hitOf(a, f);
  const flash = h ? Math.exp(-h.e / 3) * (h.big ? 0.8 : 0.4) : 0;
  const scanning = f < GLITCH.scan[1];
  return (
    <AbsoluteFill style={{ clipPath: scanning ? `inset(0 0 ${Math.max(0, AH - by)}px 0)` : undefined }}>
      <Footage
        clip={clipPolygon(screenPoly(a, f, SILS[a]))}
        filter={`brightness(${1.05 + flash}) saturate(1.5) contrast(1.1)`}
        style={{ transform: `translate(${sx}px, ${sy}px)` }}
      />
    </AbsoluteFill>
  );
};

/** On a hit: the arrow tears into horizontal slices that slide in its direction. */
const ArrowSlices: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const h = hitOf(a, f, 8);
  if (!h) return null;
  const pts = screenPoly(a, f, SILS[a]);
  const b = bbox(pts);
  const n = 5;
  const d = screenDir(a, f);
  const decay = 1 - h.e / 8;
  const cuts = [0, ...new Array(n - 1).fill(0).map((_, i) => random(`cut${f}${a}${i}`)).sort(), 1];
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const top = b.y0 + (b.y1 - b.y0) * cuts[i];
        const bottom = b.y0 + (b.y1 - b.y0) * cuts[i + 1];
        const r = random(`sl${f}${a}${i}`);
        if (r < 0.3) return null;
        const ox = d[0] * (r * (h.big ? 130 : 80)) * decay + (random(`sj${f}${a}${i}`) - 0.5) * 30 * decay;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${top}px 0 ${AH - bottom}px 0)` }}>
            <Footage
              clip={clipPolygon(pts)}
              filter={`brightness(${1.2 + r * 0.5}) saturate(1.8) hue-rotate(${(r - 0.5) * 60}deg)`}
              style={{ transform: `translateX(${ox}px)` }}
            />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/** On a hit: red and cyan copies split apart. */
const ArrowRGB: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const h = hitOf(a, f, 9);
  if (!h) return null;
  const d = screenDir(a, f);
  const k = (1 - h.e / 9) * (h.big ? 26 : 14);
  const clip = clipPolygon(screenPoly(a, f, SILS[a]));
  return (
    <>
      <Footage
        clip={clip}
        filter="url(#onlyR)"
        style={{ transform: `translate(${d[0] * k}px, ${d[1] * k - 3}px)`, mixBlendMode: "screen", opacity: 0.8 }}
      />
      <Footage
        clip={clip}
        filter="url(#onlyGB)"
        style={{ transform: `translate(${-d[0] * k}px, ${-d[1] * k + 3}px)`, mixBlendMode: "screen", opacity: 0.8 }}
      />
    </>
  );
};

/** Perspective grid printed onto the arrow's face, plus its lines in cyan. */
const ArrowGrid: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const dg = digitised(a, f);
  if (dg <= 0) return null;
  const [sx, sy] = stutterVec(a, f);
  const h = hitOf(a, f);
  const flash = h ? Math.exp(-h.e / 3) : 0;
  const after = f >= GLITCH.drop ? 0.4 : 0;
  const gridOp = (0.28 + flash * 0.4 + after * 0.3) * dg;
  const poly = POLYS[a].map((p) => `${p[0]}px ${p[1]}px`).join(",");
  const [x, y, w, hh] = LINE_BOX[a];
  const mask = `url(${staticFile(`arrows/lines${a}.png`)})`;
  const scanning = f < GLITCH.scan[1];
  const sweep = ((f * 9) % 900) - 100; // highlight band sliding along the grid
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${sx}px, ${sy}px)`,
        clipPath: scanning ? `inset(0 0 ${Math.max(0, AH - beamY(f))}px 0)` : undefined,
        mixBlendMode: "screen",
      }}
    >
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
            inset: 0,
            clipPath: `polygon(${poly})`,
            opacity: gridOp,
            backgroundImage: [
              `linear-gradient(${a === 1 ? 90 : 270}deg, transparent ${sweep - 60}px, rgba(0,240,255,0.5) ${sweep}px, transparent ${sweep + 60}px)`,
              "repeating-linear-gradient(0deg, rgba(0,240,255,0.9) 0 2px, transparent 2px 34px)",
              "repeating-linear-gradient(90deg, rgba(0,240,255,0.9) 0 2px, transparent 2px 34px)",
            ].join(","),
          }}
        />
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: hh,
            background: f >= GLITCH.drop ? COL.white : COL.cyan,
            opacity: (0.55 + flash * 0.45) * dg,
            maskImage: mask,
            WebkitMaskImage: mask,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            filter: `drop-shadow(0 0 6px ${COL.cyan})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------- overlays */

/** Wireframe outline, vertex markers, data packets and block noise for every arrow. */
const Wireframe: React.FC = () => {
  const f = useCurrentFrame();
  const out: React.ReactNode[] = [];
  [0, 1, 2].forEach((a) => {
    const dg = digitised(a, f);
    if (dg <= 0) return;
    const [sx, sy] = stutterVec(a, f);
    const H = homography(a, f);
    const pts = screenPoly(a, f).map((p) => [p[0] + sx, p[1] + sy] as Pt);
    const h = hitOf(a, f);
    const flash = h ? Math.exp(-h.e / 3) : 0;
    out.push(
      <path
        key={`o${a}`}
        d={svgPath(pts)}
        fill="none"
        stroke={flash > 0.3 ? COL.white : COL.cyan}
        strokeWidth={2 + flash * 3}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - dg}
        filter="url(#gGlow)"
      />,
    );
    pts.forEach((p, i) =>
      out.push(<rect key={`v${a}${i}`} x={p[0] - 5} y={p[1] - 5} width={10} height={10} fill="none" stroke={COL.lime} strokeWidth={2} opacity={dg} />),
    );
    // data packets racing along the constellation toward the tip
    if (dg >= 1) {
      const per = f >= GLITCH.drop ? 2 : 1;
      STAR_EDGES[a].forEach(([i, j], n) => {
        const si = STARS[a][i];
        const sj = STARS[a][j];
        const forward = along(a, [si[0], si[1]]) <= along(a, [sj[0], sj[1]]);
        const from = forward ? si : sj;
        const to = forward ? sj : si;
        const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
        for (let k = 0; k < per; k++) {
          const speed = (f >= GLITCH.drop ? 14 : 8) + random(`pk${a}${n}`) * 6;
          const u = ((f * speed) / len + random(`ph${a}${n}${k}`) + k * 0.5) % 1;
          const tail = Math.max(0, u - 60 / len);
          const p = apply(H, [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u]);
          const q = apply(H, [from[0] + (to[0] - from[0]) * tail, from[1] + (to[1] - from[1]) * tail]);
          const col = (n + k) % 3 === 0 ? COL.magenta : COL.white;
          out.push(
            <g key={`p${a}-${n}-${k}`}>
              <line x1={q[0] + sx} y1={q[1] + sy} x2={p[0] + sx} y2={p[1] + sy} stroke={COL.cyan} strokeWidth={2} opacity={0.8} />
              <rect x={p[0] + sx - 4} y={p[1] + sy - 4} width={8} height={8} fill={col} filter="url(#gGlow)" />
            </g>,
          );
        }
      });
    }
    // block noise on hits
    if (h && h.e < 6) {
      const b = bbox(pts);
      for (let i = 0; i < (h.big ? 14 : 7); i++) {
        const w = 20 + random(`bw${f}${a}${i}`) * 140;
        out.push(
          <rect
            key={`b${a}${i}`}
            x={b.x0 + random(`bx${f}${a}${i}`) * (b.x1 - b.x0)}
            y={b.y0 + random(`by${f}${a}${i}`) * (b.y1 - b.y0)}
            width={w}
            height={4 + random(`bh${f}${a}${i}`) * 18}
            fill={[COL.cyan, COL.magenta, COL.white, COL.lime][i % 4]}
            opacity={0.85}
          />,
        );
      }
    }
  });
  return <>{out}</>;
};

/** Tracking brackets and readouts that lock onto each arrow. */
const Hud: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((a) => {
        const e = f - GLITCH.lock[a];
        if (e < 0) return null;
        const b = bbox(screenPoly(a, f, SILS[a]));
        const pad = interpolate(e, [0, 8], [140, 16], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
        const blink = e < 10 ? (Math.floor(e / 2) % 2 === 0 ? 1 : 0.25) : 1;
        const x0 = b.x0 - pad;
        const y0 = b.y0 - pad;
        const x1 = Math.min(b.x1 + pad, AW - 6);
        const y1 = b.y1 + pad;
        const L = 34;
        const col = f >= GLITCH.drop ? COL.lime : COL.cyan;
        const corners = [
          `M${x0},${y0 + L}V${y0}H${x0 + L}`,
          `M${x1 - L},${y0}H${x1}V${y0 + L}`,
          `M${x0},${y1 - L}V${y1}H${x0 + L}`,
          `M${x1 - L},${y1}H${x1}V${y1 - L}`,
        ];
        const cx = (b.x0 + b.x1) / 2;
        const cy = (b.y0 + b.y1) / 2;
        const conf = Math.min(99.9, 60 + e * 4 + random(`cf${f}${a}`) * 0.9);
        const status = f >= GLITCH.drop ? "ONLINE" : digitised(a, f) >= 1 ? "DIGITISED" : "LOCKED";
        const ly = AH - 440 + a * 62;
        return (
          <g key={a} opacity={blink}>
            {corners.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={col} strokeWidth={3} />
            ))}
            <line x1={cx - 12} x2={cx + 12} y1={cy} y2={cy} stroke={col} strokeWidth={1.5} opacity={0.7} />
            <line x1={cx} x2={cx} y1={cy - 12} y2={cy + 12} stroke={col} strokeWidth={1.5} opacity={0.7} />
            <rect x={x0} y={y0 - 30} width={52} height={28} fill={col} />
            <text x={x0 + 8} y={y0 - 9} fill="#001018" fontFamily={mono} fontSize={22}>
              {`0${a + 1}`}
            </text>
            <rect x={36} y={ly - 30} width={560} height={54} fill="rgba(0,10,20,0.6)" />
            <rect x={36} y={ly - 30} width={6} height={54} fill={col} />
            <text x={54} y={ly - 6} fill={col} fontFamily={mono} fontSize={24}>
              {`ARW_0${a + 1} ${a === 1 ? "▶ EAST" : "◀ WEST"} // ${status}`}
            </text>
            <text x={54} y={ly + 17} fill={COL.white} fontFamily={mono} fontSize={18} opacity={0.8}>
              {`X ${cx.toFixed(0).padStart(4, "0")} Y ${cy.toFixed(0).padStart(4, "0")}  CONF ${conf.toFixed(1)}%`}
            </text>
          </g>
        );
      })}
    </>
  );
};

/** The scan laser sweeping down the stack. */
const Beam: React.FC = () => {
  const f = useCurrentFrame();
  if (f < GLITCH.scan[0] || f > GLITCH.scan[1] + 2) return null;
  const y = beamY(f);
  return (
    <g>
      <rect x={0} y={y - 140} width={AW} height={140} fill="url(#beamTrail)" />
      <rect x={0} y={y - 3} width={AW} height={6} fill={COL.white} filter="url(#gGlow)" />
      <rect x={0} y={y - 12} width={AW} height={24} fill={COL.cyan} opacity={0.35} filter="url(#gGlowBig)" />
    </g>
  );
};

/** Corner readouts for the whole screen. */
const ScreenHud: React.FC = () => {
  const f = useCurrentFrame();
  if (f < GLITCH.signal) return null;
  const sec = (f / 30).toFixed(2).padStart(5, "0");
  const online = [0, 1, 2].filter((a) => (f >= GLITCH.drop ? true : digitised(a, f) >= 1)).length;
  const bars = Math.round(interpolate(f, [GLITCH.signal, GLITCH.drop], [0, 20], clamp));
  return (
    <g fontFamily={mono}>
      <text x={40} y={70} fill={COL.cyan} fontSize={26}>
        {"SCAN_SEQ // ARROW_STACK"}
      </text>
      <text x={40} y={102} fill={COL.white} fontSize={20} opacity={0.7}>
        {`T+${sec}  FRAME ${String(f).padStart(4, "0")}`}
      </text>
      <circle cx={AW - 150} cy={62} r={9} fill="#ff2a4a" opacity={Math.floor(f / 10) % 2 ? 1 : 0.3} />
      <text x={AW - 130} y={70} fill={COL.white} fontSize={24}>
        REC
      </text>
      <text x={40} y={AH - 120} fill={COL.cyan} fontSize={22}>
        {`SYNC ${"█".repeat(bars)}${"░".repeat(20 - bars)} ${Math.round((bars / 20) * 100)}%`}
      </text>
      <text x={40} y={AH - 84} fill={f >= GLITCH.drop ? COL.lime : COL.white} fontSize={30}>
        {`ARROWS ONLINE ${online}/3`}
      </text>
    </g>
  );
};

/** Full-frame horizontal tears. */
const Tear: React.FC = () => {
  const f = useCurrentFrame();
  if (!TEARS.includes(f)) return null;
  return (
    <>
      {new Array(6).fill(0).map((_, i) => {
        const y = random(`ty${f}${i}`) * AH;
        const hgt = 30 + random(`th${f}${i}`) * 160;
        const ox = (random(`tx${f}${i}`) - 0.5) * 220;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${y}px 0 ${Math.max(0, AH - y - hgt)}px 0)` }}>
            <Footage
              filter={`brightness(1.2) saturate(2) hue-rotate(${random(`thue${f}${i}`) * 180}deg)`}
              style={{ transform: `translateX(${ox}px)` }}
            />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

const Static: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, GLITCH.signal, GLITCH.signal + 3], [1, 1, 0.06], clamp);
  return (
    <AbsoluteFill style={{ opacity: op, mixBlendMode: f < GLITCH.signal ? "normal" : "screen", pointerEvents: "none" }}>
      <svg width={AW} height={AH}>
        <filter id="tv">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f} />
          <feColorMatrix values="0 0 0 0 0.8  0 0 0 0 0.9  0 0 0 0 1  0 0 0 1.6 -0.4" />
        </filter>
        <rect width={AW} height={AH} fill="#000" opacity={f < GLITCH.signal ? 1 : 0} />
        <rect width={AW} height={AH} filter="url(#tv)" />
      </svg>
    </AbsoluteFill>
  );
};

const Defs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="onlyR">
        <feColorMatrix values="1.4 0 0 0 0  0 0 0 0 0  0 0 0 0 0.05  0 0 0 1 0" />
      </filter>
      <filter id="onlyGB">
        <feColorMatrix values="0 0 0 0 0  0 1.2 0 0 0  0 0 1.4 0 0  0 0 0 1 0" />
      </filter>
    </defs>
  </svg>
);

/* --------------------------------------------------------------- main */

export const ArrowsGlitch: React.FC = () => {
  const f = useCurrentFrame();
  const dropE = f - GLITCH.drop;
  const invert = dropE >= 0 && dropE < 2;
  const zoom =
    interpolate(f, [0, ARROWS_TOTAL], [1.02, 1.08]) +
    HITS.filter((h) => f >= h.f && f < h.f + 6).reduce((s, h) => s + (h.big ? 0.04 : 0.01) * (1 - (f - h.f) / 6), 0);
  const shakeX = HITS.some((h) => h.big && f >= h.f && f < h.f + 8) ? (random(`shk${f}`) - 0.5) * 30 : 0;
  const fade = interpolate(f, [ARROWS_TOTAL - 14, ARROWS_TOTAL - 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Defs />
      <AbsoluteFill style={{ transform: `translateX(${shakeX}px) scale(${zoom})`, opacity: fade }}>
        <Footage filter="grayscale(0.9) brightness(0.45) contrast(1.35)" />
        <AbsoluteFill style={{ background: "rgba(0,60,90,0.35)", mixBlendMode: "color" }} />
        {[0, 1, 2].map((a) => (
          <ArrowColor key={a} a={a} />
        ))}
        {[0, 1, 2].map((a) => (
          <ArrowGrid key={a} a={a} />
        ))}
        {[0, 1, 2].map((a) => (
          <ArrowRGB key={a} a={a} />
        ))}
        {[0, 1, 2].map((a) => (
          <ArrowSlices key={a} a={a} />
        ))}
        <svg width={AW} height={AH} style={{ position: "absolute" }}>
          <defs>
            <filter id="gGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={3} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="gGlowBig" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={12} />
            </filter>
            <linearGradient id="beamTrail" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={COL.cyan} stopOpacity={0} />
              <stop offset="100%" stopColor={COL.cyan} stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Wireframe />
          <Beam />
          <Hud />
        </svg>
        <Tear />
      </AbsoluteFill>
      {/* scanlines */}
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 4px)",
          mixBlendMode: "multiply",
        }}
      />
      <svg width={AW} height={AH} style={{ position: "absolute", opacity: fade }}>
        <ScreenHud />
      </svg>
      <Static />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.7) 100%)" }}
      />
      {invert ? <AbsoluteFill style={{ backgroundColor: "#fff", mixBlendMode: "difference" }} /> : null}
      <Html5Audio src={staticFile("glitch-soundtrack.wav")} />
    </AbsoluteFill>
  );
};
