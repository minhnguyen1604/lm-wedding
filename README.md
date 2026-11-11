# L&M Wedding Ceremony Invitation

Thiệp cưới online, chạy trên GitHub Pages:
**https://minhnguyen1604.github.io/lm-wedding/**

> **Không đổi tên repository, tên tài khoản hay đường dẫn.**
> Link trên đã được mã hoá vào mã QR in trên thiệp giấy — đổi là QR hỏng.
> Nội dung thiệp thì sửa thoải mái.

## Cấu trúc

| File / thư mục | Nội dung |
|---|---|
| `config.js` | **Toàn bộ nội dung thiệp**: khung thiệp, địa điểm, album, lời chào. Sửa nội dung chỉ cần sửa file này. |
| `index.html`, `style.css`, `script.js` | Khung trang, giao diện, hiệu ứng. Độ mờ nền chỉnh ở biến `--do-mo-nen` trong `style.css`. |
| `images/nen.jpg` | Ảnh nền hoa |
| `images/logo-lm.png` | Logo LM ở đầu trang (nền trong suốt) |
| `images/thiep/` | Ảnh thiết kế thiệp: `1.jpg` lời mời, `2.jpg` timeline (cắt từ bản duyệt in) |
| `images/gallery/` | Ảnh cưới cho album (liệt kê tên file trong `config.js`) |
| `qr/` | Mã QR (PNG, SVG) và script tạo mã `tao_qr.py` |
| `QR-thiep-cuoi-*.pdf` | Mã QR bản PDF vector để gửi nhà in |

## Làm việc trên máy khác

```bash
git clone https://github.com/minhnguyen1604/lm-wedding.git
cd lm-wedding
python -m http.server 8123
```

Mở http://localhost:8123 để xem thử.

## Cập nhật thiệp

1. Sửa `config.js` hoặc chép ảnh vào `images/thiep`, `images/gallery`
   (ảnh cưới nên thu nhỏ còn khoảng 1600 px cạnh dài cho nhẹ).
2. Đưa lên:

```bash
git add -A
git commit -m "Cập nhật thiệp"
git push
```

Khoảng 1–2 phút sau link công khai đổi theo.

## Tạo lại mã QR (chỉ khi thật sự cần)

```bash
pip install "qrcode[pil]"
python qr/tao_qr.py https://minhnguyen1604.github.io/lm-wedding/
```
