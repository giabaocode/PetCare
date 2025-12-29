import { Request, Response } from "express";
import { query } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authController = {
  register: async (req: Request, res: Response) => {
    const { email, password, fullName, phone, gender, dob, cid } = req.body;

    try {
      const checkExist = await query(
        `SELECT "MaND" FROM "NguoiDung" WHERE "Email" = $1 OR "SDT" = $2 OR "CCCD" = $3`,
        [email, phone, cid]
      );

      if (checkExist.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "Email, Số điện thoại hoặc CCCD đã tồn tại!" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await query("BEGIN");

      const userRes = await query(
        `INSERT INTO "NguoiDung" ("HoTen", "Email", "SDT", "MatKhau", "CCCD", "GioiTinh", "NgaySinh", "LoaiND")
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'KH') RETURNING "MaND"`,
        [fullName, email, phone, hashedPassword, cid, gender, dob]
      );
      const userId = userRes.rows[0].MaND;

      await query(`INSERT INTO "KhachHang" ("MaKH") VALUES ($1)`, [userId]);

      await query("COMMIT");
      res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (err: any) {
      await query("ROLLBACK");
      res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
  },

  login: async (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    try {
      const result = await query(
        `SELECT * FROM "NguoiDung" WHERE "Email" = $1 OR "SDT" = $1`,
        [identifier]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ message: "Tài khoản không tồn tại" });
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.MatKhau);
      if (!isMatch) {
        return res.status(401).json({ message: "Sai mật khẩu" });
      }

      let role = "CUSTOMER";
      let branchId = null;

      const userType = user.LoaiND ? user.LoaiND.trim() : "";

      if (userType === "NV") {
        const staffResult = await query(
          `SELECT "MaCN", "ChucVu" FROM "NhanVien" WHERE "MaNV" = $1`,
          [user.MaND]
        );

        if (staffResult.rows.length > 0) {
          const staff = staffResult.rows[0];
          branchId = staff.MaCN;

          const jobTitle = staff.ChucVu ? staff.ChucVu.trim() : "";
          switch (jobTitle) {
            case "Quản lý CN":
              role = "ADMIN";
              break;
            case "Bác sĩ":
              role = "DOCTOR";
              break;
            case "Tiếp tân":
              role = "RECEPTIONIST";
              break;
            default:
              role = "STAFF";
          }
        }
      } else {
        const custResult = await query(
          `SELECT "DiemTichLuy" FROM "KhachHang" WHERE "MaKH" = $1`,
          [user.MaND]
        );
        if (custResult.rows.length > 0) {
          user.DiemTichLuy = custResult.rows[0].DiemTichLuy;
        }
      }

      const token = jwt.sign(
        { id: user.MaND, role: role, branchId: branchId },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        MaND: user.MaND,
        MaKH: user.MaND,
        HoTen: user.HoTen,
        Email: user.Email,
        SDT: user.SDT,
        Role: role,
        MaCN: branchId,
        DiemTichLuy: user.DiemTichLuy,
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: "Lỗi Server" });
    }
  },
};
