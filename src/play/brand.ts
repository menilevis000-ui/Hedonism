import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const outfit = "Outfit";
loadFont({ family: outfit, url: staticFile("fonts/outfit.woff2"), weight: "200 900" });

// HEDONISM group / HEDONISM play brand palette
export const B = {
  bg: "#06060b",
  pink: "#f25ca2",
  orange: "#f26b2a",
  blue: "#9cc9f0",
  lime: "#c4d82e",
  teal: "#2bd1c6",
  ink: "#141414",
  white: "#f5f6fa",
  dim: "rgba(235, 240, 255, 0.55)",
};

export const PW = 1080;
export const PH = 1920;

export const PLAY_SCENES = {
  assemble: 100,
  ready: 95,
  decrypt: 150,
  finale: 135,
};
export const PLAY_TOTAL = Object.values(PLAY_SCENES).reduce((a, b) => a + b, 0);
