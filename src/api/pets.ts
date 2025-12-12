import { ThuCung } from "../types/schema";

const MOCK_PETS: ThuCung[] = [
  {
    MaTC: 1,
    MaKH: "user-01",
    TenTC: "Mimi",
    Loai: "Mèo",
    Giong: "Anh Lông Ngắn",
    NgaySinh: "2022-05-15",
    GioiTinh: "Cái",
    TinhTrang: "Khỏe mạnh, đã tiêm phòng dại",
  },
  {
    MaTC: 2,
    MaKH: "user-01",
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
    await new Promise((r) => setTimeout(r, 500)); // Delay 0.5s cho giống thật
    return MOCK_PETS;
  },

  getOne: async (id: number) => {
    await new Promise((r) => setTimeout(r, 300));
    const pet = MOCK_PETS.find((p) => p.MaTC === Number(id));
    return pet ? [pet] : [];
  },

  create: async (data: any) => {
    console.log("Mock Create Pet:", data);
    alert("Thêm thú cưng giả lập thành công!");
    return { status: 201 };
  },

  update: async (id: number, data: any) => {
    return { status: 200 };
  },
  delete: async (id: number) => {
    return { status: 200 };
  },
};
