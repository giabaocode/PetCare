import { Request, Response } from "express";
import { query } from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";

export const petController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const result = await query(
        'SELECT * FROM "ThuCung" ORDER BY "TenTC" ASC'
      );
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const result = await query('SELECT * FROM "ThuCung" WHERE "MaTC" = $1', [
        id,
      ]);
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Pet not found" });
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    const userIdFromToken = req.user?.id;

    const { TenTC, Loai, Giong, GioiTinh, NgaySinh, TinhTrang } = req.body;

    try {
      if (!userIdFromToken) {
        return res
          .status(401)
          .json({ error: "Bạn chưa đăng nhập (Thiếu Token)" });
      }

      if (!TenTC) {
        return res.status(400).json({ error: "Vui lòng nhập Tên thú cưng" });
      }

      const sql = `
        INSERT INTO "ThuCung" ("MaKH", "TenTC", "Loai", "Giong", "GioiTinh", "NgaySinh", "TinhTrang")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await query(sql, [
        userIdFromToken,
        TenTC,
        Loai,
        Giong,
        GioiTinh,
        NgaySinh,
        TinhTrang || "Khỏe mạnh",
      ]);

      res.json({ success: true, data: result.rows[0] });
    } catch (err: any) {
      console.error("Lỗi tạo thú cưng:", err);
      res.status(500).json({ error: "Lỗi Server: " + err.message });
    }
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { TenTC, Loai, Giong, GioiTinh, NgaySinh, TinhTrang } = req.body;

    try {
      const sql = `
        UPDATE "ThuCung"
        SET "TenTC" = $1, "Loai" = $2, "Giong" = $3, "GioiTinh" = $4, "NgaySinh" = $5, "TinhTrang" = $6
        WHERE "MaTC" = $7
        RETURNING *
      `;

      const result = await query(sql, [
        TenTC,
        Loai,
        Giong,
        GioiTinh,
        NgaySinh,
        TinhTrang,
        id,
      ]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy thú cưng để sửa" });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const result = await query(
        'DELETE FROM "ThuCung" WHERE "MaTC" = $1 RETURNING "MaTC"',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy thú cưng" });
      }

      res.json({ success: true, message: "Đã xóa hồ sơ thú cưng" });
    } catch (err: any) {
      res.status(500).json({ error: "Không thể xóa: " + err.message });
    }
  },
};
