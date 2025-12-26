// /controllers/invoiceController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const invoiceController = {
  // Lấy tất cả hóa đơn
  getAll: async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from("invoices").select("*");

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về danh sách tất cả hóa đơn
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy chi tiết một hóa đơn theo id
  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single(); // Lấy chi tiết hóa đơn theo id

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về thông tin hóa đơn
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Tạo hóa đơn mới
  create: async (req: Request, res: Response) => {
    const { userId, totalAmount, services, medicines } = req.body;

    try {
      const { data, error } = await supabase.from("invoices").insert([
        {
          userId,
          totalAmount,
          services,
          medicines,
          status: "PENDING", // Trạng thái mặc định
        },
      ]);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true, data }); // Trả về thông tin hóa đơn đã tạo
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
