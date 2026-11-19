"""Tô logo LM (images/logo-lm.png, bản xám) thành vàng ánh kim, ghi images/logo-lm-vang.png,
rồi tạo biểu tượng tab images/icon-32.png và icon-180.png (iPhone).

Màu chuyển từ vàng sáng ở trên xuống vàng đậm ở dưới, có một dải sáng nhẹ (giống ép nhũ).
Muốn sáng/trầm hơn thì sửa ba màu TREN, GIUA, DUOI và độ sáng SANG.

Cách dùng (ở thư mục gốc repo):  python cong-cu/tao_logo_vang.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

GOC = Path(__file__).resolve().parent.parent
TREN = np.array([200, 172, 106])   # vàng phía trên
GIUA = np.array([174, 139, 62])    # vàng giữa
DUOI = np.array([136, 103, 38])    # vàng đậm phía dưới
SANG = 20                          # độ sáng của dải ánh kim

anh = np.asarray(Image.open(GOC / "images/logo-lm.png").convert("RGBA")).astype(float)
H, W = anh.shape[:2]
hang = np.where(anh[..., 3] > 20)[0]
t = np.clip((np.arange(H) - hang.min()) / (hang.max() - hang.min()), 0, 1)[:, None, None]
mau = np.where(t < .5, TREN + (GIUA - TREN) * (t / .5), GIUA + (DUOI - GIUA) * ((t - .5) / .5))
mau = np.clip(mau + np.exp(-((t - .32) / .07) ** 2) * SANG, 0, 255)
ra = np.zeros_like(anh)
ra[..., :3] = np.broadcast_to(mau, (H, W, 3))
ra[..., 3] = anh[..., 3]
Image.fromarray(ra.astype(np.uint8)).save(GOC / "images/logo-lm-vang.png", optimize=True)
print("images/logo-lm-vang.png", (W, H))

# Biểu tượng trên tab trình duyệt: chỉ logo LM, nền trong suốt (32 px và 64 px cho màn hình sắc nét).
# Riêng biểu tượng màn hình chính iPhone (180 px) cần nền đặc (iPhone tô nền trong suốt thành đen) nên giữ nền kem.
logo = Image.open(GOC / "images/logo-lm-vang.png")
logo = logo.crop(logo.getbbox())
for co, le, nen_mau in ((32, 0, None), (64, 0, None), (180, 26, (247, 242, 231, 255))):
    nen = Image.new("RGBA", (co, co), nen_mau or (0, 0, 0, 0))
    l = logo.copy()
    l.thumbnail((co - 2 * le, co - 2 * le), Image.LANCZOS)
    nen.alpha_composite(l, ((co - l.width) // 2, (co - l.height) // 2))
    (nen if nen_mau is None else nen.convert("RGB")).save(GOC / f"images/icon-{co}.png", optimize=True)
    print(f"images/icon-{co}.png")
