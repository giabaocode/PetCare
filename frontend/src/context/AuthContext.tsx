import React, { createContext, useContext, useState, useEffect } from "react";
// Đảm bảo import đúng đường dẫn schema mới
import { UserProfile, UserRole } from "../types/schema";

interface AuthContextType {
  token: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>("mock-token-123");

  // FIX: Cập nhật Mock Profile khớp với Schema mới
  const [profile, setProfile] = useState<UserProfile | null>({
    MaND: "user-01",
    MaKH: "KH001", // Dùng cho chức năng Đặt lịch/Xem thú cưng
    MaNV: "NV001", // Dùng cho chức năng Nhân sự/Lương
    MaCN: "CN01", // QUAN TRỌNG: Dùng cho Inventory & Schedule (Lọc theo chi nhánh)
    HoTen: "Nguyễn Văn Tester",
    Email: "tester@petcare.com",
    SDT: "0909123456",
    TenHang: "VIP",
    DiemTichLuy: 5000,
    Role: "ADMIN", // Full quyền để test
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (t: string) => {
    console.log("Mock login với token:", t);
    setToken(t);

    // Logic giả lập: Nếu token là 'customer' thì đổi role, ngược lại là staff
    if (t === "customer-token") {
      setProfile({
        MaND: "user-02",
        MaKH: "KH002",
        HoTen: "Khách Hàng Demo",
        Email: "khach@gmail.com",
        Role: "CUSTOMER",
      } as UserProfile);
    } else {
      // Mặc định login vào là ADMIN/DOCTOR
      setProfile({
        MaND: "user-01",
        MaKH: "KH001",
        MaNV: "NV001",
        MaCN: "CN01",
        HoTen: "BS. Nguyễn Văn Tester",
        Email: "bacsitester@petcare.com",
        Role: "DOCTOR", // Hoặc ADMIN
      } as UserProfile);
    }
  };

  const logout = () => {
    setToken(null);
    setProfile(null);
    localStorage.removeItem("pcx_token");
  };

  return (
    <AuthContext.Provider value={{ token, profile, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth inside provider");
  return ctx;
};
