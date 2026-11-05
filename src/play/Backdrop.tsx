import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { B, PW, PH } from "./brand";

/** Dark space with a moving perspective floor and soft brand-coloured glows. */
export const Backdrop: React.FC<{ glow?: string; speed?: number }> = ({
  glow = B.teal,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: B.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 40% at 50% 45%, ${glow}30, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -PW,
          width: PW * 3,
          top: PH * 0.7,
          height: PH,
          transformOrigin: "50% 0%",
          transform: "perspective(600px) rotateX(75deg)",
          backgroundImage: `linear-gradient(${B.teal}88 2px, transparent 2px), linear-gradient(90deg, ${B.pink}66 2px, transparent 2px)`,
          backgroundSize: "110px 110px",
          backgroundPosition: `0px ${(frame * 6 * speed) % 110}px`,
          maskImage: "linear-gradient(180deg, transparent 0%, black 40%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 40%)",
          opacity: 0.6,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage: `radial-gradient(${B.white} 1.4px, transparent 1.4px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: `0px ${-frame * 0.8}px`,
          maskImage: "linear-gradient(180deg, black 0%, transparent 65%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 65%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Futuristic corner brackets framing a region. */
export const Brackets: React.FC<{
  width: number;
  height: number;
  color?: string;
  len?: number;
  opacity?: number;
}> = ({ width, height, color = B.teal, len = 60, opacity = 1 }) => {
  const s = 5;
  const corner = (style: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: len,
        height: len,
        borderColor: color,
        borderStyle: "solid",
        borderWidth: 0,
        filter: `drop-shadow(0 0 8px ${color})`,
        ...style,
      }}
    />
  );
  return (
    <div style={{ position: "relative", width, height, opacity }}>
      {corner({ left: 0, top: 0, borderLeftWidth: s, borderTopWidth: s })}
      {corner({ right: 0, top: 0, borderRightWidth: s, borderTopWidth: s })}
      {corner({ left: 0, bottom: 0, borderLeftWidth: s, borderBottomWidth: s })}
      {corner({ right: 0, bottom: 0, borderRightWidth: s, borderBottomWidth: s })}
    </div>
  );
};
