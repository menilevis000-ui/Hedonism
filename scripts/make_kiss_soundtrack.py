"""Synthesizes public/kiss-soundtrack.wav for the "Blow Kiss" clip.

Run: python3 scripts/make_kiss_soundtrack.py
Frame timings match KISS in src/kiss/BlowKiss.tsx at 30fps.
"""
import numpy as np
from synth import Track

TOTAL = 168
EYE, PUCKER, RELEASE, STAMP, WINK = 22, (30, 46), 56, 96, 136

T = Track(TOTAL, seed=5)
t, s, env, add = T.t, T.s, T.env, T.add
hiss = T.noise - T.lowpass(T.noise, 0.25)  # bright noise


def bell(start, fq, pan=0.0, gain=0.07, decay=0.9):
    sig = np.sin(2 * np.pi * fq * t) + 0.3 * np.sin(2 * np.pi * fq * 2.0 * t) + 0.12 * np.sin(2 * np.pi * fq * 3.0 * t)
    add(sig * env(start, 0.004, decay), pan=pan, gain=gain)


# soft music box waltz bed: C - Am - F - G, one chord per bar of ~1.1s
bed = np.clip(t / 0.4, 0, 1) * np.clip((T.dur - t) / 0.6, 0, 1)
chords = [[261.63, 329.63, 392.0], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [261.63, 329.63, 392.0]]
beat = 0.37
for i in range(int(T.dur / beat)):
    ch = chords[(i // 3) % len(chords)]
    if i % 3 == 0:
        bell(i * beat, ch[0] / 2, 0, 0.06, 0.8)
    else:
        bell(i * beat, ch[1 + (i % 3) % 2] * 2, 0.25 * (1 if i % 2 else -1), 0.04, 0.5)
pad = sum(np.sin(2 * np.pi * fq * t + k) for k, fq in enumerate([261.63, 329.63, 392.0]))
add(pad * bed * (1 + 0.2 * np.sin(2 * np.pi * 4 * t)), gain=0.02)

# eye closes: twinkle
for k, fq in enumerate([1568, 2093, 2637]):
    bell(s(EYE) + k * 0.05, fq, 0.3, 0.035, 0.4)

# pucker: rising "mmm" hum
m = (t >= s(PUCKER[0])) & (t < s(RELEASE))
p = np.clip((t - s(PUCKER[0])) / (s(RELEASE) - s(PUCKER[0])), 0, 1)
hum = T.tone(220 + 90 * p) + 0.5 * T.tone(440 + 180 * p)
add(T.lowpass(hum, 0.08) * m * np.sin(np.pi * np.clip(p * 1.05, 0, 1)), gain=0.12)

# the kiss: suction squeak + smack pop
x = np.clip(t - s(RELEASE), 0, None)
add(T.tone(2600 - 1400 * np.clip(x / 0.08, 0, 1)) * env(s(RELEASE) - 0.06, 0.03, 0.03, 0.12), gain=0.06)
add(hiss * env(s(RELEASE), 0.001, 0.012, 0.05), gain=0.6)
add(T.tone(900 * np.exp(-x * 40) + 150) * env(s(RELEASE), 0.001, 0.03, 0.12), gain=0.35)

# flight: airy whoosh that swells toward the camera + sparkle arpeggio
m = (t >= s(RELEASE)) & (t < s(STAMP))
p = np.clip((t - s(RELEASE)) / (s(STAMP) - s(RELEASE)), 0, 1)
add(T.lowpass(T.noise, 0.05 + 0.3 * 0) * m * p ** 2, gain=0.6)
for k in range(8):
    bell(s(RELEASE) + 0.15 + k * 0.15, [1046.5, 1318.5, 1568, 2093][k % 4] * (1 + k // 4), (k % 3 - 1) * 0.5, 0.04, 0.35)

# stamp on the lens: soft thump + glassy boing + chord bloom
T.kick(s(STAMP), 0.9)
x = np.clip(t - s(STAMP), 0, None)
add(T.tone(330 + 120 * np.sin(2 * np.pi * 7 * x) * np.exp(-x * 4)) * env(s(STAMP), 0.002, 0.35), gain=0.12)
add(hiss * env(s(STAMP), 0.001, 0.02, 0.06), gain=0.35)
for k, fq in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.5]):
    bell(s(STAMP) + k * 0.04, fq, (k - 2) * 0.3, 0.06, 1.4)

# wink: tiny "ding"
bell(s(WINK + 3), 2637, 0.4, 0.06, 0.5)

T.delays([(0.17, 0.25), (0.33, 0.15)])
T.write("public/kiss-soundtrack.wav", drive=2.2, fade=0.5)
