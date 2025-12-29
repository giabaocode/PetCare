import { Request, Response } from "express";
import { query, pool } from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";

export const serviceController = {
  getBranches: async (req: Request, res: Response) => {
    try {
      const result = await query('SELECT * FROM "ChiNhanh"');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  createBooking: async (req: AuthRequest, res: Response) => {
    const userId = req.body.MaKH || req.user?.id;
    const {
      maCN,
      serviceType,
      maTC,
      dateTime,
      trieuChung,
      maNVPhuTrach,
      maVaccine,
    } = req.body;

    try {
      const initialStatus = "PENDING";
      const doctorId =
        maNVPhuTrach && maNVPhuTrach !== "" ? maNVPhuTrach : null;

      if (doctorId) {
        const checkBusy = await query(
          `SELECT "MaLichHen" FROM "LichHen" 
           WHERE "MaNV" = $1 AND "ThoiGianHen" = $2 
           AND "TrangThai" NOT IN ('CANCELLED', 'COMPLETED')`,
          [doctorId, dateTime]
        );

        if (checkBusy.rows.length > 0) {
          return res.status(400).json({
            error:
              "Bác sĩ đã có lịch hẹn vào khung giờ này. Vui lòng chọn giờ khác.",
          });
        }
      }

      let finalTrieuChung = trieuChung || "";

      if (serviceType === "VACCINATION" && maVaccine) {
        let tenItem = "";

        const spRes = await query(
          `SELECT "TenSP" FROM "SanPham" WHERE "MaSP" = $1`,
          [maVaccine]
        );

        if (spRes.rows.length > 0) {
          tenItem = spRes.rows[0].TenSP;
        } else {
          const goiRes = await query(
            `SELECT "TenGoi" FROM "GoiTiem" WHERE "MaGoi" = $1`,
            [maVaccine]
          );
          if (goiRes.rows.length > 0) {
            tenItem = goiRes.rows[0].TenGoi;
          }
        }

        if (tenItem) {
          finalTrieuChung = `[Đăng ký tiêm: ${tenItem}] ${finalTrieuChung}`;
        }
      }

      const sql = `
        INSERT INTO "LichHen" 
        ("MaKH", "MaTC", "MaCN", "LoaiDichVu", "ThoiGianHen", "TrieuChung", "TrangThai", "MaNV")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await query(sql, [
        userId,
        maTC,
        maCN,
        serviceType,
        dateTime,
        finalTrieuChung,
        initialStatus,
        doctorId,
      ]);

      res.json({ success: true, data: result.rows[0] });
    } catch (err: any) {
      console.error("Lỗi tạo lịch hẹn:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getMyAppointments: async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
      const sql = `
        SELECT lh.*, cn."TenCN", tc."TenTC", 
               bs_nd."HoTen" as "TenBacSi"
        FROM "LichHen" lh
        LEFT JOIN "ChiNhanh" cn ON lh."MaCN" = cn."MaCN"
        LEFT JOIN "ThuCung" tc ON lh."MaTC" = tc."MaTC"
        LEFT JOIN "NguoiDung" bs_nd ON lh."MaNV" = bs_nd."MaND"
        WHERE lh."MaKH" = $1
        ORDER BY lh."ThoiGianHen" DESC
      `;
      const result = await query(sql, [userId]);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getBranchAppointments: async (req: AuthRequest, res: Response) => {
    const { branchId } = req.user || {};
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    if (!branchId)
      return res.status(400).json({ error: "Không xác định chi nhánh" });

    try {
      let params: any[] = [branchId];
      let paramIndex = 2;
      let searchClause = "";

      if (search) {
        searchClause = `
          AND (
            nd_kh."HoTen" ILIKE $${paramIndex} OR 
            tc."TenTC" ILIKE $${paramIndex} OR 
            nd_kh."SDT" ILIKE $${paramIndex}
          )
        `;
        params.push(`%${search}%`);
        paramIndex++;
      }

      const sql = `
        SELECT lh.*, 
               nd_kh."HoTen" as "TenKhachHang", 
               nd_kh."SDT" as "SDTKhachHang",
               tc."TenTC", tc."Loai" as "LoaiTC", tc."Giong",
               nd_bs."HoTen" as "TenBacSi"
        FROM "LichHen" lh
        LEFT JOIN "KhachHang" kh ON lh."MaKH" = kh."MaKH"
        LEFT JOIN "NguoiDung" nd_kh ON kh."MaKH" = nd_kh."MaND"
        LEFT JOIN "ThuCung" tc ON lh."MaTC" = tc."MaTC"
        LEFT JOIN "NguoiDung" nd_bs ON lh."MaNV" = nd_bs."MaND"
        WHERE lh."MaCN" = $1 ${searchClause}
        ORDER BY lh."ThoiGianHen" DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const countSql = `
        SELECT COUNT(*) as total
        FROM "LichHen" lh
        LEFT JOIN "KhachHang" kh ON lh."MaKH" = kh."MaKH"
        LEFT JOIN "NguoiDung" nd_kh ON kh."MaKH" = nd_kh."MaND"
        LEFT JOIN "ThuCung" tc ON lh."MaTC" = tc."MaTC"
        WHERE lh."MaCN" = $1 ${searchClause}
      `;

      const dataResult = await query(sql, [...params, limit, offset]);
      const countResult = await query(countSql, params);
      const totalItems = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        data: dataResult.rows,
        pagination: { page, limit, totalItems, totalPages },
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateStatus: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, ketQuaKham } = req.body;
    const currentDoctorId = req.user?.id;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE "LichHen" SET "TrangThai" = $1, "MaNV" = COALESCE("MaNV", $3) WHERE "MaLichHen" = $2`,
        [status, id, currentDoctorId]
      );

      if (ketQuaKham) {
        const noiDungGhiChu = `Chẩn đoán: ${
          ketQuaKham.ChanDoan || "Không rõ"
        }. \nLời dặn: ${ketQuaKham.LoiDan || "Không có"}`;

        await client.query(
          `UPDATE "LichHen" SET "TrieuChung" = $1 WHERE "MaLichHen" = $2`,
          [noiDungGhiChu, id]
        );
      }

      if (status === "WAITING_PAYMENT") {
        const bookingRes = await client.query(
          `SELECT * FROM "LichHen" WHERE "MaLichHen" = $1`,
          [id]
        );
        const booking = bookingRes.rows[0];

        if (booking) {
          let tienKham = 150000;

          const note = booking.TrieuChung
            ? booking.TrieuChung.toLowerCase()
            : "";
          const serviceType = booking.LoaiDichVu || "";

          if (serviceType === "Tiêm phòng" || serviceType === "VACCINATION") {
            if (note.includes("chó con")) tienKham = 1000000;
            else if (note.includes("mèo con")) tienKham = 850000;
            else if (note.includes("7 bệnh")) tienKham = 350000;
            else if (note.includes("5 bệnh")) tienKham = 250000;
            else if (note.includes("4 bệnh")) tienKham = 280000;
            else if (note.includes("dại")) tienKham = 150000;
            else tienKham = 150000;
          } else if (
            note.includes("dv 2") ||
            serviceType.toLowerCase() === "examination"
          ) {
            tienKham = 200000;
          }

          let tienThuoc = 0;
          if (
            ketQuaKham &&
            ketQuaKham.DonThuoc &&
            Array.isArray(ketQuaKham.DonThuoc)
          ) {
            tienThuoc = ketQuaKham.DonThuoc.reduce(
              (sum: number, item: any) =>
                sum + Number(item.price) * Number(item.quantity),
              0
            );
          }

          const tongTien = tienKham + tienThuoc;

          const checkInvoice = await client.query(
            `SELECT 1 FROM "HoaDon" WHERE "MaLichHen" = $1`,
            [id]
          );

          if (checkInvoice.rows.length > 0) {
            await client.query(
              `UPDATE "HoaDon" SET "TongTien" = $1, "NgayLap" = CURRENT_TIMESTAMP WHERE "MaLichHen" = $2`,
              [tongTien, id]
            );
          } else {
            await client.query(
              `INSERT INTO "HoaDon" ("MaCN", "MaKH", "MaNV", "MaLichHen", "NgayLap", "TongTien", "TrangThai")
               VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, 'PENDING')`,
              [
                booking.MaCN,
                booking.MaKH,
                booking.MaNV || currentDoctorId,
                id,
                tongTien,
              ]
            );
          }
        }
      }

      await client.query("COMMIT");
      res.json({ success: true, message: "Đã lưu bệnh án thành công!" });
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Lỗi:", err);
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  },

  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const result = await query(
        'SELECT * FROM "LichHen" WHERE "MaLichHen" = $1',
        [id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await query('SELECT * FROM "LichHen"');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
