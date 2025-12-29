import { Request, Response } from "express";
import { query } from "../config/db";

export const feedbackController = {
  create: async (req: Request, res: Response) => {
    try {
      const {
        MaKH,
        MaCN,
        DiemChatLuong,
        ThaiDoNhanVien,
        MucHaiLongTongThe,
        BinhLuan,
      } = req.body;

      if (!MaKH) {
        return res.status(400).json({ error: "Thiếu thông tin khách hàng" });
      }

      await query(
        `INSERT INTO "DanhGia" 
        ("MaKH", "MaCN", "DiemChatLuong", "ThaiDoNhanVien", "MucHaiLongTongThe", "BinhLuan", "NgayDanhGia")
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
          MaKH,
          MaCN || "CN01",
          DiemChatLuong,
          ThaiDoNhanVien,
          MucHaiLongTongThe,
          BinhLuan,
        ]
      );

      res.json({ success: true, message: "Cảm ơn bạn đã gửi đánh giá!" });
    } catch (err: any) {
      console.error("Lỗi gửi đánh giá:", err);
      res.status(500).json({ error: "Lỗi Server: " + err.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await query(
        `SELECT dg.*, kh."HoTen" 
         FROM "DanhGia" dg
         LEFT JOIN "NguoiDung" kh ON dg."MaKH" = kh."MaND"
         ORDER BY dg."NgayDanhGia" DESC`
      );
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
