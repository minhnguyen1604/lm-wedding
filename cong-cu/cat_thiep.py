"""Cắt hai mặt thiệp từ bản duyệt in và ghi vào images/thiep/.

- images/thiep/1.jpg: mặt lời mời, có viết "QUÝ KHÁCH" (in hoa, đậm nghiêng) lên dòng chấm,
  đảo tên "TÚ LINH" lên trước (DAO_TEN) và đưa cột "NHÀ GÁI" sang bên trái (DOI_COT) — đúng như bản duyệt mới
  nguon/ban-duyet-in-mat-sau.jpeg nhưng giữ độ nét của bản duyệt chung (bản mới chỉ là ảnh chụp màn hình).
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

# Bản duyệt riêng mặt lời mời (ảnh chụp màn hình điện thoại: thẻ trắng trên nền xám, nhà in gửi sau với Tú Linh trước,
# Nhà gái bên trái). Ảnh chụp màn hình kém nét hơn bản duyệt chung, nên mặc định KHÔNG dùng mà tự đổi chỗ trên bản nét
# (2a, 2b bên dưới) cho ra cùng nội dung. Đặt DUNG_BAN_RIENG = True nếu nhà in gửi file gốc nét của mặt sau.
DUNG_BAN_RIENG = False
MAT_SAU_RIENG = GOC / "nguon" / "ban-duyet-in-mat-sau.jpeg"
if DUNG_BAN_RIENG and MAT_SAU_RIENG.exists():
    rieng = Image.open(MAT_SAU_RIENG).convert("RGB")
    b = np.asarray(rieng).astype(int)
    trang_b = b.min(axis=2) > 240
    h_b, w_b = trang_b.shape
    xs = np.flatnonzero(trang_b[int(h_b * .3):int(h_b * .7)].mean(axis=0) > .5)
    ys = np.flatnonzero(trang_b[:, int(w_b * .1):int(w_b * .85)].mean(axis=1) > .5)
    the = rieng.crop((xs.min() + 1, ys.min() + 1, xs.max(), ys.max()))
    rong = mat_sau.width     # đưa về cùng chiều rộng để toạ độ dòng chấm "QUÝ KHÁCH" vẫn đúng
    mat_sau = the.resize((rong, round(the.height * rong / the.width)), Image.LANCZOS)


def doi_cho(mat, vung1, vung2, la_chu, mau_chu, cung_hang, cham_le=12):
    """Đổi chỗ chữ trong hai vùng (x0, y0, x1, y1) của ảnh, giữ nguyên phông, màu, cỡ chữ gốc.

    la_chu(lum, sat) -> mặt nạ lõi nét chữ; mau_chu(y) -> màu chữ ở hàng y của vùng gốc;
    cham_le: bỏ các đốm nhỏ hơn số điểm ảnh này (đặt nhỏ để không mất dấu nặng, dấu chấm).
    Hai khối được canh theo mép trái; cung_hang=True thì giữ nguyên hàng (chỉ đổi trái/phải),
    không thì canh theo chân chữ (đổi dòng trên/dưới). Chữ cũ được xoá và vẽ bù nền (hoa rum, nét uốn) bằng inpaint.
    """
    import cv2
    a = np.asarray(mat).astype(float)
    lum = a @ [.299, .587, .114]
    sat = a[..., 0] - a[..., 2]
    loi = la_chu(lum, sat)
    vung = np.zeros(lum.shape, bool)
    khoi = []
    for x0, y0, x1, y1 in (vung1, vung2):
        m = np.zeros(lum.shape, np.uint8)
        m[y0:y1, x0:x1] = loi[y0:y1, x0:x1]
        n, nhan, tk, _ = cv2.connectedComponentsWithStats(m, 8)
        for i in range(1, n):                 # bỏ chấm lẻ không thuộc chữ
            if tk[i, cv2.CC_STAT_AREA] < cham_le:
                m[nhan == i] = 0
        m = cv2.dilate(m, np.ones((3, 3), np.uint8), iterations=2) > 0
        ys, xs = np.nonzero(m)
        khoi.append((m, xs.min(), ys.max()))
        vung |= m
    bgr = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2BGR)
    xoa = cv2.dilate(vung.astype(np.uint8), np.ones((3, 3), np.uint8))
    nen = cv2.cvtColor(cv2.inpaint(bgr, xoa * 255, 4, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB).astype(float)
    lum_nen = nen @ [.299, .587, .114]
    ra = nen.copy()
    (m1, trai1, day1), (m2, trai2, day2) = khoi
    for m, dx, dy in ((m2, trai1 - trai2, 0 if cung_hang else day1 - day2),
                      (m1, trai2 - trai1, 0 if cung_hang else day2 - day1)):
        ys, xs = np.nonzero(m)
        mau = np.array([mau_chu(y) for y in ys], float)
        # độ đậm của chữ ở từng điểm (giữ nét mảnh, viền mịn của chữ gốc)
        al = np.clip((lum_nen[ys, xs] - lum[ys, xs]) / np.maximum(lum_nen[ys, xs] - mau @ [.299, .587, .114], 1), 0, 1)[:, None]
        ny, nx = ys + dy, xs + dx
        ra[ny, nx] = ra[ny, nx] * (1 - al) + mau * al
    return Image.fromarray(np.clip(ra, 0, 255).astype(np.uint8))


dung_rieng = DUNG_BAN_RIENG and MAT_SAU_RIENG.exists()     # bản riêng đã đúng thứ tự, không cần đổi

# 2a. Đảo thứ tự tên: "TÚ LINH" lên dòng trên, "TUẤN MINH" xuống dòng dưới (kiểu dòng dưới thụt vào giữ như bản in)
DAO_TEN = not dung_rieng
DONG_TREN = (118, 440, 670, 553)    # "TUẤN MINH" trên bản in (toạ độ mặt lời mời đã cắt, gồm cả dấu)
DONG_DUOI = (150, 556, 560, 656)    # "TÚ LINH" trên bản in
MAU_TEN = (172, 137, 79)            # vàng của chữ tên
if DAO_TEN:
    # lõi nét chữ tên: đậm hơn hẳn nét hoa rum, nét uốn phía sau (JPEG làm nhạt màu nét mảnh nên xét độ sáng là chính)
    mat_sau = doi_cho(mat_sau, DONG_TREN, DONG_DUOI, lambda l, s: (l < 212) & (s > 8), lambda y: MAU_TEN, False)

# 2b. Đổi cột: "NHÀ GÁI" (và tên bố mẹ) sang bên trái, "NHÀ TRAI" sang bên phải
DOI_COT = not dung_rieng
COT_TRAI = (92, 1172, 402, 1320)    # "NHÀ TRAI" trên bản in
COT_PHAI = (505, 1172, 812, 1320)   # "NHÀ GÁI" trên bản in
MAU_TIEU_DE, MAU_TEN_BO_ME, HANG_TACH = (60, 66, 51), (72, 75, 64), 1218   # chữ đậm "NHÀ ..." / tên bố mẹ
if DOI_COT:
    # chữ xanh rêu xám: tối hơn hẳn nét hoa rum rất nhạt phía sau
    mat_sau = doi_cho(mat_sau, COT_TRAI, COT_PHAI, lambda l, s: l < 205,
                      lambda y: MAU_TIEU_DE if y < HANG_TACH else MAU_TEN_BO_ME, True, cham_le=3)   # giữ dấu nặng (Ặ, Ị, Ạ)

# 2c. Mặt lời mời: viết "QUÝ KHÁCH" lên dòng chấm dưới "TRÂN TRỌNG KÍNH MỜI"
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
