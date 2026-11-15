"""Tiny synth toolkit shared by the arrows soundtracks (numpy only)."""
import wave
import numpy as np

SR = 44100
FPS = 30


class Track:
    def __init__(self, frames, seed=1):
        self.dur = frames / FPS
        self.t = np.arange(int(SR * self.dur)) / SR
        self.out = np.zeros((len(self.t), 2))
        self.rng = np.random.default_rng(seed)
        self.noise = self.rng.standard_normal(len(self.t))

    @staticmethod
    def s(frame):
        return frame / FPS

    def env(self, start, attack, decay, length=None):
        x = self.t - start
        e = np.where(
            x < 0, 0, np.where(x < attack, x / max(attack, 1e-6), np.exp(-np.clip(x - attack, 0, None) / decay))
        )
        if length is not None:
            e = e * (x < length)
        return e

    def add(self, sig, pan=0.0, gain=1.0):
        """pan < 0 is left, pan > 0 is right."""
        self.out[:, 0] += sig * gain * (1 - max(pan, 0))
        self.out[:, 1] += sig * gain * (1 + min(pan, 0))

    @staticmethod
    def lowpass(x, alpha):
        y = np.empty_like(x)
        acc = 0.0
        for i in range(len(x)):
            acc += alpha * (x[i] - acc)
            y[i] = acc
        return y

    def tone(self, freq):
        """Sine following a frequency curve (array) or a constant."""
        f = np.broadcast_to(np.asarray(freq, dtype=float), self.t.shape)
        return np.sin(2 * np.pi * np.cumsum(f) / SR)

    def kick(self, start, gain=1.0, deep=False):
        x = np.clip(self.t - start, 0, None)
        f = (34 if deep else 50) + 160 * np.exp(-x * 28)
        self.add(self.tone(f) * self.env(start, 0.002, 0.9 if deep else 0.28), gain=gain)

    def riser(self, a, b, gain=0.4, top=2400):
        m = (self.t >= a) & (self.t < b)
        p = np.clip((self.t - a) / (b - a), 0, 1)
        self.add(self.tone((120 + p ** 3 * top) * m) * m * p * gain * 0.5)
        self.add(self.noise * m * p ** 3 * gain * 0.6)

    def delays(self, taps):
        for d, g in taps:
            n = int(d * SR)
            self.out[n:, 0] += self.out[:-n, 1] * g
            self.out[n:, 1] += self.out[:-n, 0] * g

    def write(self, path, drive=1.2, fade=0.5):
        out = self.out * np.clip((self.dur - self.t) / fade, 0, 1)[:, None]
        out = np.tanh(out * drive)
        out /= np.max(np.abs(out)) * 1.05
        with wave.open(path, "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((out * 32767).astype(np.int16).tobytes())
        print("wrote", path)
