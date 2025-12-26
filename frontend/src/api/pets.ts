// src/api/pets.ts
import { db } from "../utils/dataProvider";

export const petsApi = {
  getAll: async (maKH: string) => {
    // Giả lập delay mạng
    await new Promise((r) => setTimeout(r, 300));
    const allPets = db.getPets();
    // Lọc pet của user hiện tại
    const userPets = allPets.filter((p: any) => p.MaKH === maKH);
    return { data: userPets }; // Return structure { data: [] } để khớp code cũ
  },

  getOne: async (id: number) => {
    const allPets = db.getPets();
    const pet = allPets.find((p: any) => Number(p.MaTC) === Number(id));
    return pet ? [pet] : [];
  },

  create: async (data: any) => {
    console.log("API: Create Pet", data);
    db.addPet(data);
    return { status: 201 };
  },

  // Các hàm update/delete giữ nguyên mock hoặc implement tương tự
  update: async () => ({ status: 200 }),
  delete: async () => ({ status: 200 }),
};
