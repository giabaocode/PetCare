// frontend/src/utils/dataProvider.ts

export const INITIAL_APPOINTMENTS = [
  {
    id: "BK-2024-001",
    time: "08:30",
    patientName: "Nguyễn Văn Tester",
    petName: "Mimi",
    type: "Mèo",
    service: "Khám bệnh",
    symptom: "Bỏ ăn, nôn mửa",
    status: "PENDING", // Chưa đến
    paymentStatus: "UNPAID",
    doctor: "BS. A",
  },
  {
    id: "BK-2024-002",
    time: "09:15",
    patientName: "Trần Thị B",
    petName: "Lu",
    type: "Chó",
    service: "Tiêm phòng",
    symptom: "Vaccine 7 bệnh",
    status: "COMPLETED", // Đã khám xong -> Chờ thanh toán
    paymentStatus: "UNPAID",
    doctor: "BS. A",
    result: {
      ToaThuocChiTiet: [
        {
          medicineName: "Vaccine 7 bệnh",
          quantity: 1,
          unit: "Lọ",
          price: 150000,
        },
      ],
    },
  },
  {
    id: "BK-2024-003",
    time: "10:00",
    patientName: "Lê Văn C",
    petName: "Kiki",
    type: "Chó",
    service: "Spa - Cắt tỉa",
    symptom: "Cắt lông toàn thân",
    status: "WAITING", // Đã check-in -> Đang chờ khám
    paymentStatus: "UNPAID",
    doctor: "BS. B",
  },
];

// Hàm này đảm bảo mọi trang đều lấy cùng 1 dữ liệu
export const getSharedAppointments = () => {
  const saved = localStorage.getItem("pcx_appointments");
  if (saved) {
    return JSON.parse(saved);
  }
  // Nếu chưa có (lần đầu chạy), nạp dữ liệu mẫu chuẩn vào
  localStorage.setItem(
    "pcx_appointments",
    JSON.stringify(INITIAL_APPOINTMENTS)
  );
  return INITIAL_APPOINTMENTS;
};

// frontend/src/utils/dataProvider.ts

// ... (Giữ nguyên phần INITIAL_APPOINTMENTS và getSharedAppointments cũ)

// 1. DỮ LIỆU MẪU KHO HÀNG
export const INITIAL_INVENTORY = [
  {
    id: "SP001",
    name: "Vaccine 7 bệnh (Chó)",
    category: "Vaccine",
    stock: 2, // Đang thấp hơn minStock
    unit: "Lọ",
    price: "150000",
    status: "Low Stock",
    minStock: 10,
  },
  {
    id: "SP002",
    name: "Thức ăn hạt Royal Canin",
    category: "Thức ăn",
    stock: 45,
    unit: "Bao",
    price: "250000",
    status: "In Stock",
    minStock: 10,
  },
  {
    id: "SP003",
    name: "Thuốc nhỏ mắt Bio",
    category: "Thuốc",
    stock: 0, // Hết hàng
    unit: "Chai",
    price: "50000",
    status: "Out of Stock",
    minStock: 5,
  },
  {
    id: "SP004",
    name: "Cát vệ sinh Mèo",
    category: "Phụ kiện",
    stock: 12,
    unit: "Túi",
    price: "120000",
    status: "In Stock",
    minStock: 10,
  },
  {
    id: "SP005",
    name: "Vaccine Dại (Rabies)",
    category: "Vaccine",
    stock: 3,
    unit: "Lọ",
    price: "80000",
    status: "Low Stock",
    minStock: 15,
  },
];

// 2. HÀM LẤY DỮ LIỆU KHO CHUNG
export const getSharedInventory = () => {
  const saved = localStorage.getItem("pcx_inventory");
  if (saved) {
    return JSON.parse(saved);
  }
  localStorage.setItem("pcx_inventory", JSON.stringify(INITIAL_INVENTORY));
  return INITIAL_INVENTORY;
};
