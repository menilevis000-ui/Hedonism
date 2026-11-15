# HEDONISM — Futuristic Teasers

Teaser videos built in code with [Remotion](https://remotion.dev).

## Blow Kiss (the illustrated woman panel)
`renders/blow-kiss.mp4` is 5.6 seconds, vertical 1080×1920, 30fps, with sound. The 50fps phone clip plays at 0.6× (one source frame per output frame), then holds on its last frame. The panel is tracked with one homography per frame, so the drawing sits on her face as the camera pans.

1. She closes her eye and blushes, lipstick appears on her lips, and they pucker. Little hearts float up.
2. *Mwah*: her lips squeeze and pop, and a lipstick kiss flies out at the camera, growing, spinning and trailing sparkles.
3. The kiss lands on the "lens" with a bounce, a ring of hearts and a flash. Her lips relax, she opens her eye, and then she winks.

To redraw her eye and lips, the script first erases the original line art there with OpenCV inpainting, into a "clean plate".

Code: `src/kiss/BlowKiss.tsx`. The timeline is in `KISS` at the top of that file.

```bash
ffmpeg -i IMG.mov -vf "scale=1080:1920,format=yuv420p" -c:v libx264 -crf 16 -an -r 50 public/kiss/footage50.mp4
python3 scripts/track_kiss.py            # tracking + clean plate (public/kiss/clean.mp4)
ffmpeg -i public/kiss/footage50.mp4 -vf "setpts=PTS*50/30" -r 30 -c:v libx264 -crf 16 -pix_fmt yuv420p public/kiss/footage.mp4
ffmpeg -i public/kiss/clean.mp4 -vf "setpts=PTS*50/30" -r 30 -c:v libx264 -crf 16 -pix_fmt yuv420p public/kiss/clean30.mp4
python3 scripts/make_kiss_soundtrack.py
npx remotion render BlowKiss out/blow-kiss.mp4
```

## Arrows Alive (constellation arrows installation)
`renders/arrows-alive.mp4` is 9.1 seconds, vertical 1080×1920, 30fps, with sound. It uses real footage of the three-arrow installation. The footage is slowed to 0.75× with motion interpolation, and each arrow is tracked in 3D, so every effect stays stuck to the real arrows as the camera moves.

1. **Dormant** (0–1s): the room is dimmed and the arrows' neon edges flicker like a tube light warming up.
2. **Ignition** (1–2.7s): one arrow at a time, a neon outline draws around it. Its constellation lines light up from tail to tip, every star flares, and a shockwave hits.
3. **Alive** (2.7–5.8s): the arrows kick forward on the beat in the direction they point. Each kick throws a holographic copy of the arrow, rippling outlines and sparks off the arrowhead. Energy pulses keep flowing along the constellation lines toward each tip.
4. **Build and drop** (5.8–9.1s): the kicks speed up and light rays rise behind the stack. Then all three arrows fire together with a flash and a big shockwave, and the clip ends in an afterglow.

In the soundtrack, each arrow's hits are panned the way it points: the top and bottom arrows to the left, the middle one to the right.

Code: `src/arrows/`. The timeline is in `src/arrows/timeline.ts`.

```bash
# 1. footage: rotate/scale the phone clip, then make the 0.75x slow-mo
ffmpeg -i IMG_5240.mov -vf "scale=1080:1920,fps=30,format=yuv420p" -c:v libx264 -crf 18 -an public/arrows/footage.mp4
ffmpeg -i public/arrows/footage.mp4 -vf "minterpolate=fps=40:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,setpts=PTS*4/3,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p public/arrows/footage-slow.mp4
# 2. tracking + artwork extraction (needs opencv-python-headless)
python3 scripts/track_arrows.py
# 3. sound + render
python3 scripts/make_arrows_soundtrack.py
npx remotion render ArrowsAlive out/arrows-alive.mp4
```

### Two more styles (same footage, same tracking)
**Cosmos**: `renders/arrows-cosmos.mp4`, code in `src/arrows/Cosmos.tsx`. Dreamy and slow.
1. A single star wakes up. Then a glowing portal opens behind the stack and the whole room dissolves into deep space, with a nebula, a starfield that moves with the camera, shooting stars and drifting dust.
2. The constellations draw themselves onto the arrows. The arrows lift off and float apart, each in its own drift, joined by threads of light between their stars.
3. The arrows lock back together with a soft pulse and a ring of light.

**Glitch**: `renders/arrows-glitch.mp4`, code in `src/arrows/Glitch.tsx`. Cyber and aggressive.
1. TV static, then the signal is acquired. A tracking HUD locks onto each arrow, with live coordinates.
2. A scan laser sweeps down. The arrows it passes turn from grey to full colour, with a perspective grid printed on their faces.
3. On the beat, the arrows glitch: slice tears, RGB split and stutter jumps in the direction they point. Data packets race along the constellations toward each tip.
4. The drop: an inverted flash and full-frame tears, then *ARROWS ONLINE 3/3*.

```bash
python3 scripts/make_cosmos_soundtrack.py
python3 scripts/make_glitch_soundtrack.py
npx remotion render ArrowsCosmos out/arrows-cosmos.mp4
npx remotion render ArrowsGlitch out/arrows-glitch.mp4
```

## HEDONISM play: story teaser
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
