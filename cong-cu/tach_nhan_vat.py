"""Tách các nhân vật lego (vẽ màu nước) khỏi nền tranh, ghi PNG nền trong suốt vào images/lego/.

Mỗi nhân vật khai báo: ảnh nguồn, khung chữ nhật bao quanh, và (tuỳ chọn) các vùng chắc chắn là nền.
Thuật toán GrabCut (OpenCV) tự tìm mép theo màu bên trong khung.

Cách dùng (ở thư mục gốc repo):
    pip install pillow numpy opencv-python-headless
    python cong-cu/tach_nhan_vat.py            # tách tất cả
    python cong-cu/tach_nhan_vat.py chu-re-nhan co-dau-hoa
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GOC = Path(__file__).resolve().parent.parent
RA = GOC / "images" / "lego"
THU = GOC / "_thu"
BANG = "nguon/lego-bang-nhan-vat.jpg"         # bảng 4 cô dâu (hàng trên) + 4 chú rể (hàng dưới)

# Váy cưới (và voan) màu kem gần trùng màu nền nên thuật toán hay cắt mất:
# vẽ tay đường bao váy làm vùng "chắc chắn là hình".
VAY_CO_DAU_HOA = [(285, 200), (375, 200), (395, 262), (400, 320), (440, 458), (237, 458), (268, 320), (272, 262)]
VAY_CO_DAU_VOAN = [(836, 68), (800, 105), (779, 145), (772, 210), (771, 275), (785, 300), (805, 310), (828, 318),
                   (786, 452), (1062, 452), (1003, 322), (1040, 292), (1066, 270), (1068, 205), (1040, 165),
                   (1005, 122), (975, 75), (940, 48), (880, 45)]
VAY_CO_DAU_BUI = [(1165, 200), (1300, 200), (1308, 260), (1318, 350), (1342, 462), (1138, 462), (1150, 350), (1157, 260)]
BUI_TOC = [(1190, 68), (1202, 52), (1240, 38), (1278, 50), (1292, 68), (1280, 82), (1200, 82)]   # búi tóc và hoa cài
# chú rể bế cô dâu (nguon/lego-doi-be.jpg, khung trên trái): thân váy và chân váy xoè
VAY_BE = [[(345, 185), (398, 178), (410, 250), (345, 262)],
          [(330, 290), (440, 255), (560, 232), (640, 300), (620, 340), (520, 400), (445, 445), (400, 445),
           (380, 350), (332, 322)]]
# cô dâu cầm que pháo (nguon/lego-co-dau-phao.png): váy trắng gần trùng màu nền
VAY_CO_DAU_PHAO = [(472, 600), (655, 600), (690, 760), (712, 900), (785, 1265), (290, 1265), (410, 900), (440, 760)]
VAY_DOI = [(495, 585), (612, 585), (630, 700), (640, 810), (698, 1137), (304, 1137), (420, 770), (470, 700)]

# tên: (ảnh nguồn, khung (x0, y0, x1, y1), chiều cao xuất, đa giác chắc chắn là hình)
NHAN_VAT = {
    "co-dau-hoa":     (BANG, (226, 18, 452, 470), 420, [VAY_CO_DAU_HOA]),    # cô dâu ôm hoa (tóc xoã)
    "co-dau-voan":    (BANG, (762, 18, 1074, 468), 420, [VAY_CO_DAU_VOAN]),  # cô dâu đội voan, vẫy tay
    "chu-re-nhan":    (BANG, (196, 490, 452, 936), 420, []),                 # chú rể cầm hộp nhẫn
    "chu-re-vay":     (BANG, (512, 488, 748, 938), 420, []),                 # chú rể ngả mũ vẫy tay
    # màn ăn mừng sau khi khách gửi xác nhận tham dự: tia pháo ở đầu que và rượu champagne do code vẽ,
    # nên cắt bỏ chùm pháo vẽ sẵn trên đầu que (khung bắt đầu ngay dưới chùm pháo)
    "co-dau-phao": ("nguon/lego-co-dau-phao.png", (270, 292, 822, 1285), 520, [VAY_CO_DAU_PHAO]),
    "chu-re-champagne": ("nguon/lego-chu-re-champagne.png", (345, 190, 890, 1155), 520, []),
    "doi-be": ("nguon/lego-doi-be.jpg", (248, 15, 652, 478), 520, VAY_BE),       # chú rể bế cô dâu (cuối thiệp)
    "co-dau-bui-toc": (BANG, (1128, 28, 1348, 468), 420, [VAY_CO_DAU_BUI, BUI_TOC]),  # cô dâu búi tóc, váy ren (cuối thiệp)
    "chu-re-khoanh-tay": (BANG, (1162, 488, 1322, 940), 420, []),           # chú rể đội mũ khoanh tay (cuối thiệp)
    "doi-toc-den-mu": ("nguon/lego-doi-toc-den-mu.jpg", (296, 255, 990, 1148), 520, [VAY_DOI]),
    # đôi tóc đen, chú rể để tóc
    "doi-toc-den-toc": ("nguon/lego-doi-toc-den-toc.jpg", (270, 288, 990, 1160), 520,
                        [[(478, 570), (610, 570), (628, 700), (640, 800), (705, 1148), (280, 1148),
                          (420, 760), (460, 700)],
                         [(702, 505), (812, 505), (808, 600), (760, 668), (732, 668), (706, 600)]]),   # sơ mi trắng chú rể
}
# Vùng chắc chắn là nền (không thuộc nhân vật) cho từng nhân vật, nếu cần
NEN_CHAC = {
    # cây cầu trong tranh nằm sát chai champagne
    "chu-re-champagne": [[(345, 190), (378, 190), (378, 362), (368, 400), (358, 470), (345, 470)]],
    # bên phải chú rể: trái tim nhỏ và hoa rum của tranh
    "doi-be": [[(565, 15), (652, 15), (652, 225), (588, 225), (570, 150)],
               [(632, 140), (652, 140), (652, 292), (642, 292)]],
    # hai bên váy ren cô dâu búi tóc: nền kem gần trùng màu ren
    "co-dau-bui-toc": [[(1128, 100), (1150, 100), (1154, 200), (1145, 330), (1133, 462), (1128, 462)],
                       [(1348, 100), (1326, 100), (1313, 200), (1323, 330), (1347, 462), (1348, 462)]],
}


def tach(ten, nguon, khung, cao, hinh_chac):
    anh = Image.open(GOC / nguon).convert("RGB")
    W, H = anh.size
    bgr = cv2.cvtColor(np.asarray(anh), cv2.COLOR_RGB2BGR)
    x0, y0, x1, y1 = khung
    nhan = np.full((H, W), cv2.GC_BGD, np.uint8)
    nhan[y0:y1, x0:x1] = cv2.GC_PR_FGD
    # viền 14px sát trong khung để thuật toán hiểu là "có thể là nền"
    nhan[y0:y1, x0:x0 + 14] = nhan[y0:y1, x1 - 14:x1] = cv2.GC_PR_BGD
    nhan[y0:y0 + 14, x0:x1] = cv2.GC_PR_BGD
    chac = np.zeros((H, W), bool)
    for da_giac in hinh_chac:
        m = Image.new("L", (W, H), 0)
        ImageDraw.Draw(m).polygon(da_giac, fill=255)
        chac |= np.asarray(m) > 0
    nhan[chac] = cv2.GC_FGD
    for da_giac in NEN_CHAC.get(ten, []):
        m = Image.new("L", (W, H), 0)
        ImageDraw.Draw(m).polygon(da_giac, fill=255)
        nhan[np.asarray(m) > 0] = cv2.GC_BGD
    m1, m2 = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.setRNGSeed(7)      # cố định ngẫu nhiên để chạy lại lần nào cũng ra cùng kết quả
    cv2.grabCut(bgr, nhan, None, m1, m2, 10, cv2.GC_INIT_WITH_MASK)
    hinh = (((nhan == cv2.GC_FGD) | (nhan == cv2.GC_PR_FGD)) | chac).astype(np.uint8)

    # giữ khối lớn nhất (bỏ hoa lá vụn quanh khung), lấp các lỗ nhỏ bên trong
    so, nhan_k, tk, _ = cv2.connectedComponentsWithStats(hinh, 8)
    hinh = (nhan_k == 1 + int(np.argmax(tk[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    nguoc = 1 - hinh
    so, nhan_l, tk, _ = cv2.connectedComponentsWithStats(nguoc, 4)
    for i in range(1, so):
        if tk[i, cv2.CC_STAT_AREA] < 4000:          # lỗ nhỏ bên trong (răng, khuy áo...) thì lấp lại
            hinh[nhan_l == i] = 1
    hinh = cv2.morphologyEx(hinh, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

    alpha = Image.fromarray(hinh * 255).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.1))
    rgba = anh.copy()
    rgba.putalpha(alpha)
    rgba = rgba.crop(rgba.getbbox())
    rgba = rgba.resize((round(rgba.width * cao / rgba.height), cao), Image.LANCZOS)
    RA.mkdir(parents=True, exist_ok=True)
    # lưu PNG 256 màu (có lớp trong suốt): nhẹ đi khoảng 4–5 lần, nhìn không khác
    rgba.quantize(colors=256, method=Image.Quantize.FASTOCTREE,
                  dither=Image.Dither.FLOYDSTEINBERG).save(RA / f"{ten}.png", optimize=True)
    print(f"{ten}.png  {rgba.size}  {(RA / f'{ten}.png').stat().st_size // 1024} KB")
    return rgba


chon = sys.argv[1:] or list(NHAN_VAT)
ket = [tach(t, *NHAN_VAT[t]) for t in chon]

# bản xem thử: mỗi nhân vật trên nền xanh (soi mép) và nền kem (như trên thiệp)
THU.mkdir(exist_ok=True)
cao = 300
o = []
for r in ket:
    r = r.resize((round(r.width * cao / r.height), cao), Image.LANCZOS)
    for mau in ((150, 185, 150, 255), (247, 242, 231, 255)):
        n = Image.new("RGBA", r.size, mau)
        n.alpha_composite(r)
        o.append(n.convert("RGB"))
g = Image.new("RGB", (sum(i.width for i in o) + 10 * len(o), cao), (255, 255, 255))
x = 0
for i in o:
    g.paste(i, (x, 0))
    x += i.width + 10
g.save(THU / "xem-nhan-vat.png")
print("bản xem thử: _thu/xem-nhan-vat.png", g.size)
