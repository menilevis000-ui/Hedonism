import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { C, display, hebrew, mono, SCENES } from "../theme";
import { GlitchText } from "../fx";

export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [SCENES.end - 15, SCENES.end], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const holo = random(`holo${frame}`) > 0.9 ? 0.55 : 1;
  const lineW = interpolate(frame, [5, 35], [0, 900], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // fake countdown that ticks down hard
  const remaining = Math.max(0, 9_999_999 - frame * 97_531);
  const days = String(Math.floor(remaining / 86400) % 1000).padStart(3, "0");
  const hrs = String(Math.floor(remaining / 3600) % 24).padStart(2, "0");
  const mins = String(Math.floor(remaining / 60) % 60).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        opacity: fadeIn * fadeOut,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 34,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 50%, ${C.violet}33, transparent 70%)`,
        }}
      />
      <div style={{ opacity: holo }}>
        <GlitchText text="COMING SOON" size={130} spacing={20} seed="end" intensity={0.2} />
      </div>
      <div
        style={{
          width: lineW,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${C.magenta}, ${C.cyan}, transparent)`,
          boxShadow: `0 0 18px ${C.magenta}`,
        }}
      />
      <div
        style={{
          fontFamily: hebrew,
          fontWeight: 900,
          fontSize: 84,
          color: C.white,
          direction: "rtl",
          textShadow: `0 0 30px ${C.magenta}`,
        }}
      >
        בקרוב
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 56,
          color: C.cyan,
          letterSpacing: 8,
          textShadow: `0 0 14px ${C.cyan}`,
          marginTop: 10,
        }}
      >
        T-{days}:{hrs}:{mins}:{secs}
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 34,
          letterSpacing: 24,
          color: C.dim,
        }}
      >
        HEDONISM
      </div>
    </AbsoluteFill>
  );
};
