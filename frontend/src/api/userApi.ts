import { db } from "../utils/dataProvider";

export const usersApi = {
  addPoints: async (maKH: string, amount: number) => {
    db.updateCustomerPoints(maKH, amount);
    return { success: true };
  },

  // --- THÊM HÀM NÀY ĐỂ FIX PACKAGES ---
  getMyPets: async (maKH: string) => {
    const allPets = db.getPets();
    return allPets.filter((p: any) => p.MaKH === maKH);
  },
};
