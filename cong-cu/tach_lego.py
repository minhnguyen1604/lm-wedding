"""Tách hai hình lego khỏi nền trắng của ảnh gốc, bỏ các nét vẽ trang trí xung quanh.

Cách làm: tô loang từ viền ảnh qua vùng gần trắng để tìm nền; phần không loang tới là hình lego
(kể cả váy trắng nằm kín bên trong đường viền). Giữ lại hai khối lớn nhất, làm mềm mép,
rồi cắt thành hai ảnh: chú rể và cô dâu, thu về cao 420 px.

Các toạ độ xoá nét vẽ / đế gạch bên dưới được chỉnh tay riêng cho nguon/lego-goc.png;
đổi sang ảnh lego khác thì phải chỉnh lại.

Cách dùng (ở thư mục gốc repo):
    python cong-cu/tach_lego.py
    -> images/lego-chu-re.png, images/lego-co-dau.png (+ bản xem thử trong _thu/)
"""
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

GOC_REPO = Path(__file__).resolve().parent.parent
nguon = sys.argv[1] if len(sys.argv) > 1 else GOC_REPO / "nguon" / "lego-goc.png"
thu_muc_ra = GOC_REPO / "images"
tam = GOC_REPO / "_thu"
tam.mkdir(exist_ok=True)
NGUONG = 236     # sáng hơn mức này coi là nền trắng

goc = Image.open(nguon).convert("RGB")
print("ảnh gốc:", goc.size)
PHONG = 3
anh = goc.resize((goc.width * PHONG, goc.height * PHONG), Image.LANCZOS)
a = np.asarray(anh).astype(int)
H, W, _ = a.shape
sang = a.min(axis=2)
la_trang = sang >= NGUONG

# Tô loang nền từ bốn cạnh
nen = np.zeros((H, W), bool)
hang_doi = deque()
for x in range(W):
    for y in (0, H - 1):
        if la_trang[y, x] and not nen[y, x]:
            nen[y, x] = True
            hang_doi.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if la_trang[y, x] and not nen[y, x]:
            nen[y, x] = True
            hang_doi.append((y, x))
# Các khoảng nền trắng bị kẹp kín bên trong (giữa hai chân chú rể, dưới bàn tay): loang thêm từ đó
for x, y in ((272, 720), (268, 660), (430, 574), (452, 570)):
    if la_trang[y, x] and not nen[y, x]:
        nen[y, x] = True
        hang_doi.append((y, x))
    else:
        print("điểm gieo", (x, y), "không phải nền trắng hoặc đã loang:", la_trang[y, x], nen[y, x])
while hang_doi:
    y, x = hang_doi.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        yy, xx = y + dy, x + dx
        if 0 <= yy < H and 0 <= xx < W and la_trang[yy, xx] and not nen[yy, xx]:
            nen[yy, xx] = True
            hang_doi.append((yy, xx))
hinh_goc = ~nen
# Xoá hẳn các vùng thừa (toạ độ theo ảnh đã phóng 3 lần):
XOA_HAN = (
    (0, 0, 300, 67),          # nét vẽ phía trên mũ chú rể
    (185, 60, 215, 74),       # mẩu nét vẽ dính trên đỉnh mũ
    (168, 66, 183, 176),      # nét vẽ chạy dọc mép trái mũ
    (0, 780, W, H),           # dải đế gạch dưới chân
    (400, 700, 630, H),       # hai núm gạch giữa hai hình
)
for x0, y0, x1, y1 in XOA_HAN:
    hinh_goc[y0:y1, x0:x1] = False
# Nhánh vẽ bằng mực đen cạnh bó hoa: chỉ xoá các điểm đen không màu, không đụng vào cánh hoa
do_mau = a.max(axis=2) - a.min(axis=2)
for x0, y0, x1, y1 in ((1085, 440, W, 512),):
    muc = (a.max(axis=2)[y0:y1, x0:x1] < 150) & (do_mau[y0:y1, x0:x1] < 45)
    hinh_goc[y0:y1, x0:x1] &= ~muc

# Bỏ các nét vẽ trang trí mảnh dính vào hình (cành lá cạnh mũ, nhánh cạnh bó hoa):
# co mặt nạ vào rồi nở ra lại ("mở" hình thái học) thì nét mảnh biến mất, khối lớn còn nguyên.
BAN_KINH = 13
mn0 = Image.fromarray((hinh_goc * 255).astype("uint8"))
mo = mn0.filter(ImageFilter.MinFilter(2 * BAN_KINH + 1)).filter(ImageFilter.MaxFilter(2 * BAN_KINH + 3))
hinh = (np.asarray(mo) > 127) & hinh_goc

# Gắn nhãn các khối liền nhau, giữ những khối đủ lớn
nhan = np.zeros((H, W), int)
khoi = []
for y0 in range(H):
    for x0 in range(W):
        if hinh[y0, x0] and not nhan[y0, x0]:
            so = len(khoi) + 1
            nhan[y0, x0] = so
            hang_doi.append((y0, x0))
            dem, x_min, x_max, y_min, y_max, mau = 0, x0, x0, y0, y0, 0
            while hang_doi:
                y, x = hang_doi.popleft()
                dem += 1
                x_min, x_max, y_min, y_max = min(x_min, x), max(x_max, x), min(y_min, y), max(y_max, y)
                r, g, b = a[y, x]
                if max(r, g, b) - min(r, g, b) > 60:
                    mau += 1                     # điểm có màu (vàng, hồng, xanh) - nét vẽ trang trí thì chỉ đen
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and hinh[yy, xx] and not nhan[yy, xx]:
                        nhan[yy, xx] = so
                        hang_doi.append((yy, xx))
            khoi.append(dict(so=so, dem=dem, hop=(x_min, y_min, x_max, y_max), mau=mau))

khoi.sort(key=lambda k: -k["dem"])
for k in khoi[:8]:
    print(f"khối {k['so']:3d}: {k['dem']:7d} điểm, hộp {k['hop']}, điểm có màu {k['mau']}")

# Hình lego = các khối lớn có nhiều điểm màu
giu = [k for k in khoi if k["mau"] > 800 and k["dem"] > 20000]
print("giữ lại:", [k["so"] for k in giu])
mat_na = np.isin(nhan, [k["so"] for k in giu])
# Mảng nền trắng lọt qua khe bàn tay kẹp của chú rể: xoá phần sáng màu, giữ nguyên phần tay vàng
# (làm sau bước lọc nét mảnh để ngón tay mảnh không bị mất theo)
for x0, y0, x1, y1 in ((385, 548, 482, 578),):
    mat_na[y0:y1, x0:x1] &= ~(sang[y0:y1, x0:x1] >= 200)

# Mép mềm + khử viền trắng: co mặt nạ vào 2 điểm ảnh để cắt hết quầng trắng bám quanh hình
mn = (Image.fromarray((mat_na * 255).astype("uint8"))
      .filter(ImageFilter.MinFilter(5))
      .filter(ImageFilter.GaussianBlur(1.2)))
alpha = np.asarray(mn).astype(float) / 255
alpha = np.clip((alpha - 0.3) / 0.5, 0, 1)
rgb = a.astype(float)
voi = alpha[..., None]
rgb = np.where(voi > 0.02, (rgb - 255 * (1 - voi)) / np.maximum(voi, 0.02), rgb)
rgb = np.clip(rgb, 0, 255)
ra = np.dstack([rgb, alpha * 255]).astype("uint8")
toan = Image.fromarray(ra, "RGBA")

ys, xs = np.nonzero(alpha > 0.05)
hop = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
print("hộp chung:", hop)

# Tìm khe giữa hai hình: cột ít điểm nhất ở khoảng giữa
cot = (alpha > 0.05).sum(axis=0)
giua_tu, giua_den = hop[0] + (hop[2] - hop[0]) * 30 // 100, hop[0] + (hop[2] - hop[0]) * 60 // 100
khe = giua_tu + int(np.argmin(cot[giua_tu:giua_den]))
print("khe giữa hai hình ở x =", khe, "số điểm ở khe:", cot[khe])

chu_re = toan.crop((hop[0], hop[1], khe, hop[3]))
co_dau = toan.crop((khe, hop[1], hop[2], hop[3]))
CAO = 420                      # hiển thị cao tối đa ~175px CSS, giữ 420px cho màn hình nét
for ten, im in (("lego-chu-re.png", chu_re), ("lego-co-dau.png", co_dau)):
    im = im.resize((round(im.width * CAO / im.height), CAO), Image.LANCZOS)
    im.save(thu_muc_ra / ten, optimize=True)
    print(ten, im.size)

# Bản xem thử trên nền kem
nen_kem = Image.new("RGBA", toan.size, (252, 249, 242, 255))
nen_kem.alpha_composite(toan)
nen_kem.convert("RGB").save(f"{tam}/xem-lego.png")
Image.fromarray((mat_na * 255).astype("uint8")).save(f"{tam}/xem-lego-mat-na.png")
