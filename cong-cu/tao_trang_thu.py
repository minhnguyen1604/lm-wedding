"""Tạo trang thử thu.html (chỉ nằm trên máy, không đưa lên GitHub) để xem thiệp với cài đặt khác.

Ví dụ hiện tại: ghi thêm dòng hạn chót xác nhận để xem thử. Sửa khối <script> bên dưới tuỳ ý.

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
    // Chỉ dùng cho trang thử trên máy
    THIEP.xacNhan.hanChot = "Xin vui lòng xác nhận trước ngày 20.12.2026";
  </script>"""
assert moc in html
(GOC / "thu.html").write_text(html.replace(moc, ghi_de), encoding="utf-8")
print("đã tạo thu.html")
