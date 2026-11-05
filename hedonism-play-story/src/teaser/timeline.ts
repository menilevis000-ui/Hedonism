import { Easing } from "remotion";

export const FPS = 30;
export const DURATION = 300; // 10 s

export const F_LAND = 92; // first dice impact
export const F_BOARD = 96; // board world starts emerging
export const F_PIECES = 122;
export const F_CITY = 160;
export const F_CONVERGE = 202;
export const F_LOGO = 234;
export const F_PLAY = 240;
export const F_SOON = 262;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eo = Easing.bezier(0.16, 1, 0.3, 1);
const eio = Easing.bezier(0.65, 0, 0.35, 1);
const ei = Easing.bezier(0.7, 0, 0.84, 0);
export const easeOut = (t: number) => eo(clamp01(t));
export const easeInOut = (t: number) => eio(clamp01(t));
export const easeIn = (t: number) => ei(clamp01(t));
export const span = (f: number, a: number, d: number) => clamp01((f - a) / d);
export const backOut = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  const x = clamp01(t);
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/* Slow-motion time remap: physics seconds elapsed at a given frame */
const speedAt = (f: number) => {
  const k: [number, number][] = [[0, 1.7], [10, 1.4], [22, 0.17], [70, 0.17], [86, 1], [400, 1]];
  for (let i = 0; i < k.length - 1; i++) {
    const [f0, s0] = k[i], [f1, s1] = k[i + 1];
    if (f <= f1) return lerp(s0, s1, easeInOut((f - f0) / (f1 - f0)));
  }
  return 1;
};
const TAU: number[] = [0];
for (let f = 1; f <= 400; f++) TAU[f] = TAU[f - 1] + (speedAt(f - 1) + speedAt(f)) / 2 / FPS;
export const physTime = (f: number) => {
  const i = Math.max(0, Math.min(399, Math.floor(f)));
  return lerp(TAU[i], TAU[i + 1], f - i);
};
