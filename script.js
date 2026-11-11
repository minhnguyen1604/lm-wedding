(function () {
  "use strict";

  var C = window.THIEP || {};
  var $ = function (id) { return document.getElementById(id); };
  var giamChuyenDong = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  /* ---------- Logo đầu trang / chữ cuối trang ---------- */
  if (C.logo) {
    $("logo").src = C.logo;
    $("logo").hidden = false;
  }
  $("loi-ket").textContent = C.loiKet || "";

  /* ---------- Hiện dần khi cuộn ---------- */
  var quanSat = "IntersectionObserver" in window
    ? new IntersectionObserver(function (ds) {
        ds.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("hien");
            quanSat.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 })
    : null;

  function theoDoi(el) {
    el.classList.add("cuon");
    if (quanSat) quanSat.observe(el); else el.classList.add("hien");
  }
  Array.prototype.forEach.call(document.querySelectorAll(".cuon"), theoDoi);

  function choTrong(tieuDe, ghiChu) {
    var d = document.createElement("div");
    d.className = "cho-trong";
    var b = document.createElement("b");
    b.textContent = tieuDe;
    d.appendChild(b);
    if (ghiChu) {
      var s = document.createElement("span");
      s.textContent = ghiChu;
      d.appendChild(s);
    }
    return d;
  }

  /* ---------- 1. Khung thiệp ---------- */
  var dsKhung = $("ds-khung");
  (C.thiep || []).forEach(function (src, i) {
    var khung = document.createElement("figure");
    khung.className = "khung";
    var trong = choTrong("Khung " + (i + 1), "Ảnh thiết kế thiệp sẽ đặt ở đây");
    khung.appendChild(trong);
    dsKhung.appendChild(khung);
    theoDoi(khung);

    // Có ảnh thật thì thay khung trống bằng ảnh
    var img = new Image();
    img.alt = "Thiệp cưới – trang " + (i + 1);
    img.onload = function () {
      khung.replaceChild(img, trong);
      $("goi-y").hidden = false;
      img.addEventListener("click", function () {
        var ds = Array.prototype.map.call(dsKhung.querySelectorAll("img"), function (x) { return x.src; });
        moAnh(ds, ds.indexOf(img.src));
      });
    };
    img.src = src;
  });

  /* ---------- 2. Địa điểm ---------- */
  var dd = C.diaDiem || {};
  var ghim = dd.ghimBanDo || [dd.ten, dd.diaChi].filter(Boolean).join(", ");
  $("dd-thoi-gian").textContent = dd.thoiGian || "";
  $("dd-ten").textContent = dd.ten || "";
  $("dd-sanh").textContent = dd.sanh || "";
  $("dd-dia-chi").textContent = dd.diaChi || "";
  if (ghim) {
    var q = encodeURIComponent(ghim);
    $("dd-map").src = "https://www.google.com/maps?q=" + q + "&z=16&hl=vi&output=embed";
    $("dd-chi-duong").href = "https://www.google.com/maps/dir/?api=1&destination=" + q;
  }

  /* ---------- 3. Xác nhận tham dự ---------- */
  var xn = C.xacNhan || {};
  if (xn.formUrl) {
    $("xac-nhan").hidden = false;
    $("nut-xac-nhan").hidden = false;
    $("xn-han").textContent = xn.hanChot || "";

    var form = $("xn-form"), nutGui = $("xn-gui"), hopLoi = $("xn-loi");
    var KHOA = "lm-xac-nhan";
    var soNguoi = 1;

    var chon = function (ten) {
      var o = form.querySelector('input[name="' + ten + '"]:checked');
      return o ? o.value : "";
    };
    var baoLoi = function (chu, oCanSua) {
      hopLoi.textContent = chu;
      hopLoi.hidden = false;
      if (oCanSua) oCanSua.focus();
    };
    var hienCamOn = function (coDen) {
      $("xn-cam-on").textContent = coDen
        ? "Xin cảm ơn! Đã ghi nhận xác nhận tham dự. Rất mong được đón tiếp trong ngày vui."
        : "Xin cảm ơn đã báo tin. Rất tiếc vì không được đón tiếp trong ngày vui này.";
      form.hidden = true;
      $("xn-xong").hidden = false;
    };

    // Chọn "Sẽ tham dự" thì mới hỏi số người
    Array.prototype.forEach.call(form.querySelectorAll('input[name="thamDu"]'), function (o) {
      o.addEventListener("change", function () {
        $("xn-neu-co").hidden = chon("thamDu").indexOf("Sẽ") !== 0;
      });
    });
    var doiSo = function (buoc) {
      soNguoi = Math.min(10, Math.max(1, soNguoi + buoc));
      $("xn-so").textContent = soNguoi;
    };
    $("xn-tru").addEventListener("click", function () { doiSo(-1); });
    $("xn-cong").addEventListener("click", function () { doiSo(1); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hopLoi.hidden = true;
      var ten = $("xn-ten").value.trim();
      var thamDu = chon("thamDu");
      var khachCua = chon("khachCua");
      if (!ten) return baoLoi("Xin vui lòng điền họ và tên.", $("xn-ten"));
      if (!thamDu) return baoLoi("Xin vui lòng chọn có tham dự hay không.");
      if (!khachCua) return baoLoi("Xin vui lòng chọn khách mời của nhà trai hay nhà gái.");
      var coDen = thamDu.indexOf("Sẽ") === 0;

      // Máy gửi tự động thường điền cả ô bẫy: coi như xong nhưng không gửi đi
      if (form.elements.website.value) return hienCamOn(coDen);

      var t = xn.truong || {};
      var duLieu = new URLSearchParams();
      var them = function (ma, giaTri) { if (ma) duLieu.append(ma, giaTri); };
      them(t.ten, ten);
      them(t.thamDu, thamDu);
      them(t.soNguoi, coDen ? String(soNguoi) : "0");
      them(t.khachCua, khachCua);
      them(t.loiChuc, $("xn-loi-chuc").value.trim());

      nutGui.disabled = true;
      nutGui.textContent = "Đang gửi…";
      // Google Form không cho trang khác đọc phản hồi (no-cors), nên chỉ biết được là đã gửi đi
      fetch(xn.formUrl, { method: "POST", mode: "no-cors", body: duLieu })
        .then(function () {
          try { localStorage.setItem(KHOA, JSON.stringify({ coDen: coDen })); } catch (loi) { /* không lưu được cũng không sao */ }
          hienCamOn(coDen);
          $("xn-cam-on").focus();
        })
        .catch(function () {
          baoLoi("Chưa gửi được. Xin kiểm tra kết nối mạng rồi thử lại.");
        })
        .then(function () {
          nutGui.disabled = false;
          nutGui.textContent = "Gửi xác nhận";
        });
    });

    $("xn-sua").addEventListener("click", function () {
      try { localStorage.removeItem(KHOA); } catch (loi) { /* bỏ qua */ }
      $("xn-xong").hidden = true;
      form.hidden = false;
      $("xn-ten").focus();
    });

    // Khách đã xác nhận trên máy này thì lần sau mở lại thấy luôn lời cảm ơn
    try {
      var cu = JSON.parse(localStorage.getItem(KHOA) || "null");
      if (cu) hienCamOn(!!cu.coDen);
    } catch (loi) { /* bỏ qua */ }
  }

  /* ---------- 4. Album cuộn ngang ---------- */
  var dai = $("dai-anh");
  var album = C.gallery || [];

  if (!album.length) {
    // Chưa có ảnh cưới thì ẩn hẳn mục album
    $("album").hidden = true;
  } else {
    var dsO = function () { return Array.prototype.slice.call(dai.children); };
    var dangO = 0;        // ảnh đang nằm giữa
    var tuChay = null;    // bộ hẹn giờ tự trôi

    album.forEach(function (src, i) {
      var o = document.createElement("button");
      o.type = "button";
      o.className = "o-anh";
      o.setAttribute("aria-label", "Xem to ảnh " + (i + 1));
      var img = document.createElement("img");
      img.loading = "lazy";
      img.alt = "Ảnh cưới " + (i + 1);
      img.draggable = false;
      img.onerror = function () { o.remove(); capNhat(); };
      img.src = src;
      o.appendChild(img);
      o.addEventListener("click", function () {
        var ds = dsO().map(function (x) { return x.firstChild.src; });
        dung();
        moAnh(ds, dsO().indexOf(o), o);
      });
      dai.appendChild(o);
    });
    theoDoi(dai);
    theoDoi($("dai-dk"));

    // Ảnh ở giữa rõ và to nhất; càng xa giữa càng nhỏ và mờ
    var capNhat = function () {
      var ds = dsO();
      var giua = dai.scrollLeft + dai.clientWidth / 2;
      var ganNhat = Infinity;
      ds.forEach(function (o, i) {
        var lech = Math.abs(o.offsetLeft + o.offsetWidth / 2 - giua);
        var t = Math.min(lech / (o.offsetWidth + 12), 1);
        o.style.setProperty("--co", (1 - t * 0.1).toFixed(3));
        o.style.setProperty("--ro", (1 - t * 0.5).toFixed(3));
        if (lech < ganNhat) { ganNhat = lech; dangO = i; }
      });
      $("da-dem").textContent = ds.length ? (dangO + 1) + " / " + ds.length : "";
    };
    var den = function (i) {
      var ds = dsO();
      if (!ds.length) return;
      var o = ds[(i + ds.length) % ds.length];
      dai.scrollTo({
        left: o.offsetLeft + o.offsetWidth / 2 - dai.clientWidth / 2,
        behavior: giamChuyenDong ? "auto" : "smooth"
      });
    };

    var choVe = false;
    dai.addEventListener("scroll", function () {
      if (choVe) return;
      choVe = true;
      requestAnimationFrame(function () { choVe = false; capNhat(); });
    }, { passive: true });
    window.addEventListener("resize", capNhat);
    capNhat();

    // Tự trôi chậm khi album đang trong tầm nhìn; khách chạm vào là dừng hẳn
    var daDung = false;
    var dung = function () {
      if (tuChay) clearInterval(tuChay);
      tuChay = null;
      daDung = true;
    };
    ["pointerdown", "touchstart", "wheel", "keydown"].forEach(function (sk) {
      dai.addEventListener(sk, dung, { passive: true });
    });
    $("da-truoc").addEventListener("click", function () { dung(); den(dangO - 1); });
    $("da-sau").addEventListener("click", function () { dung(); den(dangO + 1); });
    dai.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); den(dangO - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); den(dangO + 1); }
    });

    if (!giamChuyenDong && "IntersectionObserver" in window) {
      new IntersectionObserver(function (ds) {
        var thay = ds[0].isIntersecting;
        if (tuChay) { clearInterval(tuChay); tuChay = null; }
        if (thay && !daDung) {
          tuChay = setInterval(function () {
            if (hop.hidden && !document.hidden) den(dangO + 1);
          }, 4000);
        }
      }, { threshold: 0.6 }).observe(dai);
    }
  }

  /* ---------- Xem ảnh phóng to ---------- */
  var hop = $("xem-anh"), hopImg = $("xa-img"), hopDem = $("xa-dem");
  var dsAnh = [], viTri = 0, phanTuTruoc = null;

  function ve() {
    hopImg.src = dsAnh[viTri];
    hopDem.textContent = (viTri + 1) + " / " + dsAnh.length;
  }
  function moAnh(ds, i, nutMo) {
    dsAnh = ds;
    viTri = Math.max(0, i);
    phanTuTruoc = nutMo || null;   // nút đã mở ảnh, để trả lại tiêu điểm khi đóng
    hop.classList.toggle("mot-anh", ds.length < 2);
    ve();
    hop.hidden = false;
    document.body.classList.add("khoa-cuon");
    $("xa-dong").focus();
  }
  function dong() {
    hop.hidden = true;
    hopImg.removeAttribute("src");
    document.body.classList.remove("khoa-cuon");
    // preventScroll: đóng ảnh xong trang đứng yên, không nhảy đi chỗ khác
    if (phanTuTruoc && phanTuTruoc.focus) phanTuTruoc.focus({ preventScroll: true });
  }
  function chuyen(buoc) {
    if (dsAnh.length < 2) return;
    viTri = (viTri + buoc + dsAnh.length) % dsAnh.length;
    ve();
  }

  $("xa-dong").addEventListener("click", dong);
  $("xa-truoc").addEventListener("click", function () { chuyen(-1); });
  $("xa-sau").addEventListener("click", function () { chuyen(1); });
  hop.addEventListener("click", function (e) { if (e.target === hop) dong(); });

  document.addEventListener("keydown", function (e) {
    if (hop.hidden) return;
    if (e.key === "Escape") dong();
    else if (e.key === "ArrowLeft") chuyen(-1);
    else if (e.key === "ArrowRight") chuyen(1);
  });

  // Vuốt trái / phải trên điện thoại
  var x0 = null, y0 = null;
  hop.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { x0 = null; return; }
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  hop.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) chuyen(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
