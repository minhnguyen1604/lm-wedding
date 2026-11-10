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


CANH_PDF_MM = 60  # cạnh trang PDF (mm); mã là vector nên nhà in phóng to/thu nhỏ tuỳ ý


def luu_pdf(qr: qrcode.QRCode, mau: str, duong_dan: Path) -> None:
    """Ghi mã QR thành PDF vector một trang (không cần thư viện ngoài)."""
    o = qr.modules_count + 2 * qr.border          # số ô mỗi cạnh, kể cả viền trắng
    canh = CANH_PDF_MM / 25.4 * 72                # mm -> point
    r, g, b = (int(mau[i:i + 2], 16) / 255 for i in (1, 3, 5))

    lenh = [f"1 1 1 rg 0 0 {canh:.4f} {canh:.4f} re f",
            f"{r:.4f} {g:.4f} {b:.4f} rg",
            f"{canh / o:.6f} 0 0 {canh / o:.6f} 0 0 cm"]
    for hang, dong in enumerate(qr.modules):
        y = o - qr.border - hang - 1              # PDF tính toạ độ từ dưới lên
        cot = 0
        while cot < len(dong):
            if dong[cot]:
                dau = cot
                while cot < len(dong) and dong[cot]:
                    cot += 1
                lenh.append(f"{dau + qr.border} {y} {cot - dau} 1 re")
            else:
                cot += 1
    lenh.append("f")
    noi_dung = "\n".join(lenh).encode("ascii")

    doi_tuong = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {canh:.4f} {canh:.4f}] /Contents 4 0 R >>".encode("ascii"),
        b"<< /Length %d >>\nstream\n" % len(noi_dung) + noi_dung + b"\nendstream",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    vi_tri = []
    for so, than in enumerate(doi_tuong, start=1):
        vi_tri.append(len(pdf))
        pdf += b"%d 0 obj\n" % so + than + b"\nendobj\n"
    bang = len(pdf)
    pdf += b"xref\n0 %d\n0000000000 65535 f \n" % (len(doi_tuong) + 1)
    for v in vi_tri:
        pdf += b"%010d 00000 n \n" % v
    pdf += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(doi_tuong) + 1, bang)
    duong_dan.write_bytes(bytes(pdf))


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

        # PDF vector, lưu ở thư mục gốc của thiệp cho dễ tìm
        pdf = thu_muc.parent / f"QR-thiep-cuoi-{ten}.pdf"
        luu_pdf(qr, mau, pdf)
        print(f"Đã tạo: {pdf}")

    canh = qr.modules_count + 2 * qr.border
    print(f"Link trong mã: {url}")
    print(f"Kích thước mã: {qr.modules_count}x{qr.modules_count} ô (cả viền trắng: {canh} ô)")


if __name__ == "__main__":
    if len(sys.argv) < 2 or not sys.argv[1].startswith(("http://", "https://")):
        sys.exit("Cần truyền link bắt đầu bằng https://  — ví dụ: python qr/tao_qr.py https://ten.github.io/thiep/")
    dich = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).parent
    tao(sys.argv[1], dich)
