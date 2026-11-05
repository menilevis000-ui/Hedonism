"""Synthesizes the teaser soundtrack (public/soundtrack.wav) so the repo needs no audio assets.

Run: python3 scripts/make_soundtrack.py
Timings match src/theme.ts SCENES at 30fps.
"""
import wave
import numpy as np

SR = 44100
DUR = 20.0
FPS = 30
t = np.arange(int(SR * DUR)) / SR
out = np.zeros((len(t), 2))
rng = np.random.default_rng(7)


def f2s(frame):
    return frame / FPS


def env(start, attack, decay, length=None):
    x = t - start
    e = np.where(x < 0, 0, np.where(x < attack, x / max(attack, 1e-6), np.exp(-np.clip(x - attack, 0, None) / decay)))
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
    f = (38 if deep else 50) + 140 * np.exp(-x * 28)
    phase = 2 * np.pi * np.cumsum(f) / SR
    e = env(start, 0.002, 0.9 if deep else 0.35)
    add(np.sin(phase) * e, gain=gain)


noise = rng.standard_normal(len(t))
dark_noise = lowpass(noise, 0.05)

# --- Drone bed across the whole piece
drone_env = np.clip(t / 2.5, 0, 1) * np.clip((DUR - t) / 1.5, 0, 1)
drone = (
    np.sin(2 * np.pi * 55 * t)
    + 0.5 * np.sin(2 * np.pi * 82.4 * t + np.sin(2 * np.pi * 0.2 * t))
    + 0.25 * np.sin(2 * np.pi * 110.3 * t)
)
add(drone * drone_env * 0.12)
add(dark_noise * drone_env * 0.15, pan=0.3)

# --- Boot: terminal blips
for i in range(6):
    s = f2s(6 + i * 9)
    add(np.sin(2 * np.pi * (1800 + i * 120) * t) * env(s, 0.001, 0.03, 0.08), pan=0.4, gain=0.18)
    add(np.sin(2 * np.pi * 2400 * t) * env(s + 0.06, 0.001, 0.02, 0.05), pan=-0.4, gain=0.12)
# progress buzz
s, e_ = f2s(60), f2s(82)
mask = (t >= s) & (t < e_)
f = np.where(mask, 200 + (t - s) / (e_ - s) * 1400, 0)
add(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * mask * 0.05)

# --- Scene cut impacts
cuts = [90, 210, 340]
for c in cuts:
    s = f2s(c)
    kick(s, 0.9, deep=True)
    add(lowpass(noise, 0.2) * env(s, 0.005, 0.5), gain=0.5)

# --- Warp: whoosh riser + pulsing bass (frames 90-210)
s, e_ = f2s(90), f2s(210)
m = (t >= s) & (t < e_)
prog = np.clip((t - s) / (e_ - s), 0, 1)
add(lowpass(noise, 0.08) * m * prog ** 2 * 0.6, pan=-0.2)
pulse = (np.sin(2 * np.pi * 4 * t) > 0) * 1.0
add(np.sin(2 * np.pi * 41 * t) * pulse * m * 0.35)
for b in np.arange(s, e_, 0.5):
    kick(b, 0.45)

# --- HUD: word stabs (frames 218, 248, 278, 308)
for i, fr in enumerate([218, 248, 278, 308]):
    st = f2s(fr)
    kick(st, 1.0)
    chord = [220, 261.6, 329.6] if i < 3 else [233.1, 293.7, 349.2, 466.2]
    stab = sum(np.sign(np.sin(2 * np.pi * fq * t)) for fq in chord) / len(chord)
    add(lowpass(stab * env(st, 0.005, 0.25, 0.9), 0.15), gain=0.35)
    add(noise * env(st, 0.001, 0.04), gain=0.15)
# hi-hat ticks during HUD
for b in np.arange(f2s(210), f2s(340), 0.125):
    add(noise * env(b, 0.0005, 0.012, 0.03), pan=0.5 if int(b * 8) % 2 else -0.5, gain=0.12)

# --- Logo: charge riser then massive impact at frame 380
impact = f2s(380)
s = f2s(340)
m = (t >= s) & (t < impact)
prog = np.clip((t - s) / (impact - s), 0, 1)
f = 120 + prog ** 3 * 1800
add(np.sin(2 * np.pi * np.cumsum(f * m) / SR) * m * prog * 0.25)
add(noise * m * prog ** 3 * 0.35)
kick(impact, 1.4, deep=True)
add(lowpass(noise, 0.3) * env(impact, 0.002, 1.2), gain=0.7)
add(np.sin(2 * np.pi * 30 * t) * env(impact, 0.01, 2.0), gain=0.6)
# shimmer pad after impact
pad = sum(np.sin(2 * np.pi * fq * t + i) for i, fq in enumerate([440, 554.4, 659.3, 880]))
pad_env = np.clip((t - impact) / 0.8, 0, 1) * np.clip((f2s(500) - t) / 0.6, 0, 1)
add(pad * pad_env * 0.05 * (1 + 0.3 * np.sin(2 * np.pi * 6 * t)), pan=0.2)

# --- End: soft ticks for countdown + final hit
for b in np.arange(f2s(500), f2s(585), 0.2):
    add(np.sin(2 * np.pi * 3000 * t) * env(b, 0.0005, 0.01, 0.03), gain=0.1)
kick(f2s(503), 0.6, deep=True)

# --- Simple stereo "reverb" via delays
for d, g in [(0.083, 0.3), (0.157, 0.22), (0.241, 0.15)]:
    n = int(d * SR)
    out[n:, 0] += out[:-n, 1] * g
    out[n:, 1] += out[:-n, 0] * g

out = np.tanh(out * 1.2)
out /= np.max(np.abs(out)) * 1.05
pcm = (out * 32767).astype(np.int16)
with wave.open("public/soundtrack.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote public/soundtrack.wav")
