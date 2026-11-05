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

const STARS = new Array(260).fill(0).map((_, i) => ({
  angle: random(`a${i}`) * Math.PI * 2,
  z0: random(`z${i}`),
  speed: 0.6 + random(`s${i}`) * 0.9,
  hue: random(`h${i}`),
}));

const project = (angle: number, z: number) => {
  const r = (1 / Math.max(z, 0.02)) * 60;
  return { x: W / 2 + Math.cos(angle) * r, y: H / 2 + Math.sin(angle) * r * 0.75 };
};

export const Warp: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const accel = interpolate(frame, [0, SCENES.warp], [0.6, 2.2], {
    easing: Easing.in(Easing.quad),
  });

  const inFlash = interpolate(frame, [0, 8], [1, 0], {
    extrapolateRight: "clamp",
  });
  const outFlash = interpolate(frame, [SCENES.warp - 6, SCENES.warp], [0, 1], {
    extrapolateLeft: "clamp",
  });

  const titleIn = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const spacing = interpolate(titleIn, [0, 1], [60, 14]);
  const heIn = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shake = frame > 100 ? (random(`sh${frame}`) - 0.5) * 14 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* horizon sun glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 35% at 50% 58%, ${C.magenta}44, ${C.violet}22 45%, transparent 70%)`,
        }}
      />

      {/* neon perspective floor */}
      <div
        style={{
          position: "absolute",
          left: -W,
          width: W * 3,
          top: H * 0.58,
          height: H * 1.6,
          transformOrigin: "50% 0%",
          transform: "perspective(500px) rotateX(78deg)",
          backgroundImage: `linear-gradient(${C.cyan}cc 2px, transparent 2px), linear-gradient(90deg, ${C.magenta}aa 2px, transparent 2px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${(t * 400 * accel) % 120}px`,
          maskImage: "linear-gradient(180deg, transparent 0%, black 30%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%)",
          filter: `drop-shadow(0 0 6px ${C.cyan})`,
        }}
      />

      {/* hyperspace streaks */}
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)` }}
      >
        {STARS.map((s, i) => {
          const z = 1 - ((s.z0 + t * 0.35 * s.speed * accel) % 1);
          const tail = Math.min(0.25, 0.04 * accel * s.speed);
          const a = project(s.angle, z + tail);
          const b = project(s.angle, z);
          const color = s.hue < 0.5 ? C.cyan : s.hue < 0.8 ? C.white : C.magenta;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={color}
              strokeWidth={interpolate(z, [0, 1], [4, 0.5], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
              strokeLinecap="round"
              opacity={interpolate(z, [0, 0.9, 1], [1, 0.7, 0])}
            />
          );
        })}
      </svg>

      {/* title */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 36,
          transform: `translate(${shake}px, ${-80}px)`,
        }}
      >
        <div
          style={{
            opacity: titleIn,
            transform: `scale(${interpolate(titleIn, [0, 1], [1.4, 1])})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <GlitchText
            text="THE FUTURE"
            size={130}
            spacing={spacing}
            seed="warp1"
            intensity={0.25}
            weight={900}
          />
          <GlitchText
            text="OF PLEASURE"
            size={130}
            spacing={spacing}
            seed="warp2"
            intensity={0.25}
            weight={900}
          />
        </div>
        <div
          style={{
            opacity: heIn,
            fontFamily: hebrew,
            fontWeight: 300,
            fontSize: 60,
            color: C.white,
            direction: "rtl",
            letterSpacing: 6,
            textShadow: `0 0 20px ${C.magenta}`,
          }}
        >
          העתיד של ההנאה
        </div>
        <div
          style={{
            opacity: heIn * 0.8,
            fontFamily: display,
            fontSize: 30,
            letterSpacing: 14,
            color: C.dim,
          }}
        >
          YEAR 2077 // SECTOR Ø
        </div>
      </AbsoluteFill>

      <Flash value={Math.max(inFlash, outFlash)} />
    </AbsoluteFill>
  );
};
