import { Easing, interpolate } from "remotion";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/montserrat/200.css";
import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/400.css";

export const SERIF = "'Cormorant Garamond', serif";
export const SANS = "'Montserrat', sans-serif";

export const GOLD_DARK = "#7a5a25";
export const GOLD = "#c9a35a";
export const GOLD_LIGHT = "#ecd7a0";
export const CHAMPAGNE = "#fff4d8";
export const INK = "#040406";

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

/** 0→1 progress between start and start+dur with easing */
export const prog = (
  frame: number,
  start: number,
  dur: number,
  easing: (t: number) => number = easeOut,
) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Gold metallic gradient whose specular highlight moves with `sweep` (0..1) */
export const goldGradient = (sweep: number) => ({
  backgroundImage: `linear-gradient(105deg, ${GOLD_DARK} 0%, ${GOLD} 22%, ${GOLD_LIGHT} 38%, ${CHAMPAGNE} 46%, ${GOLD_LIGHT} 54%, ${GOLD} 70%, ${GOLD_DARK} 100%)`,
  backgroundSize: "300% 100%",
  backgroundPosition: `${mix(100, 0, sweep)}% 50%`,
  WebkitBackgroundClip: "text" as const,
  backgroundClip: "text" as const,
  color: "transparent",
  WebkitTextFillColor: "transparent",
});
