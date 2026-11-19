"""Cắt hai mặt thiệp từ bản duyệt in và ghi vào images/thiep/.

- images/thiep/1.jpg: mặt lời mời, có viết "QUÝ KHÁCH" (in hoa, đậm nghiêng) lên dòng chấm,
  và đảo thứ tự tên: "TÚ LINH" trước, "TUẤN MINH" sau (DAO_TEN)
- images/thiep/2.jpg: mặt chương trình tiệc cưới, đã bỏ mã QR và lề trống
Đồng thời kiểm tra mã QR in trên thiệp có trỏ đúng link thiệp không.

Cách dùng (chạy ở thư mục gốc của repo):
    pip install pillow numpy "qrcode[pil]"
    python cong-cu/cat_thiep.py                       # dùng nguon/ban-duyet-in.jpeg
    python cong-cu/cat_thiep.py nguon/ban-khac.jpeg   # bản duyệt in khác (cùng bố cục)
Phông chữ: Palatino Linotype đậm nghiêng (C:\\Windows\\Fonts\\palabi.ttf) có sẵn trên Windows.
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
PHONG = r"C:\Windows\Fonts\palabi.ttf"    # Palatino đậm nghiêng (bản đứng: palab.ttf)
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

# 2a. Mặt lời mời: đảo thứ tự tên — "TÚ LINH" lên dòng trên, "TUẤN MINH" xuống dòng dưới
#     (giữ nguyên phông, màu, cỡ chữ và kiểu dòng dưới thụt vào của bản in). Đặt DAO_TEN = False để giữ như bản in.
DAO_TEN = True
# vùng chứa từng dòng tên trên mặt lời mời (toạ độ điểm ảnh của mặt thiệp đã cắt, gồm cả dấu)
DONG_TREN = (118, 440, 670, 553)    # "TUẤN MINH" trên bản in
DONG_DUOI = (150, 556, 560, 656)    # "TÚ LINH" trên bản in
MAU_TEN = np.array([172, 137, 79])  # vàng của chữ tên


def dao_ten(mat):
    import cv2
    a = np.asarray(mat).astype(float)
    lum = a @ [.299, .587, .114]
    sat = a[..., 0] - a[..., 2]
    # lõi nét chữ: đậm hơn hẳn nét hoa rum và nét uốn phía sau (ảnh JPEG làm nhạt màu nét mảnh nên xét độ sáng là chính)
    loi = (lum < 212) & (sat > 8)
    vung = np.zeros(lum.shape, bool)
    dong = []
    for x0, y0, x1, y1 in (DONG_TREN, DONG_DUOI):
        m = np.zeros(lum.shape, np.uint8)
        m[y0:y1, x0:x1] = loi[y0:y1, x0:x1]
        n, nhan, tk, _ = cv2.connectedComponentsWithStats(m, 8)
        for i in range(1, n):                 # bỏ chấm lẻ không thuộc chữ
            if tk[i, cv2.CC_STAT_AREA] < 12:
                m[nhan == i] = 0
        m = cv2.dilate(m, np.ones((3, 3), np.uint8), iterations=2) > 0
        ys, xs = np.nonzero(m)
        dong.append((m, xs.min(), ys.max()))
        vung |= m
    # xoá chữ cũ, vẽ bù nền (hoa rum, nét uốn) bằng inpaint
    bgr = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2BGR)
    xoa = cv2.dilate(vung.astype(np.uint8), np.ones((3, 3), np.uint8))
    nen = cv2.cvtColor(cv2.inpaint(bgr, xoa * 255, 4, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB).astype(float)
    lum_nen = nen @ [.299, .587, .114]
    lum_chu = MAU_TEN @ [.299, .587, .114]
    # độ đậm của chữ ở từng điểm (giữ nét mảnh, viền mịn của chữ gốc)
    alpha = np.clip((lum_nen - lum) / np.maximum(lum_nen - lum_chu, 1), 0, 1)
    ra = nen.copy()
    (m1, trai1, day1), (m2, trai2, day2) = dong
    # dòng dưới cũ ("TÚ LINH") đặt lên chỗ dòng trên; dòng trên cũ ("TUẤN MINH") đặt xuống chỗ dòng dưới
    for m, dx, dy in ((m2, trai1 - trai2, day1 - day2), (m1, trai2 - trai1, day2 - day1)):
        ys, xs = np.nonzero(m)
        al = alpha[ys, xs][:, None]
        ny, nx = ys + dy, xs + dx
        ra[ny, nx] = ra[ny, nx] * (1 - al) + MAU_TEN * al
    return Image.fromarray(np.clip(ra, 0, 255).astype(np.uint8))


if DAO_TEN:
    mat_sau = dao_ten(mat_sau)

# 2b. Mặt lời mời: viết "QUÝ KHÁCH" lên dòng chấm dưới "TRÂN TRỌNG KÍNH MỜI"
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
