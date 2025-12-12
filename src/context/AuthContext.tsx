import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, userRole } from "../types/schema";

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
  const [profile, setProfile] = useState<UserProfile | null>({
    MaND: "user-01",
    MaKH: "user-01", // Quan   trọng để khớp logic
    HoTen: "Nguyễn Văn Tester",
    Email: "tester@petcare.com",
    SDT: "0909123456",
    TenHang: "VIP",
    DiemTichLuy: 5000,
    Role: "ADMIN",
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (t: string) => {
    // Giả lập login thành công
    console.log("Mock login với token:", t);
    setToken(t);
    setProfile({
      ...profile!,
      Role: "ADMIN",
    });
  };

  const logout = () => {
    setToken(null);
    setProfile(null);
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
