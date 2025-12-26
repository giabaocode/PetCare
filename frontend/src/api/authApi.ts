import { db } from "../utils/dataProvider";

// Giả lập độ trễ mạng (0.5 giây) để giống backend thật
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (identifier: string) => {
    await delay(500);

    const allUsers = db.getUsers();
    const cleanInput = identifier.trim();

    // Logic tìm user (Sau này BE sẽ query SQL ở đây)
    let user = allUsers.find(
      (u: any) =>
        u.Email === cleanInput || u.MaND === cleanInput || u.SDT === cleanInput
    );

    // Fallback demo cho các account test nhanh
    if (!user) {
      if (cleanInput.includes("admin"))
        user = { MaND: "ad", Role: "ADMIN", HoTen: "Admin Demo", MaCN: "CN01" };
      else if (cleanInput.includes("bs"))
        user = { MaND: "bs1", Role: "DOCTOR", HoTen: "BS. Demo", MaCN: "CN01" };
      else if (cleanInput.includes("letan"))
        user = {
          MaND: "lt",
          Role: "RECEPTIONIST",
          HoTen: "Lễ Tân Demo",
          MaCN: "CN01",
        };
      else
        user = {
          MaND: "guest",
          Role: "CUSTOMER",
          HoTen: "Khách Vãng Lai",
          MaKH: "KH-GUEST",
        };
    }

    return user;
  },
};
