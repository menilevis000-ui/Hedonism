# HEDONISM — Futuristic Teaser

A 20-second teaser video (1920×1080, 30fps) built in code with [Remotion](https://remotion.dev).

The finished video is in `renders/hedonism-teaser.mp4`.

## Scenes
1. **Boot** (0–3s): a neural OS boots with a terminal readout and a "LOADING DESIRE" bar.
2. **Warp** (3–7s): hyperspace streaks over a neon grid: *THE FUTURE OF PLEASURE / העתיד של ההנאה*.
3. **HUD** (7–11.3s): spinning holographic rings, live biometric readouts, and the words FEEL → DESIRE → INDULGE → TRANSCEND, each in Hebrew too.
4. **Logo** (11.3–16.7s): energy charges up, a shockwave hits, then the glitch reveal of **HEDONISM**: *EXPERIENCE BEYOND HUMAN*.
5. **End** (16.7–20s): COMING SOON / בקרוב with a countdown.

Film grain, CRT scanlines and a vignette run over the whole video. The soundtrack is generated from code: drone, kicks, risers and impacts.

## Commands
```bash
npm i
npm run dev                                   # Remotion Studio preview
python3 scripts/make_soundtrack.py            # rebuild public/soundtrack.wav
npx remotion render HedonismTeaser out/hedonism-teaser.mp4
```
Scene lengths, colors and fonts are in `src/theme.ts`.
