import React from "react";
import { useCurrentFrame } from "remotion";
import { prog, easeInOut } from "./theme";

/** HEDONISM PLAY emblem: gold ring with a play glyph, drawn on */
export const Emblem: React.FC<{
  size: number;
  start: number;
  id: string;
}> = ({ size, start, id }) => {
  const frame = useCurrentFrame();
  const ring = prog(frame, start, 38, easeInOut);
  const inner = prog(frame, start + 8, 40, easeInOut);
  const tri = prog(frame, start + 16, 34, easeInOut);
  const fill = prog(frame, start + 38, 24);
  const C = 2 * Math.PI * 90;
  const Ci = 2 * Math.PI * 76;
  const triLen = 200;
  const orbit = ((frame - start) * 2.4) % 360;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{
        overflow: "visible",
        filter: `drop-shadow(0 0 ${10 + pulse * 10}px rgba(236,200,130,${0.35 + fill * 0.35}))`,
      }}
    >
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7a5a25" />
          <stop offset="35%" stopColor="#ecd7a0" />
          <stop offset="50%" stopColor="#fff4d8" />
          <stop offset="65%" stopColor="#c9a35a" />
          <stop offset="100%" stopColor="#6b4e1f" />
        </linearGradient>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke={`url(#g${id})`}
        strokeWidth="2.2"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - ring)}
        transform="rotate(-90 100 100)"
      />
      <circle
        cx="100"
        cy="100"
        r="76"
        fill="none"
        stroke={`url(#g${id})`}
        strokeWidth="0.7"
        opacity={0.6}
        strokeDasharray={Ci}
        strokeDashoffset={-Ci * (1 - inner)}
        transform="rotate(90 100 100)"
      />
      <path
        d="M84 66 L136 100 L84 134 Z"
        fill={`url(#g${id})`}
        fillOpacity={fill * 0.9}
        stroke={`url(#g${id})`}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray={triLen}
        strokeDashoffset={triLen * (1 - tri)}
      />
      {/* orbiting spark */}
      <g transform={`rotate(${orbit - 90} 100 100)`} opacity={ring}>
        <circle cx="190" cy="100" r="3" fill="#fff6e0" />
        <circle cx="190" cy="100" r="9" fill="#ffe7b0" opacity={0.35} />
      </g>
    </svg>
  );
};
