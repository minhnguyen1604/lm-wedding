"""Thu nhỏ ảnh cưới gốc cho album: cạnh dài 1600 px, bỏ thông tin EXIF, ghi images/gallery/01.jpg, 02.jpg...
Kèm bản nhỏ cạnh dài 1080 px ở images/gallery/nho/ cho dải ảnh cuộn ngang (trượt nhẹ hơn trên điện thoại);
bấm vào ảnh để xem to thì vẫn dùng bản 1600 px.

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
NGUON = Path(sys.argv[1]) if len(sys.argv) > 1 else GOC / "nguon" / "anh-cuoi-moi"
DICH = GOC / "images" / "gallery"

# Thứ tự album (15 ảnh): trộn đều ảnh đôi, ảnh cô dâu (studio hoa), ảnh chú rể và ảnh chi tiết,
# mở đầu bằng ảnh hai người, ảnh chú rể một mình không đứng đầu và không đứng gần nhau.
# Bộ ảnh cũ (6 ảnh) vẫn ở nguon/anh-cuoi/: chạy `python cong-cu/thu_nho_anh_cuoi.py nguon/anh-cuoi` để dùng lại.
THU_TU = [
    "f68076b7-9090-4e75-90bc-5786d6c8029b.jpeg",   # hai người trước hàng cây
    "9654e75e-500d-409b-8d83-f3ead175643c.jpeg",   # cô dâu, studio hoa
    "8116c374-3c3c-4349-9a47-0edb87dbd576.jpeg",   # hai người dưới khăn voan dài
    "02714804-a7da-4924-9c1a-f677e95d043c.jpeg",   # cô dâu nhìn nghiêng, studio hoa
    "77a709b0-bad7-4aa1-96d6-35b0d1175740.jpeg",   # hai người dạo bước, quán ngoài trời
    "da202839-0634-47b5-856e-720fcbca8782.jpeg",   # chú rể trên bãi cỏ
    "c104407c-46ec-4900-b209-914e11ebca17.jpeg",   # cô dâu ngồi giữa hoa
    "c9164f4300b280ecd9a3.jpg",                    # hai người dưới ô trong suốt (ảnh màu, thay ảnh đen trắng)
    "261fb844-6c7a-46b3-98a7-39daedd5d534.jpeg",   # cận bó hoa
    "5092bcec-c5a6-42cf-8a7f-12d1235d0fc6.jpeg",   # cô dâu quay lưng, studio hoa
    "67a378c1-af4b-4da0-95bf-c162b4d80cb1.jpeg",   # hai người qua gương cầu
    "0756d918-adc7-4abb-8e9c-fc3516e0d9c6.jpeg",   # chú rể cầm hoa
    "f66a86a4-1a6d-4753-8b0e-3729e3d46042.jpeg",   # hai người trong quán, tường cam
    "5ebd9def-c657-46c4-af99-11a668fc33bf.jpeg",   # cô dâu, toàn cảnh studio hoa
    "999a021232e2b2bcebf3.jpg",                    # hai người nắm tay xoay điệu nhảy trên bãi cỏ (khép lại album)
]

co_san = sorted(p.name for p in NGUON.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))
ds = [t for t in THU_TU if t in co_san] + [t for t in co_san if t not in THU_TU]
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
