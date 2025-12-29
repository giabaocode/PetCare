import { Request, Response } from "express";
import { query } from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";

export const productController = {
  getAll: async (req: AuthRequest, res: Response) => {
    const { branchId } = req.user || {};

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    try {
      let sql = "";
      let countSql = "";
      let params: any[] = [];
      let paramIndex = 1;

      let searchCondition = "";
      if (search) {
        searchCondition = `AND sp."TenSP" ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (branchId) {
        const branchParamIndex = paramIndex;

        sql = `
          SELECT sp.*, COALESCE(cc."SoLuongTon", 0) as "SoLuongTon"
          FROM "SanPham" sp
          LEFT JOIN "CungCapSanPham" cc ON sp."MaSP" = cc."MaSP" AND cc."MaCN" = $${branchParamIndex}
          WHERE 1=1 ${searchCondition.replace(
            `$${paramIndex - 1}`,
            `$${paramIndex - 1}`
          )} 
          ORDER BY sp."TenSP" ASC
          LIMIT $${branchParamIndex + 1} OFFSET $${branchParamIndex + 2}
        `;

        countSql = `
          SELECT COUNT(*) as total 
          FROM "SanPham" sp 
          LEFT JOIN "CungCapSanPham" cc ON sp."MaSP" = cc."MaSP" AND cc."MaCN" = $${branchParamIndex}
          WHERE 1=1 ${searchCondition}
        `;

        params.push(branchId);
      } else {
        sql = `
          SELECT * FROM "SanPham" sp
          WHERE 1=1 ${searchCondition}
          ORDER BY "TenSP" ASC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        countSql = `SELECT COUNT(*) as total FROM "SanPham" sp WHERE 1=1 ${searchCondition}`;
      }

      const dataResult = await query(sql, [...params, limit, offset]);

      const countParams = params.slice(0, branchId ? 2 : 1);

      const dbParams = [];
      if (search) dbParams.push(`%${search}%`);
      if (branchId) dbParams.push(branchId);

      const countRes = await query(countSql, dbParams);
      const totalItems = parseInt(countRes.rows[0].total);
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      });
    } catch (err: any) {
      console.error("Lỗi lấy sản phẩm:", err);
      res.status(500).json({ error: err.message });
    }
  },

  importStock: async (req: AuthRequest, res: Response) => {
    const { branchId } = req.user || {};
    const { productId, quantity } = req.body;

    if (!branchId)
      return res.status(400).json({ error: "Yêu cầu mã chi nhánh" });

    try {
      const sql = `
        INSERT INTO "CungCapSanPham" ("MaCN", "MaSP", "SoLuongTon")
        VALUES ($1, $2, $3)
        ON CONFLICT ("MaCN", "MaSP")
        DO UPDATE SET "SoLuongTon" = "CungCapSanPham"."SoLuongTon" + EXCLUDED."SoLuongTon";
      `;
      await query(sql, [branchId, productId, quantity]);
      res.json({ success: true, message: "Nhập kho thành công!" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
