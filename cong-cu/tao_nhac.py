"""Tự tổng hợp bản Canon in D (Pachelbel) kiểu hộp nhạc cho thiệp, ghi audio/canon-in-d.mp3.

Bản nhạc gốc đã thuộc phạm vi công cộng; file này do máy tổng hợp từ nốt nhạc nên không dính
bản quyền thu âm của ai. MP3 mono 96 kbps, khoảng 1,2 MB.

Cách dùng (ở thư mục gốc repo):
    pip install numpy lameenc
    python cong-cu/tao_nhac.py
"""
from pathlib import Path

import lameenc
import numpy as np

RA = Path(__file__).resolve().parent.parent / "audio" / "canon-in-d.mp3"

SR = 22050
T = 1.9                      # thời lượng mỗi hợp âm (giây); 8 hợp âm = một vòng
rng = np.random.default_rng(7)


def tan_so(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def hop_nhac(midi, dai, to=1.0):
    """Tiếng hộp nhạc: gõ nhanh, tắt dần, có vài bội âm lấp lánh."""
    f = tan_so(midi)
    n = int(SR * (dai + 2.2))
    t = np.arange(n) / SR
    tat = 0.55 + dai * 0.9
    s = (np.sin(2 * np.pi * f * t)
         + 0.32 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / (tat * 0.6))
         + 0.10 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / (tat * 0.35))
         + 0.05 * np.sin(2 * np.pi * 4.16 * f * t) * np.exp(-t / 0.12))
    s *= np.exp(-t / tat)
    s[: int(SR * 0.004)] *= np.linspace(0, 1, int(SR * 0.004))
    return s * to


def tram(midi, dai, to=1.0):
    """Tiếng trầm gảy, nhiều bội âm để loa điện thoại vẫn nghe được."""
    f = tan_so(midi)
    n = int(SR * (dai + 1.5))
    t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * k * f * t) for k, a in ((1, 1.0), (2, 0.55), (3, 0.3), (4, 0.15)))
    s *= np.exp(-t / (dai * 0.9))
    s[: int(SR * 0.01)] *= np.linspace(0, 1, int(SR * 0.01))
    return s * to


def dem(midis, dai, to=1.0):
    """Hợp âm đệm êm, vào ra từ từ."""
    n = int(SR * (dai + 0.5))
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * tan_so(m) * t) + 0.2 * np.sin(2 * np.pi * 2 * tan_so(m) * t) for m in midis)
    vo = np.minimum(1, t / 0.3) * np.minimum(1, (n / SR - t) / 0.5)
    return s * vo * to / len(midis)


BASS = [50, 45, 47, 42, 43, 38, 43, 45]
HOP_AM = [[62, 66, 69], [61, 64, 69], [59, 62, 66], [61, 66, 69], [59, 62, 67], [57, 62, 66], [59, 62, 67], [61, 64, 69]]
V1 = [78, 76, 74, 73, 71, 69, 71, 73]
V2 = [74, 73, 71, 69, 67, 66, 67, 64]
V3 = [(62, 66), (69, 67), (66, 62), (66, 64), (62, 59), (62, 69), (67, 71), (69, 67)]
V4 = [
    [(81, 2), (78, 1), (79, 1), (81, 2), (78, 1), (79, 1)],
    [(81, 1), (69, 1), (71, 1), (73, 1), (74, 1), (76, 1), (78, 1), (79, 1)],
    [(78, 2), (74, 1), (76, 1), (78, 2), (66, 1), (67, 1)],
    [(69, 1), (71, 1), (69, 1), (67, 1), (69, 1), (66, 1), (67, 1), (69, 1)],
    [(67, 2), (71, 1), (69, 1), (67, 2), (66, 1), (64, 1)],
    [(66, 1), (64, 1), (62, 1), (64, 1), (66, 1), (67, 1), (69, 1), (71, 1)],
    [(67, 2), (71, 1), (69, 1), (71, 2), (73, 1), (74, 1)],
    [(69, 1), (71, 1), (73, 1), (74, 1), (76, 1), (78, 1), (79, 1), (81, 1)],
]

# Mỗi vòng dùng những bè nào: (v1, v2, v3, v4, v1 cao một quãng tám)
VONG = [
    dict(v1=0.9),
    dict(v1=0.85, v2=0.6),
    dict(v3=0.8, v2=0.35),
    dict(v4=0.7),
    dict(v4=0.7, v1cao=0.3),
    dict(v1=0.85, v2=0.6),
]

tong = len(VONG) * 8 * T + 6
buf = np.zeros(int(SR * tong) + SR * 4)


def dat(s, luc):
    i = int(luc * SR)
    buf[i:i + len(s)] += s[: len(buf) - i]


for iv, vong in enumerate(VONG):
    for ih in range(8):
        luc = (iv * 8 + ih) * T
        dat(tram(BASS[ih], T, 0.5), luc)
        dat(dem(HOP_AM[ih], T, 0.22), luc)
        lech = rng.uniform(-0.006, 0.006)             # lệch tay rất nhẹ cho đỡ máy móc
        if "v1" in vong:
            dat(hop_nhac(V1[ih], T, vong["v1"]), luc + lech)
        if "v1cao" in vong:
            dat(hop_nhac(V1[ih] + 12, T, vong["v1cao"]), luc + lech)
        if "v2" in vong:
            dat(hop_nhac(V2[ih], T, vong["v2"]), luc + lech + 0.004)
        if "v3" in vong:
            for k, m in enumerate(V3[ih]):
                dat(hop_nhac(m + 12, T / 2, vong["v3"]), luc + k * T / 2)
        if "v4" in vong:
            o = 0
            for m, so_o in V4[ih]:
                dat(hop_nhac(m, so_o * T / 8, vong["v4"] * (1.0 if so_o == 2 else 0.85)), luc + o * T / 8)
                o += so_o

# Hợp âm kết
ket = len(VONG) * 8 * T
dat(tram(50, 4, 0.5), ket)
for k, m in enumerate([62, 66, 69, 74, 78]):
    dat(hop_nhac(m, 3.5, 0.55), ket + k * 0.07)

# Vang nhẹ: nhân chập với nhiễu tắt dần
n_ir = int(SR * 1.6)
ir = rng.standard_normal(n_ir) * np.exp(-np.arange(n_ir) / (SR * 0.45))
ir[: int(SR * 0.012)] = 0
n = len(buf) + n_ir
nfft = 1 << (n - 1).bit_length()
vang = np.fft.irfft(np.fft.rfft(buf, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(buf)]
vang /= np.abs(vang).max()
buf = buf / np.abs(buf).max() * 0.85 + vang * 0.22

dai = int(SR * (ket + 5.5))
buf = buf[:dai]
buf[: int(SR * 0.03)] *= np.linspace(0, 1, int(SR * 0.03))
tat = int(SR * 2.5)
buf[-tat:] *= np.linspace(1, 0, tat) ** 2
buf = buf / np.abs(buf).max() * 0.8

nen = lameenc.Encoder()
nen.set_bit_rate(96)
nen.set_in_sample_rate(SR)
nen.set_channels(1)
nen.set_quality(2)
pcm = (buf * 32767).astype("<i2").tobytes()
mp3 = nen.encode(pcm) + nen.flush()
RA.parent.mkdir(exist_ok=True)
RA.write_bytes(mp3)
print(f"{RA}: {dai / SR:.1f} giây, {len(mp3) / 1e6:.2f} MB")
