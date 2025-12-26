// frontend/src/utils/dataProvider.ts

// --- 1. DỮ LIỆU KHỞI TẠO ---

const INITIAL_USERS = [
  // ADMIN: Quyền lực nhất, xem được tất cả
  {
    MaND: "user-ad",
    HoTen: "Admin Tổng",
    Role: "ADMIN",
    Email: "admin@petcare.com",
    MaCN: "ALL",
  },

  // QUẬN 1 (CN01)
  {
    MaND: "user-bs1",
    MaNV: "NV001",
    MaCN: "CN01",
    HoTen: "BS. Nguyễn Văn A",
    Role: "DOCTOR",
    Email: "bs.a@petcare.com",
  },
  {
    MaND: "user-lt1",
    MaNV: "NV002",
    MaCN: "CN01",
    HoTen: "Lễ Tân Quận 1",
    Role: "RECEPTIONIST",
    Email: "letan@petcare.com",
  },

  // QUẬN 7 (CN02)
  {
    MaND: "user-bs2",
    MaNV: "NV003",
    MaCN: "CN02",
    HoTen: "BS. Lê Thị C",
    Role: "DOCTOR",
    Email: "bs.c@petcare.com",
  },
  {
    MaND: "user-lt2",
    MaNV: "NV004",
    MaCN: "CN02",
    HoTen: "Lễ Tân Quận 7",
    Role: "RECEPTIONIST",
    Email: "letan7@petcare.com",
  },

  // KHÁCH HÀNG DEMO
  {
    MaND: "user-kh",
    MaKH: "KH002",
    HoTen: "Trần Thị Khách",
    Role: "CUSTOMER",
    Email: "khach@gmail.com",
    SDT: "0909123456",
    DiemTichLuy: 0, // Đảm bảo có trường này
  },
];

const INITIAL_PETS = [
  {
    MaTC: 1,
    MaKH: "KH002",
    TenTC: "Mimi",
    Loai: "Mèo",
    Giong: "Anh Lông Ngắn",
    GioiTinh: "Cái",
    NgaySinh: "2022-01-01",
  },
  {
    MaTC: 2,
    MaKH: "KH002",
    TenTC: "Lu",
    Loai: "Chó",
    Giong: "Golden",
    GioiTinh: "Đực",
    NgaySinh: "2021-05-20",
  },
];

export const INITIAL_INVENTORY = [
  {
    id: "SP001",
    name: "Vaccine 7 bệnh (Chó)",
    category: "Vaccine",
    stock: 50,
    unit: "Lọ",
    price: 150000,
    minStock: 10,
    status: "In Stock",
  },
  {
    id: "SP002",
    name: "Men tiêu hóa",
    category: "Thuốc",
    stock: 100,
    unit: "Gói",
    price: 20000,
    minStock: 20,
    status: "In Stock",
  },
  {
    id: "SP003",
    name: "Royal Canin Puppy",
    category: "Thức ăn",
    stock: 5,
    unit: "Bao",
    price: 500000,
    minStock: 5,
    status: "Low Stock",
  },
];

export const INITIAL_APPOINTMENTS = [];

const INITIAL_INVOICES: any[] = [];

// --- DỮ LIỆU GÓI DỊCH VỤ ---
const INITIAL_ACTIVE_PACKAGES: any[] = [];

// --- 2. HELPERS ---

const getStorage = (key: string, initial: any) => {
  const saved = localStorage.getItem(key);
  if (!saved) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(saved);
};

const setStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event("local-storage-update"));
  window.dispatchEvent(new Event("storage"));
};

// --- 3. EXPORTS ---

export const db = {
  getUsers: () => getStorage("pcx_users", INITIAL_USERS),

  addUser: (user: any) => {
    const users = db.getUsers();
    const exists = users.find(
      (u: any) =>
        (u.Email && u.Email === user.Email) || (u.SDT && u.SDT === user.SDT)
    );
    if (exists) throw new Error("Email hoặc SĐT đã tồn tại!");

    const newUser = {
      ...user,
      MaND: `user-${Date.now()}`,
      MaKH: `KH-${Date.now().toString().slice(-6)}`,
      Role: "CUSTOMER",
      TenHang: "Thành viên mới",
      DiemTichLuy: 0,
    };
    setStorage("pcx_users", [...users, newUser]);
    return newUser;
  },

  // --- HÀM MỚI: CẬP NHẬT ĐIỂM TÍCH LŨY (BẢN FIX ĐỒNG BỘ UI) ---
  updateCustomerPoints: (maKH: string, amount: number) => {
    const users = db.getUsers();
    // Quy ước: 100.000 VNĐ = 1 điểm
    const pointsToAdd = Math.floor(amount / 100000);

    if (pointsToAdd > 0) {
      let newTotalPoints = 0;

      // 1. Cập nhật vào Database tổng (pcx_users)
      const updatedUsers = users.map((u: any) => {
        if (u.MaKH === maKH) {
          const currentPoints = u.DiemTichLuy || 0;
          newTotalPoints = currentPoints + pointsToAdd;
          return { ...u, DiemTichLuy: newTotalPoints };
        }
        return u;
      });
      setStorage("pcx_users", updatedUsers);

      // 2. Cập nhật ngay vào Phiên đăng nhập hiện tại (pcx_profile)
      // FIX QUAN TRỌNG: Giúp UI cập nhật điểm ngay lập tức không cần F5
      const currentProfile = JSON.parse(
        localStorage.getItem("pcx_profile") || "{}"
      );
      if (currentProfile && currentProfile.MaKH === maKH) {
        const updatedProfile = {
          ...currentProfile,
          DiemTichLuy: newTotalPoints,
        };
        localStorage.setItem("pcx_profile", JSON.stringify(updatedProfile));

        // Bắn sự kiện để ép giao diện render lại
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("local-storage-update"));
      }

      console.log(
        `Đã cộng ${pointsToAdd} điểm cho khách ${maKH}. Tổng: ${newTotalPoints}`
      );
    }
  },

  getAppointments: () => getStorage("pcx_appointments", INITIAL_APPOINTMENTS),
  addAppointment: (appt: any) => {
    const list = db.getAppointments();
    const newItem = {
      ...appt,
      id: `BK-${Date.now().toString().slice(-4)}`,
      status: "PENDING",
      paymentStatus: "UNPAID",
    };
    setStorage("pcx_appointments", [newItem, ...list]);
    return newItem;
  },
  updateAppointment: (id: string, updates: any) => {
    const list = db.getAppointments();
    const newList = list.map((item: any) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setStorage("pcx_appointments", newList);
  },

  getPets: () => getStorage("pcx_pets", INITIAL_PETS),
  addPet: (pet: any) => {
    const list = db.getPets();
    const newPet = { ...pet, MaTC: Date.now() };
    setStorage("pcx_pets", [...list, newPet]);
    return newPet;
  },

  getInventory: () => getStorage("pcx_inventory", INITIAL_INVENTORY),
  updateInventory: (newList: any[]) => setStorage("pcx_inventory", newList),

  getInvoices: () => getStorage("pcx_invoices", INITIAL_INVOICES),
  addInvoice: (invoice: any) => {
    const list = db.getInvoices();
    const newList = [invoice, ...list];
    setStorage("pcx_invoices", newList);
    return invoice;
  },

  // --- QUẢN LÝ GÓI DỊCH VỤ ---
  getActivePackages: () =>
    getStorage("pcx_active_packages", INITIAL_ACTIVE_PACKAGES),

  // 1. Kích hoạt gói mới cho thú cưng
  activatePackage: (data: any) => {
    const list = db.getActivePackages();
    // Xóa gói cũ của thú cưng này (nếu có) để tránh trùng lặp
    const cleanList = list.filter(
      (p: any) => String(p.MaTC) !== String(data.MaTC)
    );

    const newPackage = {
      ...data,
      id: `ACT-${Date.now()}`,
      status: "ACTIVE",
      usedCount: 0,
    };

    setStorage("pcx_active_packages", [...cleanList, newPackage]);
    return newPackage;
  },

  // 2. Kiểm tra xem thú cưng có gói nào hợp lệ không
  checkPackageStatus: (maTC: string) => {
    const list = db.getActivePackages();
    const pkg = list.find((p: any) => String(p.MaTC) === String(maTC));

    if (!pkg) return null;

    const now = new Date();
    const expiry = new Date(pkg.expireDate);
    if (now > expiry) return null;

    return pkg;
  },

  // 3. Trừ lượt dùng
  usePackageBenefit: (maTC: string) => {
    const list = db.getActivePackages();
    const updated = list.map((p: any) => {
      if (String(p.MaTC) === String(maTC)) {
        return { ...p, usedCount: (p.usedCount || 0) + 1 };
      }
      return p;
    });
    setStorage("pcx_active_packages", updated);
  },
};

export const getSharedAppointments = db.getAppointments;
export const getSharedInventory = db.getInventory;
