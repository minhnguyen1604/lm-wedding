# L&M Wedding Ceremony Invitation

Thiệp cưới online của Tuấn Minh & Tú Linh, chạy trên GitHub Pages:
**https://minhnguyen1604.github.io/lm-wedding/**

> **Không đổi tên repository, tên tài khoản hay đường dẫn.**
> Link trên đã được mã hoá vào mã QR in trên thiệp giấy, đổi là QR hỏng.
> Nội dung thiệp thì sửa thoải mái.

## Thiệp đang có gì (theo thứ tự trên trang)

1. **Màn mở thiệp**: logo LM, "Save the date" (phông Pinyon Script), ngày 02.01.2027, đôi lego và nút "Mở thiệp".
   Chạm vào thì đôi lego nhún nhảy, pháo hoa rực rỡ nổ (tên lửa, 11 chùm nhiều màu, kim tuyến, ba chùm kết),
   nhạc Canon in D bắt đầu. Màn này luôn tự đóng sau ~6 giây kể cả khi máy tạm dừng hoạt ảnh.
2. **Hai mặt thiệp** cắt từ bản duyệt in: mặt lời mời (có chữ "QUÝ KHÁCH" in hoa đậm trên dòng chấm)
   và mặt chương trình tiệc cưới (đã bỏ mã QR). Chạm vào để phóng to.
3. **Xác nhận tham dự**: chọn "Sẽ tham dự" thì hiện họ tên, số người, khách nhà trai/gái, lời chúc;
   chọn "Không thể tham dự" thì chỉ hỏi họ tên. Dữ liệu ghi vào Google Sheet (xem bên dưới).
4. **Album ảnh cưới** cuộn ngang, 6 ảnh, tự trôi chậm, chạm để xem to.
5. **Địa điểm tổ chức**: Khách sạn Meliá Hà Nội, Grand Ballroom tầng 2, 44B Lý Thường Kiệt, bản đồ và nút Chỉ đường.
6. **Câu kết** và đôi lego đung đưa theo nhạc; **chạm vào đôi lego bắn ra chùm tim**.

Luôn có: nền hoa mờ cố định phía sau, đĩa nhạc ở góc dưới để tắt/bật nhạc.
Lời lẽ trên thiệp xưng "Quý khách" / "gia đình chúng tôi" (không dùng "bạn", "chúng mình").

Tải trang: lúc mới mở link chỉ ~0,9 MB; nhạc tải khi bấm "Mở thiệp", ảnh album tải khi cuộn gần tới.

## Cấu trúc

| File / thư mục | Nội dung |
|---|---|
| `config.js` | **Toàn bộ nội dung thiệp**: màn mở thiệp, khung thiệp, địa điểm, form xác nhận, album, câu kết. Sửa nội dung chỉ cần sửa file này. |
| `index.html`, `style.css`, `script.js` | Khung trang, giao diện, hiệu ứng. Độ mờ nền chỉnh ở biến `--do-mo-nen` trong `style.css`. |
| `images/nen.jpg` | Ảnh nền hoa |
| `images/logo-lm.png` | Logo LM (nền trong suốt) |
| `images/thiep/` | `1.jpg` mặt lời mời, `2.jpg` mặt chương trình tiệc — tạo bằng `cong-cu/cat_thiep.py` |
| `images/gallery/` | Ảnh album đã thu nhỏ — tạo bằng `cong-cu/thu_nho_anh_cuoi.py` |
| `images/lego-doi.png` | **Đôi lego đang dùng** (một ảnh chung, nét vẽ màu nước) — tách từ `nguon/lego-moi-goc.jpg` bằng `cong-cu/tach_lego_moi.py` |
| `images/lego-chu-re.png`, `lego-co-dau.png` | Đôi lego cũ (ảnh chụp, hai ảnh riêng) — tạo bằng `cong-cu/tach_lego.py`; đổi lại trong `config.js` nếu muốn |
| `audio/canon-in-d.mp3` | Nhạc nền — tạo bằng `cong-cu/tao_nhac.py` |
| `nguon/` | **Ảnh gốc**: bản duyệt in mới (`ban-duyet-in.jpeg`) và cũ, logo gốc, ảnh lego gốc, ảnh cưới gốc (`anh-cuoi/`) |
| `cong-cu/` | Script Python để tạo lại ảnh, nhạc từ ảnh gốc |
| `qr/` | Mã QR (PNG, SVG) và script tạo mã `tao_qr.py` |
| `QR-thiep-cuoi-*.pdf` | Mã QR bản PDF vector để gửi nhà in |

Các file chỉ để thử / tham khảo, không dùng trên thiệp:
`_thu/` (nhạc thử WAV, bảng so sánh phông chữ, ảnh xem trước đã bỏ...), `thu.html` (trang thử),
`anhcuoi/` và các ảnh tên dài ở thư mục ngoài cùng (bản gốc như anh gửi, trùng với `nguon/`),
`qr-thiep-*.png` ở thư mục ngoài cùng (trùng với `qr/`).
Lưu ý: vì repo dùng cho GitHub Pages nên các file này cũng mở được qua link, ví dụ `.../lm-wedding/thu.html`.

## Làm việc trên máy khác

```bash
git clone https://github.com/minhnguyen1604/lm-wedding.git
cd lm-wedding
python -m http.server 8123
```

Mở http://localhost:8123 để xem thử. Cần đẩy code lên thì máy đó phải đăng nhập GitHub cho git.

Chỉ khi cần chạy các script trong `cong-cu/`:

```bash
pip install pillow numpy "qrcode[pil]" lameenc opencv-python-headless
```

## Cập nhật thiệp

1. Sửa `config.js` (hoặc chạy script trong `cong-cu/` nếu đổi ảnh, nhạc).
2. Đưa lên:

```bash
git add -A
git commit -m "Cập nhật thiệp"
git push
```

Khoảng 1–2 phút sau link công khai đổi theo. Máy nào còn hiện bản cũ thì tải lại trang.

## Công cụ (`cong-cu/`) — chạy ở thư mục gốc repo

| Script | Việc |
|---|---|
| `cat_thiep.py [ảnh duyệt in]` | Cắt 2 mặt thiệp từ `nguon/ban-duyet-in.jpeg`, viết "QUÝ KHÁCH", bỏ QR ở mặt chương trình, **kiểm tra QR in trên thiệp khớp link**. Dùng phông Palatino đậm có sẵn trên Windows. Khi nhà in gửi bản duyệt mới (cùng bố cục): chép vào `nguon/ban-duyet-in.jpeg` rồi chạy lại. |
| `thu_nho_anh_cuoi.py [thư mục]` | Thu nhỏ ảnh cưới gốc còn cạnh dài 1600 px, bỏ EXIF, ghi `images/gallery/01.jpg…`. Thứ tự sửa trong danh sách `THU_TU`. Nhớ cập nhật `gallery` trong `config.js`. |
| `tach_lego_moi.py` | Tách đôi lego đang dùng khỏi nền tranh `nguon/lego-moi-goc.jpg` bằng GrabCut (cần `opencv-python-headless`); đường bao thô vẽ tay cho riêng ảnh này. |
| `tach_lego.py` | Tách đôi lego cũ khỏi nền ảnh `nguon/lego-goc.png` (toạ độ xoá nét thừa chỉnh tay cho ảnh này). |
| `tao_nhac.py` | Tổng hợp bản Canon in D kiểu hộp nhạc, ghi `audio/canon-in-d.mp3`. Muốn dùng bản thu thật thì thay file mp3 và giữ tên. |
| `tao_trang_thu.py` | Tạo `thu.html` để xem thử thiệp với cài đặt khác mà không đụng bản thật. |

Chạy lại các script trên với ảnh gốc hiện tại cho ra đúng các file đang dùng.

## Xác nhận tham dự → Google Sheet

- Google Form **"Xác nhận tham dự – L&M Wedding"** trong tài khoản Gmail cá nhân của Tuấn Minh
  (file trong Drive tên "Mẫu không có tiêu đề").
- Câu trả lời ghi vào Google Sheet **"L&M-Wedding-Online-Invitation"**, tab **"Câu trả lời biểu mẫu 1"**.
- Thiệp gửi thẳng vào form qua `xacNhan.formUrl` và mã `entry.xxxxx` của 5 câu hỏi trong `config.js`.
- **Không xoá, không đổi tên câu hỏi trong Form**, thiệp sẽ không ghi được nữa. Đổi tiêu đề, màu sắc form thì không sao.
- Thêm dòng hạn chót xác nhận: điền `xacNhan.hanChot` trong `config.js`.
- Một người có thể gửi nhiều lần (trên cùng máy thì lần sau thấy lời cảm ơn), khi đếm khách nên lọc theo tên.

Tạo form mới (nếu cần): 5 câu Họ và tên · Tham dự · Số người · Khách mời của (Trả lời ngắn) · Lời chúc (Đoạn);
không bật "Bắt buộc"; Cài đặt: không thu thập email, không giới hạn 1 câu trả lời; liên kết với Trang tính;
xuất bản cho "Bất kỳ ai có đường liên kết"; lấy mã `entry.` qua "Nhận đường liên kết điền sẵn".

## Ý tưởng đã thử và bỏ (đừng làm lại)

- Hoa rum rơi sau khi mở thiệp — bỏ vì không đẹp.
- Nút "Thêm vào lịch" (Google Calendar / iPhone) — bỏ.
- Ảnh xem trước riêng khi gửi link qua Zalo/Messenger — bỏ, chỉ gửi link trần.
- Đôi búp bê / lego tự vẽ bằng SVG — bỏ, dùng ảnh lego (code vẽ vẫn còn trong `script.js` làm phương án dự phòng).
- Đôi lego ảnh chụp (hai ảnh riêng, bước lại gần nhau) — thay bằng đôi lego nét vẽ màu nước hợp tông thiệp hơn.
- Khung vòm ở màn mở thiệp — bỏ.
- Nút "Xác nhận tham dự" riêng phía dưới thiệp — bỏ, chỉ giữ một mục xác nhận.

## Ý tưởng chưa làm

- Thiệp gọi tên từng khách: link riêng `?k=Chu-Hung` hiện tên khách trên dòng chấm và điền sẵn tên trong form.
- Đếm ngược tới ngày cưới.
- Mừng cưới online: nút mở mã QR chuyển khoản nhà trai / nhà gái (cần ảnh QR).
- Câu chuyện của hai người, thông tin gửi xe / trang phục.
- Nhạc bản thu thật thay bản hộp nhạc tự tổng hợp.

## Tạo lại mã QR (chỉ khi thật sự cần)

```bash
python qr/tao_qr.py https://minhnguyen1604.github.io/lm-wedding/
```

Script ghi PNG, SVG vào `qr/` và PDF vector ra thư mục gốc.
