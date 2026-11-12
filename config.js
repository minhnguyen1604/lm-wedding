/* ============================================================
   NỘI DUNG THIỆP — chỉ cần sửa file này, không cần đụng file khác
   ============================================================ */
window.THIEP = {

  // Logo ở đầu trang (để "" nếu không muốn hiện)
  logo: "images/logo-lm.png",

  // 0) MÀN MỞ THIỆP + NHẠC + ĐÔI BÚP BÊ
  //    bat: true thì khách vào link thấy màn "Mở thiệp" trước; chạm vào thì hai búp bê bước lại
  //    gần nhau, pháo hoa nổ, nhạc bắt đầu, và ở cuối thiệp có đôi búp bê đung đưa theo nhạc.
  moThiep: {
    bat: true,
    ten: "Save the date",   // dòng chữ dưới logo trên màn mở thiệp
    ngay: "02 . 01 . 2027",
    // Ảnh hai hình lego (nền trong suốt). Để "" thì dùng hình vẽ sẵn.
    hinh: { chuRe: "images/lego-chu-re.png", coDau: "images/lego-co-dau.png" },
    // File nhạc, ví dụ "audio/canon-in-d.mp3". Để "" thì không có nhạc và không có đĩa nhạc.
    nhac: "audio/canon-in-d.mp3",
  },

  // 1) CÁC KHUNG THIỆP (ảnh thiết kế thông tin đám cưới)
  //    Chép ảnh vào thư mục images/thiep/ rồi ghi tên file ở đây.
  //    Ảnh nào chưa có thì trang tự hiện khung trống.
  thiep: [
    "images/thiep/1.jpg",   // lời mời (mặt sau thiệp giấy)
    "images/thiep/2.jpg",   // chương trình tiệc cưới (mặt trước thiệp giấy, đã bỏ mã QR và lề trống)
  ],

  // 2) ĐỊA ĐIỂM
  diaDiem: {
    thoiGian: "17h30 · Thứ Bảy · 02.01.2027",
    ten: "Khách sạn Meliá Hà Nội",
    sanh: "Hội trường Grand Ballroom – Tầng 2",
    diaChi: "44B Lý Thường Kiệt, Phường Cửa Nam, Hà Nội",
    // Từ khoá để ghim trên Google Maps (tên + địa chỉ), hoặc toạ độ "21.0288,105.8525"
    ghimBanDo: "Khách sạn Meliá Hanoi, 44B Lý Thường Kiệt, Hà Nội",
  },

  // 3) XÁC NHẬN THAM DỰ — khách điền trên thiệp, dữ liệu ghi về Google Sheet qua một Google Form
  //    Để formUrl là "" thì mục này (và nút "Xác nhận tham dự") tự ẩn.
  xacNhan: {
    // Địa chỉ nhận của Google Form, dạng: https://docs.google.com/forms/d/e/XXXX/formResponse
    formUrl: "",
    // Mã của từng câu hỏi trong Google Form (dạng "entry.123456789")
    truong: {
      ten: "",
      thamDu: "",
      soNguoi: "",
      khachCua: "",
      loiChuc: "",
    },
    // Dòng nhắc hạn chót, ví dụ "Xin vui lòng xác nhận trước ngày 20.12.2026" (để "" nếu không cần)
    hanChot: "",
  },

  // 4) ALBUM ẢNH CƯỚI (cuộn ngang)
  //    Chép ảnh vào thư mục images/gallery/ rồi liệt kê tên file ở đây.
  //    Để trống [] thì mục album tự ẩn.
  gallery: [
    "images/gallery/01.jpg",
    "images/gallery/02.jpg",
    "images/gallery/03.jpg",
    "images/gallery/04.jpg",
    "images/gallery/05.jpg",
    "images/gallery/06.jpg",
  ],

  // Dòng chữ cuối trang
  loiKet: "Sự hiện diện của Quý khách là niềm vinh hạnh của gia đình chúng tôi.",
};
