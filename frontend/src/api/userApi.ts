import api from "../utils/apiClient";

export const usersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getDoctorsByBranch: async (branchId: string) => {
    const response = await api.get(`/users/doctors/${branchId}`);
    return response.data;
  },

  createStaff: async (data: any) => {
    const response = await api.post("/users/staff", data);
    return response.data;
  },

  updateStaff: (id: string, data: any) => {
    return api.put(`/users/${id}`, data);
  },

  deleteUser: (id: string) => {
    return api.delete(`/users/${id}`);
  },

  getBranchHistory: async (id: string) => {
    const response = await api.get(`/users/${id}/work-history`);
    return response.data;
  },

  getMyPets: async () => {
    const response = await api.get("/users/my-pets");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  addPoints: async (maKH: string, amount: number) => {
    const response = await api.post("/users/points", { maKH, points: amount });
    return response.data;
  },
  sendFeedback: async (data: any) => {
    const response = await api.post("/feedback", data);
    return response.data;
  },
};
