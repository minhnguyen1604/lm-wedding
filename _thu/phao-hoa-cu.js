/* Bản sao pháo hoa đang dùng (script.js) để so sánh */
  function phaoHoa(canvas, xong) {
    var ctx = canvas.getContext("2d");
    var tiLe = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * tiLe;
    canvas.height = H * tiLe;
    ctx.setTransform(tiLe, 0, 0, tiLe, 0, 0);

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
      if (da < 2300 || hat.length || tenLua.length) (window.__raf = requestAnimationFrame(khung));
      else { ctx.clearRect(0, 0, W, H); if (!daGoiXong && xong) { daGoiXong = true; xong(); } }
    }
    (window.__raf = requestAnimationFrame(khung));
  }

