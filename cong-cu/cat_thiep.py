"""Cắt hai mặt thiệp từ bản duyệt in và ghi vào images/thiep/.

- images/thiep/1.jpg: mặt lời mời, có viết "QUÝ KHÁCH" (in hoa đậm) lên dòng chấm
- images/thiep/2.jpg: mặt chương trình tiệc cưới, đã bỏ mã QR và lề trống
Đồng thời kiểm tra mã QR in trên thiệp có trỏ đúng link thiệp không.

Cách dùng (chạy ở thư mục gốc của repo):
    pip install pillow numpy "qrcode[pil]"
    python cong-cu/cat_thiep.py                       # dùng nguon/ban-duyet-in.jpeg
    python cong-cu/cat_thiep.py nguon/ban-khac.jpeg   # bản duyệt in khác (cùng bố cục)
Phông chữ: Palatino Linotype đậm (C:\\Windows\\Fonts\\palab.ttf) có sẵn trên Windows.
"""
import sys
from pathlib import Path

import numpy as np
import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.constants import ERROR_CORRECT_Q

GOC = Path(__file__).resolve().parent.parent
NGUON = Path(sys.argv[1]) if len(sys.argv) > 1 else GOC / "nguon" / "ban-duyet-in.jpeg"
URL = "https://minhnguyen1604.github.io/lm-wedding/"
PHONG = r"C:\Windows\Fonts\palab.ttf"
MAU_CHU = (58, 62, 49)            # xanh rêu đậm như chữ trên thiệp

ban_in = Image.open(NGUON).convert("RGB")
a = np.asarray(ban_in).astype(int)
H, W, _ = a.shape

# 1. Tìm hai mặt thiệp (vùng trắng trên nền xám của bản duyệt)
trang = a.min(axis=2) > 235
cot = trang[int(H * .3):int(H * .8)].mean(axis=0) > .6
doan, bat_dau = [], None
for x, v in enumerate(list(cot) + [False]):
    if v and bat_dau is None:
        bat_dau = x
    if not v and bat_dau is not None:
        if x - bat_dau > W * .15:
            doan.append((bat_dau, x))
        bat_dau = None
assert len(doan) == 2, f"không tìm thấy đúng 2 mặt thiệp: {doan}"
xam = np.median(a.reshape(-1, 3), axis=0)
mat = []
for x0, x1 in doan:
    la_nen = np.abs(a[:, x0:x1] - xam).max(axis=2) < 14
    ys = np.flatnonzero(la_nen.mean(axis=1) < .3)
    nhom = np.split(ys, np.flatnonzero(np.diff(ys) > 5) + 1)
    dai = max(nhom, key=len)
    mat.append(ban_in.crop((x0 + 3, int(dai[0]) + 3, x1 - 3, int(dai[-1]) + 1 - 3)))
mat_truoc, mat_sau = mat          # trái: chương trình tiệc, phải: lời mời

# 2. Mặt lời mời: viết "QUÝ KHÁCH" lên dòng chấm dưới "TRÂN TRỌNG KÍNH MỜI"
K = 4
f = ImageFont.truetype(PHONG, 29 * K)
lop = Image.new("L", (mat_sau.width * K, mat_sau.height * K), 0)
ve = ImageDraw.Draw(lop)
chan = f.getbbox("QUY KHACH")[3]
ve.text((98 * K - f.getbbox("QUÝ KHÁCH")[0], (237 - 9) * K - chan), "QUÝ KHÁCH", font=f, fill=255)
lop = lop.resize(mat_sau.size, Image.LANCZOS)
mat_sau = Image.composite(Image.new("RGB", mat_sau.size, MAU_CHU), mat_sau, lop)
mat_sau.save(GOC / "images/thiep/1.jpg", quality=90, optimize=True)

# 3. Mặt chương trình tiệc: tìm khối mã QR, kiểm tra, rồi cắt bỏ
b = np.asarray(mat_truoc).astype(int)
h, w, _ = b.shape
muc = b.min(axis=2) < 215
ys = np.flatnonzero(muc[:, 20:w - 20].any(axis=1))
nhom = np.split(ys, np.flatnonzero(np.diff(ys) > 25) + 1)


def mat_do(g):
    v = muc[g[0]:g[-1] + 1]
    xs = np.flatnonzero(v.any(axis=0))
    return v[:, xs[0]:xs[-1] + 1].mean()


qr_khoi = next(g for g in nhom if g[0] > h * .5 and mat_do(g) > .35)
vung = b[qr_khoi[0]:qr_khoi[-1] + 1].min(axis=2)
xs = np.flatnonzero((vung < 140).any(axis=0))
qr_in = vung[:, xs[0]:xs[-1] + 1]
qr = qrcode.QRCode(error_correction=ERROR_CORRECT_Q, border=0)
qr.add_data(URL)
qr.make(fit=True)
chuan = np.array(qr.modules, dtype=bool)
n = chuan.shape[0]
doc = np.array([[qr_in[int((i + .5) * qr_in.shape[0] / n), int((j + .5) * qr_in.shape[1] / n)] < 140
                 for j in range(n)] for i in range(n)])
print(f"Mã QR trên bản in khớp với link thiệp: {(doc == chuan).mean():.1%}")

giu = [g for g in nhom if g[-1] < qr_khoi[0]]
anh2 = mat_truoc.crop((0, max(0, giu[0][0] - 110), w, min(h, giu[-1][-1] + 110)))
anh2.save(GOC / "images/thiep/2.jpg", quality=90, optimize=True)
print("Đã ghi images/thiep/1.jpg", mat_sau.size, "và images/thiep/2.jpg", anh2.size)
