/**
 * ROSSDOOR® — Cánh Cửa Cuốn 3D Mở Màn (Three.js Fullscreen Architectural Gate)
 * Dựng cánh cửa cuốn 3D từ các thanh nan nhôm định hình, có khe thoáng,
 * bảng đồng thương hiệu ROSSDOOR® và trục cuốn thu gọn thực tế.
 * Nền trong suốt (Alpha WebGL) để khi cửa 3D cuộn lên sẽ lộ trực tiếp nội dung trang web phía sau.
 */

class RossIntroGate3D {
  constructor() {
    this.container = document.getElementById("intro-gate-canvas-wrap");
    this.overlay = document.getElementById("intro-gate-overlay");
    this.statusText = document.getElementById("gate-status-label");
    this.remoteLed = document.getElementById("remote-led-indicator");
    this.autoBar = document.getElementById("gate-auto-progress");

    if (!this.container || typeof THREE === "undefined") return;

    this.state = "CLOSED"; // CLOSED | VENTING | OPENING | OPENED | CLOSING
    this.openProgress = 0; // 0 = đóng kín, 0.18 = mở khe thoáng, 1.0 = cuộn hết lên đỉnh
    this.targetProgress = 0;
    this.slatCount = 26;
    this.slats = [];
    this.autoTimer = null;
    this.autoElapsed = 0;
    this.autoDuration = 3200; // Tự động mở sau 3.2 giây nếu khách chưa bấm
    this.autoPaused = false;

    this.initThree();
    this.buildArchitecturalFrame();
    this.buildShutterSlats();
    this.bindEvents();
    this.animate();
    this.startAutoOpenCountdown();
  }

  initThree() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();

    // Camera phối cảnh mặt tiền kiến trúc
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 14.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // Trong suốt hoàn toàn để nhìn xuyên vào web khi cửa mở
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // Tính toán kích thước khung cửa khớp 100% khung nhìn camera
    this.updateViewportBounds();

    // Hệ thống ánh sáng kiến trúc tự nhiên (Không dùng đèn neon)
    const ambientLight = new THREE.AmbientLight(0xf5f0e6, 1.15);
    this.scene.add(ambientLight);

    // Ánh nắng mặt trời chiếu xiên từ trên xuống tạo khối 3D cho từng nan cửa
    this.sunLight = new THREE.DirectionalLight(0xfff8eb, 1.9);
    this.sunLight.position.set(4, 8, 9);
    this.scene.add(this.sunLight);

    // Ánh sáng phản xạ từ mặt đất bê tông
    const bounceLight = new THREE.DirectionalLight(0xd8d0c5, 0.65);
    bounceLight.position.set(-5, -6, 5);
    this.scene.add(bounceLight);

    // Ánh sáng ấm bên trong showroom hắt qua khe thoáng
    this.interiorLight = new THREE.PointLight(0xffdfa8, 1.4, 18);
    this.interiorLight.position.set(0, 0.5, -1.5);
    this.scene.add(this.interiorLight);
  }

  updateViewportBounds() {
    const vFov = (this.camera.fov * Math.PI) / 180;
    this.viewHeight = 2 * Math.tan(vFov / 2) * this.camera.position.z;
    this.viewWidth = this.viewHeight * this.camera.aspect;
  }

  // Tạo texture mặt nan nhôm sơn tĩnh điện hạt mịn + lỗ thoáng kim cương
  createSlatSurfaceTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    // Nền sơn tĩnh điện Ghi sáng ánh kim pha cát mịn
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#d7d3cb");
    grad.addColorStop(0.28, "#e6e3dc");
    grad.addColorStop(0.55, "#c6c1b8");
    grad.addColorStop(0.85, "#aba59b");
    grad.addColorStop(1, "#857f75");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 128);

    // Hai đường gân chỉ chịu lực chạy ngang thân nan
    ctx.fillStyle = "rgba(60, 56, 50, 0.35)";
    ctx.fillRect(0, 34, 1024, 4);
    ctx.fillRect(0, 88, 1024, 4);

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.fillRect(0, 38, 1024, 3);
    ctx.fillRect(0, 92, 1024, 3);

    // Các lỗ thoáng hình kim cương (Diamond Ventilation Slots) ở mép trên nan
    ctx.fillStyle = "#2b2621";
    const slotCount = 24;
    const step = 1024 / slotCount;
    for (let i = 1; i < slotCount; i++) {
      const cx = i * step;
      const cy = 15;
      const rx = 11;
      const ry = 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - ry);
      ctx.lineTo(cx + rx, cy);
      ctx.lineTo(cx, cy + ry);
      ctx.lineTo(cx - rx, cy);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  // Tạo biển hiệu kim loại ROSSDOOR® gắn chính giữa thân cửa cuốn 3D
  createBrandPlateTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 340;
    const ctx = canvas.getContext("2d");

    // Nền Đỏ Đô ROSSDOOR chuẩn từ logo
    ctx.fillStyle = "#8B0D1C";
    ctx.fillRect(0, 0, 1024, 340);

    // Viền kim loại vàng đồng xung quanh bảng tên
    ctx.strokeStyle = "#D4A72C";
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, 996, 312);

    // 4 Đinh tán kim loại ở 4 góc
    const rivets = [
      [36, 36],
      [988, 36],
      [36, 304],
      [988, 304]
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#D8D2C7";
      ctx.fill();
      ctx.strokeStyle = "#4A050D";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Vẽ biểu tượng hình học ROSSDOOR bên trái (2 cánh móc + trục tròn ở tâm)
    ctx.save();
    ctx.translate(145, 165);
    ctx.fillStyle = "#FFFFFF";

    // Trục tròn trung tâm
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Cánh móc trái trên
    ctx.beginPath();
    ctx.moveTo(-10, -88);
    ctx.lineTo(22, -56);
    ctx.lineTo(-34, 0);
    ctx.lineTo(-14, 20);
    ctx.lineTo(-36, 42);
    ctx.lineTo(-78, 0);
    ctx.closePath();
    ctx.fill();

    // Cánh móc phải dưới (đối xứng tâm)
    ctx.beginPath();
    ctx.moveTo(10, 88);
    ctx.lineTo(-22, 56);
    ctx.lineTo(34, 0);
    ctx.lineTo(14, -20);
    ctx.lineTo(36, -42);
    ctx.lineTo(78, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Chữ ROSS (Trắng) + DOOR (Vàng Kim)
    ctx.font = "900 112px 'Archivo', 'Be Vietnam Pro', sans-serif";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("ROSS", 255, 148);
    const rossWidth = ctx.measureText("ROSS").width;

    ctx.fillStyle = "#F5D000";
    ctx.fillText("DOOR", 255 + rossWidth + 6, 148);
    const doorWidth = ctx.measureText("DOOR").width;

    // Ký hiệu ®
    ctx.font = "700 42px 'Archivo', sans-serif";
    ctx.fillText("®", 255 + rossWidth + doorWidth + 14, 95);

    // Slogan "Bền bỉ & thẩm mỹ"
    ctx.font = "700 40px 'Be Vietnam Pro', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Bền bỉ & thẩm mỹ", 545, 248);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }

  buildArchitecturalFrame() {
    this.frameGroup = new THREE.Group();
    this.scene.add(this.frameGroup);

    const railWidth = Math.max(0.55, this.viewWidth * 0.055);
    const hoodHeight = 1.35;

    // Vật liệu ray dẫn hướng nhôm Anodized xám đậm
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x2c2a27,
      metalness: 0.72,
      roughness: 0.35
    });

    // Hộp kỹ thuật phía trên (Header Box)
    const hoodGeo = new THREE.BoxGeometry(this.viewWidth + 1, hoodHeight, 1.4);
    this.hoodMesh = new THREE.Mesh(hoodGeo, railMat);
    this.hoodMesh.position.set(0, this.viewHeight / 2 - hoodHeight / 2 + 0.15, 0.55);
    this.frameGroup.add(this.hoodMesh);

    // Thanh nẹp chỉ đỏ đô & vàng đồng trên hộp kỹ thuật
    const accentGeo = new THREE.BoxGeometry(this.viewWidth + 1, 0.12, 1.44);
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x8b0d1c,
      metalness: 0.4,
      roughness: 0.4
    });
    this.hoodAccent = new THREE.Mesh(accentGeo, accentMat);
    this.hoodAccent.position.set(0, this.viewHeight / 2 - hoodHeight + 0.22, 0.55);
    this.frameGroup.add(this.hoodAccent);

    // Hai thanh ray dẫn hướng U85i hai bên
    const railGeo = new THREE.BoxGeometry(railWidth, this.viewHeight + 2, 0.85);
    this.leftRail = new THREE.Mesh(railGeo, railMat);
    this.leftRail.position.set(-this.viewWidth / 2 + railWidth / 2 - 0.05, 0, 0.25);

    this.rightRail = new THREE.Mesh(railGeo, railMat);
    this.rightRail.position.set(this.viewWidth / 2 - railWidth / 2 + 0.05, 0, 0.25);

    this.frameGroup.add(this.leftRail, this.rightRail);
  }

  buildShutterSlats() {
    if (this.shutterGroup) {
      this.scene.remove(this.shutterGroup);
    }
    this.shutterGroup = new THREE.Group();
    this.scene.add(this.shutterGroup);
    this.slats = [];

    const topLimit = this.viewHeight / 2 - 0.9;
    const bottomLimit = -this.viewHeight / 2;
    this.doorTotalHeight = topLimit - bottomLimit;
    this.topRollY = topLimit + 0.35;

    this.slatHeight = this.doorTotalHeight / this.slatCount;
    const slatWidth = this.viewWidth + 0.2;

    const slatTex = this.createSlatSurfaceTexture();
    const slatMat = new THREE.MeshStandardMaterial({
      map: slatTex,
      color: 0xffffff,
      metalness: 0.58,
      roughness: 0.36
    });

    // Vật liệu thanh đáy cửa cuốn (Màu đỏ đô hoặc xám đậm kèm gioăng cao su đen)
    const bottomBarMat = new THREE.MeshStandardMaterial({
      color: 0x2b2926,
      metalness: 0.65,
      roughness: 0.32
    });

    const rubberSealMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.1,
      roughness: 0.85
    });

    // Vật liệu khe thoáng phát sáng ấm phía sau khi nan cửa giãn ra
    const glowSlotMat = new THREE.MeshBasicMaterial({
      color: 0xffdf9e,
      transparent: true,
      opacity: 0.0
    });
    this.glowSlotMat = glowSlotMat;

    for (let i = 0; i < this.slatCount; i++) {
      const slatItem = new THREE.Group();
      const isBottomBar = i === this.slatCount - 1;

      if (isBottomBar) {
        // Thanh đáy nhôm hộp kép + gioăng cao su chống nước/vật cản
        const barGeo = new THREE.BoxGeometry(slatWidth, this.slatHeight * 1.15, 0.28);
        const barMesh = new THREE.Mesh(barGeo, bottomBarMat);
        slatItem.add(barMesh);

        const rubberGeo = new THREE.BoxGeometry(slatWidth, this.slatHeight * 0.35, 0.24);
        const rubberMesh = new THREE.Mesh(rubberGeo, rubberSealMat);
        rubberMesh.position.y = -this.slatHeight * 0.6;
        slatItem.add(rubberMesh);
      } else {
        // Nan cửa cuốn thân cong 2 lớp
        const bodyGeo = new THREE.BoxGeometry(slatWidth, this.slatHeight * 0.96, 0.22);
        const bodyMesh = new THREE.Mesh(bodyGeo, slatMat);
        slatItem.add(bodyMesh);

        // Gờ móc liên kết phía trên mỗi nan
        const hookGeo = new THREE.CylinderGeometry(0.08, 0.08, slatWidth, 12);
        hookGeo.rotateZ(Math.PI / 2);
        const hookMesh = new THREE.Mesh(hookGeo, slatMat);
        hookMesh.position.set(0, this.slatHeight * 0.46, 0.06);
        slatItem.add(hookMesh);
      }

      // Vị trí Y khi cửa đóng kín (i=0 ở trên cùng, i=slatCount-1 ở sát đất)
      const closedY = topLimit - (i + 0.5) * this.slatHeight;
      slatItem.userData = {
        index: i,
        closedY: closedY
      };
      slatItem.position.set(0, closedY, 0);

      this.shutterGroup.add(slatItem);
      this.slats.push(slatItem);
    }

    // Gắn tấm bảng thương hiệu ROSSDOOR® nổi lên nan cửa số 11 (giữa tâm cửa)
    const brandTex = this.createBrandPlateTexture();
    const plateWidth = Math.min(4.6, this.viewWidth * 0.52);
    const plateHeight = plateWidth * (340 / 1024);
    const plateGeo = new THREE.BoxGeometry(plateWidth, plateHeight, 0.08);
    const plateMat = new THREE.MeshStandardMaterial({
      map: brandTex,
      metalness: 0.35,
      roughness: 0.38
    });
    this.brandPlate = new THREE.Mesh(plateGeo, plateMat);
    this.brandPlate.position.set(0, 0, 0.14);

    const middleSlatIndex = Math.floor(this.slatCount * 0.42);
    if (this.slats[middleSlatIndex]) {
      this.slats[middleSlatIndex].add(this.brandPlate);
    }
  }

  // Cập nhật vị trí từng nan cửa theo tiến trình mở (0 -> 1)
  updateShutterKinematics(progress) {
    // Giai đoạn 1 (0 -> 0.16): Các nan cửa phía trên nhấc nhẹ để mở khe thoáng trước
    // Giai đoạn 2 (0.16 -> 1.0): Toàn bộ rèm cửa cuốn chạy dọc theo ray lên trục cuốn
    const ventPhase = Math.min(1, progress / 0.16);
    const liftPhase = Math.max(0, (progress - 0.12) / 0.88);
    // Hàm easing mượt như biến tần động cơ cửa cuốn thực tế
    const smoothLift =
      liftPhase < 0.5
        ? 2 * liftPhase * liftPhase
        : 1 - Math.pow(-2 * liftPhase + 2, 2) / 2;

    const totalLiftDistance = this.doorTotalHeight + 0.9;

    for (let i = 0; i < this.slats.length; i++) {
      const slat = this.slats[i];
      const ratioFromTop = 1 - i / this.slatCount;

      // Độ giãn khe thoáng giữa các nan (các nan trên giãn trước)
      const ventOffset = ventPhase * ratioFromTop * this.slatHeight * 0.95;

      // Quãng đường đi lên hộp kỹ thuật
      const currentY =
        slat.userData.closedY + ventOffset + smoothLift * totalLiftDistance;

      // Khi nan cửa chạm vào hộp kỹ thuật (topRollY), nó cuộn vào trục lô cuốn phía sau
      if (currentY >= this.topRollY) {
        const over = currentY - this.topRollY;
        const angle = over * 1.6;
        const radius = 0.38;
        slat.position.y = this.topRollY + Math.sin(angle) * radius;
        slat.position.z = -0.35 - (1 - Math.cos(angle)) * radius;
        slat.rotation.x = -angle;
        slat.visible = over < 1.8; // Thu gọn hoàn toàn bên trong hộp kỹ thuật
      } else {
        slat.position.y = currentY;
        slat.position.z = 0;
        // Nghiêng nhẹ nan cửa khi đang mở khe thoáng để đón sáng
        slat.rotation.x = ventPhase * (1 - smoothLift) * 0.14;
        slat.visible = true;
      }
    }

    // Khi cửa đã mở gần hết (> 0.82), thu gọn cả khung ray và hộp kỹ thuật lên trên để trả lại 100% màn hình web
    if (this.frameGroup) {
      const frameRetract = Math.max(0, (progress - 0.78) / 0.22);
      this.hoodMesh.position.y =
        this.viewHeight / 2 - 1.35 / 2 + 0.15 + frameRetract * 2.2;
      this.hoodAccent.position.y =
        this.viewHeight / 2 - 1.35 + 0.22 + frameRetract * 2.2;
      this.leftRail.position.x =
        -this.viewWidth / 2 + 0.25 - frameRetract * 2.0;
      this.rightRail.position.x =
        this.viewWidth / 2 - 0.25 + frameRetract * 2.0;
    }
  }

  // Kích hoạt mở hoàn toàn cánh cửa cuốn
  openGate(playAudio = true) {
    this.stopAutoOpenCountdown();
    if (this.state === "OPENED" || this.state === "OPENING") return;

    this.state = "OPENING";
    this.targetProgress = 1.0;
    document.body.classList.remove("gate-locked");

    if (this.remoteLed) this.remoteLed.classList.add("active");
    if (this.statusText) {
      this.statusText.textContent = "ĐANG MỞ KHE THOÁNG & CUỘN CỬA LÊN HỘP KỸ THUẬT...";
    }

    if (playAudio && window.rossSound) {
      window.rossSound.playRemoteBeep(2450, 0.09);
      window.rossSound.startMotorHum(1.9);
    }

    setTimeout(() => {
      if (this.remoteLed) this.remoteLed.classList.remove("active");
    }, 600);
  }

  // Chế độ chỉ mở khe thoáng (người dùng xem hiệu ứng ánh sáng xuyên qua lỗ thoáng)
  ventGate() {
    this.stopAutoOpenCountdown();
    this.state = "VENTING";
    this.targetProgress = this.targetProgress > 0.12 ? 0.0 : 0.16;

    if (this.remoteLed) {
      this.remoteLed.classList.add("active");
      setTimeout(() => this.remoteLed.classList.remove("active"), 350);
    }

    if (window.rossSound) {
      window.rossSound.playRemoteBeep(2100, 0.08);
      window.rossSound.startMotorHum(0.6);
    }

    if (this.statusText) {
      this.statusText.textContent =
        this.targetProgress > 0
          ? "CHẾ ĐỘ KHE THOÁNG: ĐỐI LƯU KHÔNG KHÍ & ĐÓN SÁNG"
          : "ĐÃ ĐÓNG KÍN KHE THOÁNG";
    }
  }

  // Kéo cửa cuốn 3D đóng xuống lại khi người dùng bấm nút trên thanh Header
  closeGate() {
    this.stopAutoOpenCountdown();
    this.overlay.classList.remove("gate-opened");
    document.body.classList.add("gate-locked");
    this.state = "CLOSING";
    this.targetProgress = 0.0;

    if (this.statusText) {
      this.statusText.textContent = "CỬA CUỐN ĐANG ĐÓNG XUỐNG — BẤM REMOTE ĐỂ MỞ...";
    }

    if (window.rossSound) {
      window.rossSound.playRemoteBeep(2200, 0.09);
      window.rossSound.startMotorHum(1.8);
    }
  }

  startAutoOpenCountdown() {
    const startTime = performance.now();
    const tick = (now) => {
      if (this.autoPaused || this.state !== "CLOSED") return;
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / this.autoDuration);
      if (this.autoBar) {
        this.autoBar.style.width = `${(1 - ratio) * 100}%`;
      }
      if (ratio >= 1) {
        this.openGate(false); // Tự động mở êm không phát tiếng nếu khách chưa click
      } else {
        this.autoTimer = requestAnimationFrame(tick);
      }
    };
    this.autoTimer = requestAnimationFrame(tick);
  }

  stopAutoOpenCountdown() {
    this.autoPaused = true;
    if (this.autoTimer) cancelAnimationFrame(this.autoTimer);
    const autoWrap = document.getElementById("gate-auto-wrap");
    if (autoWrap) autoWrap.style.opacity = "0";
  }

  bindEvents() {
    const btnOpen = document.getElementById("btn-gate-open");
    const btnVent = document.getElementById("btn-gate-vent");
    const btnStopAuto = document.getElementById("btn-gate-keep-closed");
    const btnHeaderReplay = document.getElementById("btn-header-replay-gate");

    if (btnOpen) {
      btnOpen.addEventListener("click", () => this.openGate(true));
    }
    if (btnVent) {
      btnVent.addEventListener("click", () => this.ventGate());
    }
    if (btnStopAuto) {
      btnStopAuto.addEventListener("click", () => {
        this.stopAutoOpenCountdown();
        if (this.statusText) {
          this.statusText.textContent =
            "ĐÃ GIỮ CỬA ĐÓNG — BẤM NÚT TRÊN REMOTE ĐỂ ĐIỀU KHIỂN";
        }
      });
    }
    if (btnHeaderReplay) {
      btnHeaderReplay.addEventListener("click", () => {
        if (this.state === "OPENED" || this.targetProgress > 0.5) {
          this.closeGate();
        } else {
          this.openGate(true);
        }
      });
    }

    // Cho phép lăn chuột hoặc bấm phím Space/Enter để mở cửa cuốn ngay lập tức
    window.addEventListener(
      "wheel",
      (e) => {
        if (this.state === "CLOSED" && e.deltaY > 15) {
          this.openGate(true);
        }
      },
      { passive: true }
    );

    window.addEventListener("keydown", (e) => {
      if (
        (this.state === "CLOSED" || this.state === "VENTING") &&
        (e.code === "Space" || e.code === "Enter" || e.code === "ArrowUp")
      ) {
        e.preventDefault();
        this.openGate(true);
      }
    });

    window.addEventListener("resize", () => {
      if (!this.renderer || !this.camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.updateViewportBounds();
      this.scene.remove(this.frameGroup);
      this.buildArchitecturalFrame();
      this.buildShutterSlats();
      this.updateShutterKinematics(this.openProgress);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Nội suy tiến trình đóng/mở cửa mượt 60 FPS
    const diff = this.targetProgress - this.openProgress;
    if (Math.abs(diff) > 0.0008) {
      const speed = this.state === "VENTING" ? 0.08 : 0.024;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), speed);
      this.openProgress += step;
      this.updateShutterKinematics(this.openProgress);

      if (this.openProgress > 0.45 && !this.overlay.classList.contains("gate-opened")) {
        this.overlay.classList.add("gate-opened");
      }
    } else if (this.state === "OPENING" && this.openProgress >= 0.99) {
      this.openProgress = 1.0;
      this.updateShutterKinematics(1.0);
      this.state = "OPENED";
      this.overlay.classList.add("gate-opened");
    } else if (this.state === "CLOSING" && this.openProgress <= 0.01) {
      this.openProgress = 0.0;
      this.updateShutterKinematics(0.0);
      this.state = "CLOSED";
      if (this.statusText) {
        this.statusText.textContent = "CỬA CUỐN ĐANG ĐÓNG — SẴN SÀNG NHẬN LỆNH TỪ REMOTE";
      }
    }

    // Chỉ render Three.js của cổng khi cửa chưa mở hoàn toàn để tiết kiệm GPU cho 3D Studio bên dưới
    if (this.state !== "OPENED" || this.openProgress < 0.999) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.rossIntroGate = new RossIntroGate3D();
});

