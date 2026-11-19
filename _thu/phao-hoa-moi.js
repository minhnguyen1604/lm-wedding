/* Các kiểu pháo hoa thử cho màn mở thiệp (trang _thu/phao-hoa-thu.html).
   phaoHoaMoi(canvas, kieu, xong): kieu = "lieu" | "cuc" | "tim" */
function phaoHoaMoi(canvas, kieu, xong) {
  var ctx = canvas.getContext("2d");
  var tiLe = Math.min(window.devicePixelRatio || 1, 2);
  var W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * tiLe; canvas.height = H * tiLe;
  ctx.setTransform(tiLe, 0, 0, tiLe, 0, 0);

  // Vàng đủ đậm để nổi trên nền kem
  var VANG = ["#b8862b", "#c99a3a", "#a87a22"];
  var VANG_SANG = ["#d9ad4f", "#e2bd66"];
  var HONG = ["#c98a92", "#d9a0a6"];
  var REU = ["#8d9a6a", "#a3ad80"];

  var CAU_HINH = {
    // A. Liễu vàng: ít chùm, một màu vàng kim, vệt dài rủ xuống như cành liễu, đuôi lấp lánh
    lieu: {
      lich: [
        { t: 0, x: .5, y: .2, to: 1.1 }, { t: 200, x: .2, y: .15 }, { t: 400, x: .8, y: .16 },
        { t: 620, x: .34, y: .28 }, { t: 800, x: .66, y: .27 }, { t: 1000, x: .12, y: .3, to: .8 },
        { t: 1150, x: .88, y: .3, to: .8 }, { t: 1350, x: .5, y: .1 },
        { t: 1750, x: .26, y: .2, to: 1.3 }, { t: 1750, x: .74, y: .2, to: 1.3 }, { t: 1850, x: .5, y: .26, to: 1.5 }
      ],
      no: function (x, y, to) {
        var so = Math.round(90 * to);
        for (var i = 0; i < so; i++) {
          var g = Math.PI * 2 * i / so + Math.random() * .1, n = (3.1 + Math.random() * 1.1) * to;
          hat.push({ x: x, y: y, vx: Math.cos(g) * n, vy: Math.sin(g) * n, song: 1,
            giam: .0062 + Math.random() * .0022, keo: .962, roi: .032, r: 1.6, sang: true,
            mau: chon(VANG), dau: chon(VANG_SANG), vet: [], dai: 16, lapLanhCuoi: true });
        }
        kimTuyen(x, y, to, 46);
        chop(x, y, 42 * to, "236,205,140");
      }
    },
    // B. Hoa cúc ba màu hợp tông thiệp: vòng ngoài vàng, vòng trong hồng phấn hoặc xanh rêu, tàn nổ lách tách
    cuc: {
      lich: [
        { t: 0, x: .5, y: .22, to: 1.1 }, { t: 180, x: .2, y: .16 }, { t: 360, x: .8, y: .16 },
        { t: 560, x: .32, y: .3, to: .9 }, { t: 720, x: .68, y: .3, to: .9 }, { t: 900, x: .12, y: .26, to: .8 },
        { t: 1040, x: .88, y: .26, to: .8 }, { t: 1250, x: .5, y: .1 },
        { t: 1650, x: .27, y: .2, to: 1.25 }, { t: 1650, x: .73, y: .2, to: 1.25 }, { t: 1750, x: .5, y: .27, to: 1.45 }
      ],
      no: function (x, y, to) {
        var trong = Math.random() < .5 ? HONG : REU;
        var so = Math.round(72 * to);
        for (var i = 0; i < so; i++) {
          var g = Math.PI * 2 * i / so, n = 5 * to;
          hat.push({ x: x, y: y, vx: Math.cos(g) * n, vy: Math.sin(g) * n, song: 1, giam: .0105,
            keo: .955, roi: .018, r: 1.9, mau: chon(VANG), vet: [], dai: 8, tach: true, sang: true });
        }
        for (var j = 0; j < so * .6; j++) {
          var g2 = Math.PI * 2 * j / (so * .6), n2 = 2.8 * to;
          hat.push({ x: x, y: y, vx: Math.cos(g2) * n2, vy: Math.sin(g2) * n2, song: 1, giam: .012,
            keo: .955, roi: .018, r: 1.8, mau: chon(trong), vet: [], dai: 6, sang: true });
        }
        kimTuyen(x, y, to, 30);
        chop(x, y, 38 * to, "240,215,160");
      }
    },
    // C. Trái tim: vài chùm vàng nhỏ mở màn, kết bằng một chùm hình trái tim hồng phấn viền vàng
    tim: {
      lich: [
        { t: 0, x: .5, y: .16 }, { t: 180, x: .22, y: .2, to: .9 }, { t: 360, x: .78, y: .2, to: .9 },
        { t: 560, x: .34, y: .32, to: .8 }, { t: 720, x: .66, y: .32, to: .8 }, { t: 900, x: .12, y: .14, to: .8 },
        { t: 1040, x: .88, y: .14, to: .8 },
        { t: 1400, x: .5, y: .22, to: 1.3, tim: true },
        { t: 1600, x: .18, y: .3, to: 1.1 }, { t: 1600, x: .82, y: .3, to: 1.1 }
      ],
      no: function (x, y, to, laTim) {
        if (laTim) {
          var so = 140;
          for (var i = 0; i < so; i++) {
            var t = Math.PI * 2 * i / so;
            var hx = 16 * Math.pow(Math.sin(t), 3);
            var hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            var k = .3 * to;
            hat.push({ x: x, y: y, vx: hx * k, vy: hy * k, song: 1, giam: .0078, keo: .952, roi: .008,
              r: 2.1, mau: i % 2 ? chon(HONG) : chon(VANG), vet: [], dai: 7, sang: true });
          }
          for (var m = 0; m < 70; m++) {          // kim tuyến vàng trong lòng trái tim
            var g = Math.random() * 6.283, n = Math.random() * 2.2;
            hat.push({ x: x, y: y, vx: Math.cos(g) * n, vy: Math.sin(g) * n, song: 1, giam: .007,
              keo: .97, roi: .012, r: 1.1, mau: chon(VANG_SANG), kim: true, pha: Math.random() * 6 });
          }
          chop(x, y, 60, "240,200,200");
          return;
        }
        var s = Math.round(70 * to);
        for (var j = 0; j < s; j++) {
          var g2 = Math.PI * 2 * j / s, n2 = (4.2 + Math.random() * .6) * to;
          hat.push({ x: x, y: y, vx: Math.cos(g2) * n2, vy: Math.sin(g2) * n2, song: 1, giam: .011,
            keo: .958, roi: .022, r: 1.8, mau: j % 4 ? chon(VANG) : chon(HONG), vet: [], dai: 8, sang: true });
        }
        kimTuyen(x, y, to, 28);
        chop(x, y, 36 * to, "236,205,140");
      }
    }
  };

  var ch = CAU_HINH[kieu];
  var lich = ch.lich.map(function (p) { return Object.assign({}, p); });
  var BAY = 420, tenLua = [], hat = [], batDau = null, daGoiXong = false;

  function chon(ds) { return ds[Math.floor(Math.random() * ds.length)]; }
  function chop(x, y, r, rgb) { hat.push({ x: x, y: y, song: 1, giam: .06, r: r, chop: rgb }); }
  // kim tuyến: hạt nhỏ lấp lánh, rơi chậm, sống lâu
  function kimTuyen(x, y, to, so) {
    for (var k = 0; k < so * to; k++) {
      var g = Math.random() * 6.283, n = Math.random() * 3.4 * to;
      hat.push({ x: x, y: y, vx: Math.cos(g) * n, vy: Math.sin(g) * n, song: 1, giam: .0055 + Math.random() * .004,
        keo: .975, roi: .014, r: 1 + Math.random() * .7, mau: chon(VANG_SANG.concat(VANG)), kim: true, pha: Math.random() * 6 });
    }
  }

  function khung(luc) {
    if (batDau === null) batDau = luc;
    var da = luc - batDau;
    lich.forEach(function (p) {
      if (!p.daBan && da >= p.t) {
        p.daBan = true;
        tenLua.push({ x: p.x * W + (Math.random() - .5) * 24, y: H + 10, dx: p.x * W, dy: p.y * H,
          batDau: da, to: p.to || 1, tim: p.tim });
      }
    });
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    tenLua = tenLua.filter(function (t) {
      var k = Math.min(1, (da - t.batDau) / BAY), e = 1 - Math.pow(1 - k, 3);
      var x = t.x + (t.dx - t.x) * e, y = t.y + (t.dy - t.y) * e;
      var e2 = Math.max(0, e - .22);
      ctx.globalAlpha = .55; ctx.strokeStyle = "#c99a3a"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(t.x + (t.dx - t.x) * e2, t.y + (t.dy - t.y) * e2); ctx.lineTo(x, y); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = "#d9ad4f";
      ctx.beginPath(); ctx.arc(x, y, 2, 0, 6.2832); ctx.fill();
      if (Math.random() < .7) hat.push({ x: x, y: y, vx: (Math.random() - .5) * .6, vy: .4 + Math.random() * .6, song: .8,
        giam: .03, keo: .97, roi: .02, r: .9, mau: chon(VANG_SANG), kim: true, pha: Math.random() * 6 });
      if (k >= 1) { ch.no(t.dx, t.dy, t.to, t.tim); return false; }
      return true;
    });

    var moi = [];
    hat = hat.filter(function (h) {
      h.song -= h.giam;
      if (h.song <= 0) return false;
      if (h.chop) {
        var q = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
        q.addColorStop(0, "rgba(" + h.chop + "," + (.55 * h.song) + ")");
        q.addColorStop(1, "rgba(" + h.chop + ",0)");
        ctx.globalAlpha = 1; ctx.fillStyle = q;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, 6.2832); ctx.fill();
        return true;
      }
      h.vx *= h.keo; h.vy = h.vy * h.keo + h.roi;
      h.x += h.vx; h.y += h.vy;
      if (h.kim) {
        h.pha += .45;
        ctx.globalAlpha = h.song * (.35 + .65 * Math.abs(Math.sin(h.pha)));
        ctx.fillStyle = h.mau;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, 6.2832); ctx.fill();
        return true;
      }
      if (h.vet) {
        h.vet.push(h.x, h.y);
        if (h.vet.length > h.dai * 2) h.vet.splice(0, 2);
        var n = h.vet.length / 2;
        ctx.strokeStyle = h.mau; ctx.lineWidth = h.r;
        for (var i = 1; i < n; i++) {
          ctx.globalAlpha = h.song * (i / n) * .75;
          ctx.beginPath();
          ctx.moveTo(h.vet[2 * i - 2], h.vet[2 * i - 1]); ctx.lineTo(h.vet[2 * i], h.vet[2 * i + 1]);
          ctx.stroke();
        }
      }
      var sang = h.lapLanhCuoi && h.song < .45 ? (.3 + .7 * Math.abs(Math.sin(da / 55 + h.x))) : 1;
      if (h.sang) {                         // quầng mờ quanh đầu hạt cho cảm giác phát sáng
        ctx.globalAlpha = h.song * .16 * sang; ctx.fillStyle = h.dau || h.mau;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 3.4, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = Math.min(1, h.song * 1.5) * sang;
      ctx.fillStyle = h.dau || h.mau;
      ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 1.1, 0, 6.2832); ctx.fill();
      // hoa cúc: gần tàn thì nổ lách tách thành vài hạt nhỏ
      if (h.tach && !h.daTach && h.song < .3) {
        h.daTach = true;
        for (var m = 0; m < 3; m++) {
          var g = Math.random() * 6.283, v = .6 + Math.random() * .9;
          moi.push({ x: h.x, y: h.y, vx: Math.cos(g) * v, vy: Math.sin(g) * v, song: .9, giam: .02,
            keo: .95, roi: .02, r: .9, mau: chon(VANG_SANG), kim: true, pha: Math.random() * 6 });
        }
      }
      return true;
    });
    hat = hat.concat(moi);
    ctx.globalAlpha = 1;

    if (!daGoiXong && da > 3400) { daGoiXong = true; if (xong) xong(); }
    if (da < 2400 || hat.length || tenLua.length) dangChay = requestAnimationFrame(khung);
    else { ctx.clearRect(0, 0, W, H); if (!daGoiXong && xong) { daGoiXong = true; xong(); } }
  }
  var dangChay = requestAnimationFrame(khung);
  return function dung() { cancelAnimationFrame(dangChay); ctx.clearRect(0, 0, W, H); };
}
