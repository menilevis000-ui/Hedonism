import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { GroupMark, PlayLockup } from "./Logos";
import {
  BLUE, BRAND, FONT, GREY, INK, LIME, ORANGE, PINK, TEAL, backOut, easeIn, easeInOut, easeOut, mix, prog,
} from "./theme";

const center: React.CSSProperties = { justifyContent: "center", alignItems: "center" };

const Reveal: React.FC<{ start: number; children: React.ReactNode; dur?: number; style?: React.CSSProperties }> = ({
  start, children, dur = 28, style,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, dur, easeOut);
  return (
    <div style={{ overflow: "hidden", padding: "0.08em 0.1em", ...style }}>
      <div style={{ transform: `translateY(${mix(105, 0, p)}%)`, opacity: Math.min(1, p * 1.5), filter: `blur(${(1 - p) * 6}px)` }}>
        {children}
      </div>
    </div>
  );
};

/** Four-colour brand bar that draws itself */
const BrandBar: React.FC<{ start: number; width: number; height?: number }> = ({ start, width, height = 8 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", width, height, gap: 6 }}>
      {[PINK, ORANGE, BLUE, LIME].map((c, i) => (
        <div key={i} style={{ flex: 1, background: c, transformOrigin: "0 50%", transform: `scaleX(${prog(f, start + i * 4, 22, easeInOut)})` }} />
      ))}
    </div>
  );
};

/* ───────────── 1 · HEDONISM group intro ───────────── */
export const SceneGroup: React.FC = () => {
  const f = useCurrentFrame();
  const push = mix(1.06, 1.0, prog(f, 0, 60)) * mix(1, 1.05, prog(f, 50, 60, easeInOut));
  const exit = prog(f, 92, 20, easeIn);
  const rotY = mix(-18, 0, prog(f, 0, 60));
  return (
    <AbsoluteFill style={{ ...center, perspective: 1400 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 40,
        transform: `scale(${1.18 * push * mix(1, 1.8, exit)}) rotateY(${rotY}deg) translateZ(${exit * 200}px)`,
        opacity: 1 - exit, filter: `blur(${exit * 16}px)`, transformStyle: "preserve-3d",
      }}>
        <GroupMark size={200} start={0} />
        <div style={{ fontFamily: FONT, color: INK, lineHeight: 0.95 }}>
          <Reveal start={26}><div style={{ fontWeight: 300, fontSize: 86, letterSpacing: "-0.01em" }}>HEDONISM</div></Reveal>
          <Reveal start={34}><div style={{ fontWeight: 800, fontSize: 104, letterSpacing: "-0.03em", marginTop: -14 }}>group</div></Reveal>
          <Reveal start={46}><div style={{ fontWeight: 500, fontSize: 32, color: GREY, marginTop: 4 }}>Unlimited design</div></Reveal>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 2 · GET READY TO PLAY. ───────────── */
export const SceneReady: React.FC = () => {
  const f = useCurrentFrame();
  const words = ["GET", "READY", "TO"];
  const push = mix(0.94, 1.04, prog(f, 0, 90, easeInOut));
  const tilt = mix(14, -4, prog(f, 0, 90, easeInOut));
  return (
    <AbsoluteFill style={{ ...center, perspective: 1200 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, fontWeight: 800, color: INK, lineHeight: 0.92, transform: `scale(${push}) rotateX(${tilt}deg) rotateZ(${mix(-3, 0, prog(f, 0, 50))}deg)` }}>
        {words.map((w, i) => {
          const p = prog(f, 2 + i * 6, 26, easeOut);
          return (
            <div key={w} style={{ overflow: "hidden", padding: "0 0.05em" }}>
              <div style={{
                fontSize: 190, letterSpacing: `${mix(0.25, -0.02, p)}em`,
                transform: `translateY(${mix(100, 0, p)}%) rotateX(${mix(-60, 0, p)}deg)`,
              }}>{w}</div>
            </div>
          );
        })}
        <div style={{ display: "flex", fontSize: 230, letterSpacing: "-0.03em", marginTop: 6 }}>
          {"PLAY.".split("").map((ch, i) => {
            const p = prog(f, 22 + i * 4, 26, backOut);
            const cyc = Math.floor(Math.max(0, f - 26 - i * 2) / 4);
            const settled = f > 62 + i * 3;
            const color = settled ? TEAL : [...BRAND, TEAL][(cyc + i) % 5];
            return (
              <span key={i} style={{
                display: "inline-block", color, transformOrigin: "50% 100%",
                transform: `translateY(${mix(140, 0, p)}px) scale(${mix(0.2, 1, p)}) rotate(${mix(i % 2 ? 20 : -20, 0, p)}deg)`,
                opacity: Math.min(1, p * 2),
              }}>{ch}</span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Brand-colour panel wipe that sweeps upward across the frame */
export const TileWipe: React.FC = () => {
  const f = useCurrentFrame();
  const cols = [PINK, ORANGE, BLUE, LIME];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {cols.map((c, i) => {
        const p = prog(f, i * 3, 34, easeInOut);
        return (
          <div key={i} style={{
            position: "absolute", left: i * 270, width: 271, height: 2400, top: mix(1950, -2500, p),
            background: `linear-gradient(180deg, transparent 0%, ${c} 18%, ${c} 82%, transparent 100%)`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────── 3 · HEDONISM play logo reveal ───────────── */
export const ScenePlay: React.FC = () => {
  const f = useCurrentFrame();
  const camY = mix(-16, 4, prog(f, 0, 110, easeInOut));
  const push = mix(0.9, 1.06, prog(f, 0, 115, easeInOut));
  const shine = interpolate(f, [62, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = prog(f, 100, 18, easeIn);
  const glow = prog(f, 10, 40);
  return (
    <AbsoluteFill style={{ ...center, perspective: 1300 }}>
      <div style={{ position: "absolute", width: 1000, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(23,211,196,0.22), transparent 70%)", opacity: glow * (1 - exit), transform: `scale(${mix(0.6, 1.1, glow)})` }} />
      <div style={{ transform: `scale(${push * mix(1, 0.8, exit)}) rotateY(${camY}deg) translateY(${exit * -60}px)`, opacity: 1 - exit, filter: `blur(${exit * 12}px)` }}>
        <PlayLockup start={0} shine={shine} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 4 · When design meets experiences ───────────── */
export const SceneTagline: React.FC = () => {
  const f = useCurrentFrame();
  const push = mix(1, 1.07, prog(f, 0, 95, easeInOut));
  const exit = prog(f, 76, 18, easeIn);
  const word = (w: string, i: number, extra: React.CSSProperties = {}) => {
    const p = prog(f, 4 + i * 7, 26, easeOut);
    return (
      <span key={w} style={{ display: "inline-block", overflow: "hidden", padding: "0.06em 0.12em", verticalAlign: "bottom" }}>
        <span style={{ display: "inline-block", transform: `translateY(${mix(110, 0, p)}%) translateY(${exit * -(30 + i * 12)}px)`, opacity: Math.min(1, p * 1.5) * (1 - exit), filter: `blur(${(1 - p) * 8 + exit * 10}px)`, ...extra }}>
          {w}
        </span>
      </span>
    );
  };
  return (
    <AbsoluteFill style={{ ...center }}>
      <div style={{ transform: `scale(${push})`, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: INK, textAlign: "center" }}>
        <div style={{ fontSize: 112, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>
          {word("When", 0)}{word("design", 1, { fontWeight: 700 })}
        </div>
        <div style={{ fontSize: 112, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>
          {word("meets", 2)}
        </div>
        <div style={{ fontSize: 124, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          {word("experiences", 3, { color: TEAL })}
        </div>
        <div style={{ marginTop: 44, opacity: 1 - exit }}>
          <BrandBar start={34} width={420} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 5 · COMING SOON finale ───────────── */
const Heavy: React.FC<{ text: string; start: number }> = ({ text, start }) => {
  const f = useCurrentFrame();
  const sp = mix(0.3, 0.0, prog(f, start, 50, easeOut));
  return (
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 176, color: INK, lineHeight: 0.95, letterSpacing: `${sp}em`, display: "flex", transformStyle: "preserve-3d" }}>
      {text.split("").map((c, i) => {
        const p = prog(f, start + i * 3, 28, easeOut);
        return (
          <span key={i} style={{ display: "inline-block", transformOrigin: "50% 100%", transform: `rotateX(${mix(-100, 0, p)}deg) translateY(${mix(-40, 0, p)}px)`, opacity: Math.min(1, p * 2) }}>{c}</span>
        );
      })}
    </div>
  );
};

export const SceneComingSoon: React.FC = () => {
  const f = useCurrentFrame();
  const push = mix(1.1, 1.0, prog(f, 0, 50)) * mix(1, 1.035, prog(f, 50, 50, easeInOut));
  const tilt = mix(16, 0, prog(f, 0, 60));
  const footIn = prog(f, 54, 24);
  const breathe = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <AbsoluteFill style={{ ...center, perspective: 1200 }}>
      <div style={{ position: "absolute", width: 1100, height: 900, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.95), transparent 70%)", opacity: prog(f, 0, 30) }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${push}) rotateX(${tilt}deg)`, transformStyle: "preserve-3d" }}>
        <div style={{ opacity: prog(f, 0, 20), transform: `translateY(${mix(-40, 0, prog(f, 0, 30))}px)`, marginBottom: 100 }}>
          <PlayLockup start={-6} scale={0.62} />
        </div>
        <Heavy text="COMING" start={12} />
        <Heavy text="SOON" start={22} />
        <div style={{ marginTop: 56, transform: `scale(${1 + breathe * 0.02})` }}>
          <BrandBar start={44} width={560} height={10} />
        </div>
        <div style={{ marginTop: 44, fontFamily: FONT, fontWeight: 500, fontSize: 38, color: GREY, opacity: footIn, transform: `translateY(${mix(20, 0, footIn)}px)` }}>
          When design meets experiences
        </div>
      </div>
    </AbsoluteFill>
  );
};
