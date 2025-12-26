import { db, getSharedAppointments } from "../utils/dataProvider";

export const dashboardApi = {
  // Endpoint: GET /api/dashboard/stats
  getStats: async (branchCode: string, role: string) => {
    // 1. Tính doanh thu từ Hóa đơn
    const allInvoices = db.getInvoices();
    let todayRevenue = 0;
    const todayStr = new Date().toDateString();

    const filteredInvoices = allInvoices.filter((inv: any) => {
      if (role === "ADMIN") return true;
      return inv.MaCN === branchCode;
    });

    filteredInvoices.forEach((inv: any) => {
      if (new Date(inv.NgayLap).toDateString() === todayStr) {
        todayRevenue += inv.TongTien || 0;
      }
    });

    // 2. Tính số lịch hẹn & khách mới
    const appointments = getSharedAppointments();
    let todayAppts = 0;
    let todayNew = 0;

    const filteredAppts = appointments.filter((apt: any) => {
      if (role === "ADMIN") return true;
      return apt.MaCN === branchCode;
    });

    filteredAppts.forEach((apt: any) => {
      if (apt.status !== "CANCELLED") todayAppts++;
      if (
        apt.id &&
        (String(apt.id).includes("WALK-IN") ||
          String(apt.MaKH).includes("GUEST"))
      ) {
        todayNew++;
      }
    });

    return {
      revenue: todayRevenue,
      appointments: todayAppts,
      newPatients: todayNew,
    };
  },
};
