import { GoiTiem } from "../types/schema";

const MOCK_PACKAGES: GoiTiem[] = [
  { MaGoi: 101, TenGoi: "Gói Cơ Bản (Mèo)", ThoiHanThang: 6, PhanTramGiam: 5 },
  {
    MaGoi: 102,
    TenGoi: "Gói Toàn Diện (Chó)",
    ThoiHanThang: 12,
    PhanTramGiam: 15,
  },
  {
    MaGoi: 103,
    TenGoi: "Gói Sơ Sinh (Baby)",
    ThoiHanThang: 3,
    PhanTramGiam: 10,
  },
];

export const packagesApi = {
  getAll: async () => {
    await new Promise((r) => setTimeout(r, 600));
    return { data: MOCK_PACKAGES };
  },

  getOne: async (id: number) => {
    const pkg = MOCK_PACKAGES.find((p) => p.MaGoi === Number(id));
    return { data: pkg ? [pkg] : [] };
  },

  register: async (data: any) => {
    console.log("Mock Register Package:", data);
    return { success: true };
  },
};
