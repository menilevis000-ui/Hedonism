"""Synthesizes public/play-soundtrack.wav for the HEDONISM play story teaser.

Run: python3 scripts/make_play_soundtrack.py
Frame timings match src/play/brand.ts PLAY_SCENES at 30fps.
"""
import wave
import numpy as np

SR = 44100
FPS = 30
DUR = 480 / FPS
t = np.arange(int(SR * DUR)) / SR
out = np.zeros((len(t), 2))
rng = np.random.default_rng(11)
noise = rng.standard_normal(len(t))


def s(frame):
    return frame / FPS


def env(start, attack, decay, length=None):
    x = t - start
    e = np.where(
        x < 0, 0, np.where(x < attack, x / max(attack, 1e-6), np.exp(-np.clip(x - attack, 0, None) / decay))
    )
    if length is not None:
        e = e * (x < length)
    return e


def add(sig, pan=0.0, gain=1.0):
    out[:, 0] += sig * gain * (1 - max(pan, 0))
    out[:, 1] += sig * gain * (1 + min(pan, 0))


def lowpass(x, alpha):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha * (x[i] - acc)
        y[i] = acc
    return y


def kick(start, gain=1.0, deep=False):
    x = np.clip(t - start, 0, None)
    f = (36 if deep else 52) + 150 * np.exp(-x * 30)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(start, 0.002, 1.0 if deep else 0.3), gain=gain)


def riser(a, b, gain=0.4):
    m = (t >= a) & (t < b)
    p = np.clip((t - a) / (b - a), 0, 1)
    f = 150 + p ** 3 * 2200
    add(np.sin(2 * np.pi * np.cumsum(f * m) / SR) * m * p * gain * 0.6)
    add(noise * m * p ** 3 * gain)


def stab(start, freqs, gain=0.3, length=0.5):
    sq = sum(np.sign(np.sin(2 * np.pi * fq * t)) for fq in freqs) / len(freqs)
    add(lowpass(sq * env(start, 0.004, 0.2, length), 0.18), gain=gain)


soft_noise = lowpass(noise, 0.2)

# bed: sub drone + slow filtered air
bed = np.clip(t / 1.5, 0, 1) * np.clip((DUR - t) / 0.6, 0, 1)
add((np.sin(2 * np.pi * 49 * t) + 0.4 * np.sin(2 * np.pi * 73.4 * t)) * bed * 0.1)
add(lowpass(noise, 0.04) * bed * 0.2, pan=0.25)

# 1) tiles fly in and snap (frame 34)
riser(0, s(34), 0.35)
kick(s(34), 1.3, deep=True)
add(soft_noise * env(s(34), 0.002, 0.6), gain=0.5)
stab(s(34), [196, 246.9, 293.7, 392], 0.25, 1.2)
# wordmark shimmer
for i, fq in enumerate([1318, 1568, 1976, 2637]):
    add(np.sin(2 * np.pi * fq * t) * env(s(52 + i * 4), 0.002, 0.25), pan=0.5 - i * 0.3, gain=0.07)
riser(s(88), s(100), 0.3)

# 2) GET / READY / TO / PLAY. slams
chords = [[220, 277.2, 329.6], [246.9, 311.1, 370], [277.2, 349.2, 415.3], [293.7, 370, 440, 587.3]]
for i, fr in enumerate([106, 119, 132, 145]):
    kick(s(fr), 1.1)
    add(noise * env(s(fr), 0.001, 0.05), gain=0.2)
    stab(s(fr), chords[i], 0.32, 0.4)
# arcade "start" blips
for i, b in enumerate(np.arange(s(165), s(192), s(8))):
    add(np.sign(np.sin(2 * np.pi * (880 if i % 2 else 1320) * t)) * env(b, 0.001, 0.04, 0.1), gain=0.06)
riser(s(185), s(195), 0.3)

# 3) decrypt: cut hit, ticking + data chatter, then LOCK at 307
kick(s(195), 1.0, deep=True)
for b in np.arange(s(195), s(307), 1 / 15):
    add(np.sin(2 * np.pi * (2200 + rng.random() * 1800) * t) * env(b, 0.0005, 0.008, 0.03),
        pan=rng.random() - 0.5, gain=0.07)
for b in np.arange(s(195), s(307), 0.5):
    kick(b, 0.4)
m = (t >= s(200)) & (t < s(307))
p = np.clip((t - s(200)) / (s(307) - s(200)), 0, 1)
add(np.sin(2 * np.pi * (300 + 500 * p) * t) * m * 0.04)
lock = s(307)
kick(lock, 1.2, deep=True)
add(np.sign(np.sin(2 * np.pi * 110 * t)) * env(lock, 0.002, 0.15, 0.5), gain=0.25)
add(np.sign(np.sin(2 * np.pi * 116.5 * t)) * env(lock, 0.002, 0.15, 0.5), gain=0.2)
add(soft_noise * env(lock, 0.002, 0.3), gain=0.4)
riser(s(325), s(345), 0.35)

# 4) tagline pad, then COMING SOON slam (frame 403)
pad_env = np.clip((t - s(345)) / 0.4, 0, 1) * np.clip((DUR - t) / 0.8, 0, 1)
pad = sum(np.sin(2 * np.pi * fq * t + i) for i, fq in enumerate([293.7, 370, 440, 554.4]))
add(pad * pad_env * 0.045 * (1 + 0.3 * np.sin(2 * np.pi * 5 * t)), pan=-0.2)
for i, fr in enumerate([351, 360, 369, 378]):
    add(np.sin(2 * np.pi * [587.3, 740, 880, 1108.7][i] * t) * env(s(fr), 0.003, 0.3), gain=0.08)
riser(s(385), s(403), 0.45)
slam = s(403)
kick(slam, 1.5, deep=True)
add(soft_noise * env(slam, 0.002, 1.3), gain=0.6)
add(np.sin(2 * np.pi * 30 * t) * env(slam, 0.01, 1.8), gain=0.5)
stab(slam, [146.8, 220, 293.7, 370], 0.3, 2.0)

# stereo delays for space
for d, g in [(0.09, 0.28), (0.17, 0.2), (0.26, 0.13)]:
    n = int(d * SR)
    out[n:, 0] += out[:-n, 1] * g
    out[n:, 1] += out[:-n, 0] * g

out = np.tanh(out * 1.2)
out /= np.max(np.abs(out)) * 1.05
with wave.open("public/play-soundtrack.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("wrote public/play-soundtrack.wav")
