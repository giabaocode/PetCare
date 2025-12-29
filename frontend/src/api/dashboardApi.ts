import api from "../utils/apiClient";

export const dashboardApi = {
  getStats: (branchId: string, role: string) => {
    return api.get("/dashboard/stats", { params: { branchId, role } });
  },

  getChartData: (branchId?: string) => {
    return api.get("/dashboard/chart", { params: { branchId } });
  },
};
