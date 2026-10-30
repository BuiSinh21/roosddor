/**
 * ROSSDOOR® — Điều phối giao diện, Bộ lọc danh mục kỹ thuật, Modal thông số & Công cụ tính dự toán
 */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.ROSSDOOR_DATA;
  if (!data) return;

  // 1. Khởi tạo bảng chọn Dòng Cửa & Màu Sơn trong 3D Studio
  const seriesBtnContainer = document.getElementById("studio-series-selector");
  const colorBtnContainer = document.getElementById("studio-color-selector");

  if (seriesBtnContainer) {
    seriesBtnContainer.innerHTML = data.shutterSeries
      .map(
        (s, idx) => `
      <button type="button" data-series-btn="${s.id}" class="series-tab-btn ${idx === 0 ? "active" : ""
          }">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-xs opacity-75">${s.code}</span>
          <span class="text-[11px] px-1.5 py-0.5 bg-black/15 font-mono">${s.slatHeightMm
          }mm</span>
        </div>
        <div class="mt-1 font-bold text-sm leading-tight">${s.shortName}</div>
      </button>
    `
      )
      .join("");

    seriesBtnContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-series-btn]");
      if (!btn || !window.rossStudio3D) return;
      window.rossStudio3D.setSeries(btn.dataset.seriesBtn);
    });
  }

  if (colorBtnContainer) {
    colorBtnContainer.innerHTML = data.colors
      .map(
        (c, idx) => `
      <button type="button" data-color-btn="${c.id}" class="swatch-btn ${idx === 0 ? "active" : ""
          }">
        <span class="swatch-chip" style="background-color: ${c.hex};"></span>
        <div class="min-w-0">
          <div class="text-xs font-bold text-[#191816] truncate">${c.name}</div>
          <div class="text-[11px] font-mono text-[#757067]">${c.code}</div>
        </div>
      </button>
    `
      )
      .join("");

    colorBtnContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-color-btn]");
      if (!btn || !window.rossStudio3D) return;
      window.rossStudio3D.setColor(btn.dataset.colorBtn);
    });
  }

  // Các nút chuyển góc nhìn 3D (Mặt tiền / Mặt cắt nan nhôm 3D / Cận cảnh trục cuốn)
  document.querySelectorAll("[data-studio-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.rossStudio3D) {
        window.rossStudio3D.setViewMode(btn.dataset.studioView);
      }
    });
  });

  // Các nút vận hành cửa trong 3D Studio (UP / STOP / DOWN / VENT / OBSTACLE)
  document.querySelectorAll("[data-door-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.rossStudio3D) {
        window.rossStudio3D.operateDoor(btn.dataset.doorCmd);
      }
    });
  });

  // 2. Hiển thị Danh mục Sản phẩm & Phụ kiện đồng bộ (Không cần ảnh chụp có sẵn)
  const allProducts = [...data.shutterSeries, ...data.catalogExtras];
  const catalogGrid = document.getElementById("catalog-products-grid");

  function renderCatalog(filterCat = "all") {
    if (!catalogGrid) return;
    const filtered =
      filterCat === "all"
        ? allProducts
        : allProducts.filter((item) => item.category === filterCat);

    catalogGrid.innerHTML = filtered
      .map((item) => {
        const is3DCapable = data.shutterSeries.some((s) => s.id === item.id);
        const unitLabel = item.isUnitPrice ? "đ / bộ" : "đ / m²";
        return `
        <article class="product-arch-card">
          <div class="product-canvas-preview">
            <canvas data-product-canvas="${item.id}" class="w-full h-full block"></canvas>
            <span class="absolute top-3 left-3 bg-[#8B0D1C] text-white font-mono text-[11px] font-semibold px-2.5 py-1 uppercase tracking-wider">
              ${item.badge}
            </span>
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 text-xs font-mono text-[#757067] mb-1">
                <span>MODEL: ${item.code}</span>
                <span>${item.weightPerM2}</span>
              </div>
              <h3 class="text-lg font-bold text-[#191816] leading-snug mb-2">
                ${item.name}
              </h3>
              <p class="text-sm text-[#4A4640] mb-4 line-clamp-2">
                ${item.summary}
              </p>
              <table class="spec-grid-table mb-4">
                <tr>
                  <th>Vật liệu chế tạo</th>
                  <td>${item.material}</td>
                </tr>
                <tr>
                  <th>Độ dày / Công suất</th>
                  <td>${item.thickness}</td>
                </tr>
                <tr>
                  <th>Kích thước tối đa</th>
                  <td>${item.maxSize}</td>
                </tr>
              </table>
            </div>

            <div>
              <div class="flex items-baseline justify-between pt-3 border-t border-[#D2CBBF] mb-4">
                <span class="text-xs uppercase font-mono text-[#757067]">Đơn giá niêm yết</span>
                <span class="text-lg font-extrabold font-mono text-[#8B0D1C]">
                  ${item.pricePerM2.toLocaleString("vi-VN")} <small class="text-xs font-normal text-[#4A4640]">${unitLabel}</small>
                </span>
              </div>
              <div class="grid ${is3DCapable ? "grid-cols-2" : "grid-cols-1"} gap-2">
                <button
                  type="button"
                  data-open-modal="${item.id}"
                  class="px-3 py-2.5 border border-[#191816] text-[#191816] hover:bg-[#191816] hover:text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Bản vẽ & Thông số
                </button>
                ${is3DCapable
            ? `<button
                        type="button"
                        data-load-3d="${item.id}"
                        class="px-3 py-2.5 bg-[#8B0D1C] text-white hover:bg-[#680814] text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        Nạp vào 3D Studio
                      </button>`
            : ""
          }
              </div>
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    // Vẽ bản vẽ kỹ thuật lên từng Canvas của thẻ sản phẩm
    catalogGrid.querySelectorAll("[data-product-canvas]").forEach((canvas) => {
      const prodId = canvas.dataset.productCanvas;
      const prodObj = allProducts.find((p) => p.id === prodId);
      if (prodObj && window.renderProductTechnicalCanvas) {
        window.renderProductTechnicalCanvas(canvas, prodObj);
      }
    });
  }

  renderCatalog("all");

  // Lọc danh mục sản phẩm
  document.querySelectorAll("[data-cat-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-cat-filter]").forEach((b) => {
        b.classList.remove("bg-[#8B0D1C]", "text-white", "border-[#8B0D1C]");
        b.classList.add("bg-[#FAF8F5]", "text-[#4A4640]");
      });
      btn.classList.remove("bg-[#FAF8F5]", "text-[#4A4640]");
      btn.classList.add("bg-[#8B0D1C]", "text-white", "border-[#8B0D1C]");
      renderCatalog(btn.dataset.catFilter);
    });
  });

  // Xử lý sự kiện bấm nút "Nạp vào 3D Studio" hoặc mở Modal chi tiết kỹ thuật
  if (catalogGrid) {
    catalogGrid.addEventListener("click", (e) => {
      const load3DBtn = e.target.closest("[data-load-3d]");
      if (load3DBtn) {
        const seriesId = load3DBtn.dataset.load3d;
        const studioSection = document.getElementById("section-3d-studio");
        if (studioSection) {
          studioSection.scrollIntoView({ behavior: "smooth" });
        }
        if (window.rossStudio3D) {
          window.rossStudio3D.setSeries(seriesId);
          window.rossStudio3D.setViewMode("facade");
        }
        return;
      }

      const modalBtn = e.target.closest("[data-open-modal]");
      if (modalBtn) {
        openProductModal(modalBtn.dataset.openModal);
      }
    });
  }

  // 3. Modal Xem Chi Tiết Thông Số Kỹ Thuật
  const modalEl = document.getElementById("spec-detail-modal");
  const modalCloseBtn = document.getElementById("btn-close-spec-modal");

  function openProductModal(prodId) {
    const item = allProducts.find((p) => p.id === prodId);
    if (!item || !modalEl) return;

    document.getElementById("modal-prod-code").textContent = `MÃ HIỆU: ${item.code}`;
    document.getElementById("modal-prod-name").textContent = item.name;
    document.getElementById("modal-prod-summary").textContent = item.summary;
    document.getElementById("modal-prod-material").textContent = item.material;
    document.getElementById("modal-prod-thickness").textContent = item.thickness;
    document.getElementById("modal-prod-maxsize").textContent = item.maxSize;
    document.getElementById("modal-prod-weight").textContent = item.weightPerM2;
    document.getElementById("modal-prod-price").textContent = `${item.pricePerM2.toLocaleString(
      "vi-VN"
    )} ${item.isUnitPrice ? "đ / bộ" : "đ / m²"}`;

    const featList = document.getElementById("modal-prod-features");
    if (featList && item.features) {
      featList.innerHTML = item.features
        .map(
          (f) => `
        <li class="flex items-start gap-2.5 text-sm text-[#191816]">
          <span class="w-2 h-2 mt-2 bg-[#8B0D1C] shrink-0"></span>
          <span>${f}</span>
        </li>
      `
        )
        .join("");
    }

    const modalCanvas = document.getElementById("modal-prod-canvas");
    if (modalCanvas && window.renderProductTechnicalCanvas) {
      window.renderProductTechnicalCanvas(modalCanvas, item);
    }

    modalEl.classList.remove("hidden");
    modalEl.classList.add("flex");
  }

  if (modalCloseBtn && modalEl) {
    modalCloseBtn.addEventListener("click", () => {
      modalEl.classList.add("hidden");
      modalEl.classList.remove("flex");
    });
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) {
        modalEl.classList.add("hidden");
        modalEl.classList.remove("flex");
      }
    });
  }

  // 4. Công cụ Tính Dự Toán Chi Phí Cửa Cuốn Theo Kích Thước (Frontend Calculator)
  const calcWidthInput = document.getElementById("calc-width");
  const calcHeightInput = document.getElementById("calc-height");
  const calcSeriesSelect = document.getElementById("calc-series");
  const calcMotorSelect = document.getElementById("calc-motor");
  const calcUpsCheckbox = document.getElementById("calc-ups");

  function updateCostEstimate() {
    if (!calcWidthInput || !calcHeightInput || !calcSeriesSelect) return;

    const w = Math.max(1.5, Math.min(9.0, parseFloat(calcWidthInput.value) || 3.6));
    const h = Math.max(1.8, Math.min(7.0, parseFloat(calcHeightInput.value) || 3.2));

    // Chiều cao phủ bì tiêu chuẩn cộng thêm 0.5m lô cuốn
    const coverHeight = h + 0.5;
    const totalArea = w * coverHeight;

    const series =
      data.shutterSeries.find((s) => s.id === calcSeriesSelect.value) ||
      data.shutterSeries[0];

    const curtainCost = Math.round(totalArea * series.pricePerM2);

    let motorCost = 6800000;
    let motorName = "Bộ tời đồng bộ ROSSDOOR AH-500 (Lõi đồng)";
    if (calcMotorSelect) {
      const mVal = calcMotorSelect.value;
      if (mVal === "300") {
        motorCost = 5200000;
        motorName = "Bộ tời đồng bộ ROSSDOOR AH-300 (≤ 15m²)";
      } else if (mVal === "800") {
        motorCost = 9400000;
        motorName = "Bộ tời siêu trường ROSSDOOR AH-800 (> 22m²)";
      } else if (mVal === "none") {
        motorCost = 0;
        motorName = "Không kèm bộ tời (Kéo tay / Đã có sẵn)";
      }
    }

    const upsCost = calcUpsCheckbox && calcUpsCheckbox.checked ? 3600000 : 0;
    const totalEstimate = curtainCost + motorCost + upsCost;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt("calc-out-dim", `Rộng ${w.toFixed(2)}m × Cao phủ bì ${coverHeight.toFixed(2)}m`);
    setTxt("calc-out-area", `${totalArea.toFixed(2)} m²`);
    setTxt("calc-out-series-name", `${series.name}`);
    setTxt("calc-out-curtain-cost", `${curtainCost.toLocaleString("vi-VN")} đ`);
    setTxt("calc-out-motor-name", motorName);
    setTxt("calc-out-motor-cost", `${motorCost.toLocaleString("vi-VN")} đ`);
    setTxt("calc-out-ups-cost", `${upsCost.toLocaleString("vi-VN")} đ`);
    setTxt("calc-out-total", `${totalEstimate.toLocaleString("vi-VN")} VNĐ`);
  }

  [
    calcWidthInput,
    calcHeightInput,
    calcSeriesSelect,
    calcMotorSelect,
    calcUpsCheckbox
  ].forEach((el) => {
    if (el) {
      el.addEventListener("input", updateCostEstimate);
      el.addEventListener("change", updateCostEstimate);
    }
  });
  updateCostEstimate();

  // 5. Nút bật / tắt âm thanh cơ khí
  const btnAudioToggle = document.getElementById("btn-toggle-audio");
  const audioLabel = document.getElementById("audio-state-label");
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener("click", () => {
      if (!window.rossSound) return;
      const isEnabled = window.rossSound.toggleMute();
      if (audioLabel) {
        audioLabel.textContent = isEnabled ? "Âm thanh: BẬT" : "Âm thanh: TẮT";
      }
    });
  }
});
