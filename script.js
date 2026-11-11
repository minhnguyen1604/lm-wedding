(function () {
  "use strict";

  var C = window.THIEP || {};
  var $ = function (id) { return document.getElementById(id); };
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
  $("dd-ten").textContent = dd.ten || "";
  $("dd-dia-chi").textContent = dd.diaChi || "";
  if (ghim) {
    var q = encodeURIComponent(ghim);
    $("dd-map").src = "https://www.google.com/maps?q=" + q + "&z=16&hl=vi&output=embed";
    $("dd-chi-duong").href = "https://www.google.com/maps/dir/?api=1&destination=" + q;
  }

  /* ---------- 3. Album ---------- */
  var luoi = $("luoi-anh");
  var album = C.gallery || [];

  if (!album.length) {
    ["3 / 4", "1 / 1", "4 / 3", "3 / 4", "3 / 4", "1 / 1"].forEach(function (tiLe, i) {
      var o = document.createElement("div");
      o.className = "o-anh";
      var trong = choTrong("Ảnh " + (i + 1));
      trong.style.aspectRatio = tiLe;
      o.appendChild(trong);
      luoi.appendChild(o);
      theoDoi(o);
    });
  } else {
    album.forEach(function (src, i) {
      var o = document.createElement("button");
      o.type = "button";
      o.className = "o-anh";
      o.setAttribute("aria-label", "Xem ảnh " + (i + 1));
      var img = document.createElement("img");
      img.loading = "lazy";
      img.alt = "Ảnh cưới " + (i + 1);
      img.onerror = function () { o.remove(); };
      img.src = src;
      o.appendChild(img);
      o.addEventListener("click", function () { moAnh(album, i); });
      luoi.appendChild(o);
      theoDoi(o);
    });
  }

  /* ---------- Xem ảnh phóng to ---------- */
  var hop = $("xem-anh"), hopImg = $("xa-img"), hopDem = $("xa-dem");
  var dsAnh = [], viTri = 0, phanTuTruoc = null;

  function ve() {
    hopImg.src = dsAnh[viTri];
    hopDem.textContent = (viTri + 1) + " / " + dsAnh.length;
  }
  function moAnh(ds, i) {
    dsAnh = ds;
    viTri = Math.max(0, i);
    phanTuTruoc = document.activeElement;
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
    if (phanTuTruoc && phanTuTruoc.focus) phanTuTruoc.focus();
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
