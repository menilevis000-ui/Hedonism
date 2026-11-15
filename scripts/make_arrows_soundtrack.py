"""Synthesizes public/arrows-soundtrack.wav for the "Arrows Alive" clip.

Run: python3 scripts/make_arrows_soundtrack.py
Frame timings match src/arrows/timeline.ts at 30fps. Each arrow's hits are panned
the way it points: the top and bottom arrows to the left, the middle one to the right.
"""
import wave
import numpy as np

SR = 44100
FPS = 30
TOTAL = 273  # ARROWS_TOTAL in src/arrows/data.ts
DUR = TOTAL / FPS
t = np.arange(int(SR * DUR)) / SR
out = np.zeros((len(t), 2))
rng = np.random.default_rng(7)
noise = rng.standard_normal(len(t))

FLICKERS = [8, 13, 15, 21, 24]
IGNITE = [30, 46, 62]
DROP = 222
PAN = [-0.6, 0.6, -0.6]


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


soft_noise = lowpass(noise, 0.15)
air = lowpass(noise, 0.03)


def kick(start, gain=1.0, deep=False):
    x = np.clip(t - start, 0, None)
    f = (34 if deep else 50) + 160 * np.exp(-x * 28)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(start, 0.002, 0.9 if deep else 0.28), gain=gain)


def zap(start, pan, gain=0.3, up=False):
    """Laser-ish pitch sweep: the sound of an arrow firing."""
    x = np.clip(t - start, 0, None)
    f = 300 + 2400 * (1 - np.exp(-x * 18)) if up else 2600 * np.exp(-x * 14) + 180
    sig = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 0.5) / SR)
    add(sig * env(start, 0.002, 0.12, 0.4), pan=pan, gain=gain)


def whoosh(start, pan, gain=0.35, length=0.45):
    e = env(start, 0.06, length / 3, length)
    add(soft_noise * e, pan=pan, gain=gain)


def riser(a, b, gain=0.4):
    m = (t >= a) & (t < b)
    p = np.clip((t - a) / (b - a), 0, 1)
    f = 120 + p ** 3 * 2400
    add(np.sin(2 * np.pi * np.cumsum(f * m) / SR) * m * p * gain * 0.5)
    add(noise * m * p ** 3 * gain * 0.6)


def chime(start, fq, pan, gain=0.08):
    add((np.sin(2 * np.pi * fq * t) + 0.3 * np.sin(2 * np.pi * fq * 2.01 * t)) * env(start, 0.002, 0.5), pan=pan, gain=gain)


# --- dormant: mains hum + flickering neon buzz
hum = 0.5 * np.sin(2 * np.pi * 50 * t) + 0.3 * np.sign(np.sin(2 * np.pi * 100 * t))
hum_env = np.clip(t / 0.3, 0, 1) * np.clip((DUR - t) / 0.8, 0, 1)
add(lowpass(hum, 0.1) * hum_env, gain=0.05)
for fr in FLICKERS:
    add(np.sign(np.sin(2 * np.pi * 120 * t)) * env(s(fr), 0.001, 0.03, 0.07), gain=0.18)
    add(noise * env(s(fr), 0.001, 0.015, 0.05), gain=0.12)
riser(s(4), s(IGNITE[0]), 0.3)

# --- ignition: each arrow powers on with a boom, a rising zap and a chord tone
chord = [220, 277.2, 329.6]
for a, fr in enumerate(IGNITE):
    kick(s(fr), 1.1, deep=True)
    zap(s(fr), PAN[a], 0.22, up=True)
    whoosh(s(fr), PAN[a], 0.35, 0.6)
    pad = sum(np.sin(2 * np.pi * fq * t + i) for i, fq in enumerate([chord[a], chord[a] * 1.5]))
    add(pad * env(s(fr), 0.02, 1.2), pan=PAN[a] * 0.5, gain=0.06)

# --- bed: sub drone + slow pad from the third ignition on
bed = np.clip((t - s(62)) / 1.0, 0, 1) * np.clip((DUR - t) / 0.7, 0, 1)
add((np.sin(2 * np.pi * 55 * t) + 0.4 * np.sin(2 * np.pi * 82.4 * t)) * bed, gain=0.09)
add(air * bed * (1 + 0.5 * np.sin(2 * np.pi * 0.5 * t)), gain=0.25, pan=0.2)

# --- groove: one arrow kicks every half second (pattern 0,1,2,1)
pattern = [0, 1, 2, 1]
notes = [659.3, 880, 587.3, 783.99]
for n, fr in enumerate(range(84, 174, 15)):
    a = pattern[n % 4]
    kick(s(fr), 0.9)
    zap(s(fr), PAN[a], 0.16)
    whoosh(s(fr), PAN[a], 0.25, 0.35)
    chime(s(fr), notes[n % 4], PAN[a])
    # offbeat hats
    add(noise * env(s(fr + 7.5), 0.001, 0.02, 0.06), gain=0.08, pan=-PAN[a] * 0.5)

# --- build-up: faster hits cycling through the stack + riser
for n, fr in enumerate(range(174, DROP - 4, 8)):
    a = n % 3
    kick(s(fr), 0.6 + n * 0.05)
    zap(s(fr), PAN[a], 0.12)
    chime(s(fr), [880, 1046.5, 1318.5][a], PAN[a], 0.06)
riser(s(174), s(DROP), 0.55)

# --- drop: all arrows fire
kick(s(DROP), 1.6, deep=True)
add(np.sin(2 * np.pi * 32 * t) * env(s(DROP), 0.01, 1.4), gain=0.55)
add(soft_noise * env(s(DROP), 0.002, 0.9), gain=0.7)
for a in range(3):
    zap(s(DROP), PAN[a], 0.2)
    whoosh(s(DROP), PAN[a], 0.4, 0.9)
pad = sum(np.sin(2 * np.pi * fq * t + i) for i, fq in enumerate([220, 277.2, 329.6, 440, 554.4]))
add(pad * env(s(DROP), 0.01, 1.6) * (1 + 0.25 * np.sin(2 * np.pi * 6 * t)), gain=0.06)
for fr in range(DROP + 15, TOTAL - 20, 15):
    kick(s(fr), 0.7)
    for a in range(3):
        zap(s(fr), PAN[a], 0.08)

# stereo delays for space
for d, g in [(0.11, 0.26), (0.21, 0.18), (0.33, 0.1)]:
    n = int(d * SR)
    out[n:, 0] += out[:-n, 1] * g
    out[n:, 1] += out[:-n, 0] * g

out *= np.clip((DUR - t) / 0.5, 0, 1)[:, None]
out = np.tanh(out * 1.2)
out /= np.max(np.abs(out)) * 1.05
with wave.open("public/arrows-soundtrack.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("wrote public/arrows-soundtrack.wav")
