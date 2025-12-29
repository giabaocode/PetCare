import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 1. CẬP NHẬT: Định nghĩa rõ kiểu User trong Request
// Giúp VS Code gợi ý code: req.user.branchId, req.user.role...
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    branchId?: string; // <--- QUAN TRỌNG: Thêm cái này để lọc dữ liệu theo chi nhánh
  };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Truy cập bị từ chối (Thiếu Token)" });
  }

  try {
    // Giải mã token
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);

    // Gán vào req.user (TS sẽ hiểu verified có dạng object như interface trên)
    req.user = verified as any;

    next();
  } catch (err) {
    res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// 2. CẬP NHẬT: Middleware Admin chuẩn (Chạy SAU verifyToken)
export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Logic: verifyToken đã chạy trước đó rồi, nên req.user chắc chắn đã có dữ liệu

  // Kiểm tra xem có user chưa (phòng hờ)
  if (!req.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  // Kiểm tra quyền (Lưu ý: authController ta đã map "Quản lý CN" -> "ADMIN")
  // Nên ở đây chỉ cần check "ADMIN" là đủ.
  if (req.user.role === "ADMIN") {
    next(); // Ok, là sếp -> Cho qua
  } else {
    res.status(403).json({ message: "Bạn không có quyền Admin" });
  }
};
