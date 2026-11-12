"""Thu nhỏ ảnh cưới gốc cho album: cạnh dài 1600 px, bỏ thông tin EXIF, ghi images/gallery/01.jpg, 02.jpg...

Thứ tự trong album theo danh sách THU_TU bên dưới; ảnh nào không có trong danh sách sẽ xếp sau, theo tên file.
Sau khi chạy, cập nhật danh sách `gallery` trong config.js cho đủ số ảnh.

Cách dùng (ở thư mục gốc repo):
    python cong-cu/thu_nho_anh_cuoi.py                 # đọc nguon/anh-cuoi/
    python cong-cu/thu_nho_anh_cuoi.py thu-muc-anh-khac
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

GOC = Path(__file__).resolve().parent.parent
NGUON = Path(sys.argv[1]) if len(sys.argv) > 1 else GOC / "nguon" / "anh-cuoi"
DICH = GOC / "images" / "gallery"

THU_TU = [
    "90cd54a8-eab6-4f32-8cab-1fad7b9bb511.jpeg",   # hai người dưới khăn voan (cận)
    "6ab19c8e-19e3-4233-8423-a95eb7a6ce09.jpeg",   # khiêu vũ trên bãi cỏ
    "feb33450-b768-46e8-a249-6fcbe37e3511.jpeg",   # khăn voan dài (toàn cảnh)
    "ac43de17-934a-4c51-bbe0-37c89f53e904.jpeg",   # chú rể cầm hoa
    "cc633425-d5b1-4d25-9427-aacdee25e81b.jpeg",   # ảnh qua gương cầu
    "24eb5a4c-816b-4684-8a5c-db3845624718.jpeg",   # trong quán, tường cam
]

co_san = sorted(p.name for p in NGUON.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))
ds = [t for t in THU_TU if t in co_san] + [t for t in co_san if t not in THU_TU]
DICH.mkdir(parents=True, exist_ok=True)
for i, ten in enumerate(ds, 1):
    im = ImageOps.exif_transpose(Image.open(NGUON / ten)).convert("RGB")
    im.thumbnail((1600, 1600), Image.LANCZOS)
    ra = DICH / f"{i:02d}.jpg"
    im.save(ra, quality=82, optimize=True, progressive=True)   # không ghi kèm EXIF
    print(f"{ra.name}  {im.size[0]}x{im.size[1]}  {ra.stat().st_size // 1024} KB  <- {ten}")
print(f'Nhớ cập nhật config.js: gallery = images/gallery/01.jpg ... {len(ds):02d}.jpg')
