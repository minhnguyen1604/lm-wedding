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

## Màn mở thiệp, nhạc, đôi lego

Mục `moThiep` trong `config.js`. Khách vào link thấy màn "Mở thiệp" trước; chạm vào thì hai hình
lego bước lại gần nhau, pháo hoa nổ, nhạc Canon in D bắt đầu (trình duyệt điện thoại chỉ cho phát
nhạc sau một lần chạm). Đĩa nhạc ở góc dưới để tắt/bật; cuối thiệp có đôi lego đung đưa theo nhạc.

- Nhạc: `audio/canon-in-d.mp3` — bản hộp nhạc tổng hợp từ nốt nhạc (không dùng bản thu của ai).
- Ảnh lego: `images/lego-chu-re.png`, `images/lego-co-dau.png` (nền trong suốt).
- Đặt `bat: false` để tắt toàn bộ phần này.

## Album ảnh cưới (cuộn ngang)

Chép ảnh vào `images/gallery/` rồi liệt kê tên file trong mục `gallery` của `config.js`.
Chưa có ảnh nào thì mục album tự ẩn.

## Xác nhận tham dự → Google Sheet

Khách điền form trên thiệp; thiệp gửi dữ liệu vào một Google Form, Form tự ghi vào Google Sheet.
Mục này chỉ hiện khi `xacNhan.formUrl` trong `config.js` đã được điền.

1. Tạo Google Form (nên dùng Gmail cá nhân) với 5 câu hỏi kiểu **Trả lời ngắn**, riêng câu cuối kiểu **Đoạn**:
   Họ và tên · Tham dự · Số người · Khách mời của · Lời chúc. Không bật "Bắt buộc".
2. Trong Cài đặt: không thu thập email, không giới hạn 1 câu trả lời, không yêu cầu đăng nhập.
3. Tab Câu trả lời → Liên kết với Trang tính.
4. Xuất bản form, lấy link và mã `entry.xxxxx` của từng câu hỏi, điền vào `xacNhan` trong `config.js`.

## Tạo lại mã QR (chỉ khi thật sự cần)

```bash
pip install "qrcode[pil]"
python qr/tao_qr.py https://minhnguyen1604.github.io/lm-wedding/
```
