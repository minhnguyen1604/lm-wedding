"""Tạo trang thử thu.html (bản sao của thiệp với cài đặt khác) để xem trước khi đổi bản thật.

Hiện tại: thử đôi lego mới (một ảnh chung images/lego-doi.png). Sửa khối <script> bên dưới tuỳ ý.

Cách dùng (ở thư mục gốc repo):
    python cong-cu/tao_trang_thu.py
    python -m http.server 8123      # rồi mở http://localhost:8123/thu.html
"""
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent
html = (GOC / "index.html").read_text(encoding="utf-8")
moc = '<script src="config.js"></script>'
ghi_de = moc + """
  <script>
    // Chỉ dùng cho trang thử
    THIEP.moThiep.hinh = { doi: "images/lego-doi.png" };
  </script>"""
assert moc in html
(GOC / "thu.html").write_text(html.replace(moc, ghi_de), encoding="utf-8")
print("đã tạo thu.html")
