import api from "../utils/apiClient";

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get("/products", { params });

    return response.data;
  },

  importStock: async (data: { productId: string; quantity: number }) => {
    const response = await api.post("/products/import", data);
    return response.data;
  },
};
