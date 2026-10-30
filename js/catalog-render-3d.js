/**
 * ROSSDOOR® — Bộ dựng hình Kỹ thuật Isometric & Mặt cắt Nan Cửa cho từng thẻ Sản Phẩm
 * Thay thế hoàn toàn ảnh chụp có sẵn bằng bản vẽ phối cảnh kỹ thuật kim khí sắc nét.
 */

window.renderProductTechnicalCanvas = function (canvas, item) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = (canvas.width = 600);
  const h = (canvas.height = 360);

  // 1. Nền bản vẽ kỹ thuật than chì nhám (Architectural Charcoal Blueprint)
  ctx.fillStyle = "#1E1C1A";
  ctx.fillRect(0, 0, w, h);

  // Lưới kỹ thuật mảnh
  ctx.strokeStyle = "rgba(210, 203, 191, 0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Tìm màu sơn tĩnh điện mặc định của sản phẩm
  const colorObj =
    window.ROSSDOOR_DATA.colors.find((c) => c.id === item.defaultColor) ||
    window.ROSSDOOR_DATA.colors[0];

  // Hàm phụ tạo độ chuyển sắc kim loại sơn tĩnh điện
  const makeMetallicGradient = (x0, y0, x1, y1, baseHex) => {
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, baseHex);
    grad.addColorStop(0.35, "#EDEAE2");
    grad.addColorStop(0.7, baseHex);
    grad.addColorStop(1, "#2A2622");
    return grad;
  };

  ctx.save();

  if (item.type3D === "slat_curved_vent" || item.type3D === "slat_flat_wide") {
    // Vẽ phối cảnh 3D mặt trước các thanh nan nhôm + Mặt cắt kỹ thuật bên phải
    const slatCount = item.type3D === "slat_flat_wide" ? 4 : 5;
    const startY = 58;
    const slatH = item.type3D === "slat_flat_wide" ? 56 : 44;

    for (let i = 0; i < slatCount; i++) {
      const y = startY + i * (slatH + 4);
      const grad = ctx.createLinearGradient(60, y, 60, y + slatH);
      grad.addColorStop(0, colorObj.hex);
      grad.addColorStop(0.35, "#E5E1D8");
      grad.addColorStop(0.75, colorObj.hex);
      grad.addColorStop(1, "#3A3530");

      // Thân nan nhôm
      ctx.fillStyle = grad;
      ctx.fillRect(55, y, 310, slatH - 3);
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.strokeRect(55, y, 310, slatH - 3);

      // Gân chịu lực ngang
      ctx.fillStyle = "rgba(25, 24, 22, 0.35)";
      ctx.fillRect(55, y + slatH * 0.36, 310, 2);
      ctx.fillRect(55, y + slatH * 0.68, 310, 2);

      // Lỗ thoáng kim cương
      if (item.type3D === "slat_curved_vent" && i < slatCount - 1) {
        ctx.fillStyle = "#141210";
        for (let s = 0; s < 7; s++) {
          const sx = 82 + s * 42;
          const sy = y + slatH - 3;
          ctx.beginPath();
          ctx.moveTo(sx, sy - 4);
          ctx.lineTo(sx + 9, sy);
          ctx.lineTo(sx, sy + 4);
          ctx.lineTo(sx - 9, sy);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Vẽ bản vẽ mặt cắt kỹ thuật 2 lớp (Cross-section Blueprint) bên phải
    ctx.strokeStyle = "#D4A72C";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(212, 167, 44, 0.12)";
    ctx.beginPath();
    ctx.roundRect(415, 65, 120, 215, 4);
    ctx.fill();
    ctx.stroke();

    // Đường cắt profile nan nhôm 2 lớp
    ctx.strokeStyle = "#F5F2EB";
    ctx.lineWidth = 2.5;
    [95, 185].forEach((cy) => {
      ctx.beginPath();
      ctx.moveTo(455, cy - 28);
      ctx.quadraticCurveTo(438, cy, 455, cy + 28);
      ctx.lineTo(488, cy + 28);
      ctx.quadraticCurveTo(476, cy, 488, cy - 28);
      ctx.closePath();
      ctx.stroke();
      // Vách ngang chịu lực chữ K
      ctx.beginPath();
      ctx.moveTo(448, cy);
      ctx.lineTo(482, cy);
      ctx.stroke();
    });

    ctx.fillStyle = "#D4A72C";
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillText("MẶT CẮT 2 LỚP", 428, 266);
  } else if (item.type3D === "sheet_corrugated") {
    // Vẽ thân cửa cuốn tấm liền sóng vuông công nghệ Úc + Lò xo trợ lực
    for (let i = 0; i < 7; i++) {
      const y = 55 + i * 34;
      const grad = ctx.createLinearGradient(0, y, 0, y + 32);
      grad.addColorStop(0, colorObj.hex);
      grad.addColorStop(0.5, "#EAE6DF");
      grad.addColorStop(1, "#4A453E");
      ctx.fillStyle = grad;
      ctx.fillRect(55, y, 330, 28);
    }

    // Lô cuốn tròn phía bên phải
    ctx.strokeStyle = "#D4A72C";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(475, 165, 58, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(475, 165, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#8B0D1C";
    ctx.beginPath();
    ctx.arc(475, 165, 14, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type3D === "slat_polycarbonate") {
    // Cửa cuốn xuyên sáng Polycarbonate
    for (let i = 0; i < 5; i++) {
      const y = 58 + i * 46;
      const isGlass = i === 1 || i === 2 || i === 3;
      if (isGlass) {
        ctx.fillStyle = "rgba(245, 242, 235, 0.22)";
        ctx.fillRect(65, y + 4, 380, 34);
        ctx.strokeStyle = "#D4A72C";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(65, y + 4, 380, 34);
        // Vệt phản quang kính PC
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        ctx.moveTo(110 + i * 40, y + 6);
        ctx.lineTo(90 + i * 40, y + 36);
        ctx.stroke();
      } else {
        ctx.fillStyle = colorObj.hex;
        ctx.fillRect(55, y, 400, 38);
      }
    }
  } else if (item.type3D === "accessory_motor") {
    // Bản vẽ kỹ thuật Bộ tời (Motor) ROSSDOOR đồng bộ
    ctx.fillStyle = "#8B0D1C";
    ctx.strokeStyle = "#D4A72C";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(175, 95, 210, 130, 12);
    ctx.fill();
    ctx.stroke();

    // Khe tản nhiệt thân motor
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      ctx.moveTo(205 + k * 24, 115);
      ctx.lineTo(205 + k * 24, 205);
      ctx.stroke();
    }

    // Đầu trục nhông kéo bằng đồng
    ctx.fillStyle = "#D4A72C";
    ctx.fillRect(120, 125, 55, 70);
    ctx.fillStyle = "#C5C2BA";
    ctx.fillRect(385, 110, 65, 100);
  } else {
    // Bình lưu điện UPS ROSSDOOR
    ctx.fillStyle = "#2E2C29";
    ctx.strokeStyle = "#B5ADA0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(185, 65, 230, 195, 8);
    ctx.fill();
    ctx.stroke();

    // Dải nhận diện đỏ đô ROSSDOOR trên mặt máy UPS
    ctx.fillStyle = "#8B0D1C";
    ctx.fillRect(187, 95, 226, 46);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 18px 'Archivo', sans-serif";
    ctx.fillText("ROSSDOOR UPS", 230, 124);

    // 3 đèn báo trạng thái nguồn
    ["#22c55e", "#22c55e", "#eab308"].forEach((ledColor, idx) => {
      ctx.fillStyle = ledColor;
      ctx.beginPath();
      ctx.arc(245 + idx * 32, 180, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();

  // Tem thông số kỹ thuật góc dưới bản vẽ
  ctx.fillStyle = "rgba(18, 17, 15, 0.88)";
  ctx.fillRect(0, h - 44, w, 44);
  ctx.strokeStyle = "rgba(212, 167, 44, 0.4)";
  ctx.beginPath();
  ctx.moveTo(0, h - 44);
  ctx.lineTo(w, h - 44);
  ctx.stroke();

  ctx.fillStyle = "#D4A72C";
  ctx.font = "700 13px 'JetBrains Mono', monospace";
  ctx.fillText(`MÃ KỸ THUẬT: ${item.code}`, 18, h - 17);

  ctx.fillStyle = "#EAE5DA";
  ctx.font = "500 12px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText(`ĐỘ DÀY: ${item.thickness}`, w - 18, h - 17);
  ctx.textAlign = "left";
};

