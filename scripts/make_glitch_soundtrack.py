"""Synthesizes public/glitch-soundtrack.wav for the "Arrows Glitch" style.

Run: python3 scripts/make_glitch_soundtrack.py
Frame timings match GLITCH / HITS in src/arrows/Glitch.tsx at 30fps.
"""
import numpy as np
from synth import Track

TOTAL = 273
SIGNAL, LOCK, SCAN, DROP = 8, [14, 22, 30], (38, 80), 222
TEARS = [8, 9, 81, 82, 129, 150, 151, 198, 210, 216, 222, 223, 224, 226]
PAN = [-0.6, 0.6, -0.6]

T = Track(TOTAL, seed=9)
t, s, env, add = T.t, T.s, T.env, T.add
noise = T.noise


def crush(sig, steps=8, hold=6):
    """Bitcrush + sample-rate reduction."""
    q = np.round(sig * steps) / steps
    idx = (np.arange(len(q)) // hold) * hold
    return q[idx]


def blip(start, fq, pan=0.0, gain=0.08, length=0.05):
    add(np.sign(np.sin(2 * np.pi * fq * t)) * env(start, 0.001, length / 2, length), pan=pan, gain=gain)


def burst(start, gain=0.3, length=0.08):
    add(crush(noise, 4, 12) * env(start, 0.001, length / 2, length), gain=gain)


def hit(start, a, big=False):
    T.kick(start, 1.3 if big else 0.8, deep=big)
    stut = np.zeros_like(t)
    for k in range(3):  # stutter: three chopped repeats of a square chirp
        x = np.clip(t - start - k * 0.045, 0, None)
        stut += np.sign(np.sin(2 * np.pi * np.cumsum(900 * np.exp(-x * 20) + 120) / 44100)) * env(start + k * 0.045, 0.001, 0.015, 0.035)
    add(crush(stut, 6, 4), pan=PAN[a] if a is not None else 0, gain=0.22 if not big else 0.3)
    burst(start, 0.15 if not big else 0.4, 0.06 if not big else 0.3)


# static, then signal acquired
add(crush(noise, 3, 3) * (t < s(SIGNAL)), gain=0.25)
add(np.sin(2 * np.pi * 1000 * t) * env(s(SIGNAL), 0.001, 0.05, 0.1), gain=0.15)

# lock-on beeps
for a, fr in enumerate(LOCK):
    for k in range(3):
        blip(s(fr + k * 2), 1760 if k < 2 else 2637, PAN[a], 0.09, 0.04)

# hum bed (digital drone with slow bitcrush)
bed = np.clip((t - s(SIGNAL)) / 0.5, 0, 1) * np.clip((T.dur - t) / 0.6, 0, 1)
add(crush(np.sin(2 * np.pi * 55 * t) + 0.5 * np.sign(np.sin(2 * np.pi * 110.5 * t)), 10, 20) * bed, gain=0.07)

# scan beam: a sweeping tone over the scan
m = (t >= s(SCAN[0])) & (t < s(SCAN[1]))
p = np.clip((t - s(SCAN[0])) / (s(SCAN[1]) - s(SCAN[0])), 0, 1)
add(T.tone(400 + 1600 * p) * m * 0.6 + np.sin(2 * np.pi * 60 * t) * m, gain=0.08)
for fr in range(SCAN[0], SCAN[1], 3):
    blip(s(fr), 3000 + (fr % 7) * 300, (fr % 5 - 2) * 0.3, 0.03, 0.02)

# glitch hits (same pattern as HITS in Glitch.tsx)
pattern = [0, 1, 2, 1]
for n, fr in enumerate(range(84, 174, 15)):
    hit(s(fr), pattern[n % 4])
    burst(s(fr + 7.5), 0.06, 0.03)  # offbeat hat
for n, fr in enumerate(range(174, DROP - 3, 6)):
    hit(s(fr), n % 3)
T.riser(s(174), s(DROP), 0.5, top=3200)

# data chatter while packets run
for b in np.arange(s(80), T.dur - 0.6, 1 / 15):
    blip(b, 2000 + T.rng.random() * 3000, T.rng.random() - 0.5, 0.025, 0.012)

# tears
for fr in TEARS:
    burst(s(fr), 0.25, 0.05)

# drop
hit(s(DROP), None, big=True)
add(np.sin(2 * np.pi * 30 * t) * env(s(DROP), 0.01, 1.3), gain=0.55)
for fr in range(DROP + 15, TOTAL - 18, 15):
    hit(s(fr), None)

T.delays([(0.125, 0.2), (0.25, 0.12)])
T.write("public/glitch-soundtrack.wav", drive=1.3)
