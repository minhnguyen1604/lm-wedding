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

    // Bước 1 chỉ có hai lựa chọn; chọn xong mới hiện phần điền:
    //  - "Sẽ tham dự": họ tên, số người, khách nhà trai/gái, lời chúc
    //  - "Không thể tham dự": chỉ họ tên, để gia đình biết ai báo vắng
    var coDenDangChon = function () { return chon("thamDu").indexOf("Sẽ") === 0; };
    Array.prototype.forEach.call(form.querySelectorAll('input[name="thamDu"]'), function (o) {
      o.addEventListener("change", function () {
        var lanDau = $("xn-buoc-2").hidden;
        $("xn-buoc-2").hidden = false;
        $("xn-chi-khi-co").hidden = !coDenDangChon();
        hopLoi.hidden = true;
        if (lanDau) $("xn-ten").focus({ preventScroll: true });
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
      var coDen = coDenDangChon();
      var khachCua = coDen ? chon("khachCua") : "";
      if (!thamDu) return baoLoi("Xin vui lòng chọn có tham dự hay không.");
      if (!ten) return baoLoi("Xin vui lòng điền họ và tên.", $("xn-ten"));
      if (coDen && !khachCua) return baoLoi("Xin vui lòng chọn khách mời của nhà trai hay nhà gái.");

      // Máy gửi tự động thường điền cả ô bẫy: coi như xong nhưng không gửi đi
      if (form.elements.website.value) return hienCamOn(coDen);

      var t = xn.truong || {};
      var duLieu = new URLSearchParams();
      var them = function (ma, giaTri) { if (ma) duLieu.append(ma, giaTri); };
      them(t.ten, ten);
      them(t.thamDu, thamDu);
      them(t.soNguoi, coDen ? String(soNguoi) : "0");
      them(t.khachCua, khachCua);
      them(t.loiChuc, coDen ? $("xn-loi-chuc").value.trim() : "");

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
      var dangChon = form.querySelector('input[name="thamDu"]:checked') || form.querySelector('input[name="thamDu"]');
      dangChon.focus();
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
      img.alt = "Ảnh cưới " + (i + 1);
      img.draggable = false;
      img.decoding = "async";
      img.onerror = function () { o.remove(); capNhat(); };
      img.dataset.src = src;    // chưa tải; chỉ tải khi khách cuộn gần tới album
      o.appendChild(img);
      o.addEventListener("click", function () {
        var ds = dsO().map(function (x) { return x.firstChild.dataset.src; });
        dung();
        moAnh(ds, dsO().indexOf(o), o);
      });
      dai.appendChild(o);
    });
    theoDoi(dai);
    theoDoi($("dai-dk"));

    // Tải ảnh album khi khách cuộn gần tới (còn cách ~nửa màn hình),
    // và chỉ bắt đầu canh sau khi khách đã mở thiệp
    var taiAlbum = function () {
      Array.prototype.forEach.call(dai.querySelectorAll("img[data-src]"), function (img) {
        if (!img.getAttribute("src")) img.src = img.dataset.src;
      });
    };
    var canhAlbum = function () {
      if (!("IntersectionObserver" in window)) { taiAlbum(); return; }
      var canhGac = new IntersectionObserver(function (ds) {
        if (ds[0].isIntersecting) { taiAlbum(); canhGac.disconnect(); }
      }, { rootMargin: "400px 0px" });
      canhGac.observe($("album"));
    };
    if (C.moThiep && C.moThiep.bat) document.addEventListener("thiep-da-mo", canhAlbum, { once: true });
    else canhAlbum();

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

  /* ---------- Cô dâu chú rể kiểu lego (tự vẽ bằng SVG, không dùng ảnh hay logo của hãng) ---------- */
  // Bàn tay kẹp chữ C: vòng tròn hở ở phía dưới
  function tayKep(cx) {
    return '<rect x="' + (cx - 3.5) + '" y="101" width="7" height="6" fill="var(--bb-da-dam)"/>' +
      '<circle cx="' + cx + '" cy="112" r="5.6" fill="none" stroke="var(--bb-da)" stroke-width="4.4" ' +
      'stroke-dasharray="27 8.2" transform="rotate(113 ' + cx + ' 112)"/>';
  }
  function canhTay(lop, x, mau) {
    return '<g class="tay ' + lop + '"><rect x="' + x + '" y="70" width="13" height="34" rx="6.5" fill="' + mau + '" stroke="var(--bb-vien)" stroke-width=".8"/>' +
      tayKep(x + 6.5) + '</g>';
  }
  // Đầu trụ có núm, cổ, vệt bóng nhựa
  var DAU =
    '<rect x="52" y="61" width="16" height="8" fill="var(--bb-da-dam)"/>' +
    '<rect x="50" y="23" width="20" height="9" rx="2.2" fill="var(--bb-da)" stroke="var(--bb-vien)" stroke-width=".8"/>' +
    '<rect x="40" y="29" width="40" height="35" rx="9.5" fill="var(--bb-da)" stroke="var(--bb-vien)" stroke-width=".8"/>' +
    '<rect x="43.5" y="33" width="5" height="27" rx="2.5" fill="#fff" opacity=".32"/>';
  var MAT =
    '<g class="mat"><circle cx="52" cy="46" r="2.7" fill="#161616"/><circle cx="68" cy="46" r="2.7" fill="#161616"/>' +
    '<circle cx="52.9" cy="45" r=".85" fill="#fff"/><circle cx="68.9" cy="45" r=".85" fill="#fff"/></g>' +
    '<path d="M51 53q9 7.6 18 0" fill="none" stroke="#161616" stroke-width="2" stroke-linecap="round"/>';
  var THAN = 'M39.5 68h41q2 0 2.3 2l5.7 40q.2 2-2 2h-53q-2.2 0-2-2l5.7-40q.3-2 2.3-2z';

  var CHU_RE =
    '<svg class="bup-be chu-re" viewBox="0 0 120 176"><g class="than">' +
      // chân: hai khối, mũi giày nhô ra
      '<g class="chan chan-t"><rect x="33" y="118" width="26" height="48" rx="2" fill="var(--bb-vest)" stroke="var(--bb-vien)" stroke-width=".8"/><rect x="33" y="154" width="26" height="12" rx="2" fill="var(--bb-giay)"/></g>' +
      '<g class="chan chan-p"><rect x="61" y="118" width="26" height="48" rx="2" fill="var(--bb-vest)" stroke="var(--bb-vien)" stroke-width=".8"/><rect x="61" y="154" width="26" height="12" rx="2" fill="var(--bb-giay)"/></g>' +
      '<rect x="31.5" y="109" width="57" height="11" rx="2" fill="var(--bb-vest)"/>' +
      canhTay("tay-t", 24, "var(--bb-vest)") +
      canhTay("tay-p", 83, "var(--bb-vest)") +
      // thân hình thang, in hình áo vest
      '<path d="' + THAN + '" fill="var(--bb-vest)" stroke="var(--bb-vien)" stroke-width=".8"/>' +
      '<path d="M49 68h22l-11 30z" fill="#fff"/>' +
      '<path d="M49 68l9 33M71 68l-9 33" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.4"/>' +
      '<path d="M60 76.5l-7.5-4.5v9zM60 76.5l7.5-4.5v9z" fill="#111"/><circle cx="60" cy="76.5" r="1.9" fill="#111"/>' +
      '<circle cx="60" cy="86" r="1.1" fill="#b9b9b9"/><circle cx="60" cy="91" r="1.1" fill="#b9b9b9"/>' +
      '<circle cx="44.5" cy="82" r="3" fill="var(--bb-hong)"/><circle cx="44.5" cy="82" r="1.1" fill="#fff"/>' +
      '<rect x="34" y="72" width="4" height="34" rx="2" fill="#fff" opacity=".12" transform="rotate(8 36 72)"/>' +
      DAU + MAT +
      // tóc ngắn rẽ ngôi
      '<path d="M38 45v-9q0-15 22-15t22 15v9q-2-8-8-10-8 5-20 3-10-1-16 7z" fill="var(--bb-toc)"/>' +
      '<path d="M46 27q8-4 18-2" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2" stroke-linecap="round"/>' +
    '</g></svg>';

  var CO_DAU =
    '<svg class="bup-be co-dau" viewBox="0 0 120 176"><g class="than">' +
      // khăn voan phía sau
      '<path d="M37 33q-17 52-13 120l15-42zM83 33q17 52 13 120l-15-42z" fill="var(--bb-voan)" stroke="var(--bb-vien)" stroke-width=".8"/>' +
      // váy: khối dốc màu trắng trên đế
      '<path d="M33 110h54l11 54H22z" fill="var(--bb-trang)" stroke="var(--bb-vien)" stroke-width=".9"/>' +
      '<rect x="20" y="162" width="80" height="6" rx="2" fill="var(--bb-de)" stroke="var(--bb-vien)" stroke-width=".8"/>' +
      '<path d="M40 114l-9 46" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
      canhTay("tay-t", 24, "var(--bb-da)") +
      canhTay("tay-p", 83, "var(--bb-da)") +
      '<path d="' + THAN + '" fill="var(--bb-trang)" stroke="var(--bb-vien)" stroke-width=".9"/>' +
      '<path d="M43 68h34l-3 10q-14 7-28 0z" fill="var(--bb-da)"/>' +
      '<path d="M33.6 101h52.8l.9 6H32.7z" fill="var(--bb-vang)"/>' +
      '<circle cx="60" cy="104" r="2.6" fill="#fff" stroke="var(--bb-vang)" stroke-width=".8"/>' +
      DAU +
      '<circle cx="46" cy="52" r="3.3" fill="var(--bb-hong)" opacity=".5"/><circle cx="74" cy="52" r="3.3" fill="var(--bb-hong)" opacity=".5"/>' +
      MAT +
      '<path d="M48.6 43.6l-2.6-2M71.4 43.6l2.6-2" stroke="#161616" stroke-width="1.3" stroke-linecap="round"/>' +
      // tóc dài và vương miện nhỏ
      '<path d="M36 72V40q0-19 24-19t24 19v32q-4 2.5-8.5 0V47q-3-9-15.5-9t-15.5 9v25q-4.500 2.500-8.500 0z" fill="var(--bb-toc-nu)"/>' +
      '<path d="M45 27q7-4 15-3" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M48 27q12-6 24 0" fill="none" stroke="var(--bb-vang)" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="60" cy="23.300" r="1.800" fill="#fff" stroke="var(--bb-vang)" stroke-width=".8"/>' +
      // bó hoa
      '<g class="bo-hoa">' +
        '<path d="M97 112l-5 20M98 112l2 21M99 112l8 17" stroke="var(--bb-la)" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="89" cy="106" r="6.5" fill="var(--bb-la)"/><circle cx="107" cy="107" r="6" fill="var(--bb-la)"/>' +
        '<circle cx="92" cy="101" r="7" fill="var(--bb-hong)"/><circle cx="104" cy="100" r="6.5" fill="#fff" stroke="var(--bb-hong)" stroke-width=".9"/>' +
        '<circle cx="98" cy="108" r="7" fill="var(--bb-hong-dam)"/><circle cx="98" cy="95" r="5.5" fill="#fff" stroke="var(--bb-hong)" stroke-width=".9"/>' +
        '<circle cx="92" cy="101" r="2.3" fill="#fff" opacity=".7"/><circle cx="104" cy="100" r="2.1" fill="var(--bb-la)"/>' +
        '<circle cx="98" cy="108" r="2.3" fill="#fff" opacity=".7"/><circle cx="98" cy="95" r="1.800" fill="var(--bb-la)"/>' +
      '</g>' +
    '</g></svg>';

  /* ---------- Nhạc nền + đĩa nhạc ---------- */
  var mt = C.moThiep || {};
  var dia = $("dia");
  var nhac = null;

  function datTrangThaiNhac(dangPhat) {
    document.body.classList.toggle("co-nhac", dangPhat);
    dia.setAttribute("aria-pressed", dangPhat ? "true" : "false");
    dia.setAttribute("aria-label", dangPhat ? "Tắt nhạc" : "Bật nhạc");
  }
  function phatNhac() {
    if (!nhac) return;
    // Chỉ tải file nhạc ở lần phát đầu tiên (khi khách bấm "Mở thiệp" hoặc đĩa nhạc)
    if (!nhac.dataset.daTai) {
      nhac.dataset.daTai = "1";
      nhac.preload = "auto";
      nhac.src = mt.nhac;
    }
    var p = nhac.play();
    if (p && p.catch) p.catch(function () { /* trình duyệt chặn thì khách tự bấm đĩa */ });
  }

  if (mt.nhac) {
    nhac = new Audio();
    nhac.loop = true;
    nhac.volume = 0.7;
    nhac.preload = "none";      // chưa tải gì cho tới khi khách bấm
    nhac.addEventListener("play", function () { datTrangThaiNhac(true); });
    nhac.addEventListener("pause", function () { datTrangThaiNhac(false); });
    dia.hidden = false;
    dia.addEventListener("click", function () {
      if (nhac.paused) phatNhac(); else nhac.pause();
    });
    // Khách chuyển sang ứng dụng khác thì tạm dừng, quay lại thì phát tiếp
    var tamDung = false;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && !nhac.paused) { tamDung = true; nhac.pause(); }
      else if (!document.hidden && tamDung) { tamDung = false; phatNhac(); }
    });
  } else {
    document.body.classList.add("khong-nhac");   // không có nhạc thì búp bê cứ nhảy
  }

  /* ---------- Pháo hoa trên màn mở thiệp ---------- */
  // Rực rỡ: tên lửa bay lên kéo vệt sáng, nổ thành chùm nhiều lớp màu, có kim tuyến lấp lánh rơi chậm,
  // cuối cùng ba chùm nổ cùng lúc. Gọi xong() khi gần hết để màn mở thiệp mờ dần cùng tàn pháo.
  function phaoHoa(canvas, xong) {
    var ctx = canvas.getContext("2d");
    var tiLe = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * tiLe;
    canvas.height = H * tiLe;
    ctx.scale(tiLe, tiLe);

    // Bộ màu đậm, rõ trên nền kem; mỗi chùm lấy một cặp màu chính
    var BO_MAU = [
      ["#c8901a", "#f0c24b"],     // vàng kim
      ["#d6336c", "#f783ac"],     // hồng đậm
      ["#c0392b", "#f39c7a"],     // đỏ san hô
      ["#7b3fa0", "#c39bd3"],     // tím
      ["#2e7d6b", "#7fc8a9"],     // xanh ngọc
      ["#b8860b", "#ffd166"]      // vàng cam
    ];
    var KIM_TUYEN = ["#fff4c2", "#ffe08a", "#ffffff"];
    // Lịch bắn: thời điểm (ms) và vị trí nổ theo tỉ lệ màn hình
    var lich = [
      { t: 0,    x: 0.50, y: 0.24 },
      { t: 220,  x: 0.22, y: 0.18 },
      { t: 420,  x: 0.78, y: 0.16 },
      { t: 650,  x: 0.36, y: 0.32 },
      { t: 850,  x: 0.66, y: 0.30 },
      { t: 1080, x: 0.14, y: 0.36 },
      { t: 1250, x: 0.86, y: 0.34 },
      { t: 1450, x: 0.50, y: 0.12 },
      { t: 1800, x: 0.28, y: 0.22, to: 1.25 },   // ba chùm kết
      { t: 1800, x: 0.72, y: 0.22, to: 1.25 },
      { t: 1880, x: 0.50, y: 0.30, to: 1.4 }
    ];
    var BAY = 380;                 // ms tên lửa bay lên trước khi nổ
    var tenLua = [], hat = [], batDau = null, daGoiXong = false;

    function chon(ds) { return ds[Math.floor(Math.random() * ds.length)]; }

    function no(x, y, to) {
      var cap = chon(BO_MAU), so = Math.round(95 * to);
      // vòng ngoài + vòng trong + hạt rải
      for (var i = 0; i < so; i++) {
        var goc = (Math.PI * 2 * i) / so + Math.random() * 0.08;
        var vong = i % 3;
        var nhanh = (vong === 0 ? 5.6 : vong === 1 ? 3.6 : 1.4 + Math.random() * 3.6) * to * (0.92 + Math.random() * 0.16);
        hat.push({
          x: x, y: y, vx: Math.cos(goc) * nhanh, vy: Math.sin(goc) * nhanh,
          song: 1, giam: 0.0105 + Math.random() * 0.006,
          mau: vong === 1 ? cap[1] : cap[0], r: 1.7 + Math.random() * 1.2, kim: false
        });
      }
      // kim tuyến: hạt nhỏ sáng, lấp lánh, rơi chậm và sống lâu hơn
      for (var k = 0; k < 34 * to; k++) {
        var g = Math.random() * Math.PI * 2, n = Math.random() * 3.2 * to;
        hat.push({
          x: x, y: y, vx: Math.cos(g) * n, vy: Math.sin(g) * n,
          song: 1, giam: 0.0065 + Math.random() * 0.004,
          mau: chon(KIM_TUYEN), r: 1 + Math.random() * 0.8, kim: true, pha: Math.random() * 6.28
        });
      }
      // chớp sáng tại tâm nổ
      hat.push({ x: x, y: y, vx: 0, vy: 0, song: 1, giam: 0.08, mau: cap[1], r: 26 * to, chop: true });
    }

    function khung(luc) {
      if (batDau === null) batDau = luc;
      var da = luc - batDau;

      // phóng tên lửa đúng lịch
      lich.forEach(function (p) {
        if (!p.daBan && da >= p.t) {
          p.daBan = true;
          tenLua.push({ x: p.x * W + (Math.random() - 0.5) * 30, y: H + 10, dx: p.x * W, dy: p.y * H,
            batDau: da, to: p.to || 1 });
        }
      });

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      // tên lửa: chấm sáng bay lên kéo vệt
      tenLua = tenLua.filter(function (t) {
        var k = Math.min(1, (da - t.batDau) / BAY);
        var e = 1 - Math.pow(1 - k, 3);
        var x = t.x + (t.dx - t.x) * e, y = t.y + (t.dy - t.y) * e;
        var ky = t.y + (t.dy - t.y) * Math.max(0, e - 0.18);
        var kx = t.x + (t.dx - t.x) * Math.max(0, e - 0.18);
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = "#e0b04a";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff6d5";
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.2832); ctx.fill();
        if (k >= 1) { no(t.dx, t.dy, t.to); return false; }
        return true;
      });

      // hạt pháo
      hat = hat.filter(function (h) {
        h.song -= h.giam;
        if (h.song <= 0) return false;
        if (h.chop) {                       // chớp sáng: quầng tròn mờ dần
          var q = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
          q.addColorStop(0, "rgba(255,250,225," + (0.9 * h.song) + ")");
          q.addColorStop(1, "rgba(255,250,225,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = q;
          ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, 6.2832); ctx.fill();
          return true;
        }
        var can = h.kim ? 0.985 : 0.968;
        h.vx *= can;
        h.vy = h.vy * can + (h.kim ? 0.018 : 0.04);
        h.x += h.vx;
        h.y += h.vy;
        if (h.kim) {                        // lấp lánh: nhấp nháy theo nhịp riêng
          h.pha += 0.5;
          ctx.globalAlpha = h.song * (0.45 + 0.55 * Math.abs(Math.sin(h.pha)));
          ctx.fillStyle = h.mau;
          ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, 6.2832); ctx.fill();
          return true;
        }
        // quầng mờ phía sau cho cảm giác phát sáng
        ctx.globalAlpha = h.song * 0.18;
        ctx.fillStyle = h.mau;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 3.2, 0, 6.2832); ctx.fill();
        // vệt kéo theo hướng bay
        ctx.globalAlpha = h.song * 0.6;
        ctx.strokeStyle = h.mau;
        ctx.lineWidth = h.r * 1.3;
        ctx.beginPath(); ctx.moveTo(h.x - h.vx * 4, h.y - h.vy * 4); ctx.lineTo(h.x, h.y); ctx.stroke();
        // đầu hạt sáng
        ctx.globalAlpha = Math.min(1, h.song * 1.4);
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, 6.2832); ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;

      // gần hết thì cho màn mở thiệp mờ dần cùng tàn pháo
      if (!daGoiXong && da > 3000) { daGoiXong = true; if (xong) xong(); }
      if (da < 2300 || hat.length || tenLua.length) requestAnimationFrame(khung);
      else { ctx.clearRect(0, 0, W, H); if (!daGoiXong && xong) { daGoiXong = true; xong(); } }
    }
    requestAnimationFrame(khung);
  }

  /* ---------- Chạm vào đôi lego cuối thiệp: bắn một chùm tim ---------- */
  var TIM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>';
  var MAU_TIM = ["#e2578f", "#f29bb5", "#d98c98", "#c9a24b", "#efc2c9"];
  function banTim(doi) {
    var ket = doi.parentNode;
    var hopDoi = doi.getBoundingClientRect(), hopKet = ket.getBoundingClientRect();
    var cx = hopDoi.left - hopKet.left + hopDoi.width / 2;
    var cy = hopDoi.top - hopKet.top + hopDoi.height * 0.35;
    // hai nhân vật nhún nhẹ một cái
    Array.prototype.forEach.call(doi.querySelectorAll(".bup-be"), function (b, i) {
      if (b.animate) b.animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(-12px)" }, { transform: "translateY(0)" }],
        { duration: 420, delay: i * 70, easing: "ease-out" }
      );
    });
    if (giamChuyenDong) return;
    for (var i = 0; i < 16; i++) {
      var t = document.createElement("span");
      t.className = "tim";
      t.innerHTML = TIM;
      var co = 12 + Math.random() * 14;
      t.style.width = t.style.height = co + "px";
      t.style.left = (cx - co / 2) + "px";
      t.style.top = (cy - co / 2) + "px";
      t.style.color = MAU_TIM[i % MAU_TIM.length];
      ket.appendChild(t);
      var goc = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;     // bay lên, toả ra hai bên
      var xa = 70 + Math.random() * 90;
      var dx = Math.cos(goc) * xa, dy = Math.sin(goc) * xa;
      var quay = (Math.random() - 0.5) * 60;
      if (!t.animate) { t.remove(); continue; }
      t.animate([
        { transform: "translate(0, 0) scale(.3) rotate(0deg)", opacity: 0 },
        { transform: "translate(" + dx * 0.55 + "px, " + dy * 0.55 + "px) scale(1) rotate(" + quay / 2 + "deg)", opacity: 1, offset: 0.35 },
        { transform: "translate(" + dx + "px, " + (dy - 30) + "px) scale(.85) rotate(" + quay + "deg)", opacity: 0 }
      ], { duration: 1300 + Math.random() * 500, delay: Math.random() * 120, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" })
        .onfinish = (function (el) { return function () { el.remove(); }; })(t);
    }
  }

  /* ---------- Màn mở thiệp ---------- */
  if (mt.bat) {
    var bia = $("bia"), biaDoi = $("bia-doi"), biaNut = $("bia-nut");
    $("bia-logo").src = C.logo || "";
    $("bia-logo").hidden = !C.logo;
    $("bia-ten").textContent = mt.ten || "";
    $("bia-ngay").textContent = mt.ngay || "";
    // Có ảnh lego thật thì dùng ảnh; không thì dùng hình vẽ
    var datDoi = function (o) {
      var h = mt.hinh || {};
      if (!h.chuRe || !h.coDau) { o.innerHTML = CHU_RE + CO_DAU; return; }
      o.classList.add("doi-anh");
      [["chu-re", h.chuRe], ["co-dau", h.coDau]].forEach(function (c) {
        var img = new Image();
        img.className = "bup-be " + c[0];
        img.alt = "";
        img.draggable = false;
        img.src = c[1];
        o.appendChild(img);
      });
    };
    datDoi(biaDoi);
    bia.hidden = false;
    document.body.classList.add("khoa-cuon");

    // Đôi búp bê nắm tay ở cuối thiệp, đung đưa theo nhạc
    datDoi($("doi-cuoi"));
    $("doi-cuoi").classList.add("nam-tay");
    $("doi-cuoi").hidden = false;
    $("doi-cuoi").addEventListener("click", function () { banTim($("doi-cuoi")); });

    var daMo = false, daXong = false;
    var dongBia = function () {
      if (daXong) return;
      daXong = true;
      bia.classList.add("dang-dong");
      document.body.classList.remove("khoa-cuon");
      setTimeout(function () { bia.hidden = true; }, 1000);
      document.dispatchEvent(new Event("thiep-da-mo"));
    };
    var moThiep = function () {
      if (daMo) { dongBia(); return; }            // chạm lần nữa thì bỏ qua phần diễn
      daMo = true;
      phatNhac();                                  // phải gọi ngay trong lần chạm thì trình duyệt mới cho phát
      biaNut.classList.add("an");
      if (giamChuyenDong) { dongBia(); return; }
      biaDoi.classList.add("gan", "dang-di");      // hai búp bê bước lại gần nhau
      setTimeout(function () {
        biaDoi.classList.remove("dang-di");
        biaDoi.classList.add("nam-tay");           // nắm tay
      }, 1300);
      setTimeout(function () {
        phaoHoa($("bia-phao"), dongBia);
      }, 1650);
      // Phòng khi máy tạm dừng hoạt ảnh (tiết kiệm pin, chuyển ứng dụng): vẫn tự mở thiệp sau ~6 giây
      setTimeout(dongBia, 6000);
    };
    biaNut.addEventListener("click", function (e) { e.stopPropagation(); moThiep(); });
    bia.addEventListener("click", function () { if (daMo) dongBia(); });
  }
})();
