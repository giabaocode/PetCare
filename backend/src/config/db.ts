// backend/src/config/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 👇 THÊM ĐOẠN CODE KIỂM TRA NÀY VÀO 👇
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Lỗi kết nối Database:", err.message);
    // Nếu lỗi, in chi tiết để debug
    console.error("Chi tiết:", err);
  } else {
    console.log("✅ Đã kết nối PostgreSQL thành công!");
    release(); // Trả kết nối về pool
  }
});
// 👆 KẾT THÚC ĐOẠN CODE KIỂM TRA 👆

export const query = (text: string, params?: any[]) => pool.query(text, params);
