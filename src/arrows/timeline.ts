import { ARROWS_TOTAL } from "./data";

/**
 * Timeline of the "Arrows Alive" clip, in output frames at 30fps.
 * scripts/make_arrows_soundtrack.py uses the same numbers; keep them in sync.
 */
export const FLICKERS = [8, 13, 15, 21, 24];
/** Frame each arrow ignites (top, middle, bottom). */
export const IGNITE = [30, 46, 62];
export const DROP = 222;

export type Beat = { f: number; arrows: number[]; big: boolean };

const build = (): Beat[] => {
  const beats: Beat[] = [];
  const pattern = [0, 1, 2, 1];
  let n = 0;
  // Groove: one arrow kicks every half second.
  for (let f = 84; f < 174; f += 15) beats.push({ f, arrows: [pattern[n++ % 4]], big: false });
  // Build-up: faster, cycling through the stack.
  n = 0;
  for (let f = 174; f < DROP - 4; f += 8) beats.push({ f, arrows: [n++ % 3], big: false });
  // Drop: everything at once, then an afterglow pulse.
  beats.push({ f: DROP, arrows: [0, 1, 2], big: true });
  for (let f = DROP + 15; f < ARROWS_TOTAL - 20; f += 15) {
    beats.push({ f, arrows: [0, 1, 2], big: false });
  }
  return beats;
};
export const BEATS = build();
