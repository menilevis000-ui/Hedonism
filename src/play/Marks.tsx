import React from "react";
import { B } from "./brand";

/** One tile of the HEDONISM group mark: a coloured square with a black geometric glyph. */
export const GroupTile: React.FC<{ index: 0 | 1 | 2 | 3; size: number }> = ({
  index,
  size,
}) => {
  const colors = [B.pink, B.orange, B.blue, B.lime];
  const ink = B.ink;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <rect width="100" height="100" fill={colors[index]} />
      {index === 0 ? (
        <>
          <path d="M52 44 A16 16 0 0 0 52 76 Z" fill={ink} />
          <rect x="56" y="28" width="9" height="48" fill={ink} />
        </>
      ) : null}
      {index === 1 ? (
        <>
          <path d="M50 30 A20 20 0 0 0 50 70 Z" fill={ink} />
          <path d="M54 38 A12 12 0 0 1 54 62 Z" fill="#ffffff" />
        </>
      ) : null}
      {index === 2 ? (
        <>
          <path d="M50 34 A18 18 0 0 0 50 70 Z" fill={ink} />
          <rect x="54" y="34" width="10" height="36" fill={ink} />
        </>
      ) : null}
      {index === 3 ? (
        <>
          <rect x="38" y="26" width="10" height="48" fill={ink} />
          <path d="M48 52 L66 74 L48 74 Z" fill={ink} />
        </>
      ) : null}
    </svg>
  );
};

/** HEDONISM play mark: teal square with a "P" made of a white bar and a black half-disc. */
export const PlayMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
    <rect width="100" height="100" fill={B.teal} />
    <rect x="28" y="22" width="14" height="58" fill="#ffffff" />
    <path d="M42 22 A19 19 0 0 1 42 60 Z" fill={B.ink} />
  </svg>
);
