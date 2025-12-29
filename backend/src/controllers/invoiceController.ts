import { Request, Response } from "express";
import { query, pool } from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";

export const invoiceController = {
  getMyInvoices: async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
      const sql = `
        SELECT hd.*, lh."LoaiDichVu", cn."TenCN"
        FROM "HoaDon" hd
        LEFT JOIN "LichHen" lh ON hd."MaLichHen" = lh."MaLichHen"
        LEFT JOIN "ChiNhanh" cn ON hd."MaCN" = cn."MaCN"
        WHERE hd."MaKH" = $1
        ORDER BY hd."NgayLap" DESC
      `;
      const result = await query(sql, [userId]);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const sqlHD = `
        SELECT hd.*, lh."LoaiDichVu", lh."MaLichHen", cn."TenCN"
        FROM "HoaDon" hd
        LEFT JOIN "LichHen" lh ON hd."MaLichHen" = lh."MaLichHen"
        LEFT JOIN "ChiNhanh" cn ON hd."MaCN" = cn."MaCN"
        WHERE hd."MaHD" = $1  
      `;

      const hdResult = await query(sqlHD, [id]);

      if (hdResult.rows.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      }

      const invoice = hdResult.rows[0];

      const sqlThuoc = `
        SELECT sp."TenSP", ct."SoLuong", ct."DonGia",
               (ct."SoLuong" * ct."DonGia") as "ThanhTien"
        FROM "ChiTietDonThuoc" ct
        JOIN "DonThuoc" dt ON ct."MaDonThuoc" = dt."MaDonThuoc"
        JOIN "SanPham" sp ON ct."MaSP" = sp."MaSP"
        WHERE dt."MaLichHen" = $1
      `;
      const thuocResult = await query(sqlThuoc, [invoice.MaLichHen]);

      let servicesResult: any[] = [];

      const sqlDichVuReal = `
         SELECT dv."TenDV", ct."DonGia", ct."DonGia" as "ThanhTien"
         FROM "ChiTietHoaDonDichVu" ct
         JOIN "DichVu" dv ON ct."MaDV" = dv."MaDV"
         WHERE ct."MaHD" = $1
      `;
      const serviceQuery = await query(sqlDichVuReal, [id]);
      servicesResult = serviceQuery.rows;

      if (servicesResult.length === 0 && invoice.LoaiDichVu) {
        const mappingName =
          invoice.LoaiDichVu === "VACCINATION" ? "Tiêm phòng" : "Khám bệnh";
        const sqlFallback = `SELECT "TenDV", "DonGiaCoBan" as "DonGia" FROM "DichVu" WHERE "LoaiDV" = $1 LIMIT 1`;
        const fallbackRes = await query(sqlFallback, [mappingName]);
        if (fallbackRes.rows.length > 0) {
          servicesResult = [
            {
              DichVu: { TenDV: fallbackRes.rows[0].TenDV },
              ThanhTien: Number(fallbackRes.rows[0].DonGia),
            },
          ];
        }
      } else {
        servicesResult = servicesResult.map((s) => ({
          DichVu: { TenDV: s.TenDV },
          ThanhTien: Number(s.DonGia),
        }));
      }

      const responseData = {
        ...invoice,
        MaHoaDon: invoice.MaHD,
        ChiTietHoaDonSanPham: thuocResult.rows.map((t) => ({
          SanPham: { TenSP: t.TenSP },
          SoLuong: t.SoLuong,
          ThanhTien: t.ThanhTien,
        })),
        ChiTietHoaDonDichVu: servicesResult,
      };

      res.json(responseData);
    } catch (err: any) {
      console.error("❌ Lỗi Invoice Controller:", err.message);
      res.status(500).json({ error: err.message });
    }
  },

  getInvoiceByBooking: async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    try {
      const sql = `SELECT * FROM "HoaDon" WHERE "MaLichHen" = $1`;
      const result = await query(sql, [bookingId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Chưa có hóa đơn nào" });
      }
      const invoice = result.rows[0];
      res.json({ ...invoice, MaHoaDon: invoice.MaHD });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getAll: async (req: AuthRequest, res: Response) => {
    const { branchId } = req.user || {};
    try {
      let sql = 'SELECT * FROM "HoaDon"';
      const params: any[] = [];
      if (branchId) {
        sql += ' WHERE "MaCN" = $1';
        params.push(branchId);
      }
      sql += ' ORDER BY "NgayLap" DESC';
      const result = await query(sql, params);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  payInvoice: async (req: Request, res: Response) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const hdRes = await client.query(
        `SELECT "TongTien", "MaKH", "TrangThai", "MaLichHen" FROM "HoaDon" WHERE "MaHD" = $1`,
        [id]
      );

      if (hdRes.rows.length === 0) throw new Error("Hóa đơn không tồn tại");
      const { TongTien, MaKH, TrangThai, MaLichHen } = hdRes.rows[0];

      if (TrangThai === "PAID" || TrangThai === "DaThanhToan") {
        throw new Error("Hóa đơn này đã được thanh toán rồi!");
      }

      await client.query(
        `UPDATE "HoaDon" SET "TrangThai" = 'PAID', "NgayLap" = NOW() WHERE "MaHD" = $1`,
        [id]
      );

      if (MaLichHen) {
        await client.query(
          `UPDATE "LichHen" SET "TrangThai" = 'COMPLETED' WHERE "MaLichHen" = $1`,
          [MaLichHen]
        );
      }

      await client.query("COMMIT");
      res.json({ success: true, message: "Thanh toán thành công" });
    } catch (err: any) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  },
};
