import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { C, W, H, display, hebrew, mono, SCENES } from "../theme";
import { Flash, GlitchText } from "../fx";

const WORDS = [
  { en: "FEEL", he: "להרגיש" },
  { en: "DESIRE", he: "לרצות" },
  { en: "INDULGE", he: "להתמכר" },
  { en: "TRANSCEND", he: "להתעלות" },
];
const WORD_LEN = 30;
const WORD_START = 8;

const Ring: React.FC<{
  r: number;
  width: number;
  dash: string;
  speed: number;
  color: string;
  opacity?: number;
}> = ({ r, width, dash, speed, color, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <circle
      cx={0}
      cy={0}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash}
      opacity={opacity}
      transform={`rotate(${frame * speed})`}
      style={{ filter: `drop-shadow(0 0 8px ${color})` }}
    />
  );
};

const Readout: React.FC<{ label: string; seed: string; unit: string }> = ({
  label,
  seed,
  unit,
}) => {
  const frame = useCurrentFrame();
  const v = (random(`${seed}${Math.floor(frame / 3)}`) * 999).toFixed(1);
  return (
    <div style={{ fontFamily: mono, color: C.cyan, lineHeight: 1.2 }}>
      <div style={{ fontSize: 26, color: C.dim, letterSpacing: 4 }}>{label}</div>
      <div style={{ fontSize: 48, textShadow: `0 0 12px ${C.cyan}` }}>
        {v}
        <span style={{ fontSize: 26, color: C.magenta }}> {unit}</span>
      </div>
    </div>
  );
};

const Bars: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
      {new Array(18).fill(0).map((_, i) => {
        const h =
          20 +
          Math.abs(Math.sin(frame * 0.25 + i * 0.7)) * 70 +
          random(`bar${i}-${frame}`) * 30;
        return (
          <div
            key={i}
            style={{
              width: 12,
              height: h,
              background: `linear-gradient(0deg, ${C.violet}, ${C.magenta})`,
              boxShadow: `0 0 8px ${C.magenta}`,
            }}
          />
        );
      })}
    </div>
  );
};

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const boot = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.6)),
  });
  const inFlash = interpolate(frame, [0, 8], [1, 0], {
    extrapolateRight: "clamp",
  });
  const outFlash = interpolate(frame, [SCENES.hud - 5, SCENES.hud], [0, 1], {
    extrapolateLeft: "clamp",
  });

  const idx = Math.min(
    WORDS.length - 1,
    Math.max(0, Math.floor((frame - WORD_START) / WORD_LEN)),
  );
  const local = frame - WORD_START - idx * WORD_LEN;
  const punch = interpolate(local, [0, 5, 12], [1.8, 0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const wordOpacity = frame < WORD_START ? 0 : interpolate(local, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const word = WORDS[idx];
  const isLast = idx === WORDS.length - 1;

  // radar sweep angle
  const sweep = frame * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* hex grid backdrop */}
      <AbsoluteFill
        style={{
          opacity: 0.18,
          backgroundImage: `radial-gradient(${C.cyan} 1.5px, transparent 1.5px)`,
          backgroundSize: "36px 36px",
          backgroundPosition: `${frame * 0.5}px ${frame * 0.5}px`,
        }}
      />

      {/* central HUD rings */}
      <svg
        width={W}
        height={H}
        viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}
        style={{ position: "absolute", inset: 0, transform: `scale(${boot})` }}
      >
        <defs>
          <radialGradient id="core">
            <stop offset="0%" stopColor={C.magenta} stopOpacity="0.55" />
            <stop offset="60%" stopColor={C.violet} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.violet} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweep" x1="0" x2="1">
            <stop offset="0%" stopColor={C.cyan} stopOpacity="0" />
            <stop offset="100%" stopColor={C.cyan} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle r={430} fill="url(#core)" />
        <Ring r={460} width={2} dash="4 14" speed={0.4} color={C.cyan} opacity={0.7} />
        <Ring r={420} width={10} dash="180 40 30 40" speed={-1.2} color={C.cyan} />
        <Ring r={380} width={3} dash="600 200" speed={2.2} color={C.magenta} />
        <Ring r={345} width={24} dash="2 10" speed={-0.6} color={C.violet} opacity={0.8} />
        <Ring r={300} width={2} dash="60 20" speed={3} color={C.white} opacity={0.6} />
        <path
          d={`M0 0 L ${Math.cos(0) * 460} ${Math.sin(0) * 460} A 460 460 0 0 1 ${Math.cos(0.6) * 460} ${Math.sin(0.6) * 460} Z`}
          fill="url(#sweep)"
          transform={`rotate(${sweep})`}
        />
        {/* tick marks */}
        {new Array(72).fill(0).map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={-480}
            x2={0}
            y2={i % 6 === 0 ? -510 : -494}
            stroke={C.cyan}
            strokeWidth={i % 6 === 0 ? 3 : 1.5}
            opacity={0.7}
            transform={`rotate(${i * 5 - frame * 0.3})`}
          />
        ))}
      </svg>

      {/* corner readouts */}
      <div style={{ position: "absolute", left: 120, top: 110, opacity: boot }}>
        <Readout label="SEROTONIN FLUX" seed="ser" unit="μg" />
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 110, opacity: boot }}>
        <Readout label="HEART SYNC" seed="hr" unit="BPM" />
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 110,
          textAlign: "right",
          opacity: boot,
        }}
      >
        <Readout label="EUPHORIA INDEX" seed="eu" unit="Ψ" />
      </div>
      <div style={{ position: "absolute", right: 120, bottom: 110, opacity: boot }}>
        <Bars />
      </div>

      {/* the word */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 24,
          opacity: wordOpacity,
        }}
      >
        <div style={{ transform: `scale(${punch})` }}>
          <GlitchText
            key={word.en}
            text={word.en}
            size={isLast ? 150 : 180}
            seed={word.en}
            intensity={local < 8 ? 0.9 : 0.15}
            spacing={isLast ? 10 : 22}
          />
        </div>
        <div
          style={{
            fontFamily: hebrew,
            fontWeight: 700,
            fontSize: 64,
            color: C.magenta,
            direction: "rtl",
            textShadow: `0 0 24px ${C.magenta}`,
          }}
        >
          {word.he}
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 24,
            letterSpacing: 10,
            color: C.dim,
            marginTop: 10,
          }}
        >
          PROTOCOL 0{idx + 1} / 0{WORDS.length}
        </div>
      </AbsoluteFill>

      <Flash value={Math.max(inFlash, outFlash)} />
    </AbsoluteFill>
  );
};
