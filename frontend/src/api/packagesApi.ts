// Đảm bảo đường dẫn này đúng với project của bạn (thường là axiosClient hoặc apiClient)
import api from "../utils/apiClient";

export const packageApi = {
  // Lấy danh sách gói (cho Booking Dropdown)
  getAll: () => {
    return api.get("/packages");
  },

  getOne: (id: string | number) => {
    return api.get(`/packages/${id}`);
  },

  // Mua gói (chức năng phụ)
  buyPackage: (data: {
    MaTC: string;
    MaKH: string;
    Package: any;
    maCN?: string;
  }) => {
    const payload = {
      userId: data.MaKH,
      petId: data.MaTC,
      packageId: data.Package.id || data.Package.MaGoi,
      // Lưu ý: Nếu gói không có giá, mặc định là 0
      totalAmount: data.Package.price || data.Package.GiaBan || 0,
      maCN: data.maCN,
    };

    return api.post("/packages/buy", payload);
  },

  checkActivePackage: (maTC: string) => {
    return api.get(`/packages/check/${maTC}`);
  },

  useBenefit: (maTC: string) => {
    return api.post("/packages/use-benefit", { petId: maTC });
  },
};
