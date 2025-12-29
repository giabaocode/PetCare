import api from "../utils/apiClient";

export const petsApi = {
  getAll: async () => {
    const response = await api.get("/pets");
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/pets/${id}`);

    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/pets", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/pets/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/pets/${id}`);
    return response.data;
  },
};
