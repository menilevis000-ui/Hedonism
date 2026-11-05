import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { C, W, H, display, hebrew, SCENES } from "../theme";
import { Flash, GlitchText } from "../fx";

const IMPACT = 40;
const PARTICLES = new Array(260).fill(0).map((_, i) => ({
  angle: random(`la${i}`) * Math.PI * 2,
  dist: 500 + random(`ld${i}`) * 900,
  delay: random(`ldl${i}`) * 22,
  size: 2 + random(`ls${i}`) * 5,
  pink: random(`lp${i}`) > 0.55,
}));

const LETTERS = "HEDONISM".split("");

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const charge = interpolate(frame, [0, IMPACT], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const after = frame - IMPACT;
  const shake =
    frame < IMPACT
      ? (random(`lsh${frame}`) - 0.5) * 22 * charge
      : after < 12
        ? (random(`lsh${frame}`) - 0.5) * interpolate(after, [0, 12], [40, 0])
        : 0;

  const flash = interpolate(frame, [IMPACT - 3, IMPACT, IMPACT + 14], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const endFade = interpolate(frame, [SCENES.logo - 12, SCENES.logo], [0, 1], {
    extrapolateLeft: "clamp",
  });

  const shock = interpolate(after, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const spacing = interpolate(after, [0, 50], [90, 26], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const zoom = interpolate(frame, [IMPACT, SCENES.logo], [1.12, 1], {
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const shine = interpolate(after, [55, 85], [-30, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagIn = interpolate(after, [45, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flare = interpolate(after, [0, 6, 60], [0, 1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        overflow: "hidden",
        transform: `translate(${shake}px, ${shake * 0.5}px)`,
      }}
    >
      {/* charging core */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, ${C.white} 0%, ${C.cyan} ${3 + charge * 8}%, ${C.magenta}88 ${10 + charge * 22}%, transparent ${25 + charge * 40}%)`,
          opacity: frame < IMPACT ? charge : interpolate(after, [0, 30], [0.6, 0.25], { extrapolateRight: "clamp" }),
        }}
      />

      {/* converging particles */}
      {frame < IMPACT + 2 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {PARTICLES.map((p, i) => {
            const k = interpolate(frame, [p.delay, IMPACT], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.in(Easing.quad),
            });
            const d = p.dist * (1 - k);
            const d2 = d + 140 * k + 30;
            const color = p.pink ? C.magenta : C.cyan;
            return (
              <line
                key={i}
                x1={W / 2 + Math.cos(p.angle) * d}
                y1={H / 2 + Math.sin(p.angle) * d}
                x2={W / 2 + Math.cos(p.angle) * d2}
                y2={H / 2 + Math.sin(p.angle) * d2}
                stroke={color}
                strokeWidth={p.size}
                strokeLinecap="round"
                opacity={k > 0 ? 0.9 : 0}
              />
            );
          })}
        </svg>
      ) : null}

      {/* shockwave rings */}
      {after >= 0 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {[0, 1].map((n) => {
            const s = Math.max(0, shock - n * 0.15);
            return (
              <ellipse
                key={n}
                cx={W / 2}
                cy={H / 2}
                rx={s * 1300}
                ry={s * 1300 * 0.6}
                fill="none"
                stroke={n === 0 ? C.cyan : C.magenta}
                strokeWidth={interpolate(s, [0, 1], [30, 1])}
                opacity={1 - s}
              />
            );
          })}
        </svg>
      ) : null}

      {/* rotating sigil */}
      {after >= 0 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <svg
            width={900}
            height={900}
            viewBox="-450 -450 900 900"
            style={{
              opacity: interpolate(after, [0, 20], [0, 0.35], { extrapolateRight: "clamp" }),
              transform: `rotate(${frame * 0.4}deg) scale(${zoom})`,
            }}
          >
            <polygon
              points={new Array(6)
                .fill(0)
                .map((_, i) => {
                  const a = (Math.PI / 3) * i;
                  return `${Math.cos(a) * 420},${Math.sin(a) * 420}`;
                })
                .join(" ")}
              fill="none"
              stroke={C.cyan}
              strokeWidth={2}
            />
            <polygon
              points={new Array(6)
                .fill(0)
                .map((_, i) => {
                  const a = (Math.PI / 3) * i + Math.PI / 6;
                  return `${Math.cos(a) * 360},${Math.sin(a) * 360}`;
                })
                .join(" ")}
              fill="none"
              stroke={C.magenta}
              strokeWidth={2}
              strokeDasharray="10 8"
            />
          </svg>
        </AbsoluteFill>
      ) : null}

      {/* anamorphic flare */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: H / 2 - 3,
          height: 6,
          opacity: flare,
          background: `linear-gradient(90deg, transparent, ${C.cyan}, #ffffff, ${C.cyan}, transparent)`,
          boxShadow: `0 0 40px 10px ${C.cyan}88`,
        }}
      />

      {/* the logo */}
      {after >= 0 ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 40,
            transform: `scale(${zoom})`,
          }}
        >
          <div style={{ position: "relative", display: "flex" }}>
            {LETTERS.map((ch, i) => {
              const o = interpolate(after, [i * 2, i * 2 + 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div key={i} style={{ opacity: o, marginRight: i < LETTERS.length - 1 ? spacing : 0 }}>
                  <GlitchText
                    text={ch}
                    size={210}
                    seed={`L${i}`}
                    intensity={after < 25 ? 0.7 : 0.06}
                  />
                </div>
              );
            })}
            {/* shine sweep */}
            <div
              style={{
                position: "absolute",
                inset: -20,
                background: `linear-gradient(105deg, transparent ${shine - 10}%, rgba(255,255,255,0.75) ${shine}%, transparent ${shine + 10}%)`,
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }}
            />
          </div>
          <div
            style={{
              opacity: tagIn,
              transform: `translateY(${(1 - tagIn) * 30}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                fontFamily: display,
                fontWeight: 400,
                fontSize: 40,
                letterSpacing: 18,
                color: C.cyan,
                textShadow: `0 0 16px ${C.cyan}`,
              }}
            >
              EXPERIENCE BEYOND HUMAN
            </div>
            <div
              style={{
                fontFamily: hebrew,
                fontWeight: 300,
                fontSize: 50,
                color: C.white,
                direction: "rtl",
                letterSpacing: 4,
              }}
            >
              חוויה מעבר לאנושי
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      <Flash value={flash} />
      <AbsoluteFill style={{ backgroundColor: "black", opacity: endFade }} />
    </AbsoluteFill>
  );
};
