import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { GOLD, INK, prog, easeInOut } from "./theme";

const PARTICLES = new Array(90).fill(0).map((_, i) => ({
  x: random(`x${i}`) * 1080,
  y: random(`y${i}`) * 1920,
  z: random(`z${i}`), // depth 0 (far) .. 1 (near)
  phase: random(`p${i}`) * Math.PI * 2,
  speed: 0.3 + random(`s${i}`) * 0.9,
}));

/** Deep background with moving volumetric light and depth particles */
export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / 30;
  const intro = prog(frame, 0, 40, easeInOut);
  const camDrift = (frame / durationInFrames) * 140;

  const orb = (
    cx: number,
    cy: number,
    r: number,
    color: string,
    o: number,
  ): React.CSSProperties => ({
    position: "absolute",
    left: cx - r,
    top: cy - r,
    width: r * 2,
    height: r * 2,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
    opacity: o * intro,
    mixBlendMode: "screen",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 48%, #1a140c 0%, #0b0a0b 45%, #030304 100%)",
          opacity: intro,
        }}
      />
      {/* drifting cinematic light pools */}
      <div
        style={orb(
          540 + Math.sin(t * 0.6) * 260,
          700 + Math.cos(t * 0.45) * 220,
          720,
          "rgba(201,163,90,0.20)",
          1,
        )}
      />
      <div
        style={orb(
          300 + Math.cos(t * 0.5) * 200,
          1350 + Math.sin(t * 0.4) * 180,
          600,
          "rgba(120,90,160,0.13)",
          1,
        )}
      />
      <div
        style={orb(
          820 + Math.sin(t * 0.35 + 2) * 180,
          1000 + Math.cos(t * 0.55) * 300,
          520,
          "rgba(236,215,160,0.10)",
          1,
        )}
      />
      {/* top volumetric beams */}
      {[-1, 0, 1].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: 540 - 180 + k * 260,
            top: -300,
            width: 360,
            height: 2000,
            background:
              "linear-gradient(180deg, rgba(255,240,210,0.10) 0%, rgba(255,240,210,0.03) 45%, transparent 80%)",
            transformOrigin: "50% 0%",
            transform: `rotate(${k * 14 + Math.sin(t * 0.5 + k) * 4}deg)`,
            filter: "blur(30px)",
            opacity: intro * (0.6 + 0.4 * Math.sin(t * 0.8 + k * 2)),
            mixBlendMode: "screen",
          }}
        />
      ))}
      {/* depth particles */}
      {PARTICLES.map((p, i) => {
        const size = 1.5 + p.z * 5;
        const y =
          ((p.y - frame * p.speed * (0.6 + p.z * 1.6) - camDrift * p.z) % 1920 +
            1920) %
          1920;
        const x = p.x + Math.sin(t * 0.7 + p.phase) * 18 * (0.5 + p.z);
        const twinkle = 0.5 + 0.5 * Math.sin(t * 2 + p.phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: p.z > 0.85 ? "#fff6e0" : GOLD,
              opacity: intro * (0.15 + p.z * 0.55) * twinkle,
              filter: `blur(${p.z > 0.85 ? 2.5 : p.z * 1.2}px)`,
              boxShadow: `0 0 ${6 + p.z * 14}px rgba(236,215,160,0.8)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Vignette + animated film grain for a filmic finish */
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      {/* letterbox-style top/bottom fade */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 14%, transparent 86%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Anamorphic horizontal light streak + bloom, peaking at `at` */
export const Flare: React.FC<{ at: number; y?: number; strength?: number }> = ({
  at,
  y = 960,
  strength = 1,
}) => {
  const frame = useCurrentFrame();
  const d = frame - at;
  if (d < -14 || d > 30) return null;
  const o = d < 0 ? (d + 14) / 14 : Math.exp(-d / 8);
  const w = 200 + (d + 14) * 70;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: 540 - w / 2,
          top: y - 3,
          width: w,
          height: 6,
          background:
            "linear-gradient(90deg, transparent, rgba(255,236,200,0.9), #ffffff, rgba(255,236,200,0.9), transparent)",
          filter: "blur(2px)",
          opacity: o * strength,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - w * 0.7,
          top: y - 40,
          width: w * 1.4,
          height: 80,
          background:
            "radial-gradient(ellipse at center, rgba(255,220,160,0.55), transparent 70%)",
          filter: "blur(12px)",
          opacity: o * strength,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 260,
          top: y - 260,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,245,225,0.6), transparent 65%)",
          opacity: o * 0.8 * strength,
        }}
      />
    </AbsoluteFill>
  );
};
