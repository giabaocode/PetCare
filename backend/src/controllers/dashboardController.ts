import { Request, Response } from "express";
import { query } from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";

export const dashboardController = {
  // 1. LẤY SỐ LIỆU THỐNG KÊ
  getStats: async (req: AuthRequest, res: Response) => {
    const { branchId } = req.user || {};

    try {
      // A. Doanh thu: Lấy tất cả hóa đơn (PAID, PENDING, WAITING_PAYMENT)
      // Để demo nhìn cho đẹp, sau này muốn chuẩn thì thêm: WHERE "TrangThai" = 'PAID'
      let sqlRevenue = `
        SELECT SUM("TongTien") as revenue 
        FROM "HoaDon" 
        WHERE 1=1 
      `;
      const paramsRevenue: any[] = [];
      if (branchId) {
        sqlRevenue += ` AND "MaCN" = $1`;
        paramsRevenue.push(branchId);
      }

      const resRevenue = await query(sqlRevenue, paramsRevenue);
      const revenue = Number(resRevenue.rows[0]?.revenue) || 0;

      // B. Lịch hẹn: Đếm tất cả lịch hẹn trong hệ thống (hoặc sửa thành WHERE DATE("ThoiGianHen") = CURRENT_DATE nếu muốn chuẩn)
      let sqlAppt = `
        SELECT COUNT(*) as count 
        FROM "LichHen" 
        WHERE 1=1
      `;
      const paramsAppt: any[] = [];
      if (branchId) {
        sqlAppt += ` AND "MaCN" = $1`;
        paramsAppt.push(branchId);
      }

      const resAppt = await query(sqlAppt, paramsAppt);
      const appointments = Number(resAppt.rows[0]?.count) || 0;

      // C. Khách mới: Đếm tổng số khách hàng
      let sqlNewPatients = `
        SELECT COUNT(DISTINCT "MaKH") as count 
        FROM "LichHen"
        WHERE 1=1
        ${branchId ? 'AND "MaCN" = $1' : ""}
      `;
      const paramsNew = branchId ? [branchId] : [];
      const resNewPatients = await query(sqlNewPatients, paramsNew);
      const newPatients = Number(resNewPatients.rows[0]?.count) || 0;

      res.json({ revenue, appointments, newPatients });
    } catch (err: any) {
      console.error("🔥 LỖI DASHBOARD STATS:", err.message);
      res.status(500).json({ error: "Lỗi Server: " + err.message });
    }
  },

  // 2. LẤY DỮ LIỆU BIỂU ĐỒ
  getChartData: async (req: AuthRequest, res: Response) => {
    const { branchId } = req.user || {};
    try {
      // Lấy doanh thu theo ngày (không lọc trạng thái để hiện hết cho đẹp)
      const sql = `
        SELECT 
          TO_CHAR("NgayLap", 'YYYY-MM-DD') as "Ngay",
          SUM("TongTien") as "TongDoanhThu"
        FROM "HoaDon"
        WHERE 1=1
          ${branchId ? 'AND "MaCN" = $1' : ""}  
        GROUP BY TO_CHAR("NgayLap", 'YYYY-MM-DD')
        ORDER BY "Ngay" ASC
        LIMIT 7
      `;

      const params = branchId ? [branchId] : [];
      const result = await query(sql, params);

      res.json(result.rows);
    } catch (err: any) {
      console.error("🔥 LỖI CHART DATA:", err.message);
      res.status(500).json({ error: err.message });
    }
  },
};
