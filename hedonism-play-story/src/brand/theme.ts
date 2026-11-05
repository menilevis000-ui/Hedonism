import { Easing, interpolate } from "remotion";
import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";

export const FONT = "'Montserrat', sans-serif";

// HEDONISM brand palette (sampled from the official story artwork)
export const PINK = "#f26fb5";
export const ORANGE = "#f7661f";
export const BLUE = "#9fcbef";
export const LIME = "#c6cc19";
export const TEAL = "#17d3c4";
export const TEAL_DEEP = "#0fb3a6";
export const INK = "#141414";
export const GREY = "#3c3c3c";
export const PAPER = "#f8f7f4";
export const BRAND = [PINK, ORANGE, BLUE, LIME];

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);

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
