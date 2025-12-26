// /controllers/userController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const userController = {
  // Hàm lấy tất cả người dùng
  getAll: async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về tất cả người dùng
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Hàm lấy thông tin người dùng theo mã khách hàng (maKH)
  getMyPets: async (req: Request, res: Response) => {
    const { maKH } = req.params;

    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("MaKH", maKH); // Lọc theo maKH

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về danh sách thú cưng của người dùng
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Hàm thêm điểm cho người dùng
  addPoints: async (req: Request, res: Response) => {
    const { maKH, points } = req.body;

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ points })
        .eq("MaKH", maKH);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true, data }); // Trả về thông tin người dùng đã cập nhật điểm
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Hàm lấy thông tin người dùng theo id
  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id) // Lọc theo id
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về thông tin người dùng
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
