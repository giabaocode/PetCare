import api from "../utils/apiClient";

export const authApi = {
  login: async (identifier: string, password?: string) => {
    const response = await api.post("/auth/login", { identifier, password });
    return response.data;
  },

  register: async (userData: any) => {
    const payload = {
      email: userData.Email,

      password: userData.password || userData.MatKhau,
      fullName: userData.HoTen,
      phone: userData.SDT,
      gender: userData.GioiTinh,
      dob: userData.NgaySinh,
      cid: userData.CCCD,
    };

    const response = await api.post("/auth/register", payload);
    return response.data;
  },
};
