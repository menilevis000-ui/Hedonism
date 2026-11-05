# HEDONISM — Futuristic Teasers

Teaser videos built in code with [Remotion](https://remotion.dev).

## HEDONISM play: story teaser (main)
`renders/hedonism-play-teaser.mp4` is 16 seconds, vertical 1080×1920 for Instagram Stories and Reels, 30fps, with sound.

1. **Group logo** (0–3.3s): the four HEDONISM group tiles fly in from the corners and snap together with a shockwave. Then the wordmark appears: *HEDONISM group / Unlimited design*.
2. **GET READY TO PLAY.** (3.3–6.5s): each word slams in, in a brand colour, with a burst of squares and a game HUD (*PLAYER_01 // CONNECTED*, *PRESS START*).
3. **Locked logo** (6.5–11.5s): the HEDONISM play logo stays blurred behind code rain, a scan line, a segmented loader and a progress ring. "Decrypting" climbs to 99%, then *ACCESS LOCKED / RELEASE DATE: CLASSIFIED*.
4. **Finale** (11.5–16s): *When design meets experiences*, then **COMING SOON** slams in, with the group signature at the bottom.

Code: `src/play/`. The brand colours and scene lengths are in `src/play/brand.ts`, and the soundtrack comes from `scripts/make_play_soundtrack.py`.

## First draft: landscape teaser
`renders/hedonism-teaser.mp4` is 20 seconds at 1920×1080. Code: `src/scenes/`.

### Scenes
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
python3 scripts/make_play_soundtrack.py       # rebuild public/play-soundtrack.wav
npx remotion render HedonismPlayTeaser out/hedonism-play-teaser.mp4
npx remotion render HedonismTeaser out/hedonism-teaser.mp4
```
Scene lengths, colors and fonts are in `src/theme.ts`.
