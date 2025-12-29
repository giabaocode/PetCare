import api from "../utils/apiClient";

export const servicesApi = {
  getAllBranches: async () => {
    const response = await api.get("/branches");
    return response.data;
  },

  createBookingFull: async (bookingData: any) => {
    console.log("API: Creating Booking...", bookingData);

    const payload = {
      maTC: bookingData.maTC,
      maCN: bookingData.maCN,
      dateTime: bookingData.dateTime,
      serviceType: bookingData.serviceType,
      trieuChung: bookingData.trieuChung,
      maNVPhuTrach: bookingData.maNVPhuTrach,
    };

    const response = await api.post("/bookings", payload);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await api.get("/bookings/my-history");
    return response.data;
  },
  getBranchAppointments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get("/bookings/branch", { params });
    return response.data;
  },

  updateStatus: async (id: string, status: string, extraData?: any) => {
    const response = await api.put(`/bookings/${id}/status`, {
      status,
      ...extraData,
    });
    return response.data;
  },

  createDichVu: async (data: any) => ({ success: true }),
  createKhamBenh: async (data: any) => ({ success: true }),
  createTiemPhong: async (data: any) => ({ success: true }),
};
