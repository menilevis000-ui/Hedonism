import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, mono, hebrew } from "../theme";
import { Flash } from "../fx";

const LINES: { k: string; v: string; ok?: boolean }[] = [
  { k: "HEDONISM_OS v9.7 // COLD BOOT", v: "" },
  { k: "NEURAL LINK", v: "SYNCED", ok: true },
  { k: "SENSORY CORE", v: "ONLINE", ok: true },
  { k: "DOPAMINE REACTOR", v: "847%", ok: true },
  { k: "PLEASURE MATRIX", v: "CALIBRATING" },
  { k: "ETHICAL LIMITERS", v: "DISABLED" },
];

const LINE_START = 6;
const LINE_GAP = 9;

export const Boot: React.FC = () => {
  const frame = useCurrentFrame();
  const progressStart = LINE_START + LINES.length * LINE_GAP;
  const progress = interpolate(frame, [progressStart, 82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash = interpolate(frame, [82, 86, 90], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flicker = random(`bootflick${frame}`) > 0.93 ? 0.6 : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, opacity: flicker }}>
      <AbsoluteFill
        style={{
          padding: "140px 200px",
          fontFamily: mono,
          fontSize: 46,
          color: C.cyan,
          textShadow: `0 0 14px ${C.cyan}`,
          gap: 18,
        }}
      >
        {LINES.map((l, i) => {
          const start = LINE_START + i * LINE_GAP;
          if (frame < start) return null;
          const full = l.v
            ? `> ${l.k} ${".".repeat(Math.max(3, 26 - l.k.length))} `
            : `> ${l.k}`;
          const typed = Math.min(full.length, Math.floor((frame - start) * 5));
          const showVal = typed >= full.length && l.v;
          const isLast = i === LINES.length - 1;
          const valColor = l.ok ? C.cyan : isLast ? C.magenta : "#ffe36e";
          return (
            <div key={l.k} style={{ whiteSpace: "pre" }}>
              {full.slice(0, typed)}
              {showVal ? (
                <span
                  style={{
                    color: valColor,
                    textShadow: `0 0 18px ${valColor}`,
                  }}
                >
                  {l.v}
                </span>
              ) : null}
            </div>
          );
        })}

        {frame >= progressStart ? (
          <div style={{ marginTop: 40 }}>
            <div
              style={{
                width: 1100,
                height: 26,
                border: `2px solid ${C.cyan}`,
                padding: 4,
                boxShadow: `0 0 20px ${C.cyan}55`,
              }}
            >
              <div
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.violet}, ${C.cyan}, ${C.magenta})`,
                }}
              />
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 40 }}>
              <span>LOADING DESIRE // {Math.round(progress * 100)}%</span>
              <span
                style={{
                  fontFamily: hebrew,
                  fontWeight: 300,
                  color: C.dim,
                  direction: "rtl",
                }}
              >
                טוען תשוקה
              </span>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <Flash value={flash} />
    </AbsoluteFill>
  );
};
