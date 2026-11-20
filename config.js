/* ============================================================
   NỘI DUNG THIỆP — chỉ cần sửa file này, không cần đụng file khác
   ============================================================ */
window.THIEP = {

  // Logo ở đầu trang và màn mở thiệp (để "" nếu không muốn hiện)
  //  logo-lm-vang.png: vàng ánh kim (đang dùng); logo-lm.png: bản xám gốc
  logo: "images/logo-lm-vang.png",

  // 0) MÀN MỞ THIỆP + NHẠC + ĐÔI BÚP BÊ
  //    bat: true thì khách vào link thấy màn "Mở thiệp" trước; chạm vào thì hai búp bê bước lại
  //    gần nhau, pháo hoa nổ, nhạc bắt đầu, và ở cuối thiệp có đôi búp bê đung đưa theo nhạc.
  moThiep: {
    bat: true,
    ten: "Save the date",   // dòng chữ dưới logo trên màn mở thiệp
    ngay: "02 . 01 . 2027",
    // Ảnh đôi lego (nền trong suốt).
    //  - doi: một ảnh chung cho cả đôi (đang dùng, tách từ tranh nguon/lego-moi-goc.jpg)
    //  - hoặc bỏ doi và dùng chuRe + coDau (đôi cũ, hai ảnh riêng, có hiệu ứng bước lại gần nhau):
    //    hinh: { chuRe: "images/lego-chu-re.png", coDau: "images/lego-co-dau.png" },
    hinh: { doi: "images/lego/doi-toc-den-toc.png" },
    // Màn mở thiệp: để null thì dùng `hinh` như trên.
    // Cảnh cầu hôn (chú rể đội mũ cầm nhẫn bước tới cô dâu) nếu muốn dùng lại:
    //   hinhMo: { chuRe: "images/lego/chu-re-nhan.png", coDau: "images/lego/co-dau-hoa.png" },
    hinhMo: null,
    // Cuối thiệp: chú rể bế cô dâu (tách từ nguon/lego-doi-be.jpg). Để null thì dùng `hinh`.
    hinhCuoi: { doi: "images/lego/doi-be.png" },
    // File nhạc, ví dụ "audio/canon-in-d.mp3". Để "" thì không có nhạc và không có đĩa nhạc.
    nhac: "audio/sugar-maroon-5.mp3",
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
    thoiGian: "",   // dòng giờ ngày phía trên tên khách sạn (để "" thì không hiện)
    ten: "Khách sạn Meliá Hà Nội",
    sanh: "Hội trường Grand Ballroom – Tầng 2",
    diaChi: "44B Lý Thường Kiệt, Phường Cửa Nam, Hà Nội",
    // Từ khoá để ghim trên Google Maps (tên + địa chỉ), hoặc toạ độ "21.0288,105.8525"
    ghimBanDo: "Khách sạn Meliá Hanoi, 44B Lý Thường Kiệt, Hà Nội",
    // Mã nhúng chính thức của Google Maps (Chia sẻ → Nhúng bản đồ → lấy phần src). Để "" thì dùng ghimBanDo ở trên.
    banDoNhung: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.207346293652!2d105.8483808!3d21.024388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab939165e8d9%3A0xf3952b1fa755bdcc!2sMeli%C3%A1%20Hanoi!5e0!3m2!1svi!2svn!4v1795060702224!5m2!1svi!2svn",
  },

  // 3) XÁC NHẬN THAM DỰ — khách điền trên thiệp, dữ liệu ghi về Google Sheet qua một Google Form
  //    Để formUrl là "" thì mục này (và nút "Xác nhận tham dự") tự ẩn.
  xacNhan: {
    // Địa chỉ nhận của Google Form, dạng: https://docs.google.com/forms/d/e/XXXX/formResponse
    //  (form "Xác nhận tham dự – L&M Wedding", ghi vào Sheet L&M-Wedding-Online-Invitation)
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLScjHbgs71DLRVwwoFU0RZB_8lUm01SA0lPY3QVrq1eENSWCHA/formResponse",
    // Mã của từng câu hỏi trong Google Form (dạng "entry.123456789")
    truong: {
      ten: "entry.250352820",
      thamDu: "entry.1277341022",
      soNguoi: "entry.544979033",
      khachCua: "entry.499174629",
      loiChuc: "entry.1823210447",
    },
    // Dòng nhắc hạn chót, ví dụ "Xin vui lòng xác nhận trước ngày 20.12.2026" (để "" nếu không cần)
    hanChot: "",
    // Nhân vật lego hiện cùng lời cảm ơn sau khi gửi: một ảnh hoặc danh sách ảnh đứng cạnh nhau ("" nếu không cần)
    // khách sẽ tham dự: cô dâu cầm que pháo (trái) và chú rể cầm champagne (phải)
    hinhCo: ["images/lego/co-dau-phao.png", "images/lego/chu-re-champagne.png"],
    // Màn ăn mừng ngay sau khi khách GỬI xác nhận "Sẽ tham dự" thành công: que pháo của cô dâu phụt pháo nhiều màu,
    // chú rể lắc chai, nút bật, champagne phụt ra. Toạ độ tính theo tỉ lệ ảnh (0..1):
    //   dauQue: đầu que pháo trên ảnh thứ nhất; miengChai: miệng chai trên ảnh thứ hai; huongChai: hướng miệng chai.
    //   Để anMung: null thì chỉ hiện hai nhân vật đứng yên.
    anMung: { dauQue: [0.925, 0.006], miengChai: [0.08, 0.177], huongChai: [-0.36, -0.93] },
    hinhKhong: "images/lego/doi-toc-den-toc.png", // khách báo vắng: cũng là đôi để tóc
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
    "images/gallery/07.jpg",
    "images/gallery/08.jpg",
    "images/gallery/09.jpg",
    "images/gallery/10.jpg",
    "images/gallery/11.jpg",
    "images/gallery/12.jpg",
    "images/gallery/13.jpg",
    "images/gallery/14.jpg",
    "images/gallery/15.jpg",
  ],

  // Dòng chữ cuối trang (để "" thì không hiện)
  loiKet: "",
};
