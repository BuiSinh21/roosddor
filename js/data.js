/**
 * ROSSDOOR® — Dữ liệu kỹ thuật các dòng cửa cuốn, màu sơn tĩnh điện & phụ kiện đồng bộ
 * Hoàn toàn tĩnh (Frontend-only), phục vụ mô hình 3D Three.js và bảng dự toán.
 */

window.ROSSDOOR_DATA = {
  brand: {
    name: "ROSSDOOR®",
    slogan: "Bền bỉ & thẩm mỹ",
    hotline: "1900 6889",
    phone: "0909 886 789",
    email: "kythuat@rossdoor.vn",
    factory: "Khu Công Nghiệp Tân Bình, TP. Hồ Chí Minh & KCN Ngọc Hồi, Hà Nội"
  },

  // 5 Màu sơn tĩnh điện ngoài trời cao cấp AkzoNobel (PBR Material Parameters cho Three.js)
  colors: [
    {
      id: "ghi-sang",
      name: "Ghi Sáng Ánh Kim",
      code: "AKZ-7035",
      hex: "#C5C2BA",
      threeHex: 0xc5c2ba,
      metalness: 0.62,
      roughness: 0.34,
      desc: "Màu tiêu chuẩn kiến trúc hiện đại, phản xạ nhiệt tốt, giữ màu trên 10 năm."
    },
    {
      id: "kem-cat",
      name: "Vàng Kem Cát",
      code: "AKZ-1015",
      hex: "#DDD4C0",
      threeHex: 0xddd4c0,
      metalness: 0.48,
      roughness: 0.38,
      desc: "Tông ấm sang trọng, phù hợp biệt thự tân cổ điển và nhà phố mặt tiền."
    },
    {
      id: "nau-cafe",
      name: "Nâu Cafe Đậm",
      code: "AKZ-8019",
      hex: "#4A3B32",
      threeHex: 0x4a3b32,
      metalness: 0.55,
      roughness: 0.36,
      desc: "Bề mặt sơn nhám hạt mịn chống trầy xước, chiều sâu thẩm mỹ cao."
    },
    {
      id: "xam-xingfa",
      name: "Xám Đá Xingfa",
      code: "AKZ-7016",
      hex: "#3E4246",
      threeHex: 0x3e4246,
      metalness: 0.68,
      roughness: 0.32,
      desc: "Đồng bộ hoàn hảo với hệ cửa nhôm kính Xingfa mặt tiền."
    },
    {
      id: "do-rossdoor",
      name: "Đỏ Đô ROSSDOOR",
      code: "ROSS-8B0D",
      hex: "#8B0D1C",
      threeHex: 0x8b0d1c,
      metalness: 0.52,
      roughness: 0.35,
      desc: "Sắc đỏ đô nhận diện thương hiệu ROSSDOOR®, nổi bật & uy nghi."
    }
  ],

  // 4 Dòng cửa chính hiển thị trực tiếp trong 3D Studio
  shutterSeries: [
    {
      id: "ross-s52",
      code: "ROSS-S52",
      name: "Cửa Cuốn Khe Thoáng Công Nghệ Đức S52",
      shortName: "Khe Thoáng Đức S52",
      category: "khe-thoang",
      type3D: "slat_curved_vent",
      badge: "Bán chạy nhất",
      pricePerM2: 2450000,
      slatHeightMm: 52,
      thickness: "1.2mm - 1.5mm (±5%)",
      material: "Hợp kim nhôm 6063-T5 đạt chuẩn quốc tế",
      maxSize: "Rộng 6.2m x Cao 5.5m",
      weightPerM2: "11.8 kg/m²",
      sealType: "Phớt lông giảm chấn 2 chiều kép",
      coating: "Sơn tĩnh điện ngoài trời AkzoNobel (Hà Lan)",
      defaultColor: "ghi-sang",
      summary: "Thiết kế thân cong 2 lớp chịu lực với lỗ thoáng hình kim cương giúp đối lưu không khí và đón ánh sáng tự nhiên ngay cả khi đóng cửa.",
      features: [
        "Vách tăng cứng chữ K chịu lực gió bão cấp 12",
        "Hệ phớt lông giảm chấn triệt tiêu 90% tiếng ồn khi đóng/mở",
        "Tích hợp rơ-le tự động đảo chiều khi gặp vật cản",
        "Bề mặt sơn tĩnh điện hạt mịn bảo hành màu sơn 10 năm"
      ]
    },
    {
      id: "ross-a70",
      code: "ROSS-A70",
      name: "Cửa Cuốn Nan Bản Lớn Siêu Trường A70",
      shortName: "Nan Bản Lớn A70",
      category: "khe-thoang",
      type3D: "slat_flat_wide",
      badge: "Dòng Biệt Thự",
      pricePerM2: 3150000,
      slatHeightMm: 70,
      thickness: "1.5mm - 2.3mm (±5%)",
      material: "Hợp kim nhôm nguyên sinh 6063-T5 độ cứng cao",
      maxSize: "Rộng 7.5m x Cao 6.8m",
      weightPerM2: "15.4 kg/m²",
      sealType: "Gioăng cao su EPDM + Phớt giảm chấn",
      coating: "Sơn tĩnh điện AkzoNobel phủ Metallic",
      defaultColor: "xam-xingfa",
      summary: "Nan phẳng bản lớn 70mm mang phong cách kiến trúc tối giản hiện đại, chuyên dụng cho mặt tiền rộng của biệt thự và showroom lớn.",
      features: [
        "Bản nan cao 70mm tạo mặt phẳng liền mạch, khỏe khoắn",
        "Độ dày chân chịu lực lên tới 2.3mm vững chắc trước ngoại lực",
        "Ray dẫn hướng U100i bản dày chống rung lắc",
        "Vận hành đầm chắc, tương thích hệ thống điều khiển SmartHome"
      ]
    },
    {
      id: "ross-cb",
      code: "ROSS-CB",
      name: "Cửa Cuốn Tấm Liền Sóng Vuông Công Nghệ Úc",
      shortName: "Tấm Liền Úc CB",
      category: "tam-lien",
      type3D: "sheet_corrugated",
      badge: "Siêu êm - Tốc độ nhanh",
      pricePerM2: 1350000,
      slatHeightMm: 45,
      thickness: "0.50mm - 0.55mm thép mạ hợp kim",
      material: "Thép hợp kim nhôm kẽm AZ150 (Colorbond)",
      maxSize: "Rộng 5.0m x Cao 5.0m",
      weightPerM2: "5.8 kg/m²",
      sealType: "Dây polyguide chạy dọc hai bên thân cửa",
      coating: "Sơn mạ màu công nghiệp chống ăn mòn muối biển",
      defaultColor: "kem-cat",
      summary: "Thân cửa liền tấm cán sóng vuông kèm hệ thống lò xo trợ lực C75 giúp tốc độ mở nhanh gấp 3 lần và có thể đóng mở nhẹ nhàng bằng tay khi mất điện.",
      features: [
        "Tốc độ mở nhanh 15–20 cm/giây, không gây tiếng kim loại va chạm",
        "Chốt ly hợp giúp chuyển sang chế độ đẩy tay nhẹ nhàng khi mất điện",
        "Động cơ nằm gọn bên trong lô cuốn, tiết kiệm diện tích trần",
        "Độ bền lò xo trợ lực đạt trên 20.000 lần đóng/mở"
      ]
    },
    {
      id: "ross-pc",
      code: "ROSS-PC",
      name: "Cửa Cuốn Xuyên Sáng Polycarbonate Showroom",
      shortName: "Xuyên Sáng PC",
      category: "xuyen-sang",
      type3D: "slat_polycarbonate",
      badge: "Trưng bày 24/7",
      pricePerM2: 2890000,
      slatHeightMm: 55,
      thickness: "Nan nhôm 1.3mm + Ô kính PC đặc 3.0mm",
      material: "Nhôm 6063-T5 kết hợp Polycarbonate nguyên sinh",
      maxSize: "Rộng 6.0m x Cao 5.2m",
      weightPerM2: "12.6 kg/m²",
      sealType: "Phớt nỉ hai chiều + Ron cố định ô kính",
      coating: "Sơn tĩnh điện AkzoNobel + Chống tia UV",
      defaultColor: "nau-cafe",
      summary: "Kết hợp giữa khung nan nhôm chịu lực và các tấm Polycarbonate trong suốt chịu va đập gấp 200 lần kính thường, giúp trưng bày cửa hàng cả ngày lẫn đêm.",
      features: [
        "Độ truyền sáng 88%, chống tia cực tím (UV) bảo vệ nội thất",
        "Vật liệu Polycarbonate đặc ruột không vỡ dưới tác động búa đập",
        "Tùy chọn vị trí lắp các đốt xuyên sáng theo thiết kế mặt tiền",
        "Giữ trọn vẻ sang trọng cho showroom, cửa hàng thời trang, gara"
      ]
    }
  ],

  // Danh mục mở rộng (Gồm các dòng cửa chuyên dụng & phụ kiện đồng bộ)
  catalogExtras: [
    {
      id: "ross-s48-eco",
      code: "ROSS-S48",
      name: "Cửa Cuốn Khe Thoáng Tiêu Chuẩn S48",
      category: "khe-thoang",
      type3D: "slat_curved_vent",
      badge: "Kinh tế - Bền bỉ",
      pricePerM2: 1980000,
      thickness: "1.0mm - 1.2mm (±5%)",
      material: "Hợp kim nhôm 6063-T5",
      maxSize: "Rộng 5.5m x Cao 5.0m",
      weightPerM2: "9.8 kg/m²",
      defaultColor: "kem-cat",
      summary: "Giải pháp tối ưu chi phí cho nhà phố dân dụng nhưng vẫn đảm bảo đầy đủ khe thoáng lưu thông khí và phớt giảm chấn êm ái.",
      features: [
        "Cấu trúc nan 2 lớp có chân chống ngang chịu lực",
        "Sơn tĩnh điện cao cấp chống bong tróc",
        "Tích hợp cảm biến tự dừng khi gặp vật cản"
      ]
    },
    {
      id: "ross-fc100",
      code: "ROSS-FC100",
      name: "Cửa Cuốn Thép Siêu Trường Chống Cháy EI60",
      category: "chong-chay",
      type3D: "slat_flat_wide",
      badge: "Chứng nhận PCCC",
      pricePerM2: 3450000,
      thickness: "1.2mm - 1.6mm thép mạ kẽm",
      material: "Thép mạ kẽm sơn tĩnh điện chịu nhiệt",
      maxSize: "Rộng 9.0m x Cao 8.0m",
      weightPerM2: "22.5 kg/m²",
      defaultColor: "do-rossdoor",
      summary: "Thiết kế chuyên biệt cho nhà xưởng, tầng hầm tòa nhà và trung tâm thương mại. Tự động đóng ngăn lửa khi nhận tín hiệu báo cháy.",
      features: [
        "Đạt tiêu chuẩn chống cháy và ngăn khói cho kho xưởng",
        "Hộp điều khiển kết nối trực tiếp hệ thống báo cháy trung tâm",
        "Ray thép dày 2.0mm chịu áp lực gió lớn"
      ]
    },
    {
      id: "ross-motor-ah",
      code: "MOTOR-AH500",
      name: "Bộ Tời (Motor) Đồng Bộ ROSSDOOR AH-500",
      category: "phu-kien",
      type3D: "accessory_motor",
      badge: "Lõi đồng 100%",
      pricePerM2: 6800000,
      isUnitPrice: true,
      thickness: "Sức nâng 500kg",
      material: "Cuộn dây đồng nguyên chất + Vỏ hợp kim tản nhiệt",
      maxSize: "Dùng cho cửa dưới 22m²",
      weightPerM2: "16.5 kg / bộ",
      defaultColor: "do-rossdoor",
      summary: "Động cơ xích kéo đồng bộ tích hợp hộp nhận tín hiệu mã nhảy ARC chống sao chép mã khóa từ xa, hoạt động bền bỉ trong điều kiện khí hậu nóng ẩm.",
      features: [
        "Rơ-le nhiệt tự ngắt bảo vệ động cơ khi quá tải",
        "Kèm 02 tay điều khiển từ xa chống nước & 01 nút bấm âm tường",
        "Hành trình cơ khí chính xác, dễ dàng căn chỉnh"
      ]
    },
    {
      id: "ross-ups-u1000",
      code: "UPS-RD1000",
      name: "Bình Lưu Điện Thông Minh ROSSDOOR U1000",
      category: "phu-kien",
      type3D: "accessory_ups",
      badge: "Chờ 48 giờ",
      pricePerM2: 3600000,
      isUnitPrice: true,
      thickness: "Công suất 1000VA",
      material: "2 Ắc quy kín khí 12V-9Ah + Mạch sạc tự xả",
      maxSize: "Dùng cho Motor ≤ 500kg",
      weightPerM2: "8.5 kg / máy",
      defaultColor: "ghi-sang",
      summary: "Đảm bảo cửa cuốn đóng mở bình thường khi mất điện lưới. Tích hợp mạch tự xả – nạp thông minh giúp tăng gấp đôi tuổi thọ ắc quy.",
      features: [
        "Thời gian lưu điện chờ lên đến 48 giờ sau khi mất điện",
        "Tự động chuyển mạch trong 0.2 giây khi sập nguồn",
        "Đèn LED báo trạng thái nguồn và dung lượng ắc quy rõ ràng"
      ]
    }
  ]
};

