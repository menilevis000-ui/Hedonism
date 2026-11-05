import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { BRAND, PAPER, TEAL, prog } from "./theme";

const COLORS = [...BRAND, TEAL];
const TILES = new Array(26).fill(0).map((_, i) => ({
  x: random(`tx${i}`) * 1180 - 50,
  y: random(`ty${i}`) * 2100 - 90,
  z: random(`tz${i}`),
  rot: random(`tr${i}`) * 360,
  spin: (random(`ts${i}`) - 0.5) * 2.4,
  color: COLORS[i % COLORS.length],
  phase: random(`tp${i}`) * Math.PI * 2,
}));

/** Bright gallery-white space with drifting brand-colour light and floating 3D tiles */
export const Atmosphere: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const intro = prog(f, 0, 30);
  const blob = (cx: number, cy: number, r: number, color: string, o: number): React.CSSProperties => ({
    position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%",
    background: `radial-gradient(circle, ${color} 0%, transparent 68%)`, opacity: o * intro * (dark ? 1.5 : 1),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: dark ? "#0c0c0e" : PAPER, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: dark ? "radial-gradient(ellipse 80% 55% at 50% 45%, #1f1f24 0%, #121215 55%, #060607 100%)" : "radial-gradient(ellipse 80% 55% at 50% 45%, #ffffff 0%, #f6f5f1 60%, #ebe9e3 100%)" }} />
      <div style={blob(180 + Math.sin(t * 0.5) * 160, 380 + Math.cos(t * 0.4) * 140, 520, "rgba(242,111,181,0.22)", 1)} />
      <div style={blob(900 + Math.cos(t * 0.45) * 140, 620 + Math.sin(t * 0.5) * 200, 500, "rgba(247,102,31,0.14)", 1)} />
      <div style={blob(160 + Math.cos(t * 0.35) * 150, 1500 + Math.sin(t * 0.45) * 160, 560, "rgba(159,203,239,0.35)", 1)} />
      <div style={blob(920 + Math.sin(t * 0.4) * 130, 1600 + Math.cos(t * 0.35) * 160, 520, "rgba(198,204,25,0.18)", 1)} />
      <div style={blob(540 + Math.sin(t * 0.3) * 120, 980 + Math.cos(t * 0.3) * 120, 620, "rgba(23,211,196,0.12)", 1)} />
      <AbsoluteFill style={{ perspective: 1200 }}>
        {TILES.map((p, i) => {
          const size = 14 + p.z * 46;
          const y = (((p.y - f * (0.4 + p.z * 1.3)) % 2100) + 2100) % 2100 - 90;
          const x = p.x + Math.sin(t * 0.6 + p.phase) * 30 * (0.4 + p.z);
          return (
            <div key={i} style={{
              position: "absolute", left: x, top: y, width: size, height: size, background: p.color,
              borderRadius: size * 0.12,
              opacity: intro * (0.25 + p.z * 0.5) * (dark ? 0.8 : 1),
              transform: `rotateX(${p.rot + f * p.spin}deg) rotateY(${p.rot * 0.7 + f * p.spin * 1.3}deg)`,
              filter: `blur(${p.z > 0.8 ? (p.z - 0.8) * 30 : (1 - p.z) * 2.5}px)`,
              boxShadow: dark ? `0 0 ${size * 0.8}px ${p.color}88` : `0 ${size * 0.4}px ${size * 0.6}px rgba(0,0,0,0.06)`,
            }} />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const FilmFinish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 60%, rgba(60,50,40,0.12) 100%)" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.045, mixBlendMode: "multiply" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
