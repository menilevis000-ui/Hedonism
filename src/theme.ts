import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled in public/fonts so rendering works offline.
export const display = "Orbitron";
export const mono = "Share Tech Mono";
export const hebrew = "Heebo";

const HEBREW_RANGE = "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F";

loadFont({ family: display, url: staticFile("fonts/orbitron.woff2"), weight: "400 900" });
loadFont({ family: mono, url: staticFile("fonts/sharetechmono.woff2"), weight: "400" });
loadFont({ family: hebrew, url: staticFile("fonts/heebo-latin.woff2"), weight: "100 900" });
loadFont({
  family: hebrew,
  url: staticFile("fonts/heebo-hebrew.woff2"),
  weight: "100 900",
  unicodeRange: HEBREW_RANGE,
});

export const C = {
  bg: "#04010b",
  cyan: "#00f0ff",
  magenta: "#ff2bd6",
  violet: "#7a3cff",
  white: "#f4f8ff",
  dim: "rgba(160, 220, 255, 0.55)",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Scene lengths in frames
export const SCENES = {
  boot: 90,
  warp: 120,
  hud: 130,
  logo: 160,
  end: 100,
};
export const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0);
