import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { B, outfit, PLAY_SCENES } from "./brand";
import { GroupTile } from "./Marks";
import { Backdrop } from "./Backdrop";
import { Flash, GlitchText } from "../fx";

const LINE = [
  { w: "When", c: B.white },
  { w: "design", c: B.pink },
  { w: "meets", c: B.white },
  { w: "experiences", c: B.teal },
];
const SLAM = 58;

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = PLAY_SCENES.finale;

  const inFlash = interpolate(frame, [0, 8], [1, 0], { extrapolateRight: "clamp" });
  const slamFlash = interpolate(frame, [SLAM - 2, SLAM, SLAM + 10], [0, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const after = frame - SLAM;
  const shake = after >= 0 && after < 10 ? (random(`fs${frame}`) - 0.5) * interpolate(after, [0, 10], [34, 0]) : 0;

  // tagline moves up once COMING SOON lands
  const tagUp = interpolate(after, [0, 16], [0, -330], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const csScale = interpolate(after, [0, 6, 14], [2.6, 0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const flare = interpolate(after, [0, 5, 50], [0, 1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const footIn = interpolate(after, [20, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [dur - 10, dur], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeOut, transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
      <Backdrop glow={after >= 0 ? B.teal : B.pink} speed={0.6} />

      {/* tagline, word by word */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${tagUp}px) scale(${interpolate(after, [0, 16], [1, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            width: 900,
            columnGap: 28,
            rowGap: 4,
          }}
        >
          {LINE.map((l, i) => {
            const s = 6 + i * 9;
            const p = interpolate(frame, [s, s + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            const accent = l.c !== B.white;
            return (
              <div
                key={l.w}
                style={{
                  fontFamily: outfit,
                  fontWeight: accent ? 700 : 300,
                  fontSize: 104,
                  color: l.c,
                  opacity: p,
                  filter: `blur(${(1 - p) * 16}px)`,
                  transform: `translateY(${(1 - p) * 40}px)`,
                  textShadow: accent ? `0 0 30px ${l.c}aa` : "none",
                }}
              >
                {l.w}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* anamorphic flare */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1010,
          height: 5,
          opacity: flare,
          background: `linear-gradient(90deg, transparent, ${B.teal}, #fff, ${B.pink}, transparent)`,
          boxShadow: `0 0 40px 10px ${B.teal}66`,
        }}
      />

      {/* COMING SOON */}
      {after >= 0 ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            transform: `translateY(60px) scale(${csScale})`,
            gap: 0,
          }}
        >
          {["COMING", "SOON"].map((w) => (
            <div key={w} style={{ height: 210 }}>
              <GlitchText
                text={w}
                size={220}
                font={outfit}
                weight={900}
                spacing={-6}
                color={B.white}
                colorA={B.teal}
                colorB={B.pink}
                seed={w}
                intensity={after < 12 ? 0.9 : 0.05}
              />
            </div>
          ))}
        </AbsoluteFill>
      ) : null}

      {/* footer: group signature */}
      <div
        style={{
          position: "absolute",
          bottom: 330,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 22,
          opacity: footIn,
          transform: `translateY(${(1 - footIn) * 30}px)`,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[0, 1, 2, 3].map((i) => (
            <GroupTile key={i} index={i as 0 | 1 | 2 | 3} size={44} />
          ))}
        </div>
        <div style={{ fontFamily: outfit, color: B.white, lineHeight: 0.9 }}>
          <div style={{ fontWeight: 300, fontSize: 40 }}>HEDONISM</div>
          <div style={{ fontWeight: 800, fontSize: 42 }}>group</div>
        </div>
      </div>

      <Flash value={Math.max(inFlash, slamFlash)} />
    </AbsoluteFill>
  );
};
