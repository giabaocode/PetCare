import { Request, Response } from "express";
import { query, pool } from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcryptjs";

export const userController = {
  // 1. LẤY DANH SÁCH USER (CÓ PHÂN TRANG & TÌM KIẾM)
  // 1. LẤY DANH SÁCH USER (CÓ PHÂN TRANG & TÌM KIẾM)
  // 1. LẤY DANH SÁCH USER (CÓ PHÂN TRANG & TÌM KIẾM)
  getAll: async (req: AuthRequest, res: Response) => {
    const { role, branchId } = req.user || {};

    // Lấy tham số từ URL
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const type = (req.query.type as string) || "KH";
    const offset = (page - 1) * limit;

    try {
      let sql = "";
      let countSql = "";
      let params: any[] = [];
      let paramIndex = 1;

      // --- TRƯỜNG HỢP 1: LẤY KHÁCH HÀNG (KH) ---
      // (Khách hàng thì ai cũng thấy hoặc tùy logic của bạn, ở đây giữ nguyên)
      if (type === "KH") {
        let whereClause = `WHERE nd."LoaiND" = 'KH'`;

        if (search) {
          whereClause += ` AND (nd."HoTen" ILIKE $${paramIndex} OR nd."SDT" ILIKE $${paramIndex})`;
          params.push(`%${search}%`);
          paramIndex++;
        }

        sql = `
          SELECT nd.*, kh."DiemTichLuy", hh."TenHang"
          FROM "NguoiDung" nd
          LEFT JOIN "KhachHang" kh ON nd."MaND" = kh."MaKH"
          LEFT JOIN "HangHoiVien" hh ON kh."HoiVien" = hh."MaHang"
          ${whereClause}
          ORDER BY nd."HoTen" ASC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        countSql = `SELECT COUNT(*) as total FROM "NguoiDung" nd ${whereClause}`;
      }

      // --- TRƯỜNG HỢP 2: LẤY NHÂN VIÊN (NV) ---
      else {
        let whereClause = `WHERE nd."LoaiND" = 'NV'`;

        // 👇 ĐÃ SỬA Ở ĐÂY: Bỏ check role !== 'ADMIN'
        // Chỉ cần có branchId là phải lọc theo chi nhánh đó (kể cả Admin chi nhánh)
        if (branchId) {
          whereClause += ` AND nv."MaCN" = $${paramIndex}`;
          params.push(branchId);
          paramIndex++;
        }

        // Tìm kiếm
        if (search) {
          whereClause += ` AND (nd."HoTen" ILIKE $${paramIndex} OR nd."SDT" ILIKE $${paramIndex})`;
          params.push(`%${search}%`);
          paramIndex++;
        }

        sql = `
          SELECT nd.*, nv."ChucVu", nv."MaCN", cn."TenCN"
          FROM "NguoiDung" nd
          LEFT JOIN "NhanVien" nv ON nd."MaND" = nv."MaNV" 
          LEFT JOIN "ChiNhanh" cn ON nv."MaCN" = cn."MaCN"
          ${whereClause}
          ORDER BY nd."HoTen" ASC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        countSql = `
            SELECT COUNT(*) as total 
            FROM "NguoiDung" nd 
            LEFT JOIN "NhanVien" nv ON nd."MaND" = nv."MaNV" 
            ${whereClause}
        `;
      }

      // Query dữ liệu
      const dataResult = await query(sql, [...params, limit, offset]);

      // Query đếm tổng
      const countResult = await query(countSql, params);
      const totalItems = parseInt(countResult.rows[0].total);
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
      console.error("Lỗi lấy danh sách user:", err);
      res.status(500).json({ error: err.message });
    }
  },
  // 2. LẤY THÚ CƯNG CỦA TÔI
  getMyPets: async (req: AuthRequest, res: Response) => {
    const myId = req.params.maKH || req.user?.id;
    if (!myId) return res.status(401).json({ error: "Thiếu ID người dùng" });
    try {
      const result = await query('SELECT * FROM "ThuCung" WHERE "MaKH" = $1', [
        myId,
      ]);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // 3. LẤY PROFILE USER
  getProfile: async (req: AuthRequest, res: Response) => {
    const { id } = req.user || {};
    try {
      const sql = `
          SELECT nd."HoTen", nd."Email", nd."SDT", nd."CCCD", nd."LoaiND",
                 kh."DiemTichLuy", hh."TenHang", hh."MucChiTieuToiThieu",
                 nv."ChucVu", nv."MaCN"
          FROM "NguoiDung" nd
          LEFT JOIN "KhachHang" kh ON nd."MaND" = kh."MaKH"
          LEFT JOIN "HangHoiVien" hh ON kh."HoiVien" = hh."MaHang"
          LEFT JOIN "NhanVien" nv ON nd."MaND" = nv."MaNV"
          WHERE nd."MaND" = $1
        `;
      const result = await query(sql, [id]);
      if (result.rows.length === 0)
        return res.status(404).json({ error: "User not found" });
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // 4. LẤY CHI TIẾT 1 USER (Admin dùng)
  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const sql = `
             SELECT nd.*, kh."DiemTichLuy", nv."ChucVu", nv."MaCN"
             FROM "NguoiDung" nd
             LEFT JOIN "KhachHang" kh ON nd."MaND" = kh."MaKH"
             LEFT JOIN "NhanVien" nv ON nd."MaND" = nv."MaNV"
             WHERE nd."MaND" = $1
         `;
      const result = await query(sql, [id]);
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // 5. CỘNG ĐIỂM
  addPoints: async (req: Request, res: Response) => {
    const { maKH, points } = req.body;
    try {
      await query(
        `UPDATE "KhachHang" SET "DiemTichLuy" = "DiemTichLuy" + $1 WHERE "MaKH" = $2`,
        [points, maKH]
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // 6. LẤY BÁC SĨ THEO CHI NHÁNH
  getDoctorsByBranch: async (req: Request, res: Response) => {
    const { branchId } = req.params;
    try {
      const sql = `
          SELECT nd."MaND", nd."HoTen"
          FROM "NhanVien" nv
          JOIN "NguoiDung" nd ON nv."MaNV" = nd."MaND"
          WHERE nv."MaCN" = $1 AND nv."ChucVu" = 'Bác sĩ'
        `;
      const result = await query(sql, [branchId]);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // 7. TẠO NHÂN VIÊN MỚI (Transaction)
  // ... bên trong userController ...

  createStaff: async (req: Request, res: Response) => {
    // 1. Nhận thêm tham số dob (Ngày sinh)
    const { email, password, fullName, phone, role, branchId, dob } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });
    }

    if (!branchId || branchId.length < 10) {
      return res
        .status(400)
        .json({ message: "Lỗi: Không xác định được Chi nhánh làm việc." });
    }

    // 2. Xử lý ngày sinh (Nếu không gửi thì lấy mặc định 1/1/1990 để tránh lỗi DB)
    const ngaySinh = dob || "1990-01-01";

    let chucVu = "Nhân viên";
    if (role === "DOCTOR") chucVu = "Bác sĩ";
    if (role === "RECEPTIONIST") chucVu = "Tiếp tân";
    if (role === "ADMIN") chucVu = "Quản lý CN";

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Check trùng
      const check = await client.query(
        `SELECT "MaND" FROM "NguoiDung" WHERE "Email" = $1 OR "SDT" = $2`,
        [email, phone]
      );
      if (check.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Email hoặc SĐT đã tồn tại!" });
      }

      // Check chi nhánh
      const checkBranch = await client.query(
        `SELECT "MaCN" FROM "ChiNhanh" WHERE "MaCN" = $1`,
        [branchId]
      );
      if (checkBranch.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Chi nhánh không tồn tại!" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. CẬP NHẬT CÂU INSERT: Thêm cột "NgaySinh"
      const userRes = await client.query(
        `INSERT INTO "NguoiDung" ("HoTen", "Email", "SDT", "MatKhau", "LoaiND", "NgaySinh") 
         VALUES ($1, $2, $3, $4, 'NV', $5) 
         RETURNING "MaND"`,
        [fullName, email, phone, hashedPassword, ngaySinh] // Truyền biến ngaySinh vào
      );
      const newUserId = userRes.rows[0].MaND;

      await client.query(
        `INSERT INTO "NhanVien" ("MaNV", "MaCN", "ChucVu", "NgayVaoLam") VALUES ($1, $2, $3, CURRENT_DATE)`,
        [newUserId, branchId, chucVu]
      );

      await client.query(
        `INSERT INTO "LichSuCongTac" ("MaNV", "MaCN", "ChucVu", "NgayBatDau", "LuongCoBan") VALUES ($1, $2, $3, CURRENT_DATE, 0)`,
        [newUserId, branchId, chucVu]
      );

      await client.query("COMMIT");
      res.json({ success: true, message: "Tạo nhân viên thành công!" });
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("🔥 LỖI TẠO NHÂN VIÊN:", err);
      res.status(500).json({ error: "Lỗi Server: " + err.message });
    } finally {
      client.release();
    }
  },
  // 8. CẬP NHẬT NHÂN VIÊN
  updateStaff: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { fullName, phone, role, branchId } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const oldRes = await client.query(
        `SELECT "MaCN", "ChucVu" FROM "NhanVien" WHERE "MaNV" = $1`,
        [id]
      );
      const oldData = oldRes.rows[0];
      if (!oldData) throw new Error("Nhân viên không tồn tại");

      let newChucVu = "Nhân viên";
      if (role === "DOCTOR") newChucVu = "Bác sĩ";
      if (role === "RECEPTIONIST") newChucVu = "Tiếp tân";
      if (role === "ADMIN") newChucVu = "Quản lý CN";

      // Update User
      await client.query(
        `UPDATE "NguoiDung" SET "HoTen" = $1, "SDT" = $2 WHERE "MaND" = $3`,
        [fullName, phone, id]
      );

      // Update Staff
      await client.query(
        `UPDATE "NhanVien" SET "ChucVu" = $1, "MaCN" = $2 WHERE "MaNV" = $3`,
        [newChucVu, branchId, id]
      );

      // Nếu đổi chức vụ hoặc đổi chi nhánh -> Ghi lịch sử
      if (oldData.MaCN !== branchId || oldData.ChucVu !== newChucVu) {
        await client.query(
          `UPDATE "LichSuCongTac" SET "NgayKetThuc" = CURRENT_DATE WHERE "MaNV" = $1 AND "NgayKetThuc" IS NULL`,
          [id]
        );
        await client.query(
          `INSERT INTO "LichSuCongTac" ("MaNV", "MaCN", "ChucVu", "NgayBatDau", "LuongCoBan") VALUES ($1, $2, $3, CURRENT_DATE, 0)`,
          [id, branchId, newChucVu]
        );
      }

      await client.query("COMMIT");
      res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err: any) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  },

  // 9. XÓA USER (Xóa sạch mọi bảng liên quan)
  deleteUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE "HoaDon" SET "MaNV" = NULL WHERE "MaNV" = $1`,
        [id]
      );
      await client.query(
        `UPDATE "LichHen" SET "MaNV" = NULL WHERE "MaNV" = $1`,
        [id]
      );
      await client.query(`DELETE FROM "LichSuCongTac" WHERE "MaNV" = $1`, [id]);
      await client.query(`DELETE FROM "KhachHang" WHERE "MaKH" = $1`, [id]);
      await client.query(`DELETE FROM "NhanVien" WHERE "MaNV" = $1`, [id]);
      await client.query(`DELETE FROM "NguoiDung" WHERE "MaND" = $1`, [id]);
      await client.query("COMMIT");
      res.json({
        success: true,
        message: "Đã xóa nhân viên và toàn bộ dữ liệu liên quan.",
      });
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Lỗi xóa user:", err);
      res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
    } finally {
      client.release();
    }
  },

  // 10. LẤY LỊCH SỬ CÔNG TÁC (Có tự động fix dữ liệu)
  getBranchHistory: async (req: Request, res: Response) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      const sql = `
             SELECT ls.*, cn."TenCN"
             FROM "LichSuCongTac" ls
             LEFT JOIN "ChiNhanh" cn ON ls."MaCN" = cn."MaCN"
             WHERE ls."MaNV" = $1
            ORDER BY (ls."NgayKetThuc" IS NULL) DESC, ls."NgayBatDau" DESC
         `;
      let result = await client.query(sql, [id]);

      // Self-healing: Nếu chưa có lịch sử, tự động tạo record đầu tiên
      if (result.rows.length === 0) {
        const staffRes = await client.query(
          `SELECT * FROM "NhanVien" WHERE "MaNV" = $1`,
          [id]
        );
        if (staffRes.rows.length > 0) {
          const staff = staffRes.rows[0];
          if (!staff.MaCN) return res.json([]); // Bỏ qua nếu data lỗi không có MaCN
          try {
            await client.query(
              `INSERT INTO "LichSuCongTac" ("MaNV", "MaCN", "ChucVu", "NgayBatDau", "LuongCoBan") VALUES ($1, $2, $3, $4, 0)`,
              [
                staff.MaNV,
                staff.MaCN,
                staff.ChucVu,
                staff.NgayVaoLam || new Date(),
              ]
            );
            result = await client.query(sql, [id]);
          } catch (insertError: any) {
            return res.json([]);
          }
        }
      }
      res.json(result.rows);
    } catch (err: any) {
      console.error("🔥 Lỗi API History:", err);
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  },
};
