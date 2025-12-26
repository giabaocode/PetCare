// /controllers/packageController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const packageController = {
  // Lấy tất cả gói dịch vụ
  getAll: async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from("packages").select("*");

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về danh sách tất cả các gói dịch vụ
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy chi tiết một gói dịch vụ
  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .single(); // Lấy gói dịch vụ theo id

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về chi tiết gói dịch vụ
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Mua gói dịch vụ
  buyPackage: async (req: Request, res: Response) => {
    const { userId, packageId, startDate, endDate } = req.body;

    try {
      const { data, error } = await supabase.from("purchased_packages").insert([
        {
          userId,
          packageId,
          startDate,
          endDate,
        },
      ]);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true, data }); // Trả về thông tin gói đã mua
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Kiểm tra gói dịch vụ đang hoạt động cho thú cưng
  checkActivePackage: async (req: Request, res: Response) => {
    const { petId } = req.params;

    try {
      const { data, error } = await supabase
        .from("active_packages")
        .select("*")
        .eq("MaTC", petId)
        .eq("status", "ACTIVE")
        .gte("NgayHetHan", new Date().toISOString()) // Kiểm tra gói dịch vụ còn hiệu lực
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về gói dịch vụ đang hoạt động
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Sử dụng lợi ích từ gói dịch vụ
  useBenefit: async (req: Request, res: Response) => {
    const { petId } = req.body;

    try {
      const { data, error } = await supabase.rpc("use_package_benefit", {
        p_pet_id: petId,
      });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data); // Trả về thông tin sau khi sử dụng lợi ích
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
