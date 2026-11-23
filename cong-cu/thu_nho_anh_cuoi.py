"""Thu nhỏ ảnh cưới gốc cho album: cạnh dài 1600 px, bỏ thông tin EXIF, ghi images/gallery/01.jpg, 02.jpg...
Kèm bản nhỏ cạnh dài 1080 px ở images/gallery/nho/ cho dải ảnh cuộn ngang (trượt nhẹ hơn trên điện thoại);
bấm vào ảnh để xem to thì vẫn dùng bản 1600 px.

Thứ tự trong album theo danh sách THU_TU bên dưới; ảnh nào không có trong danh sách sẽ xếp sau, theo tên file.
Sau khi chạy, cập nhật danh sách `gallery` trong config.js cho đủ số ảnh.

Cách dùng (ở thư mục gốc repo):
    python cong-cu/thu_nho_anh_cuoi.py                 # đọc Thiep/
    python cong-cu/thu_nho_anh_cuoi.py thu-muc-anh-khac
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

GOC = Path(__file__).resolve().parent.parent
NGUON = Path(sys.argv[1]) if len(sys.argv) > 1 else GOC / "Thiep"   # bộ 20 ảnh mới; bộ 15 ảnh trước ở nguon/anh-cuoi-moi
DICH = GOC / "images" / "gallery"

# Thứ tự album: 20 ảnh của bộ ảnh mới (2026-11-23), đúng thứ tự gia đình gửi.
# Ảnh gốc (~20 MB/ảnh) nằm trong Thiep/ của thư mục thiepcuoi-online, không đưa lên GitHub; các repo khác chép
# images/gallery/ sang là xong. Bộ ảnh trước ở nguon/anh-cuoi-moi/ và nguon/anh-cuoi/ (chạy kèm đường dẫn để dùng lại,
# khi đó sửa THU_TU cho khớp tên file).
THU_TU = [
    "MAN_8554.jpg",
    "MAN_9415.jpg",
    "MAN_8367.jpg",
    "MAN_9064.jpg",
    "MAN_8452.jpg",
    "MAN_9503.jpg",
    "MAN_9420.jpg",
    "MAN_9367.jpg",
    "MAN_8349.jpg",
    "MAN_8058.jpg",
    "MAN_7044.jpg",
    "MAN_8209.jpg",
    "TAN_0301.jpg",
    "TAN_0378.jpg",
    "MAN_0139.jpg",
    "MAN_0475.jpg",
    "TAN_0901.jpg",
    "MAN_9559.jpg",
    "MAN_9604.jpg",
    "MAN_9644.jpg",
]

co_san = sorted(p.name for p in NGUON.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))
ds = [t for t in THU_TU if t in co_san]   # chỉ ảnh có trong danh sách (Thiep/ còn vài ảnh không dùng)
thieu = [t for t in THU_TU if t not in co_san]
if thieu:
    sys.exit(f'Thiếu ảnh trong {NGUON}: {thieu}')
DICH.mkdir(parents=True, exist_ok=True)
for cu in list(DICH.glob("*.jpg")) + list(DICH.glob("nho/*.jpg")):   # thay toàn bộ album: xoá ảnh cũ trước
    cu.unlink()
for i, ten in enumerate(ds, 1):
    im = ImageOps.exif_transpose(Image.open(NGUON / ten)).convert("RGB")
    im.thumbnail((1600, 1600), Image.LANCZOS)
    ra = DICH / f"{i:02d}.jpg"
    im.save(ra, quality=82, optimize=True, progressive=True)   # không ghi kèm EXIF
    print(f"{ra.name}  {im.size[0]}x{im.size[1]}  {ra.stat().st_size // 1024} KB  <- {ten}")
    nho = im.copy()
    nho.thumbnail((1080, 1080), Image.LANCZOS)
    (DICH / "nho").mkdir(exist_ok=True)
    nho.save(DICH / "nho" / f"{i:02d}.jpg", quality=80, optimize=True, progressive=True)
    print(f"    nho/{i:02d}.jpg  {nho.size[0]}x{nho.size[1]}  {(DICH / 'nho' / f'{i:02d}.jpg').stat().st_size // 1024} KB")
print(f'Nhớ cập nhật config.js: gallery = images/gallery/01.jpg ... {len(ds):02d}.jpg')
