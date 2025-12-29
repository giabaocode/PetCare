import { Request, Response } from "express";
import { query } from "../config/db";

export const packageController = {
  // 1. LẤY TẤT CẢ GÓI (Dùng cho Dropdown Booking)
  // 1. LẤY TẤT CẢ GÓI (Có gán giá cứng)
  getAll: async (req: Request, res: Response) => {
    try {
      const result = await query(
        'SELECT * FROM "GoiTiem" ORDER BY "TenGoi" ASC'
      );

      // ⚠️ LOGIC MỚI: Tự động gán giá tiền dựa vào Tên Gói
      const dataWithPrice = result.rows.map((pkg: any) => {
        let price = 0;
        const name = pkg.TenGoi ? pkg.TenGoi.toLowerCase() : "";

        // Bảng giá quy định (Hardcode)
        if (name.includes("dại")) price = 150000;
        else if (name.includes("5 bệnh")) price = 250000;
        else if (name.includes("7 bệnh")) price = 350000;
        else if (name.includes("4 bệnh")) price = 280000;
        else if (name.includes("chó con")) price = 1000000; // Gói trọn gói
        else if (name.includes("mèo con")) price = 850000; // Gói trọn gói

        return {
          ...pkg,
          GiaTien: price, // Thêm field GiaTien ảo vào kết quả
        };
      });

      res.json(dataWithPrice);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // 2. LẤY CHI TIẾT 1 GÓI (Cũng phải gán giá tương tự)
  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const result = await query('SELECT * FROM "GoiTiem" WHERE "MaGoi" = $1', [
        id,
      ]);

      if (result.rows.length === 0)
        return res.status(404).json({ error: "Không tìm thấy gói tiêm" });

      const pkg = result.rows[0];

      // Logic gán giá giống bên trên
      let price = 0;
      const name = pkg.TenGoi ? pkg.TenGoi.toLowerCase() : "";

      if (name.includes("dại")) price = 150000;
      else if (name.includes("5 bệnh")) price = 250000;
      else if (name.includes("7 bệnh")) price = 350000;
      else if (name.includes("4 bệnh")) price = 280000;
      else if (name.includes("chó con")) price = 1000000;
      else if (name.includes("mèo con")) price = 850000;

      res.json({ ...pkg, GiaTien: price });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // 3. MUA GÓI (Chức năng này dùng ở màn hình khác, không ảnh hưởng Booking)
  buyPackage: async (req: Request, res: Response) => {
    const { userId, petId, packageId, totalAmount, maCN } = req.body;

    try {
      await query("BEGIN");

      // Tạo đăng ký gói
      const insertSubSql = `
        INSERT INTO "DangKyGoi" ("MaKH", "MaTC", "MaGoi", "TongTien", "TongTienDaThanhToan", "NgayDangKy", "TrangThai")
        VALUES ($1, $2, $3, $4, $4, CURRENT_DATE, 'ACTIVE')
        RETURNING "MaDangKy"
      `;
      // Lưu ý: totalAmount có thể = 0 nếu DB không có giá, cần truyền từ FE lên
      const subResult = await query(insertSubSql, [
        userId,
        petId,
        packageId,
        totalAmount || 0,
      ]);

      // Tạo hóa đơn
      const insertInvSql = `
        INSERT INTO "HoaDon" ("MaCN", "MaKH", "NgayLap", "TongTien", "HinhThucThanhToan", "TrangThai")
        VALUES ($1, $2, CURRENT_TIMESTAMP, $3, 'Chuyển khoản', 'PAID')
        RETURNING "MaHD"
      `;

      const branch = maCN || "CN01"; // Default chi nhánh nếu thiếu
      const invResult = await query(insertInvSql, [
        branch,
        userId,
        totalAmount || 0,
      ]);
      const maHD = invResult.rows[0].MaHD;

      // Cộng điểm tích lũy (10.000đ = 1 điểm)
      const points = Math.floor((totalAmount || 0) / 10000);
      if (points > 0) {
        await query(
          `UPDATE "KhachHang" SET "DiemTichLuy" = "DiemTichLuy" + $1 WHERE "MaKH" = $2`,
          [points, userId]
        );
      }

      await query("COMMIT");
      res.json({ success: true, message: "Đăng ký gói thành công!", maHD });
    } catch (err: any) {
      await query("ROLLBACK");
      console.error("Lỗi mua gói:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // 4. KIỂM TRA GÓI ĐANG KÍCH HOẠT (Của 1 thú cưng)
  checkActivePackage: async (req: Request, res: Response) => {
    const { petId } = req.params;
    try {
      const sql = `
          SELECT dk.*, g."TenGoi"
          FROM "DangKyGoi" dk
          JOIN "GoiTiem" g ON dk."MaGoi" = g."MaGoi"
          WHERE dk."MaTC" = $1 AND dk."TrangThai" = 'ACTIVE'
        `;
      const result = await query(sql, [petId]);
      res.json(result.rows[0] || null);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // 5. SỬ DỤNG QUYỀN LỢI (Trừ số lần tiêm/spa...)
  useBenefit: async (req: Request, res: Response) => {
    const { registrationId, serviceName } = req.body;
    try {
      // Logic trừ số lần sử dụng ở đây (nếu có bảng chi tiết)
      // Hiện tại trả về success để demo
      res.json({ success: true, message: "Đã sử dụng quyền lợi thành công" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
