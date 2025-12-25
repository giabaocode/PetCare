import { ThuCung } from "../types/schema";

const MOCK_PETS: ThuCung[] = [
  {
    MaTC: 1,
    MaKH: "KH001", // <--- SỬA LẠI KHỚP VỚI AUTH CONTEXT
    TenTC: "Mimi",
    Loai: "Mèo",
    Giong: "Anh Lông Ngắn",
    NgaySinh: "2022-05-15",
    GioiTinh: "Cái",
    TinhTrang: "Khỏe mạnh, đã tiêm phòng dại",
  },
  {
    MaTC: 2,
    MaKH: "KH001", // <--- SỬA LẠI KHỚP VỚI AUTH CONTEXT
    TenTC: "Lu",
    Loai: "Chó",
    Giong: "Golden Retriever",
    NgaySinh: "2021-08-20",
    GioiTinh: "Đực",
    TinhTrang: "Hơi thừa cân",
  },
];

export const petsApi = {
  getAll: async (maKH: string) => {
    await new Promise((r) => setTimeout(r, 500));
    // Logic lọc giả lập: Chỉ trả về pet của KH đang đăng nhập
    return MOCK_PETS.filter((p) => p.MaKH === maKH);
  },

  getOne: async (id: number) => {
    await new Promise((r) => setTimeout(r, 300));
    const pet = MOCK_PETS.find((p) => p.MaTC === Number(id));
    return pet ? [pet] : []; // API thường trả về mảng dù get 1
  },

  create: async (data: any) => {
    console.log("Mock Create Pet:", data);
    return { status: 201 };
  },

  update: async (id: number, data: any) => {
    return { status: 200 };
  },
  delete: async (id: number) => {
    return { status: 200 };
  },
};
