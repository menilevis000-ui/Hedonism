import React from "react";
import { useCurrentFrame } from "remotion";
import {
  BLUE, FONT, GREY, INK, LIME, ORANGE, PINK, TEAL, backOut, easeInOut, easeOut, mix, prog,
} from "./theme";

/* ───────── HEDONISM group mark: 2×2 colour tiles with letter glyphs ───────── */
const Glyph: React.FC<{ k: number; bg: string; p: number }> = ({ k, bg, p }) => {
  const s = mix(0.2, 1.12, p);
  const g = (children: React.ReactNode) => (
    <g style={{ transformOrigin: "50% 50%", transform: `scale(${s})`, opacity: p }}>{children}</g>
  );
  if (k === 0)
    return g(<>
      <rect x="52" y="18" width="14" height="62" fill="#fff" />
      <path d="M52 50 A15 15 0 0 0 52 80 Z" fill={INK} />
    </>);
  if (k === 1)
    return g(<>
      <path d="M56 22 A28 28 0 0 0 56 78 Z" fill="#fff" />
      <path d="M56 36 A14 14 0 0 1 56 64 Z" fill={INK} />
    </>);
  if (k === 2)
    return g(<>
      <path d="M56 30 A25 25 0 0 0 56 80 Z" fill={INK} />
      <circle cx="51" cy="55" r="9" fill={bg} />
      <rect x="56" y="30" width="15" height="50" fill="#fff" />
    </>);
  return g(<>
    <rect x="36" y="20" width="15" height="60" fill={INK} />
    <path d="M51 50 L70 80 L51 80 Z" fill="#fff" />
  </>);
};

export const GroupMark: React.FC<{ size: number; start: number }> = ({ size, start }) => {
  const f = useCurrentFrame();
  const cells = [PINK, ORANGE, BLUE, LIME];
  const from = [
    [-420, -520, -70], [460, -380, 60], [-380, 520, 50], [420, 480, -80],
  ];
  const c = size / 2;
  return (
    <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d" }}>
      {cells.map((bg, i) => {
        const p = prog(f, start + i * 5, 34, easeOut);
        const gp = prog(f, start + 22 + i * 4, 22, backOut);
        const [fx, fy, rot] = from[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (i % 2) * c,
              top: Math.floor(i / 2) * c,
              width: c,
              height: c,
              background: bg,
              opacity: Math.min(1, p * 1.6),
              transform: `translate3d(${mix(fx, 0, p)}px, ${mix(fy, 0, p)}px, ${mix(-600, 0, p)}px) rotateZ(${mix(rot, 0, p)}deg) rotateY(${mix(rot * 1.5, 0, p)}deg)`,
              boxShadow: `0 ${mix(60, 10, p)}px ${mix(80, 30, p)}px rgba(0,0,0,${mix(0.05, 0.1, p)})`,
            }}
          >
            <svg viewBox="0 0 100 100" width={c} height={c} style={{ overflow: "visible" }}>
              <Glyph k={i} bg={bg} p={gp} />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

/* ───────── HEDONISM play mark: teal tile with a "P" built from bar + bowl ───────── */
export const PlayMark: React.FC<{ size: number; start: number; shine?: number }> = ({
  size, start, shine = -1,
}) => {
  const f = useCurrentFrame();
  const flip = prog(f, start, 34, easeOut);
  const bar = prog(f, start + 14, 22, easeInOut);
  const bowl = prog(f, start + 22, 26, backOut);
  const counter = prog(f, start + 36, 16, backOut);
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        background: TEAL,
        borderRadius: size * 0.03,
        overflow: "hidden",
        transform: `perspective(900px) rotateY(${mix(-180, 0, flip)}deg) scale(${mix(0.4, 1, flip)})`,
        opacity: Math.min(1, flip * 3),
        boxShadow: `0 ${size * 0.12}px ${size * 0.25}px rgba(15,179,166,0.28)`,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <rect x="22" y="18" width="17" height="64" fill="#fff"
          style={{ transformOrigin: "30px 18px", transform: `scaleY(${bar})` }} />
        <g style={{ transformOrigin: "39px 41px", transform: `rotate(${mix(-180, 0, bowl)}deg) scale(${mix(0, 1, Math.min(1, bowl * 1.4))})` }}>
          <path d="M39 18 A23 23 0 0 1 39 64 Z" fill={INK} />
          <circle cx="44" cy="41" r={8 * counter} fill={TEAL} />
        </g>
      </svg>
      {shine >= 0 && shine <= 1 && (
        <div style={{
          position: "absolute", top: -size * 0.5, left: mix(-size, size * 1.4, shine), width: size * 0.35, height: size * 2,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
          transform: "rotate(20deg)",
        }} />
      )}
    </div>
  );
};

/** Full HEDONISM play lock-up with animated wordmark */
export const PlayLockup: React.FC<{ scale?: number; start: number; shine?: number }> = ({
  scale = 1, start, shine,
}) => {
  const f = useCurrentFrame();
  const mark = 250 * scale;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30 * scale }}>
      <PlayMark size={mark} start={start} shine={shine} />
      <div style={{ display: "flex", flexDirection: "column", fontFamily: FONT, lineHeight: 0.86 }}>
        <div style={{ fontWeight: 800, fontSize: 96 * scale, color: GREY, letterSpacing: "-0.02em", display: "flex", overflow: "hidden", padding: "0.04em 0" }}>
          {"HEDONISM".split("").map((ch, i) => {
            const p = prog(f, start + 20 + i * 2.5, 24, easeOut);
            return (
              <span key={i} style={{ display: "inline-block", transform: `translateY(${mix(110, 0, p)}%)`, opacity: p }}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ fontWeight: 800, fontSize: 150 * scale, color: TEAL, letterSpacing: "-0.03em", display: "flex", marginTop: -6 * scale }}>
          {"play".split("").map((ch, i) => {
            const p = prog(f, start + 34 + i * 4, 26, backOut);
            return (
              <span key={i} style={{ display: "inline-block", transformOrigin: "50% 90%", transform: `translateY(${mix(60, 0, p)}px) scale(${mix(0.3, 1, p)})`, opacity: Math.min(1, p * 2) }}>
                {ch}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
