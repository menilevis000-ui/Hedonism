import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, display } from "./theme";

/** CRT scanlines + rolling bar */
export const Scanlines: React.FC = () => {
  const frame = useCurrentFrame();
  const barY = ((frame * 9) % 1400) - 200;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 4px)",
          mixBlendMode: "multiply",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: barY,
          height: 180,
          background:
            "linear-gradient(180deg, transparent, rgba(0,240,255,0.05), transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Animated film grain made from deterministic noise blocks */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const x = Math.floor(random(`gx${frame}`) * 200);
  const y = Math.floor(random(`gy${frame}`) * 200);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "screen" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={frame % 50}
          />
        </filter>
        <rect
          x={-x}
          y={-y}
          width="120%"
          height="120%"
          filter="url(#grain)"
        />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)",
    }}
  />
);

/** Text with RGB-split + slice glitch. `intensity` 0..1 */
export const GlitchText: React.FC<{
  text: string;
  size: number;
  intensity?: number;
  seed?: string;
  font?: string;
  weight?: number;
  spacing?: number;
  color?: string;
  dir?: "ltr" | "rtl";
}> = ({
  text,
  size,
  intensity = 0.3,
  seed = "g",
  font = display,
  weight = 900,
  spacing = 0,
  color = C.white,
  dir = "ltr",
}) => {
  const frame = useCurrentFrame();
  // Glitch only fires on some frames
  const fire = random(`${seed}-fire-${frame}`) < intensity;
  const amt = fire ? 6 + random(`${seed}-a-${frame}`) * 26 * intensity : 1.5;
  const sliceTop = random(`${seed}-st-${frame}`) * 80;
  const sliceH = 6 + random(`${seed}-sh-${frame}`) * 18;
  const sliceShift = fire ? (random(`${seed}-ss-${frame}`) - 0.5) * 80 : 0;

  const base: React.CSSProperties = {
    fontFamily: font,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: spacing,
    lineHeight: 1,
    whiteSpace: "nowrap",
    direction: dir,
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: C.cyan,
          transform: `translateX(${-amt}px)`,
          mixBlendMode: "screen",
          opacity: 0.9,
        }}
      >
        {text}
      </div>
      <div
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: C.magenta,
          transform: `translateX(${amt}px)`,
          mixBlendMode: "screen",
          opacity: 0.9,
        }}
      >
        {text}
      </div>
      <div
        style={{
          ...base,
          color,
          position: "relative",
          textShadow: `0 0 ${size * 0.25}px rgba(0,240,255,0.55), 0 0 ${size * 0.6}px rgba(255,43,214,0.35)`,
        }}
      >
        {text}
      </div>
      {fire ? (
        <div
          style={{
            ...base,
            position: "absolute",
            inset: 0,
            color,
            clipPath: `inset(${sliceTop}% 0 ${Math.max(0, 100 - sliceTop - sliceH)}% 0)`,
            transform: `translateX(${sliceShift}px)`,
          }}
        >
          {text}
        </div>
      ) : null}
    </div>
  );
};

/** Full-screen white/cyan flash, value 0..1 */
export const Flash: React.FC<{ value: number }> = ({ value }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity: value,
      background:
        "radial-gradient(circle at center, #ffffff 0%, #bff9ff 30%, rgba(0,240,255,0.4) 70%, rgba(0,0,0,0) 100%)",
    }}
  />
);
