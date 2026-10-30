/**
 * ROSSDOOR® — Phòng Trưng Bày Cửa Cuốn 3D Tương Tác 360° (Three.js PBR Studio)
 * Giải quyết triệt để việc chưa có ảnh chụp sản phẩm bằng cách dựng trực tiếp:
 *  1) Nguyên bộ cửa cuốn 3D lắp trên mặt tiền đá kiến trúc (có Trục cuốn, Motor, Ray U85, Cảm biến đảo chiều)
 *  2) Mô hình 3D Mặt cắt kỹ thuật Nan nhôm 2 lớp 6063-T5 (xoay 360 độ xem vách tăng cứng, phớt giảm chấn, móc nan)
 */

class RossShutterStudio3D {
  constructor() {
    this.container = document.getElementById("studio-3d-canvas-wrap");
    if (!this.container || typeof THREE === "undefined") return;

    this.currentSeriesId = "ross-s52";
    this.currentColorId = "ghi-sang";
    this.viewMode = "facade"; // 'facade' | 'cross-section' | 'motor'

    // Trạng thái vận hành cửa trong 3D Studio
    this.doorPos = 0.22; // 0 = đóng kín, 1 = mở hoàn toàn
    this.targetDoorPos = 0.22;
    this.ventMode = true;
    this.motorState = "IDLE"; // IDLE | UP | DOWN | OBSTACLE_TEST
    this.obstacleActive = false;
    this.obstacleTriggered = false;

    // Điều khiển xoay camera 360 độ (Custom Orbit Spherical Coordinates)
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.spherical = {
      theta: 0.28, // Góc ngang
      phi: 1.38,   // Góc dọc
      radius: 9.2
    };
    this.targetSpherical = { ...this.spherical };
    this.lookAtTarget = new THREE.Vector3(0, 0.3, 0);
    this.currentLookAt = new THREE.Vector3(0, 0.3, 0);

    this.slats = [];
    this.slatCount = 18;

    this.initScene();
    this.createSharedMaterials();
    this.buildFacadeGroup();
    this.buildCrossSectionGroup();
    this.bindInteraction();
    this.updateHUD();
    this.animate();
  }

  initScene() {
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 580;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1f1d1a);

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // Ánh sáng Kiến trúc tự nhiên (Chân thực, không dùng đèn màu neon)
    const hemiLight = new THREE.HemisphereLight(0xfff6e8, 0x3b3630, 1.05);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e4, 1.85);
    dirLight.position.set(6, 9, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xe5dec9, 0.8);
    rimLight.position.set(-7, 4, -5);
    this.scene.add(rimLight);

    // Đèn trần ấm bên trong Gara
    this.garageLight = new THREE.PointLight(0xffd896, 1.8, 12);
    this.garageLight.position.set(0, 1.8, -1.8);
    this.scene.add(this.garageLight);
  }

  createSharedMaterials() {
    const colorObj =
      window.ROSSDOOR_DATA.colors.find((c) => c.id === this.currentColorId) ||
      window.ROSSDOOR_DATA.colors[0];

    // Vật liệu sơn tĩnh điện nhôm định hình (Cập nhật trực tiếp khi khách đổi màu)
    this.slatMaterial = new THREE.MeshStandardMaterial({
      color: colorObj.threeHex,
      metalness: colorObj.metalness,
      roughness: colorObj.roughness
    });

    // Vật liệu mặt cắt lõi nhôm nguyên sinh 6063-T5 (bạc sáng kim khí ở đầu mặt cắt)
    this.rawAluminumMat = new THREE.MeshStandardMaterial({
      color: 0xe2e5e8,
      metalness: 0.82,
      roughness: 0.22
    });

    // Vật liệu kính Polycarbonate trong suốt cho dòng cửa xuyên sáng ROSS-PC
    this.polycarbonateMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.36,
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.6
    });

    // Vật liệu đá Travertine ốp mặt tiền biệt thự
    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0xdcd5c7,
      roughness: 0.78,
      metalness: 0.05
    });

    // Vật liệu nền bê tông mài
    this.floorMat = new THREE.MeshStandardMaterial({
      color: 0x2c2926,
      roughness: 0.65,
      metalness: 0.1
    });

    // Vật liệu ray nhôm Anodized xám đậm
    this.railMat = new THREE.MeshStandardMaterial({
      color: 0x302e2b,
      metalness: 0.7,
      roughness: 0.34
    });

    // Vật liệu Đỏ Đô ROSSDOOR cho Motor đồng bộ & điểm nhấn thương hiệu
    this.crimsonMat = new THREE.MeshStandardMaterial({
      color: 0x8b0d1c,
      metalness: 0.45,
      roughness: 0.35
    });

    // Vật liệu Vàng đồng cơ khí
    this.brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4a72c,
      metalness: 0.78,
      roughness: 0.28
    });
  }

  // Tạo texture lỗ thoáng kim cương cho nan cửa trong Studio
  createStudioSlatTexture(type3D) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 64);

    if (type3D === "slat_curved_vent") {
      // Gân chịu lực đôi + hàng lỗ thoáng kim cương
      ctx.fillStyle = "#c8c8c8";
      ctx.fillRect(0, 20, 512, 3);
      ctx.fillRect(0, 44, 512, 3);

      ctx.fillStyle = "#22201d";
      for (let i = 1; i < 16; i++) {
        const cx = i * 32;
        const cy = 9;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx + 8, cy);
        ctx.lineTo(cx, cy + 4);
        ctx.lineTo(cx - 8, cy);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type3D === "slat_flat_wide") {
      // Bản lớn siêu trường A70 với chỉ âm sắc nét
      ctx.fillStyle = "#b5b5b5";
      ctx.fillRect(0, 14, 512, 2);
      ctx.fillRect(0, 32, 512, 3);
      ctx.fillRect(0, 50, 512, 2);
    } else if (type3D === "sheet_corrugated") {
      // Sóng vuông tấm liền công nghệ Úc
      const grad = ctx.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.45, "#dcdcdc");
      grad.addColorStop(0.55, "#a8a8a8");
      grad.addColorStop(1, "#ececec");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 64);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  // Xây dựng mô hình 1: Nguyên bộ cửa cuốn lắp trên mặt tiền kiến trúc
  buildFacadeGroup() {
    if (this.facadeGroup) {
      this.scene.remove(this.facadeGroup);
    }
    this.facadeGroup = new THREE.Group();
    this.scene.add(this.facadeGroup);

    // Mặt sàn bê tông + Lưới kỹ thuật mảnh
    const floorGeo = new THREE.PlaneGeometry(18, 18);
    const floorMesh = new THREE.Mesh(floorGeo, this.floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -2.2;
    floorMesh.receiveShadow = true;
    this.facadeGroup.add(floorMesh);

    const grid = new THREE.GridHelper(16, 16, 0x57524a, 0x383530);
    grid.position.y = -2.19;
    this.facadeGroup.add(grid);

    // Hai cột trụ đá Travertine mặt tiền
    const pillarGeo = new THREE.BoxGeometry(1.1, 5.2, 1.2);
    const leftPillar = new THREE.Mesh(pillarGeo, this.stoneMat);
    leftPillar.position.set(-2.65, 0.4, 0);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;

    const rightPillar = new THREE.Mesh(pillarGeo, this.stoneMat);
    rightPillar.position.set(2.65, 0.4, 0);
    rightPillar.castShadow = true;
    rightPillar.receiveShadow = true;

    // Dầm ngang mặt tiền phía trên
    const lintelGeo = new THREE.BoxGeometry(6.4, 0.9, 1.3);
    const lintelMesh = new THREE.Mesh(lintelGeo, this.stoneMat);
    lintelMesh.position.set(0, 3.05, 0);

    // Biển hiệu ROSSDOOR® gắn trên dầm mặt tiền
    const signGeo = new THREE.BoxGeometry(2.3, 0.42, 0.08);
    const signMesh = new THREE.Mesh(signGeo, this.crimsonMat);
    signMesh.position.set(0, 3.05, 0.64);

    this.facadeGroup.add(leftPillar, rightPillar, lintelMesh, signMesh);

    // Không gian nội thất Gara phía sau cửa cuốn
    const garageBackGeo = new THREE.BoxGeometry(4.4, 4.8, 0.2);
    const garageBackMat = new THREE.MeshStandardMaterial({
      color: 0x2c2824,
      roughness: 0.8
    });
    const garageBack = new THREE.Mesh(garageBackGeo, garageBackMat);
    garageBack.position.set(0, 0.2, -2.5);
    this.facadeGroup.add(garageBack);

    // Hai thanh ray dẫn hướng nhôm U85i lắp sát mép trong cột đá
    const railGeo = new THREE.BoxGeometry(0.16, 4.5, 0.22);
    const leftRail = new THREE.Mesh(railGeo, this.railMat);
    leftRail.position.set(-2.04, 0.05, 0.15);
    const rightRail = new THREE.Mesh(railGeo, this.railMat);
    rightRail.position.set(2.04, 0.05, 0.15);
    this.facadeGroup.add(leftRail, rightRail);

    // Đèn LED báo cảm biến vật cản gắn ở chân ray
    const sensorGeo = new THREE.SphereGeometry(0.06, 12, 12);
    this.sensorMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    this.leftSensor = new THREE.Mesh(sensorGeo, this.sensorMat);
    this.leftSensor.position.set(-1.94, -1.85, 0.25);
    this.rightSensor = new THREE.Mesh(sensorGeo, this.sensorMat);
    this.rightSensor.position.set(1.94, -1.85, 0.25);
    this.facadeGroup.add(this.leftSensor, this.rightSensor);

    // Trục lô cuốn thép Ø114 + Bát nhông + Bộ tời (Motor) ROSSDOOR đồng bộ
    this.rollerShaftGroup = new THREE.Group();
    this.rollerShaftGroup.position.set(0, 2.28, -0.18);
    this.facadeGroup.add(this.rollerShaftGroup);

    const shaftGeo = new THREE.CylinderGeometry(0.22, 0.22, 4.15, 24);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMesh = new THREE.Mesh(shaftGeo, this.rawAluminumMat);
    this.rollerShaftGroup.add(shaftMesh);

    // Puly nhựa kỹ thuật đen trên trục cuốn
    [-1.4, 0, 1.4].forEach((px) => {
      const pulleyGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 20);
      pulleyGeo.rotateZ(Math.PI / 2);
      const pulleyMesh = new THREE.Mesh(pulleyGeo, this.railMat);
      pulleyMesh.position.x = px;
      this.rollerShaftGroup.add(pulleyMesh);
    });

    // Cụm Motor đồng bộ ROSSDOOR màu Đỏ Đô bên phải trục cuốn
    const motorGroup = new THREE.Group();
    motorGroup.position.set(2.25, 2.05, -0.18);
    const motorBodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.75, 20);
    const motorBody = new THREE.Mesh(motorBodyGeo, this.crimsonMat);
    const motorCapGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 20);
    const motorCap = new THREE.Mesh(motorCapGeo, this.brassMat);
    motorCap.position.y = 0.38;
    motorGroup.add(motorBody, motorCap);
    this.facadeGroup.add(motorGroup);

    // Hộp kỹ thuật Alu bán trong suốt để khách nhìn thấy trục lô cuốn bên trong
    const hoodCoverGeo = new THREE.BoxGeometry(4.25, 0.78, 0.82);
    const hoodCoverMat = new THREE.MeshPhysicalMaterial({
      color: 0x35322f,
      transparent: true,
      opacity: 0.28,
      roughness: 0.2,
      metalness: 0.1
    });
    const hoodCover = new THREE.Mesh(hoodCoverGeo, hoodCoverMat);
    hoodCover.position.set(0, 2.28, -0.12);
    this.facadeGroup.add(hoodCover);

    // Chướng ngại vật thử cảm biến an toàn (Mặc định ẩn, hiện ra khi bấm "Thử vật cản")
    this.obstacleGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(0.75, 0.65, 0.55);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xd4a72c,
      roughness: 0.45,
      metalness: 0.2
    });
    const obstacleBox = new THREE.Mesh(boxGeo, boxMat);
    obstacleBox.position.y = -1.87;
    const stripeGeo = new THREE.BoxGeometry(0.77, 0.14, 0.57);
    const stripeMesh = new THREE.Mesh(stripeGeo, this.crimsonMat);
    stripeMesh.position.y = -1.82;
    this.obstacleGroup.add(obstacleBox, stripeMesh);
    this.obstacleGroup.position.set(0, 0, 0.15);
    this.obstacleGroup.visible = false;
    this.facadeGroup.add(this.obstacleGroup);

    // Dựng các thanh nan cửa cuốn 3D
    this.rebuildCurtainSlats();
  }

  rebuildCurtainSlats() {
    if (this.curtainGroup) {
      this.facadeGroup.remove(this.curtainGroup);
    }
    this.curtainGroup = new THREE.Group();
    this.facadeGroup.add(this.curtainGroup);
    this.slats = [];

    const series =
      window.ROSSDOOR_DATA.shutterSeries.find(
        (s) => s.id === this.currentSeriesId
      ) || window.ROSSDOOR_DATA.shutterSeries[0];

    const tex = this.createStudioSlatTexture(series.type3D);
    this.slatMaterial.map = tex;
    this.slatMaterial.needsUpdate = true;

    // Điều chỉnh số lượng nan theo dòng cửa (Nan bản lớn A70 có ít nan hơn nhưng bản cao hơn)
    this.slatCount = series.type3D === "slat_flat_wide" ? 14 : 18;
    this.doorTopY = 2.05;
    this.doorBottomY = -2.15;
    this.totalCurtainH = this.doorTopY - this.doorBottomY;
    this.singleSlatH = this.totalCurtainH / this.slatCount;
    const slatW = 4.02;

    for (let i = 0; i < this.slatCount; i++) {
      const slatNode = new THREE.Group();
      const isBottom = i === this.slatCount - 1;
      const isPolyWindow =
        series.type3D === "slat_polycarbonate" && i >= 6 && i <= 11;

      if (isBottom) {
        // Thanh đáy nhôm hộp + Gioăng cao su đen cảm biến đảo chiều
        const barGeo = new THREE.BoxGeometry(slatW, this.singleSlatH * 0.95, 0.13);
        const barMesh = new THREE.Mesh(barGeo, this.railMat);
        const sealGeo = new THREE.BoxGeometry(slatW, 0.06, 0.11);
        const sealMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const sealMesh = new THREE.Mesh(sealGeo, sealMat);
        sealMesh.position.y = -this.singleSlatH * 0.5;
        slatNode.add(barMesh, sealMesh);
      } else if (isPolyWindow) {
        // Đốt xuyên sáng Polycarbonate trong suốt kết hợp khung nhôm hai đầu
        const frameGeo = new THREE.BoxGeometry(slatW, this.singleSlatH * 0.24, 0.1);
        const topBar = new THREE.Mesh(frameGeo, this.slatMaterial);
        topBar.position.y = this.singleSlatH * 0.35;
        const botBar = new THREE.Mesh(frameGeo, this.slatMaterial);
        botBar.position.y = -this.singleSlatH * 0.35;

        const glassGeo = new THREE.BoxGeometry(
          slatW * 0.92,
          this.singleSlatH * 0.65,
          0.04
        );
        const glassMesh = new THREE.Mesh(glassGeo, this.polycarbonateMat);
        slatNode.add(topBar, botBar, glassMesh);
      } else {
        // Nan nhôm định hình 2 lớp có độ cong nhẹ
        const thickness = series.type3D === "sheet_corrugated" ? 0.06 : 0.11;
        const slatGeo = new THREE.BoxGeometry(
          slatW,
          this.singleSlatH * 0.94,
          thickness
        );
        const slatMesh = new THREE.Mesh(slatGeo, this.slatMaterial);
        slatMesh.castShadow = true;
        slatMesh.receiveShadow = true;
        slatNode.add(slatMesh);

        // Móc liên kết đầu nan
        const hookGeo = new THREE.CylinderGeometry(0.035, 0.035, slatW, 10);
        hookGeo.rotateZ(Math.PI / 2);
        const hookMesh = new THREE.Mesh(hookGeo, this.slatMaterial);
        hookMesh.position.set(0, this.singleSlatH * 0.45, 0.02);
        slatNode.add(hookMesh);
      }

      const closedY = this.doorTopY - (i + 0.5) * this.singleSlatH;
      slatNode.userData = { index: i, closedY };
      this.curtainGroup.add(slatNode);
      this.slats.push(slatNode);
    }

    this.updateCurtainPositions();
  }

  // Xây dựng mô hình 2: Mặt cắt Kỹ thuật Nan Nhôm 3D Phóng Đại (2 nan cài vào nhau)
  buildCrossSectionGroup() {
    if (this.crossSectionGroup) {
      this.scene.remove(this.crossSectionGroup);
    }
    this.crossSectionGroup = new THREE.Group();
    this.crossSectionGroup.visible = false;
    this.scene.add(this.crossSectionGroup);

    // Dựng 2 đốt nan nhôm 2 lớp ghép khớp móc với nhau bằng ExtrudeGeometry
    const buildExtrudedSlatUnit = (yOffset) => {
      const unitGroup = new THREE.Group();
      unitGroup.position.y = yOffset;

      // Biên dạng mặt cắt nan cửa cuốn 2 lớp công nghệ Đức (Thân cong + Móc trên + Chân gài dưới)
      const shape = new THREE.Shape();
      shape.moveTo(-0.32, -0.85);
      shape.quadraticCurveTo(-0.46, 0, -0.32, 0.85); // Vách cong mặt trước
      shape.lineTo(-0.18, 0.98); // Cổ móc trên
      shape.lineTo(0.16, 0.98);
      shape.lineTo(0.24, 0.82);  // Móc khóa trên
      shape.lineTo(0.14, 0.78);
      shape.lineTo(0.10, 0.88);
      shape.lineTo(-0.12, 0.88);
      shape.quadraticCurveTo(0.18, 0, 0.22, -0.85); // Vách cong mặt sau
      shape.lineTo(0.08, -0.85);
      shape.lineTo(0.08, -0.68);
      shape.lineTo(-0.18, -0.68);
      shape.lineTo(-0.18, -0.85);
      shape.closePath();

      // Khoét rỗng 2 khoang chịu lực bên trong mặt cắt nhôm 2 lớp (Tạo đúng vách tăng cứng chữ K ở giữa)
      const upperHole = new THREE.Path();
      upperHole.moveTo(-0.22, 0.08);
      upperHole.quadraticCurveTo(-0.28, 0.42, -0.18, 0.74);
      upperHole.lineTo(0.02, 0.74);
      upperHole.quadraticCurveTo(0.04, 0.42, -0.02, 0.08);
      upperHole.closePath();
      shape.holes.push(upperHole);

      const lowerHole = new THREE.Path();
      lowerHole.moveTo(-0.22, -0.60);
      lowerHole.quadraticCurveTo(-0.28, -0.28, -0.22, -0.02);
      lowerHole.lineTo(-0.02, -0.02);
      lowerHole.quadraticCurveTo(0.06, -0.28, 0.08, -0.60);
      lowerHole.closePath();
      shape.holes.push(lowerHole);

      const extrudeSettings = {
        steps: 1,
        depth: 3.6,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.015,
        bevelSegments: 2
      };

      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center();

      // Mặt ngoài là sơn tĩnh điện AkzoNobel, mặt đầu cắt là lõi nhôm nguyên sinh sáng bóng
      const mesh = new THREE.Mesh(geo, [
        this.rawAluminumMat,
        this.slatMaterial
      ]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      unitGroup.add(mesh);

      // Hai dải phớt lông giảm chấn 2 chiều màu xám bạc gắn dọc chân nan
      const feltGeo = new THREE.BoxGeometry(0.07, 0.14, 3.62);
      const feltMat = new THREE.MeshStandardMaterial({
        color: 0x8d8880,
        roughness: 0.95
      });
      const frontFelt = new THREE.Mesh(feltGeo, feltMat);
      frontFelt.position.set(-0.34, -0.68, 0);
      const backFelt = new THREE.Mesh(feltGeo, feltMat);
      backFelt.position.set(0.22, -0.68, 0);
      unitGroup.add(frontFelt, backFelt);

      // Các lỗ thoáng kim cương dọc cổ móc trên
      const slotGeo = new THREE.BoxGeometry(0.55, 0.10, 0.28);
      const slotMat = new THREE.MeshBasicMaterial({ color: 0x181614 });
      for (let z = -1.3; z <= 1.3; z += 0.65) {
        const slotMesh = new THREE.Mesh(slotGeo, slotMat);
        slotMesh.position.set(-0.05, 0.88, z);
        unitGroup.add(slotMesh);
      }

      // Vít đồng bắt đầu nan chống xô lệch
      const screwGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.15, 16);
      screwGeo.rotateX(Math.PI / 2);
      const screwMesh = new THREE.Mesh(screwGeo, this.brassMat);
      screwMesh.position.set(-0.06, 0.0, 1.84);
      unitGroup.add(screwMesh);

      return unitGroup;
    };

    const topSlat = buildExtrudedSlatUnit(0.86);
    const bottomSlat = buildExtrudedSlatUnit(-0.86);
    this.crossSectionGroup.add(topSlat, bottomSlat);

    // Khung đế kỹ thuật trưng bày mẫu mặt cắt
    const pedestalGeo = new THREE.BoxGeometry(5.2, 0.12, 2.6);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, this.railMat);
    pedestalMesh.position.y = -2.1;
    this.crossSectionGroup.add(pedestalMesh);
  }

  updateCurtainPositions() {
    const series =
      window.ROSSDOOR_DATA.shutterSeries.find(
        (s) => s.id === this.currentSeriesId
      ) || window.ROSSDOOR_DATA.shutterSeries[0];

    const liftDist = this.doorPos * (this.totalCurtainH - 0.35);
    const ventGap =
      this.ventMode && series.type3D !== "sheet_corrugated" ? 0.045 : 0;

    for (let i = 0; i < this.slats.length; i++) {
      const slat = this.slats[i];
      const ventOffset = (this.slatCount - i) * ventGap * (1 - this.doorPos);
      const y = slat.userData.closedY + liftDist + ventOffset;

      if (y > this.doorTopY) {
        const over = y - this.doorTopY;
        const angle = over * 2.4;
        const r = 0.28;
        slat.position.y = 2.28 + Math.sin(angle) * r;
        slat.position.z = 0.15 - (1 - Math.cos(angle)) * r;
        slat.rotation.x = -angle;
        slat.visible = over < 1.5;
      } else {
        slat.position.y = y;
        slat.position.z = 0.15;
        slat.rotation.x = 0;
        slat.visible = true;
      }
    }

    if (this.rollerShaftGroup) {
      this.rollerShaftGroup.rotation.x = -this.doorPos * Math.PI * 4;
    }
  }

  // Đổi dòng cửa cuốn trên mô hình 3D
  setSeries(seriesId) {
    const series = window.ROSSDOOR_DATA.shutterSeries.find(
      (s) => s.id === seriesId
    );
    if (!series) return;

    this.currentSeriesId = seriesId;
    if (series.defaultColor) {
      this.setColor(series.defaultColor, false);
    }
    this.rebuildCurtainSlats();
    this.updateHUD();
  }

  // Đổi màu sơn tĩnh điện AkzoNobel trên mô hình 3D
  setColor(colorId, refreshUI = true) {
    const colorObj = window.ROSSDOOR_DATA.colors.find((c) => c.id === colorId);
    if (!colorObj) return;

    this.currentColorId = colorId;
    this.slatMaterial.color.setHex(colorObj.threeHex);
    this.slatMaterial.metalness = colorObj.metalness;
    this.slatMaterial.roughness = colorObj.roughness;
    this.slatMaterial.needsUpdate = true;

    if (refreshUI) {
      this.updateHUD();
    }
  }

  // Chuyển đổi góc nhìn 3D (Nguyên bộ mặt tiền / Mặt cắt nan nhôm 3D / Cận cảnh trục Motor)
  setViewMode(mode) {
    this.viewMode = mode;

    if (mode === "cross-section") {
      this.facadeGroup.visible = false;
      this.crossSectionGroup.visible = true;
      this.targetSpherical = { theta: 0.68, phi: 1.32, radius: 5.4 };
      this.lookAtTarget.set(0, 0, 0);
    } else if (mode === "motor") {
      this.facadeGroup.visible = true;
      this.crossSectionGroup.visible = false;
      this.targetSpherical = { theta: -0.45, phi: 1.25, radius: 4.8 };
      this.lookAtTarget.set(0.8, 2.15, 0);
    } else {
      this.facadeGroup.visible = true;
      this.crossSectionGroup.visible = false;
      this.targetSpherical = { theta: 0.28, phi: 1.38, radius: 9.2 };
      this.lookAtTarget.set(0, 0.3, 0);
    }

    document.querySelectorAll("[data-studio-view]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.studioView === mode);
    });
  }

  // Điều khiển vận hành cửa trong Studio (UP / STOP / DOWN / VENT / OBSTACLE)
  operateDoor(command) {
    if (this.viewMode === "cross-section") {
      this.setViewMode("facade");
    }

    const statusBadge = document.getElementById("studio-live-status");

    if (command === "UP") {
      this.motorState = "UP";
      this.targetDoorPos = 0.88;
      if (window.rossSound) {
        window.rossSound.playRemoteBeep(2400, 0.08);
        window.rossSound.startMotorHum(1.5);
      }
      if (statusBadge) statusBadge.textContent = "ĐANG MỞ CỬA LÊN TRỤC LÔ CUỐN";
    } else if (command === "DOWN") {
      this.motorState = "DOWN";
      this.ventMode = false;
      this.targetDoorPos = 0.0;
      if (window.rossSound) {
        window.rossSound.playRemoteBeep(2100, 0.08);
        window.rossSound.startMotorHum(1.5);
      }
      if (statusBadge) statusBadge.textContent = "ĐANG ĐÓNG KÍN THÂN CỬA";
    } else if (command === "STOP") {
      this.motorState = "IDLE";
      this.targetDoorPos = this.doorPos;
      if (window.rossSound) {
        window.rossSound.playRemoteBeep(1800, 0.08);
        window.rossSound.stopMotorHum();
      }
      if (statusBadge) statusBadge.textContent = "ĐÃ TẠM DỪNG HÀNH TRÌNH";
    } else if (command === "VENT") {
      this.ventMode = !this.ventMode;
      this.targetDoorPos = 0.08;
      this.updateCurtainPositions();
      if (window.rossSound) window.rossSound.playRemoteBeep(2300, 0.07);
      if (statusBadge) {
        statusBadge.textContent = this.ventMode
          ? "CHẾ ĐỘ MỞ KHE THOÁNG ĐỐI LƯU KHÍ"
          : "ĐÃ KHÉP KÍN KHE THOÁNG";
      }
    } else if (command === "OBSTACLE") {
      // Đưa cửa lên cao (nếu đang đóng) rồi hạ xuống gặp chướng ngại vật để tự động đảo chiều
      this.obstacleActive = true;
      this.obstacleTriggered = false;
      this.obstacleGroup.visible = true;
      if (this.doorPos < 0.45) {
        this.doorPos = 0.65;
      }
      this.motorState = "OBSTACLE_TEST";
      this.targetDoorPos = 0.0;
      this.sensorMat.color.setHex(0xf59e0b);
      if (window.rossSound) {
        window.rossSound.playRemoteBeep(2200, 0.08);
        window.rossSound.startMotorHum(1.4);
      }
      if (statusBadge) {
        statusBadge.textContent = "ĐANG HẠ CỬA KIỂM TRA CẢM BIẾN VẬT CẢN...";
      }
    }
  }

  updateHUD() {
    const series =
      window.ROSSDOOR_DATA.shutterSeries.find(
        (s) => s.id === this.currentSeriesId
      ) || window.ROSSDOOR_DATA.shutterSeries[0];
    const colorObj =
      window.ROSSDOOR_DATA.colors.find((c) => c.id === this.currentColorId) ||
      window.ROSSDOOR_DATA.colors[0];

    const setElText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setElText("studio-hud-code", series.code);
    setElText("studio-hud-name", series.name);
    setElText("studio-hud-material", series.material);
    setElText("studio-hud-thickness", series.thickness);
    setElText("studio-hud-maxsize", series.maxSize);
    setElText("studio-hud-seal", series.sealType);
    setElText("studio-hud-color", `${colorObj.name} (${colorObj.code})`);
    setElText(
      "studio-hud-price",
      `${series.pricePerM2.toLocaleString("vi-VN")} đ/m²`
    );

    // Highlight các nút chọn dòng cửa & màu sắc đang active
    document.querySelectorAll("[data-series-btn]").forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.seriesBtn === this.currentSeriesId
      );
    });
    document.querySelectorAll("[data-color-btn]").forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.colorBtn === this.currentColorId
      );
    });
  }

  bindInteraction() {
    const dom = this.renderer.domElement;

    // Xoay camera 360 độ bằng chuột
    dom.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.prevMouse = { x: e.clientX, y: e.clientY };

      this.targetSpherical.theta -= dx * 0.0075;
      this.targetSpherical.phi = Math.max(
        0.55,
        Math.min(1.62, this.targetSpherical.phi - dy * 0.0065)
      );
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    // Hỗ trợ cảm ứng trên điện thoại
    dom.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.prevMouse = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          };
        }
      },
      { passive: true }
    );

    dom.addEventListener(
      "touchmove",
      (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - this.prevMouse.x;
        const dy = e.touches[0].clientY - this.prevMouse.y;
        this.prevMouse = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        this.targetSpherical.theta -= dx * 0.008;
        this.targetSpherical.phi = Math.max(
          0.6,
          Math.min(1.6, this.targetSpherical.phi - dy * 0.007)
        );
      },
      { passive: true }
    );

    dom.addEventListener("touchend", () => {
      this.isDragging = false;
    });

    // Phóng to / thu nhỏ bằng con lăn chuột trên khung 3D
    dom.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.targetSpherical.radius = Math.max(
          3.4,
          Math.min(13.5, this.targetSpherical.radius + e.deltaY * 0.005)
        );
      },
      { passive: false }
    );

    window.addEventListener("resize", () => {
      if (!this.container || !this.renderer) return;
      const rect = this.container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Nội suy vị trí camera xoay 360 độ mượt mà
    this.spherical.theta +=
      (this.targetSpherical.theta - this.spherical.theta) * 0.1;
    this.spherical.phi +=
      (this.targetSpherical.phi - this.spherical.phi) * 0.1;
    this.spherical.radius +=
      (this.targetSpherical.radius - this.spherical.radius) * 0.1;
    this.currentLookAt.lerp(this.lookAtTarget, 0.1);

    const r = this.spherical.radius;
    const sinPhi = Math.sin(this.spherical.phi);
    this.camera.position.x =
      this.currentLookAt.x + r * sinPhi * Math.sin(this.spherical.theta);
    this.camera.position.y =
      this.currentLookAt.y + r * Math.cos(this.spherical.phi);
    this.camera.position.z =
      this.currentLookAt.z + r * sinPhi * Math.cos(this.spherical.theta);
    this.camera.lookAt(this.currentLookAt);

    // Xoay nhẹ mẫu mặt cắt nan nhôm nếu người dùng đang ở chế độ xem mặt cắt và không kéo chuột
    if (this.viewMode === "cross-section" && !this.isDragging && this.crossSectionGroup) {
      this.crossSectionGroup.rotation.y += 0.0035;
    }

    // Xử lý hành trình cửa cuốn & phát hiện vật cản tự động đảo chiều
    const diff = this.targetDoorPos - this.doorPos;
    if (Math.abs(diff) > 0.001) {
      const step = Math.sign(diff) * Math.min(Math.abs(diff), 0.009);
      this.doorPos += step;
      this.updateCurtainPositions();

      // Kiểm tra chạm vật cản khi đang thử tính năng an toàn
      if (
        this.motorState === "OBSTACLE_TEST" &&
        !this.obstacleTriggered &&
        this.doorPos <= 0.17
      ) {
        this.obstacleTriggered = true;
        this.targetDoorPos = 0.78; // Lập tức đảo chiều đi lên!
        this.sensorMat.color.setHex(0xdc2626); // Đèn cảm biến báo đỏ

        if (window.rossSound) {
          window.rossSound.playObstacleAlert();
        }
        const statusBadge = document.getElementById("studio-live-status");
        if (statusBadge) {
          statusBadge.textContent =
            "PHÁT HIỆN VẬT CẢN! RƠ-LE TỰ ĐỘNG ĐẢO CHIỀU ĐI LÊN AN TOÀN";
        }
        setTimeout(() => {
          this.sensorMat.color.setHex(0x22c55e);
          this.obstacleGroup.visible = false;
        }, 2600);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.rossStudio3D = new RossShutterStudio3D();
});

