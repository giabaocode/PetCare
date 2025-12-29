import api from "../utils/apiClient";

export const invoicesApi = {
  getAll: async (maKH?: string) => {
    const response = await api.get("/invoices/my-history");
    return response.data;
  },

  getOne: async (id: string | number) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  getByBookingId: async (bookingId: string) => {
    const response = await api.get(`/invoices/booking/${bookingId}`);
    return response.data;
  },

  payInvoice: async (id: string) => {
    const response = await api.post(`/invoices/${id}/pay`);
    return response.data;
  },
};
