"""Tạo mã QR tĩnh cho link thiệp cưới (để in lên thiệp giấy).

Cách dùng:
    python qr/tao_qr.py https://link-thiep-cua-ban
    python qr/tao_qr.py https://link-thiep-cua-ban thu-muc-xuat

Xuất ra 4 file: bản đen và bản xanh rêu, mỗi bản có PNG (ảnh nét cao)
và SVG (vector, phóng to bao nhiêu cũng không vỡ — nên gửi nhà in file này).
"""
import sys
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_Q
from qrcode.image.svg import SvgPathImage

MAU = {"den": "#000000", "reu": "#4a5134"}


def tao(url: str, thu_muc: Path) -> None:
    thu_muc.mkdir(parents=True, exist_ok=True)
    # Mức sửa lỗi Q: mã vẫn quét được khi bị xước/nhoè tới ~25%
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_Q, box_size=40, border=4)
    qr.add_data(url)
    qr.make(fit=True)

    for ten, mau in MAU.items():
        png = thu_muc / f"qr-thiep-{ten}.png"
        qr.make_image(fill_color=mau, back_color="#ffffff").save(png)

        svg = thu_muc / f"qr-thiep-{ten}.svg"
        qr.make_image(image_factory=SvgPathImage).save(svg)
        noi_dung = svg.read_text(encoding="utf-8")
        # Thêm nền trắng và đổi màu nét cho bản SVG
        noi_dung = noi_dung.replace('fill="#000000"', f'fill="{mau}"')
        noi_dung = noi_dung.replace(
            "><path", '><rect width="100%" height="100%" fill="#ffffff"/><path', 1
        )
        svg.write_text(noi_dung, encoding="utf-8")
        print(f"Đã tạo: {png}  và  {svg}")

    canh = qr.modules_count + 2 * qr.border
    print(f"Link trong mã: {url}")
    print(f"Kích thước mã: {qr.modules_count}x{qr.modules_count} ô (cả viền trắng: {canh} ô)")


if __name__ == "__main__":
    if len(sys.argv) < 2 or not sys.argv[1].startswith(("http://", "https://")):
        sys.exit("Cần truyền link bắt đầu bằng https://  — ví dụ: python qr/tao_qr.py https://ten.github.io/thiep/")
    dich = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).parent
    tao(sys.argv[1], dich)
