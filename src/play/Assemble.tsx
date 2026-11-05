import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { B, outfit, PLAY_SCENES } from "./brand";
import { GroupTile } from "./Marks";
import { Backdrop } from "./Backdrop";
import { Flash } from "../fx";

const TILE = 130;
const SNAP = 34;
// where each tile flies in from (x, y, rotation)
const FROM = [
  { x: -900, y: -1200, r: -220 },
  { x: 900, y: -1100, r: 200 },
  { x: -950, y: 1100, r: 180 },
  { x: 950, y: 1200, r: -200 },
];
const GLOW = [B.pink, B.orange, B.blue, B.lime];

export const Assemble: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = PLAY_SCENES.assemble;

  const after = frame - SNAP;
  const impactFlash = interpolate(frame, [SNAP - 2, SNAP, SNAP + 10], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shake = after >= 0 && after < 10 ? (random(`as${frame}`) - 0.5) * interpolate(after, [0, 10], [36, 0]) : 0;
  const ring = interpolate(after, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // mark slides from center to the left to make room for the wordmark
  const slide = spring({ frame: frame - 44, fps, config: { damping: 16, stiffness: 120 } });
  const markX = interpolate(slide, [0, 1], [0, -250]);
  const wordReveal = interpolate(frame, [50, 72], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const subIn = interpolate(frame, [66, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shine = interpolate(frame, [72, 92], [-20, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // exit: rush toward camera
  const exit = interpolate(frame, [dur - 10, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const outFlash = interpolate(frame, [dur - 4, dur], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <Backdrop glow={B.pink} />

      {/* shockwave */}
      {after >= 0 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          {GLOW.map((c, i) => {
            const s = Math.max(0, ring - i * 0.07);
            return (
              <div
                key={c}
                style={{
                  position: "absolute",
                  width: 200 + s * 1500,
                  height: 200 + s * 1500,
                  border: `${interpolate(s, [0, 1], [18, 1])}px solid ${c}`,
                  opacity: 1 - s,
                  transform: `rotate(${45 + i * 8}deg)`,
                }}
              />
            );
          })}
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${1 + exit * 6})`,
          filter: `blur(${exit * 30}px)`,
          opacity: 1 - exit * 0.6,
        }}
      >
        <div style={{ position: "relative", width: 900, height: TILE * 2 }}>
          {/* the 2x2 mark */}
          <div
            style={{
              position: "absolute",
              left: 450 - TILE + markX,
              top: 0,
              width: TILE * 2,
              height: TILE * 2,
            }}
          >
            {[0, 1, 2, 3].map((i) => {
              const p = spring({
                frame: frame - i * 3,
                fps,
                durationInFrames: SNAP - i * 3,
                config: { damping: 200 },
              });
              const f = FROM[i];
              const x = interpolate(p, [0, 1], [f.x, 0]);
              const y = interpolate(p, [0, 1], [f.y, 0]);
              const r = interpolate(p, [0, 1], [f.r, 0]);
              const sc = interpolate(p, [0, 1], [3.5, 1]);
              const glow = after >= 0 ? interpolate(after, [0, 20], [60, 18], { extrapolateRight: "clamp" }) : 40;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: (i % 2) * TILE,
                    top: Math.floor(i / 2) * TILE,
                    transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${sc})`,
                    boxShadow: `0 0 ${glow}px ${GLOW[i]}`,
                  }}
                >
                  <GroupTile index={i as 0 | 1 | 2 | 3} size={TILE} />
                </div>
              );
            })}
          </div>

          {/* wordmark */}
          <div
            style={{
              position: "absolute",
              left: 450 - TILE + markX + TILE * 2 + 40,
              top: 8,
              clipPath: `inset(0 ${100 - wordReveal}% 0 0)`,
              fontFamily: outfit,
              color: B.white,
              lineHeight: 0.92,
            }}
          >
            <div style={{ fontWeight: 300, fontSize: 104, letterSpacing: -2 }}>HEDONISM</div>
            <div style={{ fontWeight: 800, fontSize: 112, letterSpacing: -2 }}>group</div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(100deg, transparent ${shine - 12}%, rgba(255,255,255,0.9) ${shine}%, transparent ${shine + 12}%)`,
                mixBlendMode: "overlay",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 450 - TILE + markX + TILE * 2 + 44,
              top: TILE * 2 + 6,
              opacity: subIn,
              fontFamily: outfit,
              fontWeight: 400,
              fontSize: 44,
              color: B.dim,
              letterSpacing: interpolate(subIn, [0, 1], [20, 2]),
            }}
          >
            Unlimited design
          </div>
        </div>
      </AbsoluteFill>

      <Flash value={Math.max(impactFlash, outFlash)} />
    </AbsoluteFill>
  );
};
