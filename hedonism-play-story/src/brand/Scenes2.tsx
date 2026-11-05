import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Glyph, PlayLockup, PlayMark } from "./Logos";
import {
  BLUE, FONT, INK, LIME, ORANGE, PINK, TEAL, backOut, easeIn, easeInOut, easeOut, mix, prog,
} from "./theme";

const center: React.CSSProperties = { justifyContent: "center", alignItems: "center" };
const TILE_COLORS = [PINK, ORANGE, BLUE, LIME];

/* Text with brand-colour echo layers that converge onto the main fill */
const Echo: React.FC<{ text: string; p: number; color?: string; style: React.CSSProperties; spread?: number }> = ({
  text, p, color = "#fff", style, spread = 40,
}) => {
  const off = (1 - p) * spread + 3;
  const dirs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  return (
    <div style={{ position: "relative", ...style }}>
      {TILE_COLORS.map((c, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, color: c, opacity: 0.85 * (1 - p * 0.55), mixBlendMode: "screen", transform: `translate(${dirs[i][0] * off}px, ${dirs[i][1] * off * 0.6}px)` }}>{text}</div>
      ))}
      <div style={{ position: "relative", color }}>{text}</div>
    </div>
  );
};

/* ───────────── A · The brand cube ───────────── */
export const SceneCube: React.FC = () => {
  const f = useCurrentFrame();
  const S = 360;
  const arrive = prog(f, 0, 50, easeOut);
  const out = prog(f, 64, 22, easeIn);
  const ry = mix(-200, 30, arrive) + f * 1.2 + out * 260;
  const rx = mix(60, -22, arrive) + Math.sin(f / 18) * 6;
  const z = mix(-2400, 0, arrive) + out * 900;
  const faces: { bg: string; t: string; k?: number; play?: boolean }[] = [
    { bg: PINK, t: `translateZ(${S / 2}px)`, k: 0 },
    { bg: ORANGE, t: `rotateY(90deg) translateZ(${S / 2}px)`, k: 1 },
    { bg: BLUE, t: `rotateY(180deg) translateZ(${S / 2}px)`, k: 2 },
    { bg: LIME, t: `rotateY(-90deg) translateZ(${S / 2}px)`, k: 3 },
    { bg: TEAL, t: `rotateX(90deg) translateZ(${S / 2}px)`, play: true },
    { bg: INK, t: `rotateX(-90deg) translateZ(${S / 2}px)` },
  ];
  const txt = prog(f, 26, 24) * (1 - prog(f, 62, 14, easeIn));
  return (
    <AbsoluteFill style={{ ...center, perspective: 1500 }}>
      {/* floor reflection glow */}
      <div style={{ position: "absolute", top: 1180, width: 700, height: 160, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(23,211,196,0.35), transparent 70%)", filter: "blur(10px)", opacity: arrive * (1 - out) }} />
      <div style={{ width: S, height: S, position: "relative", transformStyle: "preserve-3d", transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`, opacity: 1 - out }}>
        {faces.map((fc, i) => (
          <div key={i} style={{ position: "absolute", width: S, height: S, background: fc.bg, transform: fc.t, backfaceVisibility: "hidden", boxShadow: "inset 0 0 80px rgba(0,0,0,0.18)" }}>
            {fc.k !== undefined && (
              <svg viewBox="0 0 100 100" width={S} height={S}><Glyph k={fc.k} bg={fc.bg} p={1} /></svg>
            )}
            {fc.play && <PlayMark size={S} start={-999} />}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1330, fontFamily: FONT, fontWeight: 500, fontSize: 30, letterSpacing: `${mix(0.2, 0.6, prog(f, 20, 60))}em`, color: "#fff", opacity: txt * 0.85 }}>
        SOMETHING NEW IS COMING
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── B · HEDONISM group burst ───────────── */
export const SceneGroupBurst: React.FC = () => {
  const f = useCurrentFrame();
  const c = 150;
  const exit = prog(f, 74, 16, easeIn);
  const flash = interpolate(f, [0, 3, 16], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spin = mix(-8, 0, prog(f, 0, 60));
  return (
    <AbsoluteFill style={{ ...center, perspective: 1400 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `rotateY(${spin}deg) scale(${mix(1, 0.7, exit)})`, opacity: 1 - exit, filter: `blur(${exit * 12}px)` }}>
        <div style={{ width: c * 2, height: c * 2, position: "relative", transformStyle: "preserve-3d" }}>
          {TILE_COLORS.map((bg, i) => {
            const p = prog(f, i * 3, 30, backOut);
            const dx = (i % 2 ? 1 : -1) * 260, dy = (i < 2 ? -1 : 1) * 260;
            return (
              <div key={i} style={{
                position: "absolute", left: (i % 2) * c, top: Math.floor(i / 2) * c, width: c, height: c, background: bg,
                transform: `translate(${mix(dx * 1.4, 0, p)}px, ${mix(dy * 1.4, 0, p)}px) rotateX(${mix(180, 0, p)}deg) rotateZ(${mix(i * 90 - 135, 0, p)}deg)`,
                boxShadow: `0 0 60px ${bg}66`,
              }}>
                <svg viewBox="0 0 100 100" width={c} height={c} style={{ overflow: "visible" }}><Glyph k={i} bg={bg} p={prog(f, 16 + i * 3, 18, backOut)} /></svg>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 60, fontFamily: FONT, color: "#fff", textAlign: "center", lineHeight: 0.95 }}>
          <div style={{ overflow: "hidden" }}><div style={{ fontWeight: 300, fontSize: 104, letterSpacing: `${mix(0.4, 0, prog(f, 18, 40))}em`, opacity: prog(f, 18, 20) }}>HEDONISM</div></div>
          <div style={{ overflow: "hidden", paddingBottom: "0.12em" }}><div style={{ fontWeight: 800, fontSize: 124, letterSpacing: "-0.03em", transform: `translateY(${mix(110, 0, prog(f, 26, 26))}%)` }}>group</div></div>
          <div style={{ fontWeight: 500, fontSize: 36, marginTop: 18, color: "rgba(255,255,255,0.7)", opacity: prog(f, 38, 20), transform: `translateY(${mix(20, 0, prog(f, 38, 20))}px)` }}>Unlimited design</div>
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ───────────── C · GET READY TO PLAY. — rapid kinetic cuts ───────────── */
export const SceneKinetic: React.FC = () => {
  const f = useCurrentFrame();
  const words: { w: string; at: number; len: number; size: number; color?: string }[] = [
    { w: "GET", at: 0, len: 12, size: 300 },
    { w: "READY", at: 12, len: 12, size: 230 },
    { w: "TO", at: 24, len: 10, size: 340 },
    { w: "PLAY.", at: 34, len: 40, size: 250, color: TEAL },
  ];
  return (
    <AbsoluteFill style={{ ...center }}>
      {words.map(({ w, at, len, size, color }) => {
        const local = f - at;
        if (local < 0 || local >= len) return null;
        const p = prog(local, 0, 9, easeOut);
        const drift = mix(1.25, 1, p) * mix(1, 1.06, local / len);
        return (
          <div key={w} style={{ position: "absolute", transform: `scale(${drift}) rotate(${mix(-6, 0, p)}deg)` }}>
            <Echo text={w} p={p} color={color} spread={70} style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────── D · teal flood + white logo card ───────────── */
export const SceneFlood: React.FC = () => {
  const f = useCurrentFrame();
  const r = mix(0, 1250, prog(f, 0, 22, easeInOut));
  const close = prog(f, 152, 22, easeInOut);
  const card = prog(f, 14, 36, easeOut);
  const cardExit = prog(f, 94, 18, easeIn);
  const tilt = mix(50, 0, card);
  const sway = Math.sin(f / 20) * 4;
  const shine = interpolate(f, [62, 86], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${mix(r, 0, close)}px at 50% 50%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #3fe6d8 0%, ${TEAL} 45%, #0d9d92 100%)` }} />
      {/* concentric pulse rings */}
      <AbsoluteFill style={{ ...center }}>
        {[0, 1, 2, 3].map((i) => {
          const t = ((f + i * 22) % 88) / 88;
          return <div key={i} style={{ position: "absolute", width: 300 + t * 1500, height: 300 + t * 1500, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", opacity: (1 - t) * prog(f, 10, 20) }} />;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ ...center, perspective: 1300 }}>
        <div style={{
          background: "#fff", borderRadius: 48, padding: "70px 60px", boxShadow: "0 60px 120px rgba(0,60,55,0.35)",
          transform: `translateY(${mix(500, 0, card) - cardExit * 80}px) rotateX(${tilt}deg) rotateY(${sway}deg) scale(${mix(0.9, 1, card) * mix(1, 0.85, cardExit)})`,
          opacity: Math.min(1, card * 2) * (1 - cardExit), filter: `blur(${cardExit * 10}px)`,
        }}>
          <PlayLockup start={18} scale={0.95} shine={shine} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── E · tagline on teal ───────────── */
export const SceneTaglineTeal: React.FC = () => {
  const f = useCurrentFrame();
  const exit = prog(f, 50, 14, easeIn);
  const line = (text: string, i: number, st: React.CSSProperties) => {
    const p = prog(f, i * 6, 24, easeOut);
    const dir = i % 2 ? 1 : -1;
    return (
      <div style={{ transform: `translateX(${mix(dir * 700, 0, p) + exit * -dir * 200}px) skewX(${mix(dir * -20, 0, p)}deg)`, opacity: Math.min(1, p * 1.5) * (1 - exit), filter: `blur(${(1 - p) * 10 + exit * 10}px)`, ...st }}>
        {text}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ ...center, flexDirection: "column", fontFamily: FONT, color: "#fff", textAlign: "center", lineHeight: 1.02, transform: `scale(${mix(1, 1.06, prog(f, 0, 76, easeInOut))})` }}>
      {line("When", 0, { fontSize: 120, fontWeight: 400 })}
      {line("design", 1, { fontSize: 170, fontWeight: 900, letterSpacing: "-0.03em" })}
      {line("meets", 2, { fontSize: 120, fontWeight: 400 })}
      {line("experiences", 3, { fontSize: 118, fontWeight: 900, letterSpacing: "-0.03em", color: INK })}
    </AbsoluteFill>
  );
};

/* ───────────── F · COMING SOON on dark ───────────── */
export const SceneFinaleDark: React.FC = () => {
  const f = useCurrentFrame();
  const a = prog(f, 6, 26, easeOut);
  const b = prog(f, 14, 26, easeOut);
  const logo = prog(f, 0, 26);
  const foot = prog(f, 40, 24);
  const push = mix(1.06, 1, prog(f, 0, 40)) * mix(1, 1.04, prog(f, 40, 60, easeInOut));
  return (
    <AbsoluteFill style={{ ...center, perspective: 1200 }}>
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", background: "radial-gradient(circle, rgba(23,211,196,0.22), transparent 65%)", opacity: logo }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${push})` }}>
        <div style={{ opacity: logo, transform: `translateY(${mix(-50, 0, logo)}px)`, marginBottom: 110 }}>
          <PlayLockup start={-60} scale={0.6} wordColor="#ffffff" />
        </div>
        <Echo text="COMING" p={Math.min(1, a)} spread={60} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 176, letterSpacing: `${mix(0.3, 0, a)}em`, lineHeight: 1, transform: `rotateX(${mix(-80, 0, a)}deg)`, opacity: Math.min(1, a * 2) }} />
        <Echo text="SOON" p={Math.min(1, b)} spread={60} color={TEAL} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 226, letterSpacing: `${mix(0.3, 0, b)}em`, lineHeight: 1, transform: `rotateX(${mix(80, 0, b)}deg)`, opacity: Math.min(1, b * 2) }} />
        <div style={{ display: "flex", gap: 8, marginTop: 60 }}>
          {TILE_COLORS.map((c, i) => {
            const p = prog(f, 30 + i * 4, 20, backOut);
            return <div key={i} style={{ width: 44, height: 44, background: c, transform: `scale(${p}) rotate(${mix(90, 0, p) + Math.sin(f / 10 + i) * 6}deg)`, boxShadow: `0 0 30px ${c}88` }} />;
          })}
        </div>
        <div style={{ marginTop: 50, fontFamily: FONT, fontWeight: 500, fontSize: 38, color: "rgba(255,255,255,0.82)", opacity: foot, transform: `translateY(${mix(20, 0, foot)}px)`, letterSpacing: "0.02em" }}>
          When design meets experiences
        </div>
      </div>
    </AbsoluteFill>
  );
};
