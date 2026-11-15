"""Synthesizes public/cosmos-soundtrack.wav for the "Arrows Cosmos" style.

Run: python3 scripts/make_cosmos_soundtrack.py
Frame timings match COSMOS in src/arrows/Cosmos.tsx at 30fps.
"""
import numpy as np
from synth import Track

TOTAL = 273
WAKE, PORTAL, DRAW, LIFT, BRIDGES, REUNITE = 6, (18, 84), [28, 42, 56], (84, 124), 132, (200, 228)
SHOOTING = [102, 150, 186, 246]

T = Track(TOTAL, seed=3)
t, s, env, add = T.t, T.s, T.env, T.add
air = T.lowpass(T.noise, 0.02)
soft = T.lowpass(T.noise, 0.12)


def chime(start, fq, pan=0.0, gain=0.07, decay=1.2):
    sig = np.sin(2 * np.pi * fq * t) + 0.35 * np.sin(2 * np.pi * fq * 2.76 * t) + 0.2 * np.sin(2 * np.pi * fq * 5.4 * t)
    add(sig * env(start, 0.003, decay), pan=pan, gain=gain)


# first star wakes up: a single high bell
chime(s(WAKE), 1567.98, 0.0, 0.1, 2.0)

# portal: reverse swell of air + rising sweep, then a deep bloom
m = (t >= s(PORTAL[0])) & (t < s(PORTAL[1]))
p = np.clip((t - s(PORTAL[0])) / (s(PORTAL[1]) - s(PORTAL[0])), 0, 1)
add(air * m * p ** 2, gain=0.9)
add(T.tone(80 + p * 300) * m * p ** 2, gain=0.08)
T.kick(s(PORTAL[1]), 0.9, deep=True)
add(soft * env(s(PORTAL[1]), 0.01, 1.2), gain=0.35)

# constellations draw: arpeggios of glassy bells, one per arrow (panned like the arrows)
scale = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51]
pans = [-0.5, 0.5, -0.5]
for a, fr in enumerate(DRAW):
    for k in range(6):
        chime(s(fr + k * 6), scale[(k + a * 2) % 6] * (1 if a != 1 else 1.5), pans[a], 0.05, 0.9)

# space pad from the portal on: Dmaj9-ish, slowly breathing
pad_env = np.clip((t - s(PORTAL[0] + 20)) / 1.5, 0, 1) * np.clip((T.dur - t) / 0.8, 0, 1)
for i, fq in enumerate([146.83, 220.0, 277.18, 329.63, 440.0]):
    add(np.sin(2 * np.pi * fq * t + i) * (1 + 0.3 * np.sin(2 * np.pi * 0.2 * t + i)), pan=(i - 2) * 0.25, gain=0.035 * pad_env)
add(np.sin(2 * np.pi * 73.4 * t) * pad_env, gain=0.08)
add(air * pad_env * (0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * t)), gain=0.3)

# lift off: soft whoosh up
m = (t >= s(LIFT[0])) & (t < s(LIFT[1]))
p = np.clip((t - s(LIFT[0])) / (s(LIFT[1]) - s(LIFT[0])), 0, 1)
add(soft * m * np.sin(np.pi * p), gain=0.35)

# bridges: a sparkle for each thread that connects
for n in range(8):
    chime(s(BRIDGES + n * 6 + 10), [1318.51, 1567.98, 1760.0, 1975.53][n % 4], (n % 3 - 1) * 0.6, 0.04, 0.6)

# shooting stars: falling whistles
for fr in SHOOTING:
    x = np.clip(t - s(fr), 0, None)
    add(T.tone(3200 * np.exp(-x * 3) + 400) * env(s(fr), 0.05, 0.25, 0.7), pan=-0.3, gain=0.03)

# reunite: swell, then a warm lock-in hit
T.riser(s(REUNITE[0]), s(REUNITE[1]), 0.25, top=900)
T.kick(s(REUNITE[1]), 1.2, deep=True)
add(soft * env(s(REUNITE[1]), 0.002, 0.9), gain=0.4)
for i, fq in enumerate([293.66, 369.99, 440.0, 587.33, 739.99]):
    chime(s(REUNITE[1]) + i * 0.03, fq, (i - 2) * 0.3, 0.07, 1.8)

T.delays([(0.19, 0.3), (0.37, 0.22), (0.61, 0.15), (0.89, 0.1)])
T.write("public/cosmos-soundtrack.wav", drive=1.0, fade=0.8)
