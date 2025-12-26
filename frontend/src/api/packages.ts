import { db } from "../utils/dataProvider";

// Dữ liệu gói cứng (Mock Data cho API)
const MOCK_PACKAGES = [
  {
    id: "PKG01",
    name: "Gói Cơ Bản (Mèo)",
    discount: "-5%",
    price: 500000,
    duration: "6 tháng",
    durationMonth: 6,
    features: ["Đầy đủ vaccine cơ bản", "Miễn phí 2 lần khám"],
    benefits: { freeExamLimit: 2 },
    TenGoi: "Gói Cơ Bản (Mèo)",
    PhanTramGiam: 5,
    ThoiHanThang: 6,
  },
  {
    id: "PKG02",
    name: "Gói Toàn Diện (Chó)",
    discount: "-15%",
    price: 1200000,
    duration: "12 tháng",
    durationMonth: 12,
    features: ["Đầy đủ vaccine cơ bản", "Miễn phí 2 lần khám", "Giảm 10% Spa"],
    benefits: { freeExamLimit: 2 },
    TenGoi: "Gói Toàn Diện (Chó)",
    PhanTramGiam: 15,
    ThoiHanThang: 12,
  },
  {
    id: "PKG03",
    name: "Gói Sơ Sinh (Baby)",
    discount: "-10%",
    price: 800000,
    duration: "3 tháng",
    durationMonth: 3,
    features: ["Đầy đủ vaccine cơ bản", "Miễn phí 2 lần khám", "Tặng sữa tắm"],
    benefits: { freeExamLimit: 2 },
    TenGoi: "Gói Sơ Sinh (Baby)",
    PhanTramGiam: 10,
    ThoiHanThang: 3,
  },
];

export const packagesApi = {
  buyPackage: async (data: { MaTC: string; MaKH: string; Package: any }) => {
    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + data.Package.durationMonth);

    return db.activatePackage({
      MaTC: data.MaTC,
      MaKH: data.MaKH,
      PackageID: data.Package.id,
      PackageName: data.Package.name,
      startDate: new Date().toISOString(),
      expireDate: expireDate.toISOString(),
      benefits: data.Package.benefits,
    });
  },

  checkActivePackage: async (maTC: string) => {
    return db.checkPackageStatus(maTC);
  },

  useBenefit: async (maTC: string) => {
    return db.usePackageBenefit(maTC);
  },

  // --- THÊM HÀM NÀY CHO PACKAGE DETAIL ---
  getOne: async (id: string | number) => {
    // Tìm gói theo ID (VD: PKG01)
    // Lưu ý: Nếu id truyền vào là số (VD: 1, 2, 3), cần map sang PKG0x
    const pkgId = String(id).startsWith("PKG") ? id : `PKG0${id}`;
    return MOCK_PACKAGES.find((p) => p.id === pkgId);
  },
};
