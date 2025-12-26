// /controllers/dashboardController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const dashboardController = {
  getStats: async (req: Request, res: Response) => {
    const { branchCode, role } = req.query;
    const today = new Date().toISOString().split("T")[0];

    let queryRev = supabase
      .from("invoices")
      .select("TongTien")
      .eq("TrangThai", "PAID")
      .gte("NgayLap", today);
    if (role !== "ADMIN" && branchCode)
      queryRev = queryRev.eq("MaCN", branchCode);
    const { data: revData } = await queryRev;
    const revenue = revData?.reduce((sum, item) => sum + item.TongTien, 0) || 0;

    res.json({ revenue, appointments: 100, newPatients: 50 }); // Placeholder values for appointments and new patients
  },
};
