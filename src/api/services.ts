// src/api/services.ts
import { ChiNhanh } from "../types/schema";

const MOCK_BRANCHES: ChiNhanh[] = [
  {
    MaCN: "CN01",
    TenCN: "PetCare Quận 1",
    DiaChi: "123 Nguyễn Huệ",
    ThoiGianMoCua: "08:00",
    ThoiGianDongCua: "20:00",
  },
  {
    MaCN: "CN02",
    TenCN: "PetCare Quận 7",
    DiaChi: "456 Nguyễn Văn Linh",
    ThoiGianMoCua: "08:00",
    ThoiGianDongCua: "21:00",
  },
];

export const servicesApi = {
  getBranches: async () => {
    return { data: MOCK_BRANCHES }; // React Query cần structure này nếu bạn dùng axios wrap
  },
  createDichVu: async (data: any) => {
    console.log("Mock Create DichVu:", data);
    return { MaDV: 999 }; // Trả về ID giả để bước sau dùng
  },
  createKhamBenh: async (data: any) => {
    console.log("Mock Create KhamBenh:", data);
    return { success: true };
  },
  createTiemPhong: async (data: any) => {
    console.log("Mock Create TiemPhong:", data);
    return { success: true };
  },
};
