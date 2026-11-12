"""Tách đôi lego (cô dâu + chú rể, kèm bó hoa) khỏi nền tranh trong nguon/lego-moi-goc.jpg.

Hai nhân vật đứng sát nhau, bó hoa che lên người chú rể, nên tách thành MỘT ảnh đôi (images/lego-doi.png).

Cách làm: vẽ tay một đường bao thô quanh hai nhân vật, rồi để thuật toán GrabCut (OpenCV) tự tìm mép
chính xác theo màu: trong đường bao co lại = chắc chắn là hình, ngoài đường bao nới ra = chắc chắn là nền,
dải ở giữa để thuật toán tự quyết.

Cách dùng (ở thư mục gốc repo):
    pip install pillow numpy opencv-python-headless
    python cong-cu/tach_lego_moi.py
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GOC = Path(__file__).resolve().parent.parent
NGUON = GOC / "nguon" / "lego-moi-goc.jpg"
RA = GOC / "images" / "lego-doi.png"
THU = GOC / "_thu"
THU.mkdir(exist_ok=True)

anh = Image.open(NGUON).convert("RGB")
W, H = anh.size

# Đường bao thô (toạ độ ảnh gốc 1230x1279), đi theo chiều kim đồng hồ từ vành mũ chú rể
BAO = [
    (641, 384), (668, 350), (679, 274), (700, 263), (826, 263), (842, 274), (846, 350), (878, 378),
    (870, 401), (842, 408), (838, 470), (826, 503), (812, 515), (845, 528), (905, 560), (932, 622),
    (942, 720), (972, 745), (975, 778), (956, 793), (924, 792), (906, 772), (906, 1010), (910, 1069),
    (655, 1071), (662, 1106), (341, 1103), (378, 960), (372, 845), (350, 845), (336, 790), (346, 752),
    (378, 700), (392, 650), (384, 600), (398, 545), (410, 503), (424, 466), (444, 434), (464, 410), (490, 395), (560, 393),
    (614, 418), (634, 430), (640, 448), (645, 478), (650, 505), (658, 516), (672, 508), (684, 490),
    (684, 412), (662, 406),
]

mat_na_bao = Image.new("L", (W, H), 0)
ImageDraw.Draw(mat_na_bao).polygon(BAO, fill=255)
bao = np.asarray(mat_na_bao) > 0

trong = cv2.erode(bao.astype(np.uint8), np.ones((31, 31), np.uint8)) > 0     # chắc chắn là hình
ngoai = cv2.dilate(bao.astype(np.uint8), np.ones((41, 41), np.uint8)) == 0   # chắc chắn là nền

nhan = np.full((H, W), cv2.GC_PR_BGD, np.uint8)
nhan[bao] = cv2.GC_PR_FGD
nhan[trong] = cv2.GC_FGD
nhan[ngoai] = cv2.GC_BGD
# Thành cầu vẽ phía sau mái tóc cô dâu: màu gần giống tóc nên đánh dấu chắc chắn là nền
cau = Image.new("L", (W, H), 0)
ImageDraw.Draw(cau).polygon([(350, 380), (470, 380), (460, 408), (440, 434), (420, 466), (406, 503), (394, 545), (350, 545)], fill=255)
# Khe nền giữa mái tóc cô dâu và đầu chú rể
ImageDraw.Draw(cau).polygon([(624, 412), (681, 411), (682, 487), (671, 504), (656, 512), (651, 503),
                             (646, 477), (641, 448), (635, 431)], fill=255)
nhan[(np.asarray(cau) > 0) & ~trong] = cv2.GC_BGD

bgr = cv2.cvtColor(np.asarray(anh), cv2.COLOR_RGB2BGR)
mo_hinh_nen = np.zeros((1, 65), np.float64)
mo_hinh_hinh = np.zeros((1, 65), np.float64)
cv2.grabCut(bgr, nhan, None, mo_hinh_nen, mo_hinh_hinh, 8, cv2.GC_INIT_WITH_MASK)
hinh = (nhan == cv2.GC_FGD) | (nhan == cv2.GC_PR_FGD)

# Giữ khối liền lớn nhất, lấp lỗ nhỏ, làm mềm mép
so, nhan_khoi, tk, _ = cv2.connectedComponentsWithStats(hinh.astype(np.uint8), 8)
lon_nhat = 1 + int(np.argmax(tk[1:, cv2.CC_STAT_AREA]))
hinh = nhan_khoi == lon_nhat
hinh = cv2.morphologyEx(hinh.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)) > 0

alpha = Image.fromarray((hinh * 255).astype("uint8")).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
rgba = anh.copy()
rgba.putalpha(alpha)
hop = rgba.getbbox()
rgba = rgba.crop(hop)

CAO = 520
rgba = rgba.resize((round(rgba.width * CAO / rgba.height), CAO), Image.LANCZOS)
rgba.save(RA, optimize=True)
print("đã ghi", RA.relative_to(GOC), rgba.size, f"{RA.stat().st_size // 1024} KB")

# Bản xem thử: trên nền xanh (soi mép) và nền kem (như trên thiệp), cùng đường bao thô vẽ đè lên ảnh gốc
o = []
for mau in ((150, 185, 150, 255), (247, 242, 231, 255)):
    n = Image.new("RGBA", rgba.size, mau)
    n.alpha_composite(rgba)
    o.append(n.convert("RGB"))
ve = anh.copy()
ImageDraw.Draw(ve).line(BAO + [BAO[0]], fill=(255, 0, 0), width=3)
ve = ve.crop((300, 230, 1010, 1130)).resize((355, 450))
g = Image.new("RGB", (o[0].width * 2 + ve.width + 40, max(o[0].height, ve.height)), (255, 255, 255))
g.paste(o[0], (0, 0))
g.paste(o[1], (o[0].width + 20, 0))
g.paste(ve, (o[0].width * 2 + 40, 0))
g.save(THU / "xem-lego-moi.png")
print("bản xem thử: _thu/xem-lego-moi.png", g.size)
