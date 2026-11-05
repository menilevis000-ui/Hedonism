import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { B, outfit, PLAY_SCENES, PW } from "./brand";
import { PlayMark } from "./Marks";
import { Backdrop, Brackets } from "./Backdrop";
import { Flash, GlitchText } from "../fx";
import { mono } from "../theme";

const GLYPHS = "01ABCDEF<>/#$%&*+=";
const COLS = 18;

/** Falling columns of code in the background. */
const CodeRain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.22, overflow: "hidden" }}>
      {new Array(COLS).fill(0).map((_, c) => {
        const speed = 8 + random(`cs${c}`) * 14;
        const offset = random(`co${c}`) * 1900;
        const y = ((frame * speed + offset) % 2600) - 700;
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: (c + 0.5) * (PW / COLS) - 14,
              top: y,
              fontFamily: mono,
              fontSize: 34,
              lineHeight: "42px",
              color: c % 3 === 0 ? B.pink : B.teal,
              textShadow: `0 0 8px currentColor`,
              width: 28,
              wordBreak: "break-all",
            }}
          >
            {new Array(16)
              .fill(0)
              .map((_, r) => GLYPHS[Math.floor(random(`g${c}-${r}-${Math.floor(frame / 4)}`) * GLYPHS.length)])
              .join("")}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const PlayLogo: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
    <PlayMark size={230} />
    <div style={{ fontFamily: outfit, lineHeight: 0.86 }}>
      <div style={{ fontWeight: 800, fontSize: 112, color: B.white, letterSpacing: -3 }}>HEDONISM</div>
      <div style={{ fontWeight: 900, fontSize: 150, color: B.teal, letterSpacing: -4 }}>play</div>
    </div>
  </div>
);

/** Segmented loading spinner, a futuristic take on the classic one. */
const Spinner: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2) % 12;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      {new Array(12).fill(0).map((_, i) => {
        const age = (step - i + 12) % 12;
        const o = interpolate(age, [0, 11], [1, 0.15]);
        return (
          <line
            key={i}
            x1={0}
            y1={-22}
            x2={0}
            y2={-40}
            stroke={age === 0 ? B.white : B.teal}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={o}
            transform={`rotate(${i * 30})`}
            style={{ filter: `drop-shadow(0 0 3px ${B.teal})` }}
          />
        );
      })}
    </svg>
  );
};

export const Decrypt: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = PLAY_SCENES.decrypt;

  const inFlash = interpolate(frame, [0, 8], [1, 0], { extrapolateRight: "clamp" });
  const appear = interpolate(frame, [4, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // progress climbs, stalls at 99%, then gets "locked"
  const LOCK = 112;
  const progress = interpolate(frame, [10, 60, 95, 108], [0, 0.62, 0.93, 0.99], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const locked = frame >= LOCK;
  const lockGlitch = frame >= LOCK && frame < LOCK + 10;

  // the logo stays blurred: only a scanning strip comes slightly into focus
  const blur = locked ? 18 : interpolate(progress, [0, 1], [30, 12]);
  const scanY = interpolate(frame % 50, [0, 50], [-15, 115]);
  const jitter = lockGlitch ? (random(`dj${frame}`) - 0.5) * 60 : 0;

  const ringR = 260;
  const circ = 2 * Math.PI * ringR;
  const outFlash = interpolate(frame, [dur - 5, dur], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <Backdrop glow={B.teal} />
      <CodeRain />

      {/* locked logo */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: appear,
          transform: `translateX(${jitter}px) scale(${interpolate(appear, [0, 1], [1.2, 1])})`,
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{ filter: `blur(${blur}px)`, opacity: 0.9 }}>
            <PlayLogo />
          </div>
          {!locked ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                filter: `blur(${blur * 0.45}px)`,
                clipPath: `inset(${scanY}% 0 ${Math.max(0, 100 - scanY - 9)}% 0)`,
              }}
            >
              <PlayLogo />
            </div>
          ) : null}
          {/* scan line */}
          {!locked ? (
            <div
              style={{
                position: "absolute",
                left: -60,
                right: -60,
                top: `${scanY}%`,
                height: 4,
                background: B.teal,
                boxShadow: `0 0 24px 6px ${B.teal}`,
              }}
            />
          ) : null}
        </div>
      </AbsoluteFill>

      {/* bracket frame */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Brackets
          width={interpolate(appear, [0, 1], [400, 980])}
          height={interpolate(appear, [0, 1], [200, 520])}
          color={locked ? B.pink : B.teal}
          opacity={appear}
        />
      </AbsoluteFill>

      {/* spinner + progress ring */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: appear }}>
        <svg width={ringR * 2 + 40} height={ringR * 2 + 40} style={{ position: "absolute" }}>
          <circle
            cx={ringR + 20}
            cy={ringR + 20}
            r={ringR}
            fill="none"
            stroke={`${B.white}22`}
            strokeWidth={4}
          />
          <circle
            cx={ringR + 20}
            cy={ringR + 20}
            r={ringR}
            fill="none"
            stroke={locked ? B.pink : B.teal}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${circ * progress} ${circ}`}
            transform={`rotate(-90 ${ringR + 20} ${ringR + 20})`}
            style={{ filter: `drop-shadow(0 0 10px ${locked ? B.pink : B.teal})` }}
          />
        </svg>
        <Spinner size={190} />
      </AbsoluteFill>

      {/* status text */}
      <div
        style={{
          position: "absolute",
          top: 1360,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          opacity: appear,
        }}
      >
        {!locked ? (
          <>
            <div style={{ fontFamily: mono, fontSize: 44, letterSpacing: 6, color: B.teal, textShadow: `0 0 12px ${B.teal}` }}>
              DECRYPTING HEDONISM.play
            </div>
            <div style={{ fontFamily: mono, fontSize: 96, color: B.white }}>
              {Math.floor(progress * 100)}%
            </div>
          </>
        ) : (
          <>
            <GlitchText
              text="ACCESS LOCKED"
              size={84}
              font={outfit}
              weight={900}
              color={B.pink}
              colorA={B.teal}
              colorB={B.orange}
              seed="lock"
              intensity={lockGlitch ? 1 : 0.15}
            />
            <div style={{ fontFamily: mono, fontSize: 40, letterSpacing: 6, color: B.dim }}>
              RELEASE DATE: CLASSIFIED
            </div>
          </>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: 360,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 36,
          letterSpacing: 10,
          color: B.dim,
          opacity: appear,
        }}
      >
        [ NEW EXPERIENCE DETECTED ]
      </div>

      <Flash value={Math.max(inFlash, outFlash, lockGlitch ? 0.25 : 0)} />
    </AbsoluteFill>
  );
};
