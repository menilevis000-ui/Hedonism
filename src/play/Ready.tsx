import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { B, outfit, PLAY_SCENES } from "./brand";
import { Backdrop } from "./Backdrop";
import { Flash, GlitchText } from "../fx";
import { mono } from "../theme";

const WORDS = [
  { t: "GET", c: B.pink, a: B.orange },
  { t: "READY", c: B.orange, a: B.lime },
  { t: "TO", c: B.blue, a: B.pink },
  { t: "PLAY.", c: B.teal, a: B.lime },
];
const STEP = 13;
const START = 6;

/** A burst of small brand-coloured squares flying out from a point. */
const Burst: React.FC<{ start: number; seed: string; colors: string[] }> = ({
  start,
  seed,
  colors,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > 30) return null;
  const p = interpolate(t, [0, 30], [0, 1], { easing: Easing.out(Easing.cubic) });
  return (
    <>
      {new Array(26).fill(0).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const d = 200 + random(`${seed}d${i}`) * 520;
        const s = 10 + random(`${seed}s${i}`) * 26;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: s,
              height: s,
              background: colors[i % colors.length],
              boxShadow: `0 0 14px ${colors[i % colors.length]}`,
              transform: `translate(${Math.cos(a) * d * p - s / 2}px, ${Math.sin(a) * d * p - s / 2}px) rotate(${p * 360 * (i % 2 ? 1 : -1)}deg)`,
              opacity: 1 - p,
            }}
          />
        );
      })}
    </>
  );
};

export const Ready: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = PLAY_SCENES.ready;
  const last = START + STEP * (WORDS.length - 1);
  const sinceLast = frame - last;

  const inFlash = interpolate(frame, [0, 8], [1, 0], { extrapolateRight: "clamp" });
  const outFlash = interpolate(frame, [dur - 5, dur], [0, 1], { extrapolateLeft: "clamp" });

  const current = Math.max(0, Math.min(WORDS.length - 1, Math.floor((frame - START) / STEP)));
  const shakeAmt = interpolate((frame - START) % STEP, [0, 6], [30, 0], {
    extrapolateRight: "clamp",
  });
  const shake = frame >= START && frame < last + 8 ? (random(`rs${frame}`) - 0.5) * shakeAmt : 0;

  const hudIn = interpolate(sinceLast, [12, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0.25;

  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
      <Backdrop glow={WORDS[current].c} speed={2.5} />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {WORDS.map((w, i) => (
          <Burst key={w.t} start={START + i * STEP} seed={w.t} colors={[w.c, w.a, B.white]} />
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {WORDS.map((w, i) => {
          const local = frame - START - i * STEP;
          if (local < 0) return <div key={w.t} style={{ height: 200 }} />;
          const sc = interpolate(local, [0, 5, 10], [3, 0.92, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const o = interpolate(local, [0, 2], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={w.t} style={{ height: 200, transform: `scale(${sc})`, opacity: o }}>
              <GlitchText
                text={w.t}
                size={210}
                font={outfit}
                weight={900}
                spacing={-4}
                color={w.c}
                colorA={w.a}
                colorB={B.white}
                seed={w.t}
                intensity={local < 8 ? 0.9 : 0.08}
              />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* game HUD */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 40,
          letterSpacing: 8,
          color: B.teal,
          textShadow: `0 0 12px ${B.teal}`,
          opacity: hudIn,
        }}
      >
        PLAYER_01 // CONNECTED
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 360,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 48,
          letterSpacing: 10,
          color: B.white,
          opacity: hudIn * blink,
        }}
      >
        ▶ PRESS START
      </div>

      <Flash value={Math.max(inFlash, outFlash)} />
    </AbsoluteFill>
  );
};
