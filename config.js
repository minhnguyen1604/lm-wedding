/* ============================================================
   NỘI DUNG THIỆP — chỉ cần sửa file này, không cần đụng file khác
   ============================================================ */
window.THIEP = {

  // Dòng chữ nhỏ ở đầu trang (để "" nếu không muốn hiện)
  loiMoDau: "Trân trọng kính mời",

  // 1) CÁC KHUNG THIỆP (ảnh thiết kế thông tin đám cưới)
  //    Chép ảnh vào thư mục images/thiep/ rồi ghi tên file ở đây.
  //    Ảnh nào chưa có thì trang tự hiện khung trống.
  thiep: [
    "images/thiep/1.jpg",
    "images/thiep/2.jpg",
    "images/thiep/3.jpg",
  ],

  // 2) ĐỊA ĐIỂM — đang là địa điểm MẪU, sẽ thay bằng nơi tổ chức thật
  diaDiem: {
    ten: "Tên nhà hàng / nơi tổ chức",
    diaChi: "Địa chỉ sẽ được cập nhật",
    // Từ khoá để ghim trên Google Maps (tên + địa chỉ), hoặc toạ độ "21.0288,105.8525"
    ghimBanDo: "Hồ Hoàn Kiếm, Hà Nội",
  },

  // 3) ALBUM ẢNH CƯỚI
  //    Chép ảnh vào thư mục images/gallery/ rồi liệt kê tên file ở đây.
  //    Để trống [] thì trang hiện các ô ảnh mẫu.
  gallery: [
    // "images/gallery/01.jpg",
    // "images/gallery/02.jpg",
  ],

  // Dòng chữ cuối trang
  loiKet: "Sự hiện diện của bạn là niềm vinh hạnh của chúng mình",
};
